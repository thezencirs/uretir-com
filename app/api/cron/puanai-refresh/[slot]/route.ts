import { NextResponse, type NextRequest } from "next/server";
import { runPuanAIAutomation } from "@/lib/puan-ai/automation-service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest, context: { params: Promise<{ slot: string }> }) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const { slot } = await context.params;
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET || !["02", "08", "14", "20"].includes(slot)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  try { return NextResponse.json(await runPuanAIAutomation("vercel-cron", 4)); }
  catch { return NextResponse.json({ error: "PuanAI otomasyonu tamamlanamadı." }, { status: 503 }); }
}
