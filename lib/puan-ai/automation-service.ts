import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/puan-ai/db";
import { processPendingCampaignSubmissions } from "@/lib/puan-ai/intake-service";
import { enforceCampaignFreshness } from "@/lib/puan-ai/maintenance-service";
import { refreshOfficialSources } from "@/lib/puan-ai/source-refresh-service";
import { discoverMonthlyCampaigns } from "@/lib/puan-ai/discovery-service";

function json(value: unknown) { return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue; }

export async function runPuanAIAutomation(triggeredBy: "vercel-cron" | "github-actions" | "manual", sourceLimit = 50) {
  const prisma = getPrisma();
  const run = await prisma.automationRun.create({ data: { job: "puanai-full-refresh", triggeredBy } });
  try {
    const freshness = await enforceCampaignFreshness();
    const intake = await processPendingCampaignSubmissions(Math.min(sourceLimit, 2));
    const sources = await refreshOfficialSources(sourceLimit);
    const discovery = await discoverMonthlyCampaigns().catch(()=>({status:"source_unavailable",queued:0}));
    const summary = { freshness, intake: intake.map(({ id, status }) => ({ id, status })), sources, discovery };
    await prisma.automationRun.update({ where: { id: run.id }, data: { status: "SUCCESS", completedAt: new Date(), summary: json(summary) } });
    return { runId: run.id, ...summary };
  } catch (error) {
    await prisma.automationRun.update({ where: { id: run.id }, data: { status: "FAILED", completedAt: new Date(), error: error instanceof Error ? error.message : "Bilinmeyen otomasyon hatası." } });
    throw error;
  }
}
