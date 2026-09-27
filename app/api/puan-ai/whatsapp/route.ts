import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCampaignCatalog } from "@/lib/puan-ai/catalog-service";
import type { CampaignView } from "@/lib/puan-ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const whatsappChannel = "https://whatsapp.com/channel/0029VbDbbII8PgsA574OLl1H";

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

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });

  try {
    const now = new Date();
    const catalog = await getCampaignCatalog();
    const items = catalog
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

    return NextResponse.json({
      channel_url: whatsappChannel,
      items,
      checkedAt: now.toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "PuanAI kanal kuyruğu hazırlanamadı." }, { status: 503 });
  }
}
