import "dotenv/config";
import { getPrisma } from "../lib/puan-ai/db";
import { processPendingCampaignSubmissions } from "../lib/puan-ai/intake-service";

const results = await processPendingCampaignSubmissions(100);
console.log(JSON.stringify({ processed: results.length, results: results.map(({ id, status }) => ({ id, status })) }));
await getPrisma().$disconnect();
