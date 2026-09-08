import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/puan-ai/db";
import { evaluateCampaigns } from "@/lib/puan-ai/rule-engine";
import type { CampaignMatch, CampaignView } from "@/lib/puan-ai/types";
import { getActiveScoreWeights } from "@/lib/puan-ai/scoring-service";

const campaignInclude = {
  bank: true,
  merchant: true,
  merchantCategory: true,
  rewardType: true,
  cards: { include: { card: true } },
  rules: { orderBy: [{ priority: "asc" }, { createdAt: "asc" }] },
  tiers: { orderBy: [{ minimumSpend: "asc" }, { priority: "asc" }] },
  installments: { orderBy: { count: "asc" } },
  officialSources: {
    where: { active: true },
    orderBy: { fetchedAt: "desc" },
  },
  verificationLogs: {
    orderBy: [{ checkedAt: "desc" }, { createdAt: "desc" }],
    take: 1,
  },
} satisfies Prisma.CampaignInclude;

type CampaignRecord = Prisma.CampaignGetPayload<{ include: typeof campaignInclude }>;

function numberOrNull(value: { toNumber(): number } | null) {
  return value === null ? null : value.toNumber();
}

export function toCampaignView(record: CampaignRecord): CampaignView {
  const verification = record.verificationLogs[0];
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    benefitSummary: record.benefitSummary,
    startDate: record.startDate.toISOString(),
    endDate: record.endDate.toISOString(),
    status: record.status,
    published: record.published,
    updatedAt: record.updatedAt.toISOString(),
    bank: {
      id: record.bank.id,
      slug: record.bank.slug,
      name: record.bank.name,
      officialName: record.bank.officialName,
      shortName: record.bank.shortName,
      websiteUrl: record.bank.websiteUrl,
      color: record.bank.color,
      status: record.bank.status,
    },
    merchant: record.merchant ? {
      id: record.merchant.id,
      slug: record.merchant.slug,
      name: record.merchant.name,
      aliases: record.merchant.aliases,
      status: record.merchant.status,
    } : null,
    category: {
      id: record.merchantCategory.id,
      slug: record.merchantCategory.slug,
      name: record.merchantCategory.name,
      aliases: record.merchantCategory.aliases,
      status: record.merchantCategory.status,
    },
    rewardType: record.rewardType ? {
      id: record.rewardType.id,
      slug: record.rewardType.slug,
      name: record.rewardType.name,
      kind: record.rewardType.kind,
      unit: record.rewardType.unit,
      status: record.rewardType.status,
    } : null,
    cards: record.cards.map(({ card }) => ({
      id: card.id,
      slug: card.slug,
      name: card.name,
      network: card.network,
      rewardProgram: card.rewardProgram,
      active: card.active,
    })),
    rules: record.rules.map((rule) => ({
      id: rule.id,
      kind: rule.kind,
      operator: rule.operator,
      numericValue: numberOrNull(rule.numericValue),
      textValue: rule.textValue,
      unit: rule.unit,
      description: rule.description,
      priority: rule.priority,
    })),
    tiers: record.tiers.map((tier) => ({
      id: tier.id,
      minimumSpend: tier.minimumSpend.toNumber(),
      maximumSpend: numberOrNull(tier.maximumSpend),
      rewardAmount: tier.rewardAmount.toNumber(),
      description: tier.description,
      priority: tier.priority,
    })),
    installments: record.installments.map((item) => ({
      id: item.id,
      count: item.count,
      feeFree: item.feeFree,
      productScope: item.productScope,
      notes: item.notes,
    })),
    sources: record.officialSources.map((source) => ({
      id: source.id,
      url: source.url,
      title: source.title,
      publisher: source.publisher,
      fetchedAt: source.fetchedAt.toISOString(),
      fingerprint: source.fingerprint,
    })),
    verification: verification ? {
      officialSourceId: verification.officialSourceId,
      status: verification.status,
      checkedAt: verification.checkedAt.toISOString(),
      nextCheckAt: verification.nextCheckAt.toISOString(),
      checker: verification.checker,
      summary: verification.summary,
      fingerprint: verification.fingerprint,
    } : null,
  };
}

export async function getCampaignCatalog() {
  const records = await getPrisma().campaign.findMany({
    include: campaignInclude,
    orderBy: [{ endDate: "asc" }, { updatedAt: "desc" }],
  });
  return records.map(toCampaignView);
}

export async function searchVerifiedCampaigns(query: string, now = new Date()): Promise<CampaignMatch[]> {
  return evaluateCampaigns(await getCampaignCatalog(), query, now, await getActiveScoreWeights());
}

export async function getVerifiedCampaignBySlug(slug: string, now = new Date()) {
  const record = await getPrisma().campaign.findUnique({ where: { slug }, include: campaignInclude });
  if (!record) return null;
  return evaluateCampaigns([toCampaignView(record)], record.title, now)[0] ?? null;
}

export async function getVerifiedCampaignsByIds(ids: string[], now = new Date()) {
  if (ids.length === 0) return [];
  const records = await getPrisma().campaign.findMany({
    where: { id: { in: ids } },
    include: campaignInclude,
  });
  const verified = records.map(toCampaignView).filter((campaign) => evaluateCampaigns([campaign], campaign.title, now).length > 0);
  return ids.flatMap((id) => verified.filter((campaign) => campaign.id === id));
}
