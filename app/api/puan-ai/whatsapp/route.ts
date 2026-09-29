import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCampaignCatalog } from "@/lib/puan-ai/catalog-service";
import type { CampaignView } from "@/lib/puan-ai/types";
import { getChannelTool } from "@/lib/channel-tools";
import { getPrisma } from "@/lib/puan-ai/db";
import { withReadRetry } from "@/lib/read-retry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const whatsappChannel = getChannelTool("puan-ai").channelUrl;

function authorized(request: NextRequest) {
  return [process.env.CRON_SECRET, process.env.WHATSAPP_BOT_SECRET]
    .some((token) => Boolean(token && request.headers.get("authorization") === `Bearer ${token}`));
}

function money(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null;
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value) + " TL";
}

function dateTR(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function minimumSpend(campaign: CampaignView) {
  const values = [
    ...campaign.tiers.map((tier) => tier.minimumSpend),
    ...campaign.rules.filter((rule) => rule.kind === "MIN_SPEND").map((rule) => rule.numericValue).filter((v): v is number => v !== null),
  ].filter((value) => Number.isFinite(value) && value > 0);
  return values.length ? Math.min(...values) : null;
}

function maximumReward(campaign: CampaignView) {
  const values = [
    ...campaign.tiers.map((tier) => tier.rewardAmount),
    ...campaign.rules
      .filter((rule) => rule.kind === "MAX_REWARD" || rule.kind === "REWARD_AMOUNT")
      .map((rule) => rule.numericValue)
      .filter((v): v is number => v !== null),
  ].filter((value) => Number.isFinite(value) && value > 0);
  return values.length ? Math.max(...values) : null;
}

function participation(campaign: CampaignView) {
  return campaign.rules.find((rule) =>
    ["REQUIRED_ENROLLMENT", "REQUIRED_CHANNEL", "REQUIRED_PAYMENT_METHOD"].includes(rule.kind)
  )?.description ?? null;
}

function toItem(campaign: CampaignView) {
  const source = campaign.sources[0];
  if (!source || !campaign.verification) return null;

  const min = money(minimumSpend(campaign));
  const reward = money(maximumReward(campaign));
  const join = participation(campaign);
  const fingerprint = createHash("sha256")
    .update(JSON.stringify([
      campaign.id,
      campaign.title,
      campaign.benefitSummary,
      campaign.endDate,
      campaign.verification.fingerprint,
      source.fingerprint,
    ]))
    .digest("hex")
    .slice(0, 24);

  const lines = [
    `💳 *PUANAI | ${campaign.category.name.toLocaleUpperCase("tr-TR")}*`,
    `*${campaign.bank.shortName || campaign.bank.name} · ${campaign.title}*`,
    campaign.benefitSummary,
    min ? `💰 Alt limit: *${min}*` : null,
    reward ? `🎁 Kazanım / üst limit: *${reward}*` : null,
    `📅 Son gün: *${dateTR(campaign.endDate)}*`,
    join ? `📲 Katılım: ${join}` : null,
    "",
    "🔗 Resmî kaynak:",
    source.url,
    "",
    "🔎 Kartları karşılaştır:",
    "https://www.uretir.com/puan-ai",
    "",
    "*PuanAI • uretir.com*",
  ].filter((line): line is string => line !== null);

  return {
    fingerprint,
    campaignId: campaign.id,
    bank: campaign.bank.slug,
    category: campaign.category.slug,
    body: lines.join("\n"),
  };
}

type VerifiedSubmissionDraft = {
  sourceFacts?: {
    monetaryAmounts?: number[];
    installmentCounts?: number[];
    cardPrograms?: string[];
    participationRequired?: boolean;
  };
  sourceUrl?: string;
  sourceTitle?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
};

function submissionItem(input: {id:string;sourceUrl:string|null;normalizedDraft:unknown;verification:unknown;processedAt:Date|null}, now:Date) {
  if (!input.sourceUrl || !input.normalizedDraft || typeof input.normalizedDraft !== "object") return null;
  const draft=input.normalizedDraft as VerifiedSubmissionDraft;
  const facts=draft.sourceFacts;
  const validFrom=draft.validFrom ? new Date(draft.validFrom) : null;
  const validUntil=draft.validUntil ? new Date(draft.validUntil) : null;
  if(!facts || !validFrom || !validUntil || validFrom>now || validUntil<now) return null;
  const programs=Array.isArray(facts.cardPrograms)?facts.cardPrograms.filter(Boolean):[];
  const amounts=Array.isArray(facts.monetaryAmounts)?facts.monetaryAmounts.filter(v=>Number.isFinite(v)&&v>0):[];
  const installments=Array.isArray(facts.installmentCounts)?facts.installmentCounts.filter(v=>Number.isFinite(v)&&v>1):[];
  if(!programs.length || (!amounts.length&&!installments.length)) return null;
  const title=draft.sourceTitle?.trim() || programs.join(" / ")+" kampanyası";
  const fingerprint=createHash("sha256").update(JSON.stringify([input.id,input.sourceUrl,draft.validUntil,input.verification])).digest("hex").slice(0,24);
  const amountText=amounts.length ? amounts.slice(0,5).map(v=>money(v)).filter(Boolean).join(" · ") : null;
  const installmentText=installments.length ? installments.slice(0,5).join(", ")+" taksit" : null;
  const body=[
    "💳 *PUANAI | RESMÎ KAMPANYA*",
    "*"+title+"*",
    "💳 Kart programı: *"+programs.join(" / ")+"*",
    amountText ? "💰 Kaynakta geçen tutarlar: *"+amountText+"*" : null,
    installmentText ? "🧾 Taksit: *"+installmentText+"*" : null,
    facts.participationRequired ? "📲 Katılım: *Kampanyaya katılım gerekiyor*" : null,
    "📅 Son gün: *"+dateTR(validUntil.toISOString())+"*",
    "",
    "🔗 Resmî kaynak:",
    input.sourceUrl,
    "",
    "🔎 Kartları karşılaştır:",
    "https://www.uretir.com/puan-ai",
    "",
    "*PuanAI • uretir.com*",
  ].filter((line):line is string=>line!==null).join("\n");
  return {fingerprint,campaignId:"submission:"+input.id,bank:programs[0].toLocaleLowerCase("tr-TR"),category:"official-campaign",body};
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });

  try {
    const now = new Date();
    let catalog: CampaignView[] = [];
    let catalogReadable = true;

    try {
      catalog = await withReadRetry(()=>getCampaignCatalog(), 5);
    } catch {
      catalogReadable = false;
    }

    let items = catalog
      .filter((campaign) =>
        campaign.published
        && ["ACTIVE", "VERIFIED"].includes(campaign.status)
        && new Date(campaign.startDate) <= now
        && new Date(campaign.endDate) >= now
        && campaign.verification?.status === "VERIFIED"
        && new Date(campaign.verification.nextCheckAt) >= now
        && campaign.sources.length > 0
      )
      .sort((a, b) =>
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .map(toItem)
      .filter((item): item is NonNullable<ReturnType<typeof toItem>> => item !== null)
      .slice(0, 24);

    if (!items.length) {
      try {
        const submissions = await withReadRetry(()=>getPrisma().campaignSubmission.findMany({
          where: { status: "VERIFIED", sourceUrl: { not: null }, processedAt: { not: null } },
          orderBy: { processedAt: "desc" },
          take: 60,
          select: { id:true, sourceUrl:true, normalizedDraft:true, verification:true, processedAt:true },
        }), 5);
        items = submissions.map(item=>submissionItem(item,now)).filter((item):item is NonNullable<ReturnType<typeof submissionItem>>=>item!==null).slice(0,24);
      } catch {
        if (!catalogReadable) throw new Error("PuanAI catalogue and verified-submission fallback are both unavailable.");
      }
    }

    return NextResponse.json({
      channel_url: whatsappChannel,
      items,
      checkedAt: now.toISOString(),
      sourceMode: catalogReadable ? "catalog" : "verified_submission_fallback",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "PuanAI kanal kuyruğu hazırlanamadı." }, { status: 503 });
  }
}
