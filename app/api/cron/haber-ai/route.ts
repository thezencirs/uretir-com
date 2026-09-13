import { NextRequest, NextResponse } from "next/server";
import { collectNews } from "@/lib/haber-ai/collector";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (![process.env.CRON_SECRET, process.env.WHATSAPP_BOT_SECRET].some(secret => secret && token === secret)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  try {
    const run = await collectNews();
    return NextResponse.json(run, { status: "status" in run && run.status === "failed" ? 503 : 200 });
  } catch {
    return NextResponse.json({ error: "HaberAI otomasyonu tamamlanamadı." }, { status: 503 });
  }
}
