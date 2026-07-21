import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Factory } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { companies } from "@/lib/companies";
import { companyCollectionSchema } from "@/lib/company-schemas";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Ne Üretir? — Türkiye'nin Üretim Rehberi",
  description: "Türkiye'nin önde gelen üretici şirketleri, faaliyet alanları, ürünleri, ihracat bilgileri ve üretim tesisleri hakkında kapsamlı rehber.",
  alternates: { canonical: "/ne-uretir" },
  openGraph: { title: "Ne Üretir? — Türkiye'nin Üretim Rehberi", description: "Türkiye'nin önde gelen üretici şirketleri, faaliyet alanları, ürünleri ve ihracat bilgileri.", url: "/ne-uretir", type: "website" },
};

export default function NeUretirPage() {
  return <div className="page-reveal">
    <JsonLd data={[companyCollectionSchema(), breadcrumbSchema([{ name: "Ana sayfa", path: "/" }, { name: "Ne Üretir?", path: "/ne-uretir" }])]} />
    <div className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Ne Üretir?" }]} />
      <div className="mt-12 grid gap-12 border-b hairline pb-14 md:grid-cols-[1.15fr_.85fr] md:items-end md:pb-20">
        <div>
          <p className="rule-label">Üretir / Şirketler</p>
          <h1 className="mt-7 display-lg">Ne<br /><span className="italic text-[#769d32]">üretir?</span></h1>
          <p className="mt-8 max-w-lg text-base leading-7 text-muted">Türkiye&apos;nin önde gelen üretici şirketleri, faaliyet alanları, ürünleri ve ihracat bilgileri hakkında kapsamlı rehber.</p>
        </div>
        <div className="grid max-w-sm grid-cols-2 border-t hairline pt-5 text-sm">
          <div>
            <p className="font-display text-4xl">{String(companies.length).padStart(2, "0")}</p>
            <p className="mt-2 text-xs text-muted">Şirket profili</p>
          </div>
          <div>
            <p className="font-display text-4xl">{String(new Set(companies.map((c) => c.sector)).size).padStart(2, "0")}</p>
            <p className="mt-2 text-xs text-muted">Farklı sektör</p>
          </div>
        </div>
      </div>
    </div>

    <div className="section-wrap pb-20 md:pb-32">
      <div className="grid gap-0">
        {companies.map((company, index) => (
          <Link href={`/ne-uretir/${company.slug}`} key={company.slug} className="group grid items-center gap-4 border-b hairline py-6 transition duration-300 hover:bg-surface sm:grid-cols-[auto_1fr_auto_auto] md:gap-8 md:px-4 md:py-8">
            <div className="flex items-center gap-5">
              <span className="font-display text-3xl text-muted/20 md:text-4xl">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-3xl">{company.logo}</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-2xl leading-none tracking-tight transition group-hover:text-[#6e9630] md:text-3xl">{company.name}</h2>
              <p className="mt-2 truncate text-sm text-muted">{company.description.slice(0, 120)}...</p>
            </div>
            <div className="hidden sm:block">
              <span className="rounded-full border hairline px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-muted">{company.sector}</span>
            </div>
            <ChevronRight size={18} className="hidden text-muted transition duration-300 group-hover:translate-x-1 group-hover:text-[color:var(--foreground)] sm:block" />
          </Link>
        ))}
      </div>

      <div className="mt-16 border hairline bg-surface p-8 md:p-12">
        <div className="flex items-center gap-3">
          <Factory size={18} className="text-muted" />
          <p className="eyebrow">Katkıda bulunun</p>
        </div>
        <p className="mt-4 max-w-lg text-sm leading-7 text-muted">Listede görmek istediğiniz bir üretici şirket mi var? Bize bildirin, araştıralım ve ekleyelim.</p>
        <Link href="/iletisim" className="link-arrow mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]">Şirket öner <ArrowUpRight size={14} /></Link>
      </div>
    </div>
  </div>;
}
