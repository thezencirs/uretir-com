import "dotenv/config";
import { getPrisma } from "../lib/puan-ai/db";
import { refreshOfficialSources } from "../lib/puan-ai/source-refresh-service";

async function main() {
  const prisma = getPrisma();
  const results = await refreshOfficialSources(100);
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), sources: results }));
  await prisma.$disconnect();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
