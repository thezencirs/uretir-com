import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, BadgePercent, CreditCard, Sparkles, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { HubKnowledgeSection } from "@/components/hub-knowledge-section";
import { PuanAIBrowser } from "@/components/puan-ai-browser";
import { PuanAICampaignCard } from "@/components/puan-ai-campaign-card";
import { PuanAIAdvisor } from "@/components/puan-ai-advisor";
import { collectionPageSchema } from "@/lib/structured-data";
import { getPuanAIBank, puanAICampaigns, puanAICards, puanAIBanks } from "@/lib/puan-ai";

export const metadata: Metadata = {
  title: "PuanAI — Banka kampanyaları ve kart avantajları",
  description: "Alışveriş tercihini paylaş, PuanAI yapılandırılmış örnek verilerle sana uygun keşif yolunu şeffaf biçimde oluştursun.",
  alternates: { canonical: "/puan-ai" },
  openGraph: { title: "PuanAI — Üretir", description: "Banka kampanyalarını ve kart avantajlarını tek merkezden keşfet.", url: "/puan-ai", type: "website" },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PuanAI",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description: "Yapılandırılmış örnek verilerle kart ve alışveriş kararlarını açıklayan, gelecekte doğrulanmış sağlayıcı entegrasyonlarına hazır alışveriş asistanı.",
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
          <p className="puan-hero__lead">Alışveriş kararını hangi koşullarla karşılaştırman gerektiğini gör. Bugünkü sürüm yalnızca marka, fiyat ve geçerlilik iddiası içermeyen varsayımsal senaryolar kullanır.</p>
          <div className="puan-hero__actions"><Link href="#danisman" className="puan-primary-button">PuanAI&apos;a sor <ArrowUpRight size={16} /></Link><Link href="#kartlar" className="puan-secondary-button">Kartları karşılaştır <CreditCard size={15} /></Link></div>
        </div>
        <div className="puan-dashboard-preview" aria-label="PuanAI özet paneli">
          <div className="puan-dashboard-preview__bar"><span><i /> PuanAI / örnek akış</span><span>Demo veri seti</span></div>
          <div className="puan-dashboard-preview__headline"><div><p className="eyebrow">Karar modeli önizlemesi</p><h2>Seçenekleri nasıl<br /><em>açıklarız?</em></h2></div><span className="puan-dashboard-preview__spark"><Sparkles size={20} /></span></div>
          {featuredCampaign && <PuanAICampaignCard campaign={featuredCampaign} bank={getPuanAIBank(featuredCampaign.bankId)} compact />}
          <div className="puan-dashboard-preview__stats"><div><strong>{activeCampaigns.length}</strong><span>örnek senaryo</span></div><div><strong>{puanAIBanks.length}</strong><span>örnek sağlayıcı</span></div><div><strong>{puanAICards.length}</strong><span>örnek kart modeli</span></div></div>
        </div>
      </div>
    </section>

    <section id="danisman" className="section-wrap"><PuanAIAdvisor campaigns={puanAICampaigns} /></section>

    <section id="kampanyalar" className="section-wrap puan-marketplace"><div id="kartlar"><Suspense fallback={<PuanAIBrowserSkeleton />}><PuanAIBrowser campaigns={puanAICampaigns} banks={puanAIBanks} cards={puanAICards} /></Suspense></div></section>

    <div className="section-wrap"><HubKnowledgeSection hubId="puan-ai" compact includeFaq /></div>

    <section className="section-wrap puan-trust-row"><div><BadgePercent size={18} /><p><strong>Veri durumu açık</strong><span>Örnek, tahmini ve doğrulanmış kayıtlar birbirine karışmaz.</span></p></div><div><CreditCard size={18} /><p><strong>Kaynak zorunlu</strong><span>Canlı sonuçlar resmî sağlayıcı bağlantısı olmadan yayımlanmaz.</span></p></div><div><Sparkles size={18} /><p><strong>Açıklanabilir karar</strong><span>Önerinin nedeni, varsayımı ve sınırı birlikte gösterilir.</span></p></div></section>
  </div>;
}

function PuanAIBrowserSkeleton() {
  return <div className="puan-browser-skeleton" aria-label="Kampanyalar yükleniyor"><div /><div /><div /></div>;
}
