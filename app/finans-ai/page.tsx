import type { Metadata } from "next";
import { FinanceDashboard } from "@/components/finance-dashboard";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { SeoExplainer } from "@/components/seo-explainer";
import { SITE_URL } from "@/lib/seo";

const ogImage = `${SITE_URL}/api/visual-card?tool=finans-ai&format=png&title=Canl%C4%B1+D%C3%B6viz%2C+Alt%C4%B1n%2C+BIST+100+ve+Emtia+Piyasa+Ekran%C4%B1`;

export const metadata: Metadata = {
  alternates: { canonical: "/finans-ai" },
  title: "FinansAI · Canlı Döviz, Gram Altın, BIST 100, Kripto ve Emtia Ekranı",
  description:
    "TCMB döviz kurları (Dolar, Euro), gram altın, Borsa İstanbul BIST 100, Bitcoin ve Brent petrol fiyatlarını birincil kaynak ve 1 aylık eğilim grafikleriyle takip edin.",
  keywords: [
    "canlı döviz kuru",
    "gram altın fiyatı",
    "Borsa İstanbul BIST 100",
    "dolar euro TL",
    "Bitcoin fiyatı",
    "Brent petrol",
    "FinansAI",
  ],
  openGraph: {
    title: "FinansAI · Canlı Döviz, Altın, BIST 100 ve Piyasa Ekranı — Üretir",
    description: "Borsa İstanbul, döviz, altın, kripto ve emtia fiyatlarını kaynak ve veri zamanıyla takip edin.",
    url: `${SITE_URL}/finans-ai`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 675, alt: "FinansAI Canlı Piyasa Ekranı" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinansAI · Canlı Döviz, Altın ve BIST 100 Ekranı",
    description: "Dolar, Euro, Gram Altın, BIST 100 ve emtia verilerini canlı takip edin.",
    images: [ogImage],
  },
};

export default function Page() {
  return (
    <>
      <ChannelToolNavigation active="finans-ai" />
      <FinanceDashboard />
      <SeoExplainer slug="finans-ai" />
    </>
  );
}
