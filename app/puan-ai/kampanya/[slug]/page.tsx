import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { PuanAICampaignResult } from "@/components/puan-ai-campaign-result";
import { getVerifiedCampaignBySlug } from "@/lib/puan-ai/catalog-service";
import { absoluteUrl } from "@/lib/seo";

type CampaignPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  try {
    const campaign = await getVerifiedCampaignBySlug((await params).slug);
    if (!campaign) return { title: "Kampanya bulunamadı", robots: { index: false, follow: false } };
    return {
      title: `${campaign.title} — PuanAI`,
      description: campaign.description,
      alternates: { canonical: `/puan-ai/kampanya/${campaign.slug}` },
      openGraph: { title: campaign.title, description: campaign.description, url: `/puan-ai/kampanya/${campaign.slug}`, type: "website" },
    };
  } catch {
    return { title: "Kampanya doğrulanamadı", robots: { index: false, follow: false } };
  }
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  let campaign;
  try {
    campaign = await getVerifiedCampaignBySlug((await params).slug);
  } catch {
    campaign = null;
  }
  if (!campaign) notFound();
  const source = campaign.sources.find((item) => item.id === campaign.verification?.officialSourceId);
  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "@id": `${absoluteUrl(`/puan-ai/kampanya/${campaign.slug}`)}#offer`,
    name: campaign.title,
    description: campaign.description,
    url: absoluteUrl(`/puan-ai/kampanya/${campaign.slug}`),
    validFrom: campaign.startDate,
    validThrough: campaign.endDate,
    seller: { "@type": "Organization", name: campaign.bank.officialName, url: campaign.bank.websiteUrl },
  };

  return <div className="page-reveal pa-detail">
    <JsonLd data={offerSchema} />
    <div className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "PuanAI", href: "/puan-ai" }, { label: campaign.category.name, href: `/puan-ai?category=${campaign.category.slug}` }, { label: campaign.title }]} />
      <Link href="/puan-ai" className="pa-detail__back"><ArrowLeft size={14} /> PuanAI&apos;a dön</Link>
      <div className="pa-detail__hero">
        <div>
          <p className="pa-kicker"><ShieldCheck size={14} /> Doğrulanmış kampanya</p>
          <h1>{campaign.title}</h1>
          <p>{campaign.description}</p>
        </div>
        {source && <a href={source.url} target="_blank" rel="noopener noreferrer">Resmî kampanya sayfasını aç <ExternalLink size={15} /></a>}
      </div>
      <div className="pa-detail__grid">
        <PuanAICampaignResult campaign={campaign} />
        <aside>
          <p className="pa-kicker">Güven kaydı</p>
          <h2>Bu kayıt neden gösteriliyor?</h2>
          <p>Kampanya yalnızca tarih aralığı güncel, resmî kaynak etkin, kaynak parmak izi son doğrulama kaydıyla aynı ve sonraki kontrol tarihi geçmemiş olduğu için yayındadır.</p>
          <dl>
            <div><dt>Doğrulayan</dt><dd>{campaign.verification?.checker}</dd></div>
            <div><dt>Kaynak yayıncısı</dt><dd>{source?.publisher}</dd></div>
            <div><dt>Geçerli kartlar</dt><dd>{campaign.cards.map((card) => card.name).join(", ") || "Resmî kaynak koşullarına göre"}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  </div>;
}
