import "dotenv/config";
import { getPrisma } from "../lib/puan-ai/db";

async function main() {
  const prisma = getPrisma();
  const now = new Date();
  const expired = await prisma.campaign.updateMany({ where: { endDate: { lt: now }, status: { not: "EXPIRED" } }, data: { status: "EXPIRED", published: false } });
  const stale = await prisma.verificationLog.findMany({ where: { nextCheckAt: { lt: now }, status: "VERIFIED" }, select: { campaignId: true } });
  if (stale.length) await prisma.campaign.updateMany({ where: { id: { in: [...new Set(stale.map((item) => item.campaignId))] } }, data: { status: "UNVERIFIED", published: false } });
  console.log(JSON.stringify({ expired: expired.count, stale: stale.length, checkedAt: now.toISOString() }));
  await prisma.$disconnect();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
