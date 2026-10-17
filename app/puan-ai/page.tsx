import type { Metadata } from "next";
import { PuanAICampaignExplorer, PuanAIChat } from "@/components/puan-ai-chat";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import { PuanAIQuickCompare } from "@/components/puan-ai-quick-compare";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { getChannelTool } from "@/lib/channel-tools";
import { SeoExplainer } from "@/components/seo-explainer";

const ogImage = `${SITE_URL}/api/visual-card?tool=puan-ai&format=png&title=Do%C4%9Frulanm%C4%B1%C5%9F+Banka+ve+Kredi+Kart%C4%B1+Kampanya+Asistan%C4%B1`;

export const metadata: Metadata = {
  title: "PuanAI · Güncel Kredi Kartı Kampanyaları ve Taksit Karşılaştırma Asistanı",
  description:
    "Türkiye'deki resmî banka ve kredi kartı kampanyalarını (Axess, Bonus, World, Maximum, Bankkart, Paraf, CardFinans) mağaza, tutar, puan ödülü ve taksit koşullarına göre karşılaştırın.",
  keywords: [
    "güncel kredi kartı kampanyaları",
    "banka kampanya karşılaştırma",
    "Axess chip-para kampanyaları",
    "Garanti Bonus kampanyaları",
    "Yapı Kredi Worldpuan fırsatları",
    "Maximum kart kampanyaları",
    "Bankkart lira kampanyaları",
    "peşin fiyatına taksit yapan kartlar",
    "PuanAI",
  ],
  alternates: { canonical: "/puan-ai" },
  openGraph: {
    title: "PuanAI · Harcamadan Önce Kart Kampanyanı Doğrula — Üretir",
    description: "Resmî kaynaklı banka ve kredi kartı kampanyalarını doğal dille karşılaştırın.",
    url: `${SITE_URL}/puan-ai`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 675, alt: "PuanAI Kart Kampanya Asistanı" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PuanAI · Kredi Kartı Kampanya ve Taksit Asistanı",
    description: "Axess, Bonus, World, Maximum ve Bankkart kampanyalarını tek ekranda karşılaştırın.",
    images: [ogImage],
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PuanAI",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: absoluteUrl("/puan-ai"),
  inLanguage: "tr-TR",
  description: "Resmî kaynakla doğrulanmış kredi kartı kampanyalarını açıklayan alışveriş karar asistanı.",
};

export default function PuanAIPage() {
  return (
    <div className="page-reveal pa-page">
      <JsonLd data={softwareSchema} />
      <ChannelToolNavigation active="puan-ai" />
      <PuanAIQuickCompare />
      <PuanAIChat />
      <section className="section-wrap pa-whatsapp" aria-label="WhatsApp gündem kanalı">
        <div>
          <h2>PuanAI gelişmelerini WhatsApp’tan takip et.</h2>
          <p>Doğrulanmış kart kampanyaları ve kullanım notları için PuanAI kanalına katıl.</p>
        </div>
        <a href={getChannelTool("puan-ai").channelUrl} target="_blank" rel="noopener noreferrer">
          PuanAI kanalına katıl <span aria-hidden="true">↗</span>
        </a>
      </section>
      <div className="section-wrap">
        <PuanAICampaignExplorer />
      </div>
      <SeoExplainer slug="puan-ai" />
    </div>
  );
}
