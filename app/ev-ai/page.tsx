import type { Metadata } from "next";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { MarketplaceHub } from "@/components/marketplace-hub";
import { marketplaceDashboard } from "@/lib/marketplace/store";
import { SeoExplainer } from "@/components/seo-explainer";
import { SITE_URL } from "@/lib/seo";

const ogImage = `${SITE_URL}/api/visual-card?tool=ev-ai&format=png&title=Harital%C4%B1+Konut%2C+Arsa+ve+Kamu+%C4%B0hale+Ta%C5%9F%C4%B1nmaz+Analizi`;

export const metadata: Metadata = {
  title: "EvAI · Haritalı Konut, Arsa, m² Fiyat Referansı ve Kamu İhale Taşınmaz Analizi",
  description:
    "Satılık/kiralık konut, arsa ve kamu ihale taşınmazlarını Türkiye haritasında inceleyin; bölgesel metrekare (m²) fiyat referansını görün ve Üretir ID ile güvenli ilan verin.",
  keywords: [
    "konut metrekare fiyatları",
    "kamu ihale satılık daire arsa",
    "icradan satılık taşınmazlar",
    "haritalı satılık ev karşılaştırma",
    "bölgesel emlak fiyat endeksi",
    "EvAI",
  ],
  alternates: { canonical: "/ev-ai" },
  openGraph: {
    title: "EvAI · Haritalı Konut, Arsa ve Kamu İhale Taşınmaz Analizi — Üretir",
    description: "Ev, arsa ve kamu taşınmazlarını haritada inceleyin; bölgesel m² fiyat referansını karşılaştırın.",
    url: `${SITE_URL}/ev-ai`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 675, alt: "EvAI Haritalı Konut ve Taşınmaz Analizi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EvAI · Haritalı Konut, Arsa ve Kamu İhale Analizi",
    description: "Bölgesel m² medyanı, konut ilanları ve kamu ihale taşınmaz fırsatları tek haritada.",
    images: [ogImage],
  },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await marketplaceDashboard("property");
  return (
    <>
      <ChannelToolNavigation active="ev-ai" />
      <MarketplaceHub data={data} />
      <SeoExplainer slug="ev-ai" />
    </>
  );
}