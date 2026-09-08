import type { Metadata } from "next";
import { PuanAICampaignExplorer, PuanAIChat } from "@/components/puan-ai-chat";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/seo";

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
    <PuanAIChat />
    <div className="section-wrap">
      <section className="pa-whatsapp" aria-labelledby="pa-whatsapp-title">
        <div>
          <h2 id="pa-whatsapp-title">Güzel fırsatları birbirimizden duyalım.</h2>
          <p>İlgimizi çeken kampanyaları WhatsApp kanalımızda paylaşıyoruz. Sen de aramıza katıl; alışveriş zamanı geldiğinde tutarını ve kartlarını PuanAI’a yaz, koşulları birlikte karşılaştıralım.</p>
        </div>
        <a href="https://whatsapp.com/channel/0029VbDbbII8PgsA574OLl1H" target="_blank" rel="noopener noreferrer">WhatsApp’ta buluşalım <span aria-hidden="true">↗</span></a>
      </section>
      <PuanAICampaignExplorer />
    </div>
  </div>;
}
