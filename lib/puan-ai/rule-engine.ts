import type { CampaignMatch, CampaignRuleView, CampaignView, SearchIntent } from "@/lib/puan-ai/types";
import { calculateDecision, type MonetaryBenefit, type ScoreWeights } from "@/lib/puan-ai/decision-engine";

const synonymGroups = [
  ["iphone", "telefon", "cep telefonu", "akilli telefon"],
  ["migros", "macrocenter", "macro"],
  ["market", "supermarket", "gida"],
  ["teknoloji", "elektronik", "bilgisayar"],
  ["puan", "odul", "worldpuan", "maxipuan", "bonus"],
  ["taksit", "vadeli", "ay"],
];

const knownCardEntities = [
  "bankkart", "worldcard", "world", "paraf", "maximum", "maximiles", "bonus", "axess", "cardfinans",
  "ziraat", "vakifbank", "halkbank", "is bankasi", "yapi kredi", "garanti", "akbank", "qnb", "denizbank",
  "teb", "ing", "hsbc", "kuveyt turk", "turkiye finans", "albaraka", "ziraat katilim", "vakif katilim",
];

export function normalizeTurkish(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandSynonyms(value: string) {
  const additions = synonymGroups
    .filter((group) => group.some((term) => value.includes(normalizeTurkish(term))))
    .flat();
  return normalizeTurkish(`${value} ${additions.join(" ")}`);
}

function parseMoney(value: string) {
  const match = value.match(/(\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,\d{1,2})?\s*(?:tl|₺)/i);
  if (!match) return null;
  const normalized = match[1].replace(/[.\s]/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function parseDate(value: string, now: Date) {
  const match = value.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/)
    ?? value.match(/\b(\d{1,2})[./-](\d{1,2})[./-](20\d{2})\b/);
  if (!match) return { date: now, valid: true };

  const isoOrder = match[1].length === 4;
  const year = Number(isoOrder ? match[1] : match[3]);
  const month = Number(match[2]);
  const day = Number(isoOrder ? match[3] : match[1]);
  const utcCheck = new Date(Date.UTC(year, month - 1, day));
  const valid = (
    utcCheck.getUTCFullYear() === year
    && utcCheck.getUTCMonth() === month - 1
    && utcCheck.getUTCDate() === day
  );
  if (!valid) return { date: now, valid: false };

  const date = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00+03:00`,
  );
  if (Number.isNaN(date.getTime())) {
    return { date: now, valid: false };
  }
  return { date, valid: true };
}

export function detectIntent(raw: string, now = new Date()): SearchIntent {
  const normalized = normalizeTurkish(raw);
  const installmentMatch = normalized.match(/\b(\d{1,2})\s*(?:taksit|ay)\b/);
  const installmentCount = installmentMatch ? Number(installmentMatch[1]) : null;
  const parsedDate = parseDate(raw, now);
  return {
    raw,
    normalized,
    expanded: expandSynonyms(normalized),
    amount: parseMoney(raw),
    installmentCount,
    wantsInstallment: installmentCount !== null || /\b(taksit|vadeli)\b/.test(normalized),
    wantsReward: /\b(puan|odul|bonus|cashback|indirim|mil)\b/.test(normalized),
    wantsHighestReward: /\b(en yuksek|en cok|maksimum|hangisi daha cok)\b/.test(normalized),
    date: parsedDate.date,
    dateValid: parsedDate.valid,
  };
}

function numericRule(rules: CampaignRuleView[], kinds: CampaignRuleView["kind"][]) {
  return rules
    .filter((rule) => kinds.includes(rule.kind) && rule.numericValue !== null)
    .map((rule) => rule.numericValue as number)
    .sort((a, b) => b - a)[0] ?? null;
}

export function isVerifiedAndCurrent(campaign: CampaignView, queryDate: Date, now = new Date()) {
  if (!campaign.published || !["VERIFIED", "ACTIVE"].includes(campaign.status)) return false;
  if (campaign.bank.status !== "ACTIVE" || campaign.category.status !== "ACTIVE") return false;
  if (campaign.merchant?.status === "INACTIVE" || campaign.rewardType?.status === "INACTIVE") return false;
  if (campaign.cards.some((card) => !card.active)) return false;
  const at = queryDate.getTime();
  if (new Date(campaign.startDate).getTime() > at || new Date(campaign.endDate).getTime() < at) return false;
  const verification = campaign.verification;
  const source = campaign.sources.find((item) => item.id === verification?.officialSourceId);
  if (!verification || verification.status !== "VERIFIED" || !source) return false;
  if (!source.url.startsWith("https://")) return false;
  if (verification.fingerprint !== source.fingerprint) return false;
  if (new Date(source.fetchedAt).getTime() > new Date(verification.checkedAt).getTime()) return false;
  if (new Date(verification.checkedAt).getTime() > now.getTime()) return false;
  if (new Date(verification.nextCheckAt).getTime() < now.getTime()) return false;
  return true;
}

function searchableText(campaign: CampaignView) {
  return normalizeTurkish([
    campaign.title,
    campaign.description,
    campaign.benefitSummary,
    campaign.bank.name,
    campaign.bank.officialName,
    campaign.bank.slug,
    campaign.merchant?.name,
    ...(campaign.merchant?.aliases ?? []),
    campaign.category.name,
    ...campaign.category.aliases,
    campaign.rewardType?.name,
    ...campaign.cards.flatMap((card) => [card.name, card.rewardProgram]),
    ...campaign.rules.flatMap((rule) => [rule.description, rule.textValue]),
  ].filter(Boolean).join(" "));
}

function entityMatch(query: string, values: Array<string | null | undefined>) {
  return values.some((value) => value && query.includes(normalizeTurkish(value)));
}

function cardEntityMatch(query: string, values: Array<string | null | undefined>) {
  if (entityMatch(query, values)) return true;
  const normalizedValues = values.filter(Boolean).map((value) => normalizeTurkish(value as string));
  return knownCardEntities.some((entity) => query.includes(entity) && normalizedValues.some((value) => value.includes(entity)));
}

function mentionsAny(query: string, campaigns: CampaignView[], selector: (campaign: CampaignView) => Array<string | null | undefined>) {
  return campaigns.some((campaign) => entityMatch(query, selector(campaign)));
}

export function calculateCampaignBenefit(campaign: CampaignView, amount: number | null) {
  const tiers = campaign.tiers ?? [];
  if (tiers.length > 0) {
    if (amount === null) return { eligible: false, amount: 0 };
    const tier = tiers.find((item) => amount >= item.minimumSpend && (item.maximumSpend === null || amount <= item.maximumSpend));
    return tier ? { eligible: true, amount: tier.rewardAmount } : { eligible: false, amount: 0 };
  }
  const minimum = numericRule(campaign.rules, ["MIN_SPEND"]);
  const maximum = numericRule(campaign.rules, ["MAX_SPEND"]);
  if (amount === null || (minimum !== null && amount < minimum) || (maximum !== null && amount > maximum)) return { eligible: false, amount: 0 };
  const fixed = numericRule(campaign.rules, ["REWARD_AMOUNT"]);
  const cap = numericRule(campaign.rules, ["MAX_REWARD"]);
  const benefit = fixed ?? cap ?? 0;
  return { eligible: true, amount: cap === null ? benefit : Math.min(benefit, cap) };
}

export function evaluateCampaigns(campaigns: CampaignView[], rawQuery: string, now = new Date(), weights?: ScoreWeights): CampaignMatch[] {
  const intent = detectIntent(rawQuery, now);
  if (!intent.dateValid) return [];
  const current = campaigns.filter((campaign) => isVerifiedAndCurrent(campaign, intent.date, now));
  if (current.length === 0) return [];

  const explicitCardOrBank = knownCardEntities.some((entity) => intent.expanded.includes(entity));
  const requestedEntityExists = current.some((campaign) => cardEntityMatch(intent.expanded, [campaign.bank.name, campaign.bank.officialName, campaign.bank.slug, ...campaign.cards.flatMap((card) => [card.name, card.rewardProgram])]));
  if (explicitCardOrBank && !requestedEntityExists) return [];

  const merchantMentioned = mentionsAny(intent.expanded, current, (campaign) => [campaign.merchant?.name, ...(campaign.merchant?.aliases ?? [])]);
  const bankMentioned = mentionsAny(intent.expanded, current, (campaign) => [campaign.bank.name, campaign.bank.officialName, campaign.bank.slug]);
  const cardMentioned = current.some((campaign) => cardEntityMatch(intent.expanded, campaign.cards.flatMap((card) => [card.name, card.rewardProgram])));
  const categoryMentioned = mentionsAny(intent.expanded, current, (campaign) => [campaign.category.name, ...campaign.category.aliases]);

  return current
    .flatMap((campaign): CampaignMatch[] => {
      const reasons: string[] = [];
      let score = 0;
      const merchantMatches = entityMatch(intent.expanded, [campaign.merchant?.name, ...(campaign.merchant?.aliases ?? [])]);
      const bankMatches = entityMatch(intent.expanded, [campaign.bank.name, campaign.bank.officialName, campaign.bank.slug]);
      const cardMatches = cardEntityMatch(intent.expanded, campaign.cards.flatMap((card) => [card.name, card.rewardProgram]));
      const categoryMatches = entityMatch(intent.expanded, [campaign.category.name, ...campaign.category.aliases]);

      if (merchantMentioned && !merchantMatches) return [];
      if (bankMentioned && !bankMatches) return [];
      if (cardMentioned && !cardMatches) return [];
      if (categoryMentioned && !categoryMatches) return [];

      if (merchantMatches) { score += 80; reasons.push("Mağaza eşleşti"); }
      if (bankMatches) { score += 45; reasons.push("Banka eşleşti"); }
      if (cardMatches) { score += 40; reasons.push("Kart eşleşti"); }
      if (categoryMatches) { score += 30; reasons.push("Kategori eşleşti"); }

      const exclusions = campaign.rules.filter((rule) => rule.kind === "EXCLUSION");
      if (exclusions.some((rule) => intent.expanded.includes(normalizeTurkish(rule.textValue ?? rule.description)))) return [];

      const minSpend = numericRule(campaign.rules, ["MIN_SPEND"]);
      const maxSpend = numericRule(campaign.rules, ["MAX_SPEND"]);
      if (intent.amount !== null && minSpend !== null && intent.amount < minSpend) return [];
      if (intent.amount !== null && maxSpend !== null && intent.amount > maxSpend) return [];
      if (intent.amount !== null && minSpend !== null) { score += 20; reasons.push("Tutar koşulu sağlanıyor"); }

      if (intent.wantsInstallment) {
        const installmentMatches = intent.installmentCount === null
          ? campaign.installments.length > 0
          : campaign.installments.some((item) => item.count === intent.installmentCount);
        if (!installmentMatches) return [];
        score += 35;
        reasons.push(intent.installmentCount ? `${intent.installmentCount} taksit mevcut` : "Taksit seçeneği mevcut");
      }

      if (intent.wantsReward) {
        if (!campaign.rewardType) return [];
        score += 25;
        reasons.push(`${campaign.rewardType.name} avantajı`);
      }

      const terms = new Set(intent.normalized.split(" ").filter((term) => term.length > 2));
      const haystack = searchableText(campaign);
      for (const term of terms) if (haystack.includes(term)) score += 2;

      const reward = calculateCampaignBenefit(campaign, intent.amount).amount;
      const rewardCeiling = (campaign.tiers?.length ?? 0) > 0
        ? Math.max(...(campaign.tiers ?? []).map((tier) => tier.rewardAmount))
        : numericRule(campaign.rules, ["MAX_REWARD", "REWARD_AMOUNT"]) ?? 0;
      if (intent.wantsHighestReward) score += Math.min(rewardCeiling / 10, 50);
      if (reasons.length === 0) reasons.push("Güncel ve doğrulanmış kampanya");

      const benefitKind: MonetaryBenefit["kind"] = campaign.rewardType?.kind === "DISCOUNT"
        ? "DIRECT_DISCOUNT"
        : campaign.rewardType?.kind === "CASHBACK"
          ? "CASHBACK"
          : "REWARD_POINTS";
      const decision = calculateDecision({
        price: intent.amount,
        benefits: reward > 0 ? [{ kind: benefitKind, amount: reward, label: campaign.rewardType?.name ?? "Kampanya avantajı", verified: true }] : [],
        installmentCount: intent.wantsInstallment ? (intent.installmentCount ?? campaign.installments.at(-1)?.count ?? null) : null,
        campaignMatch: Math.min(1, score / 100),
        preferenceMatch: (bankMatches || cardMatches || merchantMatches || categoryMatches) ? 1 : 0,
        merchantReliability: campaign.merchant ? 0.85 : 0.75,
        dataConfidence: 1,
        risk: 0,
      }, weights);
      return [{ ...campaign, score: decision.score, matchReasons: reasons, decision }];
    })
    .sort((a, b) => b.score - a.score || new Date(b.verification?.checkedAt ?? 0).getTime() - new Date(a.verification?.checkedAt ?? 0).getTime())
    .slice(0, 5);
}

export function getRuleValue(campaign: CampaignView, kinds: CampaignRuleView["kind"][]) {
  return numericRule(campaign.rules, kinds);
}
