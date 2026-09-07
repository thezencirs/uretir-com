import "dotenv/config";
import { getPrisma } from "../lib/puan-ai/db";
import { verifyCampaignUrl } from "../lib/puan-ai/source-verifier";

async function main() {
  const prisma = getPrisma();
  const sources = await prisma.officialSource.findMany({
    where: { active: true },
    include: { campaign: true, verificationLogs: { orderBy: { checkedAt: "desc" }, take: 1 } },
    orderBy: { fetchedAt: "asc" },
  });
  const results: Array<{ sourceId: string; status: string }> = [];
  for (const source of sources) {
    const checkedAt = new Date();
    const result = await verifyCampaignUrl(source.url, checkedAt);
    const previous = source.verificationLogs[0];
    const unchanged = Boolean(result.fingerprint && previous && previous.status === "VERIFIED" && previous.fingerprint === result.fingerprint);
    const verificationStatus = result.status === "SOURCE_UNAVAILABLE" ? "SOURCE_UNAVAILABLE" : unchanged && result.status === "VERIFIED" ? "VERIFIED" : "STALE";
    const campaignStatus = result.status === "EXPIRED" ? "EXPIRED" : result.status === "SOURCE_UNAVAILABLE" ? "SOURCE_UNAVAILABLE" : unchanged ? "ACTIVE" : "UNVERIFIED";
    await prisma.$transaction([
      prisma.officialSource.update({ where: { id: source.id }, data: {
        fetchedAt: checkedAt,
        lastVerifiedAt: result.status === "VERIFIED" ? checkedAt : source.lastVerifiedAt,
        validFrom: result.validFrom ? new Date(result.validFrom) : source.validFrom,
        validUntil: result.validUntil ? new Date(result.validUntil) : source.validUntil,
        fingerprint: result.fingerprint ?? source.fingerprint,
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
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), sources: results }));
  await prisma.$disconnect();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
