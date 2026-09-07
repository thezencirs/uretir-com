import { getPrisma } from "@/lib/puan-ai/db";

export async function enforceCampaignFreshness(now = new Date()) {
  const prisma = getPrisma();
  const retentionDays = Math.min(Math.max(Number(process.env.PUANAI_INTAKE_RETENTION_DAYS ?? 90), 30), 365);
  const expired = await prisma.campaign.updateMany({
    where: { endDate: { lt: now }, status: { not: "EXPIRED" } },
    data: { status: "EXPIRED", published: false },
  });
  const stale = await prisma.verificationLog.findMany({
    where: { nextCheckAt: { lt: now }, status: "VERIFIED" },
    select: { campaignId: true },
  });
  const staleCampaignIds = [...new Set(stale.map((item) => item.campaignId))];
  if (staleCampaignIds.length) await prisma.campaign.updateMany({
    where: { id: { in: staleCampaignIds } },
    data: { status: "UNVERIFIED", published: false },
  });
  const abandoned = await prisma.campaignSubmission.updateMany({
    where: { status: "VERIFYING", updatedAt: { lt: new Date(now.getTime() - 15 * 60_000) } },
    data: { status: "SOURCE_UNAVAILABLE", nextAttemptAt: now, error: "Yarım kalan doğrulama yeniden kuyruğa alındı." },
  });
  const redacted = await prisma.campaignSubmission.updateMany({
    where: {
      receivedAt: { lt: new Date(now.getTime() - retentionDays * 24 * 3_600_000) },
      status: { in: ["VERIFIED", "NEEDS_REVIEW", "REJECTED", "EXPIRED"] },
      rawText: { not: "[saklama süresi sonunda silindi]" },
    },
    data: { rawText: "[saklama süresi sonunda silindi]", senderId: null, channelId: null },
  });
  return { expired: expired.count, stale: staleCampaignIds.length, requeued: abandoned.count, redacted: redacted.count };
}
