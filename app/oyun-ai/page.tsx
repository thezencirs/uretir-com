import type { Metadata } from "next";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { OyunAIHub } from "@/components/oyun-ai-hub";
import { SeoExplainer } from "@/components/seo-explainer";
import { SITE_URL } from "@/lib/seo";

const ogImage = `${SITE_URL}/api/visual-card?tool=oyun-ai&format=png&title=Steam+%26+Epic+%C4%B0ndirim+Radar%C4%B1%2C+T%C3%BCrk+St%C3%BCdyolar%C4%B1+ve+Haf%C4%B1za+Oyunu`;

export const metadata: Metadata = {
  title: "OyunAI · Steam & Epic İndirim Radarı, Türk Stüdyoları ve Hafıza Oyunu",
  description:
    "Steam MENA-USD, Epic Games, PlayStation ve Game Pass indirimlerini, Türk oyun stüdyolarını fotoğraflı kartlarla keşfedin; reklamsız İngilizce kelime hafıza oyunu Memo ile zihin egzersizi yapın.",
  keywords: [
    "Steam MENA USD indirimleri",
    "Epic Games ücretsiz oyunlar",
    "Game Pass PlayStation Plus karşılaştırma",
    "Türk oyun stüdyoları",
    "espor turnuva takvimi",
    "İngilizce kelime hafıza oyunu",
    "OyunAI",
  ],
  alternates: { canonical: "/oyun-ai" },
  openGraph: {
    title: "OyunAI · Oyun İndirimleri, Espor ve Hafıza Oyunu — Üretir",
    description:
      "Steam, Epic, PlayStation ve Game Pass fırsatları, Türk oyun ekosistemi ve reklamsız kelime eşleştirme oyunu.",
    url: `${SITE_URL}/oyun-ai`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 675, alt: "OyunAI Gaming ve Hafıza Merkezi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OyunAI · Oyun İndirim Radarı ve İnteraktif Hafıza Oyunu",
    description: "PC/Konsol indirim radarı, Türk oyun stüdyoları ve Memo kelime hafıza oyunu.",
    images: [ogImage],
  },
};

export default function OyunAIPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "OyunAI · Steam & Epic İndirim Radarı, Türk Stüdyoları ve Hafıza Oyunu",
    url: `${SITE_URL}/oyun-ai`,
    description:
      "PC ve konsol oyun indirimleri, Türk oyun ekosistemi analizi ve tarayıcı içi İngilizce kelime hafıza oyunu.",
    isPartOf: {
      "@type": "WebSite",
      name: "Üretir",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ChannelToolNavigation active="oyun-ai" />
      <OyunAIHub />
      <SeoExplainer slug="oyun-ai" />
    </>
  );
}
