import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAutomotiveSnapshot } from "@/lib/araba-ai/analysis";
import { getChannelTool } from "@/lib/channel-tools";
import { withReadRetry } from "@/lib/read-retry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " TL";
const whatsappChannel = getChannelTool("araba-ai").channelUrl;

function auth(r: NextRequest) {
  return [process.env.CRON_SECRET, process.env.WHATSAPP_BOT_SECRET].some((t) =>
    Boolean(t && r.headers.get("authorization") === "Bearer " + t)
  );
}

export async function GET(r: NextRequest) {
  if (!auth(r)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  try {
    const data = await withReadRetry(() => getAutomotiveSnapshot());
    const brands = [
      ...new Set([...data.prices.map((p) => p.brand), ...data.campaigns.map((c) => c.brand)]),
    ];
    const items = brands
      .map((brand) => {
        const prices = data.prices.filter((p) => p.brand === brand).slice(0, 6);
        const campaigns = data.campaigns.filter((c) => c.brand === brand && c.validUntil).slice(0, 3);
        if (!prices.length && !campaigns.length) return null;

        const lead = prices[0];
        const leadUsedEst = lead ? Math.round(lead.effectivePrice * 0.88) : null;
        const lines = [
          `🚗 *ARABAAI | ${brand.toLocaleUpperCase("tr-TR")} SIFIR & 2. EL FİYAT RADARI*`,
          "",
          `📌 *Öne Çıkan Model:* ${lead ? `${brand} ${lead.model}` : `${brand} Türkiye Güncel Liste`}`,
        ];

        if (prices.length) {
          lines.push("", "💰 *Resmî Sıfır Liste & Kampanya Fiyatları:*");
          for (const p of prices) {
            const diff =
              p.changePct === null
                ? ""
                : ` _(${p.changePct > 0 ? "+" : ""}${p.changePct.toFixed(1)}%)_`;
            const campBadge =
              p.campaignPrice && p.campaignPrice < p.listPrice
                ? ` · 🏷️ Liste: ~${tl(p.listPrice)}~`
                : "";
            lines.push(`• *${p.model}:* *${tl(p.effectivePrice)}*${campBadge}${diff}`);
          }
        }

        if (lead && leadUsedEst) {
          lines.push(
            "",
            `📊 *ArabaAI 2. El Piyasa Referansı:*`,
            `• Sıfır Liste: *${tl(lead.effectivePrice)}* · Tahmini 2. El Emsal: *~${tl(leadUsedEst)}*`
          );
        }

        if (campaigns.length) {
          lines.push("", "🎯 *Resmî Finansman & Kampanya Koşulları:*");
          for (const c of campaigns) {
            lines.push(
              `• *${c.title}* (Son gün: ${new Date(c.validUntil!).toLocaleDateString("tr-TR", {
                timeZone: "Europe/Istanbul",
              })})\n  🔗 ${c.sourceUrl}`
            );
          }
        } else if (lead?.sourceUrl) {
          lines.push("", "🔗 *Resmî Marka Fiyat Listesi:*", lead.sourceUrl);
        }

        lines.push(
          "",
          "🗺️ *Haritalı 2. El İlanları ve Tüm Sıfır Araç Fiyatlarını Kıyasla:*",
          "https://www.uretir.com/araba-ai",
          "",
          "*ArabaAI • uretir.com | Türkiye Üretir, Gençler Yetişir*"
        );

        const body = lines.join("\n");
        const fingerprint = createHash("sha256").update(body + ":v2").digest("hex").slice(0, 24);
        const cardParams = new URLSearchParams({
          tool: "araba-ai",
          format: "png",
          title: lead ? `${brand} ${lead.model}` : `${brand} Türkiye Kampanya Listesi`,
          subtitle: `${brand} Resmî Sıfır Liste & 2. El Piyasa Karşılaştırması`,
          price: lead ? tl(lead.effectivePrice) : "Kampanyalı Liste",
          badge: `ARABAAI · ${brand.toUpperCase()} FİYAT RADARI`,
          s1l: "Model Sayısı",
          s1v: `${prices.length} Güncel Donanım`,
          s2l: "2. El Emsal Ort.",
          s2v: leadUsedEst ? tl(leadUsedEst) : "Resmî Kaynak",
        });

        return {
          fingerprint,
          brand,
          category: "automotive",
          source_url: lead?.sourceUrl || campaigns[0]?.sourceUrl || "https://www.uretir.com/araba-ai",
          image_url: `https://www.uretir.com/api/visual-card?${cardParams.toString()}`,
          body,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ channel_url: whatsappChannel, items, checkedAt: data.checkedAt });
  } catch {
    return NextResponse.json({ error: "ArabaAI kanal içeriği hazırlanamadı." }, { status: 503 });
  }
}
