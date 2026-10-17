import type { Metadata } from "next";
import { HaberAI } from "@/components/haber-ai";
import { getNewsSnapshot } from "@/lib/haber-ai/store";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { SeoExplainer } from "@/components/seo-explainer";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/haber-ai" },
  title: "HaberAI · 81 İl İnteraktif Türkiye Haber ve Gündem Haritası",
  description:
    "Türkiye'nin 81 ilinde şehir şehir doğrulanmış son gelişmeler, bölgesel ekonomi, sanayi, teknoloji ve yerel gündem haritası. TRT Haber ve Anadolu Ajansı kaynaklı canlı akış.",
  keywords: [
    "81 il son dakika haberleri",
    "Türkiye haber haritası",
    "interaktif şehir gündemi",
    "kaynaklı haberler",
    "ekonomi teknoloji haberleri",
    "il il Türkiye gündemi",
    "HaberAI",
  ],
  openGraph: {
    title: "HaberAI · 81 İl İnteraktif Türkiye Haber Haritası — Üretir",
    description:
      "81 ilin tamamında doğrulanmış kaynak bağlantılarıyla şehir şehir Türkiye gündemi, ekonomi ve teknoloji haritası.",
    url: `${SITE_URL}/haber-ai`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/api/visual-card?tool=haber-ai&format=png&title=81+%C4%B0l+T%C3%BCrkiye+G%C3%BCndem+Haritas%C4%B1`,
        width: 1200,
        height: 675,
        alt: "HaberAI · 81 İl Türkiye Gündem Haritası",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HaberAI · 81 İl İnteraktif Türkiye Haber Haritası",
    description: "Türkiye genelinde 81 ilde şehir şehir doğrulanmış günlük gelişmeler.",
    images: [`${SITE_URL}/api/visual-card?tool=haber-ai&format=png&title=81+%C4%B0l+T%C3%BCrkiye+G%C3%BCndem+Haritas%C4%B1`],
  },
};

export const revalidate = 60;

export default async function Page() {
  const initial = await getNewsSnapshot();
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/haber-ai#collection`,
    name: "HaberAI · 81 İl Türkiye Haber ve Gündem Haritası",
    url: `${SITE_URL}/haber-ai`,
    inLanguage: "tr-TR",
    description:
      "Türkiye'nin 81 ilinde doğrulanmış kaynaklarla güncellenen interaktif haber, ekonomi ve teknoloji haritası.",
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: Math.min(20, initial.articles.length),
      itemListElement: initial.articles.slice(0, 20).map((a, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "NewsArticle",
          headline: a.title,
          description: a.summary || a.title,
          datePublished: a.publishedAt,
          url: a.url,
          publisher: {
            "@type": "Organization",
            name: a.source,
          },
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <ChannelToolNavigation active="haber-ai" />
      <HaberAI initial={initial} />
      <SeoExplainer slug="haber-ai" />
    </>
  );
}
