import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getFinanceSnapshot, whatsappChannel } from "@/lib/finans-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  return [process.env.CRON_SECRET, process.env.WHATSAPP_BOT_SECRET].some((token) =>
    Boolean(token && request.headers.get("authorization") === `Bearer ${token}`)
  );
}

function formatPrice(value: number | null, unit: string) {
  if (value === null || !Number.isFinite(value)) return "veri bekleniyor";
  const digits = Math.abs(value) >= 1000 ? 2 : Math.abs(value) >= 10 ? 3 : 4;
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: digits }).format(value)} ${unit}`.trim();
}

function formatChange(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "";
  const icon = value > 0 ? "🟢 +" : value < 0 ? "🔴 " : "⚪ ";
  return ` _(${icon}${value.toFixed(2)}%)_`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const snapshot = await getFinanceSnapshot();
    const wanted = ["USD", "EUR", "GRAM", "XU100.IS", "BTC-USD", "BRENT"];
    const selected = wanted
      .flatMap((id) => snapshot.items.filter((item) => item.id === id))
      .filter((item) => item.price !== null);

    if (!selected.length) {
      return NextResponse.json({ channel_url: whatsappChannel, bulletin: null });
    }

    const fingerprint = createHash("sha256")
      .update(JSON.stringify([...selected.map((item) => [item.id, item.price, item.change, item.asOf]), "v2"]))
      .digest("hex")
      .slice(0, 24);

    const rows = selected.map(
      (item) => `• *${item.name}:* *${formatPrice(item.price, item.unit)}*${formatChange(item.change)}`
    );

    const usd = selected.find((x) => x.id === "USD");
    const gram = selected.find((x) => x.id === "GRAM");
    const bist = selected.find((x) => x.id === "XU100.IS");

    const body = [
      "📊 *FİNANSAI | CANLI PİYASA & EKONOMİ RAPORU*",
      "",
      "💱 *Anlık Döviz, Altın, Borsa ve Emtia Gösterge Tablosu:*",
      ...rows,
      "",
      "🧠 *FinansAI Özeti:* Döviz kurları, gram altın, BIST 100 endeksi ve küresel emtia verileri resmî piyasa akışlarıyla senkronize güncellenmektedir.",
      "",
      "🔎 *Canlı Grafikler ve Detaylı Piyasa Ekranı:*",
      "https://www.uretir.com/finans-ai",
      "",
      "*FinansAI • uretir.com | Türkiye Üretir, Gençler Yetişir*",
    ].join("\n");

    const cardParams = new URLSearchParams({
      tool: "finans-ai",
      format: "png",
      title: `Dolar ${usd ? formatPrice(usd.price, usd.unit) : ""} · Gram Altın ${gram ? formatPrice(gram.price, gram.unit) : ""}`,
      subtitle: "Döviz · Altın · BIST 100 · Bitcoin · Brent Petrol Canlı Piyasa Özeti",
      price: gram ? `Altın: ${formatPrice(gram.price, gram.unit)}` : "Canlı Piyasalar",
      badge: "FİNANSAI · CANLI EKONOMİ EKRANI",
      s1l: "Dolar / TL",
      s1v: usd ? formatPrice(usd.price, usd.unit) : "Canlı",
      s2l: "BIST 100 Endeksi",
      s2v: bist ? formatPrice(bist.price, bist.unit) : "Canlı",
    });

    return NextResponse.json(
      {
        channel_url: whatsappChannel,
        fingerprint,
        body,
        image_url: `https://www.uretir.com/api/visual-card?${cardParams.toString()}`,
        checkedAt: snapshot.checkedAt,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "FinansAI bülteni hazırlanamadı." }, { status: 503 });
  }
}
