import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getEvAIReport, type EvCandidate } from "@/lib/ev-ai/analysis";
import { getChannelTool } from "@/lib/channel-tools";
import { withReadRetry } from "@/lib/read-retry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const whatsappChannel = getChannelTool("ev-ai").channelUrl;
const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " TL";

function auth(r: NextRequest) {
  return [process.env.CRON_SECRET, process.env.WHATSAPP_BOT_SECRET].some((t) =>
    Boolean(t && r.headers.get("authorization") === "Bearer " + t)
  );
}

function buildVisualCardUrl(i: EvCandidate) {
  const loc = [i.city, i.district].filter(Boolean).join(" / ") || "Türkiye";
  const det = [i.rooms, i.grossM2 ? i.grossM2 + " m²" : null].filter(Boolean).join(" · ") || "Taşınmaz";
  const priceStr = i.price ? tl(i.price) : "Kaynağı İncele";
  const params = new URLSearchParams({
    tool: "ev-ai",
    format: "png",
    title: i.title.slice(0, 80),
    subtitle: `${loc} · ${det} · ${i.sourceName}`,
    price: priceStr,
    badge: i.isPublicAuction ? "EVAI · KAMU / İHALE SATIŞI" : `EVAI SKORU ${i.score}/100`,
    s1l: "Konum & Özellik",
    s1v: `${loc} (${det})`,
    s2l: i.localMedianPerM2 ? "Bölge m² Medyanı" : "EvAI Analiz Skoru",
    s2v: i.localMedianPerM2
      ? `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(i.localMedianPerM2)} TL/m²`
      : `${i.score}/100 Doğrulandı`,
  });
  if (i.imageUrl) params.set("image", i.imageUrl);
  return `https://www.uretir.com/api/visual-card?${params.toString()}`;
}

function body(i: EvCandidate) {
  const head = i.isPublicAuction
    ? "🏛️ *EVAI | KAMU & İHALE TAŞINMAZ ANALİZİ*"
    : "🏠 *EVAI | BÖLGESEL KONUT & ARSA RADARI*";
  const loc = [i.city, i.district].filter(Boolean).join(" / ") || "Türkiye Geneli";
  const propLabel =
    i.propertyType === "LAND"
      ? "Arsa / Tarla"
      : i.propertyType === "COMMERCIAL"
        ? "Ticari Taşınmaz"
        : "Konut / Daire";
  const det = [propLabel, i.rooms, i.grossM2 ? i.grossM2 + " m² (Brüt)" : null]
    .filter(Boolean)
    .join(" · ");
  const price = i.price ? tl(i.price) : "Bedel için resmî şartnameyi inceleyin";
  const ppm = i.pricePerM2
    ? new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(i.pricePerM2) + " TL/m²"
    : null;
  const medStr = i.localMedianPerM2
    ? new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(i.localMedianPerM2) + " TL/m²"
    : null;
  const deltaStr =
    i.valueDeltaPct !== null && i.valueDeltaPct > 0
      ? `📉 *Bölge Avantajı:* Yerel m² medyanının *%${i.valueDeltaPct.toFixed(1)} altında*`
      : null;
  const dropStr =
    i.priceDropPct !== null && i.priceDropPct >= 1
      ? `🔻 *Fiyat Değişimi:* Önceki gözleme göre *%${i.priceDropPct.toFixed(1)} indirim*`
      : null;
  const w = i.isPublicAuction
    ? "⚠️ *İhale Notu:* Kamu/icra ilanındaki muhammen bedel başlangıç referansıdır; tapu kaydı ve ihale şartnamesini resmî kaynaktan inceleyin."
    : "✅ *EvAI Notu:* Konum, m² birim fiyatı ve bölgesel emsal verileriyle otomatik karşılaştırılmıştır.";

  return [
    head,
    "",
    `📌 *${i.title}*`,
    `📍 *Konum:* ${loc}`,
    `📐 *Özellikler:* ${det}`,
    `💰 *İlan Bedeli:* *${price}*${ppm ? ` _(${ppm})_` : ""}`,
    medStr ? `📊 *Bölge m² Ortalaması:* ${medStr}` : null,
    deltaStr,
    dropStr,
    `🧠 *EvAI Yapay Zekâ Skoru:* *${i.score}/100*`,
    `💡 *Öne Çıkan Nedenler:* ${i.reasons.join(" · ")}`,
    "",
    w,
    "",
    "🔗 *Resmî İlan Kaynağı:*",
    i.sourceUrl,
    "",
    "🗺️ *Haritada İncele & Emsal Karşılaştır:*",
    "https://www.uretir.com/ev-ai",
    "",
    "*EvAI • uretir.com | Türkiye Üretir, Gençler Yetişir*",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function GET(r: NextRequest) {
  if (!auth(r)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  try {
    const d = await withReadRetry(() => getEvAIReport());
    const items = d.items.slice(0, 40).map((i) => ({
      fingerprint: createHash("sha256")
        .update(JSON.stringify([i.listingKey, i.title, i.price, i.grossM2, i.rooms, i.sourceUrl, "v2"]))
        .digest("hex")
        .slice(0, 24),
      source: i.sourceId,
      category: i.listingType,
      city: i.city,
      title: i.title,
      price: i.price,
      source_url: i.sourceUrl,
      image_url: buildVisualCardUrl(i),
      body: body(i),
    }));
    return NextResponse.json({
      channel_url: whatsappChannel,
      items,
      dailyTarget: 10,
      checkedAt: d.checkedAt,
    });
  } catch {
    return NextResponse.json({ error: "EvAI kanal içeriği hazırlanamadı." }, { status: 503 });
  }
}