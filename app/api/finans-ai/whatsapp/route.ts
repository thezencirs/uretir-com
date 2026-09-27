import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getFinanceSnapshot, whatsappChannel } from "@/lib/finans-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  return [process.env.CRON_SECRET, process.env.WHATSAPP_BOT_SECRET]
    .some((token) => Boolean(token && request.headers.get("authorization") === `Bearer ${token}`));
}

function formatPrice(value: number | null, unit: string) {
  if (value === null || !Number.isFinite(value)) return "veri bekleniyor";
  const digits = Math.abs(value) >= 1000 ? 2 : Math.abs(value) >= 10 ? 3 : 4;
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: digits }).format(value)} ${unit}`.trim();
}

function formatChange(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "";
  return ` (${value >= 0 ? "+" : ""}${value.toFixed(2)}%)`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });

  try {
    const snapshot = await getFinanceSnapshot();
    const wanted = ["USD", "EUR", "GRAM", "XU100.IS", "BTC-USD", "BRENT"];
    const selected = wanted.flatMap((id) => snapshot.items.filter((item) => item.id === id)).filter((item) => item.price !== null);

    if (!selected.length) {
      return NextResponse.json({ channel_url: whatsappChannel, bulletin: null });
    }

    const fingerprint = createHash("sha256")
      .update(JSON.stringify(selected.map((item) => [item.id, item.price, item.change, item.asOf])))
      .digest("hex")
      .slice(0, 24);

    const rows = selected.map((item) =>
      `• *${item.name}:* ${formatPrice(item.price, item.unit)}${formatChange(item.change)}`
    );

    const body = [
      "📊 *FİNANSAI | PİYASA ÖZETİ*",
      ...rows,
      "",
      "Veri zamanları ve kaynak detayları:",
      "https://www.uretir.com/finans-ai",
      "",
      "*FinansAI • uretir.com*",
    ].join("\n");

    return NextResponse.json({
      channel_url: whatsappChannel,
      fingerprint,
      body,
      checkedAt: snapshot.checkedAt,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "FinansAI bülteni hazırlanamadı." }, { status: 503 });
  }
}
