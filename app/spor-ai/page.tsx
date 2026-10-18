import type { Metadata } from "next";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { SporAIHub } from "@/components/spor-ai-hub";
import { SeoExplainer } from "@/components/seo-explainer";
import { SITE_URL } from "@/lib/seo";

const ogImage = `${SITE_URL}/api/visual-card?tool=spor-ai&format=png&title=S%C3%BCper+Lig+xG+Tablosu%2C+UEFA+%C3%9Clke+Puan%C4%B1+ve+Spor+Ekonomisi`;

export const metadata: Metadata = {
  title: "SporAI · Süper Lig xG Analizi, UEFA Ülke Puanı ve Spor Ekonomisi Radarı",
  description:
    "Süper Lig puan durumu, beklenen gol (xG) istatistikleri, UEFA ülke puanı sıralaması, EuroLeague, Sultanlar Ligi ve BIST spor kulüpleri mali analizlerini fotoğraflı kartlarla inceleyin.",
  keywords: [
    "Süper Lig puan durumu xG",
    "UEFA ülke puanı Türkiye sıralaması",
    "EuroLeague Türk takımları istatistik",
    "BIST spor hisseleri analizi",
    "beklenen gol xG tablosu",
    "SporAI",
    "Üretir spor verileri",
  ],
  alternates: { canonical: "/spor-ai" },
  openGraph: {
    title: "SporAI · Süper Lig xG, UEFA Ülke Puanı ve Spor Ekonomisi — Üretir",
    description:
      "Doğrulanmış Süper Lig xG verileri, UEFA ülke puanı takibi, EuroLeague/Voleybol istatistikleri ve spor ekonomisi bülteni.",
    url: `${SITE_URL}/spor-ai`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 675, alt: "SporAI Veri ve Performans Radarı" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SporAI · Süper Lig xG ve UEFA Ülke Puanı Radarı",
    description: "Süper Lig xG analizi, UEFA ülke katsayısı ve BIST spor ekonomisi verileri.",
    images: [ogImage],
  },
};

export default function SporAIPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SporAI · Süper Lig xG Analizi, UEFA Ülke Puanı ve Spor Ekonomisi Radarı",
    url: `${SITE_URL}/spor-ai`,
    description:
      "Süper Lig puan durumu, xG beklentisi, UEFA ülke puanı sıralaması ve spor ekonomisi veri merkezi.",
    isPartOf: {
      "@type": "WebSite",
      name: "Üretir",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ChannelToolNavigation active="spor-ai" />
      <SporAIHub />
      <SeoExplainer slug="spor-ai" />
    </>
  );
}
