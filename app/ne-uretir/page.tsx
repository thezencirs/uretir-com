import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Factory } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EditorialReviewNotice } from "@/components/editorial-review-notice";
import { JsonLd } from "@/components/json-ld";
import { companies } from "@/lib/companies";
import { createCompanyDocument } from "@/lib/content-factory";
import { isIndexableReference, isVisibleReference } from "@/lib/publication";
import { companyCollectionSchema } from "@/lib/company-schemas";
import { breadcrumbSchema } from "@/lib/structured-data";

const hasIndexableCompanies = companies.some((company) => isIndexableReference(createCompanyDocument(company)));

export const metadata: Metadata = {
  title: "Ne Üretir? — Türkiye'nin Üretim Rehberi",
  description: hasIndexableCompanies ? "Türkiye'nin üretici şirketleri, faaliyet alanları, ürünleri ve üretim tesisleri için kaynaklı rehber." : "Türkiye'nin üretici şirketleri için hazırlanan, editoryal inceleme aşamasındaki bilgi merkezi.",
  alternates: { canonical: "/ne-uretir" },
  openGraph: { title: "Ne Üretir? — Türkiye'nin Üretim Rehberi", description: hasIndexableCompanies ? "Türkiye'nin üretici şirketleri ve üretim ilişkileri için kaynaklı rehber." : "Editoryal inceleme aşamasındaki üretici bilgi merkezi.", url: "/ne-uretir", type: "website" },
  robots: hasIndexableCompanies ? undefined : { index: false, follow: true },
};

export default function NeUretirPage() {
  const indexable = hasIndexableCompanies;
  const visibleCompanies = companies.filter((company) => isVisibleReference(createCompanyDocument(company)));
  return <div className="page-reveal">
    {indexable && <JsonLd data={[companyCollectionSchema(), breadcrumbSchema([{ name: "Ana sayfa", path: "/" }, { name: "Ne Üretir?", path: "/ne-uretir" }])]} />}
    <div className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Ne Üretir?" }]} />
      {!companies.some((company) => isIndexableReference(createCompanyDocument(company))) && <EditorialReviewNotice />}
      <div className="mt-12 grid gap-12 border-b hairline pb-14 md:grid-cols-[1.15fr_.85fr] md:items-end md:pb-20">
        <div>
          <p className="rule-label">Üretir / Şirketler</p>
          <h1 className="mt-7 display-lg">Ne<br /><span className="italic text-[#769d32]">üretir?</span></h1>
          <p className="mt-8 max-w-lg text-base leading-7 text-muted">{indexable ? "Türkiye'nin üretici şirketlerini, ürünlerini ve üretim ilişkilerini kaynaklarıyla keşfedin." : "Şirket kayıtları kaynak, sorumlu inceleyen ve güncelleme planı tamamlandıkça yayımlanacaktır. İnceleme verileri doğrulanmış şirket bilgisi olarak sunulmaz."}</p>
        </div>
        <div className="grid max-w-sm grid-cols-2 border-t hairline pt-5 text-sm">
          <div>
            <p className="font-display text-4xl">{String(visibleCompanies.length).padStart(2, "0")}</p>
            <p className="mt-2 text-xs text-muted">{indexable ? "Görünür kayıt" : "Editoryal önizleme"}</p>
          </div>
          <div>
            <p className="font-display text-4xl">{String(companies.filter((company) => isIndexableReference(createCompanyDocument(company))).length).padStart(2, "0")}</p>
            <p className="mt-2 text-xs text-muted">Yayına hazır</p>
          </div>
        </div>
      </div>
    </div>

    <div className="section-wrap pb-20 md:pb-32">
      <div className="grid gap-0">
        {visibleCompanies.map((company, index) => {
          const recordIndexable = isIndexableReference(createCompanyDocument(company));
          return (
          <Link href={`/ne-uretir/${company.slug}`} key={company.slug} className="group grid items-center gap-4 border-b hairline py-6 transition duration-300 hover:bg-surface sm:grid-cols-[auto_1fr_auto_auto] md:gap-8 md:px-4 md:py-8">
            <div className="flex items-center gap-5">
              <span className="font-display text-3xl text-muted/20 md:text-4xl">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-3xl">{company.logo}</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-2xl leading-none tracking-tight transition group-hover:text-[#6e9630] md:text-3xl">{company.name}</h2>
              <p className="mt-2 text-sm text-muted">{recordIndexable ? `${company.description.slice(0, 120)}...` : "Kaynak ve alan uzmanı incelemesi tamamlanmadan ayrıntılar gösterilmez."}</p>
            </div>
            <div className="hidden sm:block">
              <span className="rounded-full border hairline px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-muted">{recordIndexable ? company.sector : "İncelemede"}</span>
            </div>
            <ChevronRight size={18} className="hidden text-muted transition duration-300 group-hover:translate-x-1 group-hover:text-[color:var(--foreground)] sm:block" />
          </Link>
        );})}
        {visibleCompanies.length === 0 && <div className="border-y hairline bg-surface p-10 text-center md:p-16"><p className="font-display text-4xl">Doğrulanmış şirket dosyaları hazırlanıyor.</p><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">Şirket iddiaları resmî kaynaklarla doğrulanmadan ürün, tesis, kapasite veya çalışan bilgisi yayımlanmaz.</p></div>}
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
