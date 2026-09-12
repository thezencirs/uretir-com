import { NextResponse, type NextRequest } from "next/server";
import { runPuanAIAutomation } from "@/lib/puan-ai/automation-service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  try {
    return NextResponse.json(await runPuanAIAutomation("vercel-cron", 4));
  } catch {
    return NextResponse.json({ error: "PuanAI otomasyonu tamamlanamadı." }, { status: 503 });
  }
}
