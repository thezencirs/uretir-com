import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Building2, ExternalLink, Globe, MapPin, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { companies, getCompany } from "@/lib/companies";
import { companyArticleSchema, companyFaqSchema, companyOrganizationSchema } from "@/lib/company-schemas";
import { breadcrumbSchema } from "@/lib/structured-data";
import { absoluteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return companies.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const company = getCompany((await params).slug);
  if (!company) return { title: "Şirket bulunamadı", robots: { index: false, follow: false } };
  const url = absoluteUrl(`/ne-uretir/${company.slug}`);
  const title = `${company.name} Ne Üretir? — Ürünleri, Fabrikaları ve İhracat Bilgileri`;
  const description = company.description;
  return {
    title, description,
    alternates: { canonical: url },
    keywords: [company.name, `${company.name} ne üretir`, company.sector, ...company.mainProducts.slice(0, 5)],
    openGraph: { title, description, url, type: "article", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const company = getCompany((await params).slug);
  if (!company) notFound();

  const faqSchema = companyFaqSchema(company);
  const schemas: Record<string, unknown>[] = [
    companyOrganizationSchema(company),
    companyArticleSchema(company),
    ...(faqSchema ? [faqSchema] : []),
    breadcrumbSchema([
      { name: "Ana sayfa", path: "/" },
      { name: "Ne Üretir?", path: "/ne-uretir" },
      { name: company.name, path: `/ne-uretir/${company.slug}` },
    ]),
  ];

  return <article className="page-reveal">
    <JsonLd data={schemas} />

    {/* Header */}
    <div className="section-wrap pt-10 md:pt-16">
      <Breadcrumbs items={[{ label: "Ne Üretir?", href: "/ne-uretir" }, { label: company.name }]} />
      <div className="mt-14 max-w-5xl">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{company.logo}</span>
          <p className="eyebrow">{company.sector}</p>
        </div>
        <h1 className="mt-6 font-display text-5xl leading-[.9] md:text-8xl">{company.name} ne <span className="italic" style={{ color: company.color }}>üretir?</span></h1>
        <p className="mt-8 max-w-3xl text-base leading-7 text-muted md:text-xl md:leading-8">{company.description}</p>
      </div>
    </div>

    {/* Quick Stats */}
    <div className="section-wrap mt-14 grid gap-0 border-y hairline sm:grid-cols-2 md:grid-cols-4">
      {[
        { icon: Building2, label: "Kuruluş", value: String(company.foundedYear) },
        { icon: MapPin, label: "Merkez", value: company.headquarters.split(",")[0] },
        { icon: Users, label: "Çalışan", value: company.employeeCount },
        { icon: Globe, label: "İhracat", value: `${company.exportCountries.length} ülke` },
      ].map((stat, i) => {
        const Icon = stat.icon;
        return <div key={stat.label} className={`flex items-center gap-4 p-5 md:p-6 ${i < 3 ? "border-b hairline sm:border-r" : "border-b hairline md:border-b-0"}`}>
          <Icon size={16} className="shrink-0 text-muted" />
          <div>
            <p className="font-display text-xl">{stat.value}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-muted">{stat.label}</p>
          </div>
        </div>;
      })}
    </div>

    {/* Main Content Grid */}
    <div className="section-wrap py-16 md:py-28">
      <div className="grid gap-16 md:gap-20 lg:grid-cols-[1.3fr_.7fr]">

        {/* Left Column */}
        <div>
          {/* Activity Area */}
          <section>
            <p className="eyebrow">Faaliyet Alanı</p>
            <p className="mt-4 text-base leading-7 text-muted">{company.activityArea}</p>
          </section>

          {/* Main Products */}
          <section className="mt-14 border-t hairline pt-10">
            <p className="eyebrow">Ana Ürünler</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {company.mainProducts.map((product) => (
                <span key={product} className="rounded-full border hairline px-4 py-2 text-sm transition hover:bg-surface">{product}</span>
              ))}
            </div>
          </section>

          {/* Sub Products */}
          <section className="mt-14 border-t hairline pt-10">
            <p className="eyebrow">Alt Ürünler ve Yan Ürünler</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {company.subProducts.map((product) => (
                <span key={product} className="rounded-full border hairline px-3 py-1.5 text-xs text-muted">{product}</span>
              ))}
            </div>
          </section>

          {/* Facilities */}
          <section className="mt-14 border-t hairline pt-10">
            <p className="eyebrow">Üretim Tesisleri</p>
            <div className="mt-6 grid gap-3">
              {company.facilities.map((facility, i) => (
                <div key={facility} className="flex items-center gap-4 text-sm">
                  <span className="font-display text-lg text-muted/30">{String(i + 1).padStart(2, "0")}</span>
                  <span>{facility}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Export Countries */}
          <section className="mt-14 border-t hairline pt-10">
            <p className="eyebrow">İhracat Yaptığı Ülkeler</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {company.exportCountries.map((country) => (
                <span key={country} className="rounded-full bg-surface px-3 py-1.5 text-xs">{country}</span>
              ))}
            </div>
          </section>

          {/* Sustainability */}
          <section className="mt-14 border-t hairline pt-10">
            <p className="eyebrow">Sürdürülebilirlik</p>
            <p className="mt-4 text-sm leading-7 text-muted">{company.sustainability}</p>
          </section>
        </div>

        {/* Right Sidebar */}
        <div>
          <div className="sticky top-[110px] grid gap-8">
            {/* Company Card */}
            <div className="border hairline p-6">
              <span className="text-3xl">{company.logo}</span>
              <h2 className="mt-4 font-display text-2xl">{company.name}</h2>
              <div className="mt-5 grid gap-3 text-sm text-muted">
                <p><strong className="text-[color:var(--foreground)]">Sektör:</strong> {company.sector}</p>
                <p><strong className="text-[color:var(--foreground)]">Kuruluş:</strong> {company.foundedYear}</p>
                <p><strong className="text-[color:var(--foreground)]">Merkez:</strong> {company.headquarters}</p>
                <p><strong className="text-[color:var(--foreground)]">Çalışan:</strong> {company.employeeCount}</p>
              </div>
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-muted transition hover:text-[color:var(--foreground)]">
                Web sitesi <ExternalLink size={12} />
              </a>
            </div>

            {/* Brands */}
            <div className="border hairline p-6">
              <p className="eyebrow">Markalar</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {company.brands.map((brand) => (
                  <span key={brand} className="rounded-full border hairline px-3 py-1.5 text-xs font-bold">{brand}</span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="border hairline p-6">
              <p className="eyebrow">Sertifikalar</p>
              <div className="mt-4 grid gap-2">
                {company.certifications.map((cert) => (
                  <span key={cert} className="text-xs text-muted">✓ {cert}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* FAQ Section */}
    {company.faqs.length > 0 && (
      <section className="border-t hairline">
        <div className="section-wrap py-16 md:py-24">
          <p className="eyebrow">Sıkça Sorulan Sorular</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">{company.name} hakkında</h2>
          <div className="mt-12 grid gap-0 border-t hairline">
            {company.faqs.map((faq, i) => (
              <div key={i} className="border-b hairline py-6 md:py-8">
                <h3 className="text-sm font-bold md:text-base">{faq.question}</h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )}

    {/* Related Companies */}
    <section className="border-t hairline">
      <div className="section-wrap py-16 md:py-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Diğer Şirketler</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Bunlara da bakın.</h2>
          </div>
          <Link href="/ne-uretir" className="link-arrow hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] sm:inline-flex">Tüm şirketler <ArrowUpRight size={14} /></Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companies.filter((c) => c.slug !== company.slug).slice(0, 3).map((related) => (
            <Link href={`/ne-uretir/${related.slug}`} key={related.slug} className="group border hairline p-6 transition duration-300 hover:border-[color:var(--foreground)] hover:shadow-[0_12px_40px_rgba(0,0,0,.06)]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{related.logo}</span>
                <span className="rounded-full border hairline px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-muted">{related.sector}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl leading-none transition group-hover:text-[#6e9630]">{related.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{related.description.slice(0, 90)}...</p>
              <div className="mt-6 h-[2px] w-8 transition-all duration-500 group-hover:w-full" style={{ backgroundColor: related.color }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  </article>;
}
