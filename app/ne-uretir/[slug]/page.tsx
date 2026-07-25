import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, Globe, MapPin, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ad-slot";
import { ContentBlockRenderer } from "@/components/content-block-renderer";
import { ContentDiscoverySection } from "@/components/content-discovery-section";
import { EditorialReviewNotice } from "@/components/editorial-review-notice";
import { AuthorityReadinessNotice } from "@/components/authority-readiness-notice";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { TableOfContents } from "@/components/editorial-components";
import { companies, getCompany } from "@/lib/companies";
import { buildContentIndex, getRelatedCompanySlugs } from "@/lib/content-linking";
import { createCompanyDocument } from "@/lib/content-factory";
import { getTocItems } from "@/lib/content-model";
import { companyArticleSchema, companyFaqSchema, companyOrganizationSchema } from "@/lib/company-schemas";
import { breadcrumbSchema } from "@/lib/structured-data";
import { absoluteUrl } from "@/lib/seo";
import { isIndexableReference, isVisibleReference } from "@/lib/publication";
import { getDocumentDiscovery } from "@/lib/content-discovery";

export const dynamicParams = false;

export function generateStaticParams() {
  return companies
    .filter((company) => isVisibleReference(createCompanyDocument(company)))
    .map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const company = getCompany((await params).slug);
  if (!company) return { title: "Şirket bulunamadı", robots: { index: false, follow: false } };
  const document = createCompanyDocument(company);
  if (!isVisibleReference(document)) return { title: "Şirket bulunamadı", robots: { index: false, follow: false } };
  const indexable = isIndexableReference(document);
  const url = absoluteUrl(document.seo.canonicalPath);
  const title = indexable ? document.seo.title : `${company.name} — Editoryal inceleme`;
  const description = indexable ? document.seo.description : `${company.name} şirket kaydı kaynak ve alan uzmanı incelemesi bekliyor.`;
  return { title, description, robots: indexable ? undefined : { index: false, follow: true }, alternates: { canonical: url }, keywords: indexable ? document.seo.keywords : undefined, openGraph: { title, description, url, type: indexable ? "article" : "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: company.name }] }, twitter: { card: "summary_large_image", title, description } };
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const company = getCompany((await params).slug);
  if (!company) notFound();
  const document = createCompanyDocument(company);
  if (!isVisibleReference(document)) notFound();
  const indexable = isIndexableReference(document);
  if (!indexable) {
    const discoveryItems = getDocumentDiscovery(document, { includeReview: true, limit: 8 });
    return <article className="page-reveal">
      <div className="section-wrap py-10 md:py-16">
        <Breadcrumbs items={[{ label: "Ne Üretir?", href: "/ne-uretir" }, { label: company.name }]} />
        <EditorialReviewNotice />
        <AuthorityReadinessNotice document={document} />
        <div className="mt-12 grid gap-12 border-y hairline py-12 md:grid-cols-[1.1fr_.9fr] md:items-end md:py-20">
          <div>
            <p className="rule-label">Şirket kaydı / İncelemede</p>
            <h1 className="mt-7 display-lg">{company.name}<br /><span className="italic text-[#769d32]">kaydı inceleniyor.</span></h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-muted">Ürünler, tesisler, çalışan sayısı, ihracat, sertifikalar ve sürdürülebilirlik iddiaları kesin kaynak belgeleriyle doğrulanmadan burada gösterilmez.</p>
          </div>
          <div className="border hairline bg-[color:var(--surface)] p-6">
            <p className="eyebrow">Doğrulama yolu</p>
            <p className="mt-4 text-sm leading-7 text-muted">Araştırmaya şirketin resmî web sitesinden başlayabilirsiniz. Bu bağlantı, Üretir tarafından doğrulanmış profil anlamına gelmez.</p>
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="link-arrow mt-6 inline-flex items-center gap-2 text-xs font-bold">Resmî siteyi aç <ArrowUpRight size={14} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap gap-3"><Link href="/ne-uretir" className="inline-flex min-h-11 items-center rounded-full border hairline px-5 text-xs font-bold">İnceleme kayıtlarına dön</Link><Link href="/uretir-ai" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 text-xs font-bold text-[color:var(--background)]">UretirAI bilgi modeli <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
      </div>
      <ContentDiscoverySection items={discoveryItems} eyebrow="Güvenli araştırma yolları" title="Doğrulanmış bilgiye nasıl ilerlenir?" />
    </article>;
  }
  const faqSchema = companyFaqSchema(company);
  const schemas: Record<string, unknown>[] = [companyOrganizationSchema(company), companyArticleSchema(company), ...(faqSchema ? [faqSchema] : []), breadcrumbSchema([{ name: "Ana sayfa", path: "/" }, { name: "Ne Üretir?", path: "/ne-uretir" }, { name: company.name, path: document.seo.canonicalPath }])];
  const stats = [{ icon: Building2, label: "Kuruluş", value: String(company.foundedYear) }, { icon: MapPin, label: "Merkez", value: company.headquarters.split(",")[0] }, { icon: Users, label: "Çalışan", value: company.employeeCount }, { icon: Globe, label: "İhracat", value: `${company.exportCountries.length} ülke` }];
  const index = buildContentIndex([], companies);
  const relatedSlugs = getRelatedCompanySlugs(index, company.slug);
  const related = (relatedSlugs.length ? relatedSlugs : companies.filter((item) => item.slug !== company.slug).map((item) => item.slug)).map((slug) => companies.find((item) => item.slug === slug)).filter((item): item is (typeof companies)[number] => Boolean(item));

  return <article className="page-reveal">{isIndexableReference(document) && <JsonLd data={schemas} />}
    <div className="section-wrap pt-10 md:pt-16"><Breadcrumbs items={[{ label: "Ne Üretir?", href: "/ne-uretir" }, { label: company.name }]} />{!isIndexableReference(document) && <EditorialReviewNotice />}<div className="mt-14 max-w-5xl"><div className="flex items-center gap-4"><span className="text-4xl">{company.logo}</span><p className="eyebrow">{company.sector}</p></div><h1 className="mt-6 font-display text-5xl leading-[.9] md:text-8xl">{company.name} ne <span className="italic" style={{ color: company.color }}>üretir?</span></h1><p className="mt-8 max-w-3xl text-base leading-7 text-muted md:text-xl md:leading-8">{company.description}</p><p className="editorial-meta mt-5">Son güncelleme: {formatDate(document.updatedAt)} · Üretir Araştırma Ekibi</p></div></div>
    <div className="section-wrap editorial-ad-top"><AdSlot format="leaderboard" /></div>
    <div className="section-wrap mt-14 grid gap-0 border-y hairline sm:grid-cols-2 md:grid-cols-4">{stats.map(({ icon: Icon, label, value }, index) => <div key={label} className={`flex items-center gap-4 p-5 md:p-6 ${index < 3 ? "border-b hairline sm:border-r" : "border-b hairline md:border-b-0"}`}><Icon size={16} className="shrink-0 text-muted" /><div><p className="font-display text-xl">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-muted">{label}</p></div></div>)}</div>
    <div className="section-wrap py-16 md:py-28"><div className="grid gap-16 md:gap-20 lg:grid-cols-[1.3fr_.7fr]"><div><ContentBlockRenderer blocks={document.blocks} /></div><aside><div className="sticky top-[110px] grid gap-8"><TableOfContents items={[...getTocItems(document), { id: "sss", label: "Sıkça sorulan sorular" }]} /><AdSlot format="sidebar" /><div className="border hairline p-6"><span className="text-3xl">{company.logo}</span><h2 className="mt-4 font-display text-2xl">{company.name}</h2><div className="mt-5 grid gap-3 text-sm text-muted"><p><strong className="text-[color:var(--foreground)]">Sektör:</strong> {company.sector}</p><p><strong className="text-[color:var(--foreground)]">Merkez:</strong> {company.headquarters}</p><p><strong className="text-[color:var(--foreground)]">Çalışan:</strong> {company.employeeCount}</p></div></div></div></aside></div></div>
    <section className="border-t hairline"><div className="section-wrap py-16 md:py-24"><div className="flex items-end justify-between"><div><p className="eyebrow">Diğer Şirketler</p><h2 className="mt-3 font-display text-4xl md:text-5xl">Bunlara da bakın.</h2></div><Link href="/ne-uretir" className="link-arrow hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] sm:inline-flex">Tüm şirketler <ArrowUpRight size={14} /></Link></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <Link href={`/ne-uretir/${item.slug}`} key={item.slug} className="group border hairline p-6"><div className="flex items-center gap-3"><span className="text-2xl">{item.logo}</span><span className="rounded-full border hairline px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-muted">{item.sector}</span></div><h3 className="mt-6 font-display text-2xl leading-none">{item.name}</h3><p className="mt-3 text-sm leading-6 text-muted">{item.description.slice(0, 90)}...</p></Link>)}</div></div></section>
  </article>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
