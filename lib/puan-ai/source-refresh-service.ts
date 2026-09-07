import { getPrisma } from "@/lib/puan-ai/db";
import { verifyCampaignUrl } from "@/lib/puan-ai/source-verifier";
import { checkRobotsPolicy, type RobotsFile } from "@/lib/puan-ai/robots-policy";

export async function refreshOfficialSources(limit = 50) {
  const prisma = getPrisma();
  const sources = await prisma.officialSource.findMany({
    where: { active: true },
    include: { campaign: true, verificationLogs: { orderBy: { checkedAt: "desc" }, take: 1 } },
    orderBy: { fetchedAt: "asc" },
    take: Math.min(Math.max(limit, 1), 100),
  });
  const results: Array<{ sourceId: string; status: string }> = [];
  const robotsCache = new Map<string, Promise<RobotsFile>>();
  for (const source of sources) {
    const checkedAt = new Date();
    const parsedUrl = new URL(source.url);
    const robots = await checkRobotsPolicy(parsedUrl, fetch, robotsCache);
    if (!robots.allowed) {
      await prisma.$transaction([
        prisma.officialSource.update({ where: { id: source.id }, data: { fetchedAt: checkedAt, health: "BLOCKED" } }),
        prisma.verificationLog.create({ data: { campaignId: source.campaignId, officialSourceId: source.id, status: "SOURCE_UNAVAILABLE", checkedAt, nextCheckAt: new Date(checkedAt.getTime() + 24 * 3_600_000), checker: "job:source-refresh", summary: robots.reason, fingerprint: source.fingerprint } }),
        prisma.campaign.update({ where: { id: source.campaignId }, data: { status: "SUSPENDED", published: false } }),
      ]);
      results.push({ sourceId: source.id, status: "SUSPENDED" });
      continue;
    }
    const result = await verifyCampaignUrl(source.url, checkedAt);
    const previous = source.verificationLogs[0];
    const unchanged = Boolean(result.fingerprint && previous?.status === "VERIFIED" && previous.fingerprint === result.fingerprint);
    const verificationStatus = result.status === "SOURCE_UNAVAILABLE" ? "SOURCE_UNAVAILABLE" : unchanged && result.status === "VERIFIED" ? "VERIFIED" : "STALE";
    const campaignStatus = result.status === "EXPIRED" ? "EXPIRED" : result.status === "SOURCE_UNAVAILABLE" ? "SOURCE_UNAVAILABLE" : unchanged ? "ACTIVE" : "UNVERIFIED";
    await prisma.$transaction([
      prisma.officialSource.update({ where: { id: source.id }, data: {
        fetchedAt: checkedAt,
        lastVerifiedAt: result.status === "VERIFIED" ? checkedAt : source.lastVerifiedAt,
        validFrom: result.validFrom ? new Date(result.validFrom) : source.validFrom,
        validUntil: result.validUntil ? new Date(result.validUntil) : source.validUntil,
        fingerprint: result.fingerprint ?? source.fingerprint,
        trustScore: result.evidence.trustScore,
        sourceKind: result.evidence.sourceKind === "OFFICIAL_BANK_CARD" ? "OFFICIAL_CARD_PROGRAM" : source.sourceKind,
        health: result.status === "SOURCE_UNAVAILABLE" ? "UNAVAILABLE" : result.status === "UNVERIFIED" ? "INVALID_CONTENT" : "ONLINE",
      } }),
      prisma.verificationLog.create({ data: {
        campaignId: source.campaignId,
        officialSourceId: source.id,
        status: verificationStatus,
        checkedAt,
        nextCheckAt: new Date(checkedAt.getTime() + 6 * 3_600_000),
        checker: "job:source-refresh",
        summary: result.reason,
        fingerprint: result.fingerprint ?? source.fingerprint,
      } }),
      prisma.campaign.update({ where: { id: source.campaignId }, data: {
        status: campaignStatus,
        published: unchanged && result.status === "VERIFIED" ? source.campaign.published : false,
      } }),
    ]);
    results.push({ sourceId: source.id, status: campaignStatus });
  }
  return results;
}
