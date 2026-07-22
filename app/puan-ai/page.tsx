import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, BadgePercent, CreditCard, Sparkles, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { PuanAIBrowser } from "@/components/puan-ai-browser";
import { PuanAICampaignCard } from "@/components/puan-ai-campaign-card";
import { collectionPageSchema } from "@/lib/structured-data";
import { getPuanAIBank, puanAICampaigns, puanAICards, puanAIBanks } from "@/lib/puan-ai";

export const metadata: Metadata = {
  title: "PuanAI — Banka kampanyaları ve kart avantajları",
  description: "Hangi kartla nerede daha avantajlı alışveriş yapacağını saniyeler içinde bul. PuanAI banka kampanyalarını ve kart avantajlarını tek yerde toplar.",
  alternates: { canonical: "/puan-ai" },
  openGraph: { title: "PuanAI — Üretir", description: "Banka kampanyalarını ve kart avantajlarını tek merkezden keşfet.", url: "/puan-ai", type: "website" },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PuanAI",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description: "Banka kampanyalarını ve kredi kartı avantajlarını karşılaştıran akıllı alışveriş asistanı.",
  url: "https://uretir.com/puan-ai",
  inLanguage: "tr-TR",
};

export default function PuanAIPage() {
  const activeCampaigns = puanAICampaigns.filter((campaign) => campaign.active);
  const featuredCampaign = puanAICampaigns.find((campaign) => campaign.featured) ?? activeCampaigns[0];

  return <div className="page-reveal puan-page">
    <JsonLd data={[collectionPageSchema({ name: "PuanAI", description: "Banka kampanyaları ve kart avantajları.", path: "/puan-ai" }), productSchema]} />
    <section className="section-wrap puan-hero">
      <Breadcrumbs items={[{ label: "Ekosistem", href: "/ekosistem" }, { label: "PuanAI" }]} />
      <div className="puan-hero__grid">
        <div className="puan-hero__copy">
          <div className="flex items-center gap-3"><span className="puan-hero__icon"><Zap size={20} /></span><p className="eyebrow">Üretir Ekosistemi / MVP</p></div>
          <h1>Hangi kart,<br /><em>nerede kazandırır?</em></h1>
          <p className="puan-hero__lead">Alışveriş yapmadan önce doğru kartı bul. Banka kampanyalarını, puanları ve taksit avantajlarını tek bir sakin ekranda karşılaştır.</p>
          <div className="puan-hero__actions"><Link href="#kampanyalar" className="puan-primary-button">Kampanyaları keşfet <ArrowUpRight size={16} /></Link><Link href="#kartlar" className="puan-secondary-button">Kartları karşılaştır <CreditCard size={15} /></Link></div>
        </div>
        <div className="puan-dashboard-preview" aria-label="PuanAI özet paneli">
          <div className="puan-dashboard-preview__bar"><span><i /> PuanAI / canlı özet</span><span>22 Temmuz 2026</span></div>
          <div className="puan-dashboard-preview__headline"><div><p className="eyebrow">Bugünün fırsatı</p><h2>En çok kazandıran<br /><em>alışverişler.</em></h2></div><span className="puan-dashboard-preview__spark"><Sparkles size={20} /></span></div>
          {featuredCampaign && <PuanAICampaignCard campaign={featuredCampaign} bank={getPuanAIBank(featuredCampaign.bankId)} compact />}
          <div className="puan-dashboard-preview__stats"><div><strong>{activeCampaigns.length}</strong><span>aktif kampanya</span></div><div><strong>{puanAIBanks.length}</strong><span>banka</span></div><div><strong>{puanAICards.length}</strong><span>kart</span></div></div>
        </div>
      </div>
    </section>

    <section id="kampanyalar" className="section-wrap puan-marketplace"><Suspense fallback={<PuanAIBrowserSkeleton />}><PuanAIBrowser campaigns={puanAICampaigns} banks={puanAIBanks} cards={puanAICards} /></Suspense></section>

    <section className="section-wrap puan-trust-row"><div><BadgePercent size={18} /><p><strong>Şeffaf fırsatlar</strong><span>Kampanya koşullarını açıkça gösteriyoruz.</span></p></div><div><CreditCard size={18} /><p><strong>Doğru kartı bul</strong><span>Farklı bankaların avantajlarını kıyasla.</span></p></div><div><Sparkles size={18} /><p><strong>Akıllı alışveriş</strong><span>Yakında kişisel önerilerle büyüyecek.</span></p></div></section>
  </div>;
}

function PuanAIBrowserSkeleton() {
  return <div className="puan-browser-skeleton" aria-label="Kampanyalar yükleniyor"><div /><div /><div /></div>;
}
