import { getPrisma } from "@/lib/puan-ai/db";

export async function enforceCampaignFreshness(now = new Date()) {
  const prisma = getPrisma();
  const retentionDays = Math.min(Math.max(Number(process.env.PUANAI_INTAKE_RETENTION_DAYS ?? 90), 30), 365);
  const expired = await prisma.campaign.updateMany({
    where: { endDate: { lt: now }, status: { not: "EXPIRED" } },
    data: { status: "EXPIRED", published: false },
  });
  const candidates = await prisma.campaign.findMany({
    where: { endDate: { gte: now }, status: { not: "EXPIRED" } },
    select: { id: true, verificationLogs: { orderBy: [{ checkedAt: "desc" }, { createdAt: "desc" }], take: 1, select: { nextCheckAt: true, status: true } } },
  });
  const staleCampaignIds = candidates
    .filter((campaign) => campaign.verificationLogs[0]?.status === "VERIFIED" && campaign.verificationLogs[0].nextCheckAt < now)
    .map((campaign) => campaign.id);
  if (staleCampaignIds.length) await prisma.campaign.updateMany({
    where: { id: { in: staleCampaignIds } },
    // Publication is editorial intent. The current-verification gate hides stale
    // records until the source is rechecked; do not erase that intent here.
    data: { status: "UNVERIFIED" },
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
