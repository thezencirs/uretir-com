import type { Metadata } from "next";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { ToolExplorer } from "@/components/tool-explorer";
import { getPriceLowReport } from "@/lib/indirim-ai/analysis";
import { discountExplorer, unavailableExplorer } from "@/lib/tool-explorer-data";
import { SeoExplainer } from "@/components/seo-explainer";
import { SITE_URL } from "@/lib/seo";

const ogImage = `${SITE_URL}/api/visual-card?tool=indirim-ai&format=png&title=30+%2F+90+%2F+360+G%C3%BCn+Ger%C3%A7ek+Fiyat+Ge%C3%A7mi%C5%9Fi+ve+D%C3%B6nem+Dibi+Radar%C4%B1`;

export const metadata: Metadata = {
  title: "İndirimAI · 30, 90 ve 360 Günlük Fiyat Geçmişi ve Gerçek İndirim Radarı",
  description:
    "30, 90 ve 360 günlük mağaza fiyat gözlemlerini bütçe ve kategoriye göre inceleyin. Sahte indirimleri eleyin, gerçek dönem dibi fırsatları ve kupon kodlarını karşılaştırın.",
  keywords: [
    "fiyat geçmişi takip",
    "gerçek indirim bulucu",
    "son 30 günün en düşük fiyatı",
    "e-ticaret fiyat karşılaştırma",
    "dönem dibi fırsatlar",
    "Dyson indirim kupon kodu",
    "Amazon Trendyol Hepsiburada Teknosa indirim takibi",
    "İndirimAI",
  ],
  alternates: { canonical: "/indirim-ai" },
  openGraph: {
    title: "İndirimAI · Gerçek Fiyat Geçmişi ve Dönem Dibi Analizi — Üretir",
    description: "30, 90 ve 360 günlük fiyat geçmişine dayalı doğrulanmış mağaza indirimleri ve kupon kodları.",
    url: `${SITE_URL}/indirim-ai`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 675, alt: "İndirimAI Fiyat Geçmişi Radarı" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "İndirimAI · Fiyat Geçmişi ve Dönem Dibi Radarı",
    description: "30, 90 ve 360 günlük mağaza fiyat geçmişiyle gerçek indirimleri keşfedin.",
    images: [ogImage],
  },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  let data = unavailableExplorer;
  try {
    data = discountExplorer(await getPriceLowReport());
  } catch {
    /* The workspace and retry remain available. */
  }
  return (
    <>
      <ChannelToolNavigation active="indirim-ai" />
      <ToolExplorer slug="indirim-ai" data={data} />
      <SeoExplainer slug="indirim-ai" />
    </>
  );
}
