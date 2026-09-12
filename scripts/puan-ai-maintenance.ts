import "dotenv/config";
import { getPrisma } from "../lib/puan-ai/db";
import { enforceCampaignFreshness } from "../lib/puan-ai/maintenance-service";

async function main() {
  const prisma = getPrisma();
  const result = await enforceCampaignFreshness();
  console.log(JSON.stringify({ ...result, checkedAt: new Date().toISOString() }));
  await prisma.$disconnect();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
