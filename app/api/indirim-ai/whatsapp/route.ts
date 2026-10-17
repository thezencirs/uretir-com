import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPriceLowReport, rankPriceDeals, type RankedPriceDeal } from "@/lib/indirim-ai/analysis";
import { getChannelTool } from "@/lib/channel-tools";
import { withReadRetry } from "@/lib/read-retry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " TL";
const whatsappChannel = getChannelTool("indirim-ai").channelUrl;
const medals = ["🥇", "🥈", "🥉"];

function row(entry: RankedPriceDeal, index: number) {
  const i = entry.item;
  const why = entry.qualified
    ? `${i.windowDays} günlük fiyat geçmişinde *DÖNEM DİBİ* · Zirveden *%${i.dropFromHighPct.toFixed(1)} daha ucuz*`
    : `Takip geçmişi: ${i.coverageDays} gün (${i.observedDays} ayrı gözlem) · Zirveden *%${i.dropFromHighPct.toFixed(1)} aşağıda*`;
  return [
    `${medals[index]} *${index + 1}. FIRSAT · ${i.merchantName.toUpperCase()}*`,
    `📌 *${i.productName}*`,
    `💰 Güncel Dip Fiyat: *${tl(i.currentPrice)}* _(Zirve: ~${tl(i.windowHighPrice)}~)_`,
    `📊 Analiz: ${why}`,
    `🔗 Doğrudan Ürün: ${i.sourceUrl}`,
  ].join("\n");
}

export async function GET(r: NextRequest) {
  try {
    const report = await withReadRetry(() => getPriceLowReport()),
      top = rankPriceDeals(report);
    if (!top.length)
      return NextResponse.json({
        channel_url: whatsappChannel,
        body: null,
        status: "price_history_accumulating",
        coverage: { products: report.productCount, observations: report.observationCount },
      });

    const lead = top[0].item;
    const body = [
      "🏷️ *İNDİRİMAI | 30/90/360 GÜN DİP FİYAT RADARI*",
      "Sahte indirimleri eleyen gerçek fiyat geçmişi algoritmasıyla günün en avantajlı 3 ürünü:",
      ...top.map(row),
      "",
      "🔎 *Tüm Dip Fiyatlı Ürünleri ve Fiyat Grafiğini İncele:*",
      "https://www.uretir.com/indirim-ai",
      "",
      "*İndirimAI • uretir.com | Türkiye Üretir, Gençler Yetişir*",
    ].join("\n\n");

    const fingerprint = createHash("sha256")
      .update(
        JSON.stringify([
          ...top.map((x) => [x.item.productKey, x.item.currentPrice, x.label]),
          "v2",
        ])
      )
      .digest("hex")
      .slice(0, 24);

    const cardParams = new URLSearchParams({
      tool: "indirim-ai",
      format: "png",
      title: lead.productName.slice(0, 80),
      subtitle: `${lead.merchantName} · ${lead.windowDays} Günlük Fiyat Geçmişinde Dip Seviye`,
      price: tl(lead.currentPrice),
      badge: `İNDİRİMAI · -%${lead.dropFromHighPct.toFixed(1)} GERÇEK DÜŞÜŞ`,
      s1l: "Zirve Fiyat",
      s1v: tl(lead.windowHighPrice),
      s2l: "Fiyat Avantajı",
      s2v: `%${lead.dropFromHighPct.toFixed(1)} İndirim`,
    });
    const rawProductImg = top.find((x) => x.item.imageUrl)?.item.imageUrl;
    if (rawProductImg) cardParams.set("image", rawProductImg);

    return NextResponse.json({
      channel_url: whatsappChannel,
      fingerprint,
      body,
      image_url: `https://www.uretir.com/api/visual-card?${cardParams.toString()}`,
      ranked: top.map((x, index) => ({
        rank: index + 1,
        productKey: x.item.productKey,
        title: x.item.productName,
        price: x.item.currentPrice,
        merchant: x.item.merchantName,
        image_url: x.item.imageUrl,
        source_url: x.item.sourceUrl,
        label: x.label,
        qualified: x.qualified,
      })),
      status: top.every((x) => x.qualified) ? "ranked_price_lows" : "ranked_tracking",
      checkedAt: report.checkedAt,
      coverage: { products: report.productCount, observations: report.observationCount },
    });
  } catch (error) {
    console.error("IndirimAI WhatsApp feed unavailable", error);
    return NextResponse.json(
      {
        channel_url: whatsappChannel,
        body: null,
        image_url: null,
        ranked: [],
        status: "temporarily_unavailable",
        checkedAt: new Date().toISOString(),
        coverage: { products: 0, observations: 0 },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
