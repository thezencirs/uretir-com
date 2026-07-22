import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, CreditCard, MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { PuanAICampaignCard } from "@/components/puan-ai-campaign-card";
import { absoluteUrl } from "@/lib/seo";
import { getPuanAIBank, getPuanAICampaign, getPuanAICard, puanAICampaigns } from "@/lib/puan-ai";

type CampaignPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return puanAICampaigns.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const campaign = getPuanAICampaign((await params).slug);
  if (!campaign) return { title: "Kampanya bulunamadı", robots: { index: false, follow: false } };
  const title = `${campaign.title} — PuanAI`;
  return { title, description: campaign.description, alternates: { canonical: `/puan-ai/kampanya/${campaign.slug}` }, openGraph: { title, description: campaign.description, url: `/puan-ai/kampanya/${campaign.slug}`, type: "website" } };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const campaign = getPuanAICampaign((await params).slug);
  if (!campaign) notFound();
  const bank = getPuanAIBank(campaign.bankId);
  const cards = campaign.cardIds.map(getPuanAICard).filter(Boolean);
  const related = puanAICampaigns.filter((item) => item.slug !== campaign.slug && (item.category === campaign.category || item.bankId === campaign.bankId)).slice(0, 2);
  const campaignSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "@id": `${absoluteUrl(`/puan-ai/kampanya/${campaign.slug}`)}#offer`,
    name: campaign.title,
    description: campaign.description,
    url: absoluteUrl(`/puan-ai/kampanya/${campaign.slug}`),
    category: campaign.category,
    availability: campaign.active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    seller: { "@type": "Organization", name: bank?.name ?? "PuanAI" },
  };

  return <div className="page-reveal puan-detail-page">
    <JsonLd data={campaignSchema} />
    <div className="section-wrap py-10 md:py-16"><Breadcrumbs items={[{ label: "PuanAI", href: "/puan-ai" }, { label: campaign.category, href: `/puan-ai?category=${encodeURIComponent(campaign.category)}` }, { label: campaign.merchant }]} />
      <div className="puan-detail-hero"><div className="puan-detail-hero__copy"><Link href="/puan-ai" className="puan-back-link"><ArrowLeft size={14} /> Tüm kampanyalar</Link><div className="puan-detail-hero__label"><span className="puan-badge puan-badge--category">{campaign.category}</span><span>{campaign.updatedAt} güncellendi</span></div><h1>{campaign.title}</h1><p>{campaign.description}</p><div className="puan-detail-hero__bank"><span className="puan-bank-mark" style={{ "--bank-color": bank?.color ?? "#6e766d" } as React.CSSProperties}>{bank?.shortName ?? "PA"}</span><span>{bank?.name ?? "Banka"}</span><span className="puan-detail-hero__separator">/</span><span>{campaign.merchant}</span></div></div><div className="puan-benefit-card"><p className="eyebrow">Sana sağlayacağı avantaj</p><strong>{campaign.benefit}</strong><span>{campaign.benefitType}</span><div><CalendarDays size={14} /> Son tarih: {campaign.expiresAt}</div></div></div>
      <div className="puan-detail-grid"><main><section className="puan-detail-section"><p className="eyebrow">Kampanya özeti</p><h2>Bu fırsat nasıl çalışır?</h2><div className="puan-detail-facts"><div><CreditCard size={16} /><span>Minimum harcama<strong>{campaign.minSpend}</strong></span></div><div><CalendarDays size={16} /><span>Ödeme seçeneği<strong>{campaign.installment}</strong></span></div><div><MapPin size={16} /><span>Alışveriş noktası<strong>{campaign.merchant}</strong></span></div></div><p className="puan-detail-copy">{campaign.description} Kampanyadan yararlanmak için uygun kartınla ödeme yapman ve belirtilen koşulları takip etmen yeterli.</p></section><section className="puan-detail-section"><p className="eyebrow">Koşullar</p><h2>Bilmen gerekenler.</h2><ul className="puan-terms">{campaign.terms.map((term) => <li key={term}><Check size={15} />{term}</li>)}</ul></section></main><aside className="puan-detail-aside"><div className="puan-panel"><p className="eyebrow">Geçerli kartlar</p><h2>Bu kampanyada<br /><em>kullanabilirsin.</em></h2>{cards.length > 0 ? <div className="puan-detail-cards">{cards.map((card) => card && <div key={card.id} className={`puan-bank-card puan-bank-card--${card.color}`}><div className="puan-bank-card__top"><span>{bank?.name}</span><span>{card.network}</span></div><strong>{card.name}</strong><p>{card.reward}</p></div>)}</div> : <p className="text-muted">Uygun kart bilgisi yakında güncellenecek.</p>}<Link href="/puan-ai#kartlar" className="puan-secondary-button puan-secondary-button--full">Tüm kartları gör <ArrowUpRight size={15} /></Link></div></aside></div>
      {related.length > 0 && <section className="puan-related"><div className="puan-section-heading"><div><p className="eyebrow">Aynı evrenden</p><h2>Bunlara da<br /><em>bakabilirsin.</em></h2></div><Link href="/puan-ai" className="link-arrow">Tüm kampanyalar <ArrowUpRight size={15} /></Link></div><div className="puan-related-grid">{related.map((item) => <PuanAICampaignCard key={item.slug} campaign={item} bank={getPuanAIBank(item.bankId)} compact />)}</div></section>}
    </div>
  </div>;
}

