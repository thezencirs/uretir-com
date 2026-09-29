import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const feeds: Record<string,string> = {
  "haber-ai": "/api/haber-ai/whatsapp",
  "finans-ai": "/api/finans-ai/whatsapp",
  "puan-ai": "/api/puan-ai/whatsapp",
  "indirim-ai": "/api/indirim-ai/whatsapp",
  "araba-ai": "/api/araba-ai/whatsapp",
  "ev-ai": "/api/ev-ai/whatsapp",
};

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const endpoint = feeds[slug];
  if (!endpoint) return NextResponse.json({ error: "Kanal bulunamadı." }, { status: 404 });

  const secret = process.env.WHATSAPP_BOT_SECRET || process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Yayın geçidi yapılandırılmadı." }, { status: 503 });

  try {
    const target = new URL(endpoint, request.nextUrl.origin);
    const response = await fetch(target, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(65_000),
    });
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Kanal yayını okunamadı." }, { status: 503 });
  }
}
