import "dotenv/config";
import { getPrisma } from "../lib/puan-ai/db";
import { runPuanAIAutomation } from "../lib/puan-ai/automation-service";

const result = await runPuanAIAutomation(process.env.GITHUB_ACTIONS ? "github-actions" : "manual", 100);
console.log(JSON.stringify(result));
await getPrisma().$disconnect();
