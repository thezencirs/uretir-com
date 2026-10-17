import type { Metadata } from "next";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { MarketplaceHub } from "@/components/marketplace-hub";
import { marketplaceDashboard } from "@/lib/marketplace/store";
import { SeoExplainer } from "@/components/seo-explainer";
import { SITE_URL } from "@/lib/seo";

const ogImage = `${SITE_URL}/api/visual-card?tool=araba-ai&format=png&title=S%C4%B1f%C4%B1r+Ara%C3%A7+Liste+Fiyatlar%C4%B1+ve+Harital%C4%B1+2.+El+K%C4%B1yaslama`;

export const metadata: Metadata = {
  title: "ArabaAI · Sıfır Araç Liste Fiyatları, Kampanyalar ve Haritalı 2. El Kıyaslama",
  description:
    "Otomobil ilanlarını Türkiye haritasında inceleyin; ilan fiyatını BYD, Renault, Toyota, Volkswagen, Peugeot, Ford resmî sıfır araç liste fiyatı ve 2. el ortalamasıyla karşılaştırın.",
  keywords: [
    "sıfır araç fiyatları 2026",
    "otomobil kampanyaları",
    "ikinci el araba fiyat karşılaştırma",
    "BYD Renault Toyota Volkswagen Peugeot fiyat listesi",
    "elektrikli araç fiyatları Türkiye",
    "ArabaAI",
  ],
  alternates: { canonical: "/araba-ai" },
  openGraph: {
    title: "ArabaAI · Haritalı 2. El ve Sıfır Araç Fiyat Referansı — Üretir",
    description: "Araç ilanlarını haritada inceleyin; resmî sıfır araç fiyatı ve ikinci el ortalamasıyla karşılaştırın.",
    url: `${SITE_URL}/araba-ai`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 675, alt: "ArabaAI Sıfır ve 2. El Araç Fiyat Referansı" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArabaAI · Sıfır Araç Fiyatları ve Haritalı 2. El Kıyaslama",
    description: "Resmî sıfır araç liste fiyatları ve haritalı ikinci el otomobil karşılaştırması.",
    images: [ogImage],
  },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await marketplaceDashboard("vehicle");
  return (
    <>
      <ChannelToolNavigation active="araba-ai" />
      <MarketplaceHub data={data} />
      <SeoExplainer slug="araba-ai" />
    </>
  );
}