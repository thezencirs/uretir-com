import type { Metadata } from "next";
import { PuanAICampaignExplorer, PuanAIChat } from "@/components/puan-ai-chat";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/seo";
import { PuanAIQuickCompare } from "@/components/puan-ai-quick-compare";

export const metadata: Metadata = {
  title: "PuanAI — Güncel kredi kartı kampanya asistanı",
  description: "Türkiye'deki doğrulanmış banka ve kredi kartı kampanyalarını mağaza, tutar, ödül ve taksit koşullarına göre karşılaştır.",
  alternates: { canonical: "/puan-ai" },
  openGraph: {
    title: "PuanAI — Harcamadan önce kampanyanı doğrula",
    description: "Resmî kaynaklı banka ve kredi kartı kampanyalarını doğal dille karşılaştır.",
    url: "/puan-ai",
    type: "website",
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
  return <div className="page-reveal pa-page">
    <JsonLd data={softwareSchema} />
    <PuanAIQuickCompare />
    <PuanAIChat />
    <section className="section-wrap pa-whatsapp" aria-label="WhatsApp gündem kanalı">
      <div><h2>PuanAI gelişmelerini WhatsApp’tan takip et.</h2><p>Yeni doğrulanmış kampanyalar, veri güncellemeleri ve kısa kullanım notları HaberAI kanalı üzerinden paylaşılır. Gündemi tek yerden takip etmek için kanala katıl.</p></div>
      <a href="https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y" target="_blank" rel="noreferrer">WhatsApp kanalına katıl <span aria-hidden="true">↗</span></a>
    </section>
    <div className="section-wrap"><PuanAICampaignExplorer /></div>
  </div>;
}
