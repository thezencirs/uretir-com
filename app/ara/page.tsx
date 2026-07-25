import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { searchPublicKnowledge, type SearchRecordKind, type SearchRecordTrust } from "@/lib/search-index";

type SearchPageProps = { searchParams: Promise<{ q?: string; type?: string }> };

const kindLabels: Record<SearchRecordKind, string> = {
  ai_product: "AI merkezi", guide: "Rehber", article: "Makale", company: "Şirket", discovery: "Keşif merkezi",
};
const trustLabels: Record<SearchRecordTrust, string> = {
  public_foundation: "Kullanılabilir temel", sample_only: "Yalnızca örnek", future_integration: "Gelecek entegrasyonu",
  authority_ready: "Editoryal olarak onaylı", editorial_review: "Yerel editoryal önizleme",
};
const kinds = Object.keys(kindLabels) as SearchRecordKind[];

export const metadata: Metadata = {
  title: "Ara",
  description: "Üretir bilgi merkezleri, rehberleri, şirketleri ve makaleleri içinde arayın.",
  alternates: { canonical: "/ara" },
  robots: { index: false, follow: true },
  openGraph: null,
  twitter: null,
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 120) ?? "";
  const selectedKind = kinds.includes(params.type as SearchRecordKind) ? (params.type as SearchRecordKind) : undefined;
  const results = query ? searchPublicKnowledge(query, { kind: selectedKind }) : [];

  return <div className="page-reveal"><div className="section-wrap py-10 md:py-16">
    <Breadcrumbs items={[{ label: "Ara" }]} />
    <div className="mt-12 grid gap-10 border-b hairline pb-12 md:grid-cols-[.8fr_1.2fr] md:items-end md:pb-16">
      <div><p className="rule-label">Üretir / Evrensel keşif</p><h1 className="mt-7 display-lg">Bilgiyi<br /><span className="italic text-[#769d32]">birlikte ara.</span></h1></div>
      <div><p className="max-w-xl text-sm leading-7 text-muted">AI merkezleri, rehberler, makaleler ve yayın kapısından geçen şirket kayıtları tek aramada buluşur. İnceleme kayıtları üretim ortamında sonuçlara girmez.</p>
        <form action="/ara" className="mt-7 flex min-h-14 items-center gap-3 border-b hairline focus-within:border-[#769d32]">
          <Search size={18} className="shrink-0 text-muted" aria-hidden="true" />
          <label htmlFor="global-search" className="sr-only">Üretir içinde ara</label>
          <input id="global-search" name="q" defaultValue={query} maxLength={120} autoFocus placeholder="Şirket, ürün, rehber veya AI merkezi" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
          {selectedKind && <input type="hidden" name="type" value={selectedKind} />}
          <button className="rounded-full bg-[color:var(--foreground)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.12em] text-[color:var(--background)]">Ara</button>
        </form>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 border-b hairline py-5" aria-label="Sonuç türü">
      <Link href={query ? `/ara?q=${encodeURIComponent(query)}` : "/ara"} aria-current={!selectedKind ? "page" : undefined} className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[.1em] ${!selectedKind ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]" : "hairline text-muted"}`}>Tümü</Link>
      {kinds.map((kind) => <Link key={kind} href={`/ara?${new URLSearchParams({ ...(query ? { q: query } : {}), type: kind })}`} aria-current={selectedKind === kind ? "page" : undefined} className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[.1em] ${selectedKind === kind ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]" : "hairline text-muted"}`}>{kindLabels[kind]}</Link>)}
    </div>
    {!query ? <div className="grid gap-8 py-14 md:grid-cols-[.65fr_1.35fr]"><p className="eyebrow">Başlangıç</p><div><h2 className="font-display text-4xl md:text-5xl">Bir üretim sorusu yazın.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-muted">“Teşvik”, “ihracat”, “fiyat”, “şirket” veya belirli bir üretim konusu ile başlayabilirsiniz. Arama sorguları bu sürümde kaydedilmez.</p></div></div>
    : results.length ? <section className="py-12">
      <div className="flex items-end justify-between gap-6"><div><p className="eyebrow">Sonuçlar</p><h2 className="mt-4 font-display text-4xl">{results.length} eşleşme</h2></div><p className="max-w-sm text-right text-xs leading-5 text-muted">“{query}” için {selectedKind ? kindLabels[selectedKind].toLocaleLowerCase("tr-TR") : "tüm yayın türleri"} içinde</p></div>
      <div className="mt-8 border-t hairline">{results.map((result) => <Link href={result.path} key={result.id} className="group grid gap-4 border-b hairline py-7 transition hover:bg-surface md:grid-cols-[.3fr_1.5fr_auto] md:items-center md:px-4">
        <div><span className="rounded-full border hairline px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.11em] text-muted">{kindLabels[result.kind]}</span></div>
        <div><h3 className="font-display text-2xl transition group-hover:text-[#6e9630]">{result.title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{result.summary}</p><p className="mt-3 text-[9px] font-bold uppercase tracking-[.12em] text-muted">{trustLabels[result.trust]}</p></div>
        <ArrowUpRight size={17} className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--foreground)]" aria-hidden="true" />
      </Link>)}</div>
    </section>
    : <div className="grid gap-8 py-14 md:grid-cols-[.65fr_1.35fr]"><p className="eyebrow">Sonuç bulunamadı</p><div><h2 className="font-display text-4xl md:text-5xl">Henüz doğrulanmış bir eşleşme yok.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-muted">Daha genel bir ifade deneyin veya tür filtresini kaldırın. Arama, yayınlanmamış bir kaydı sonuç sayısını artırmak için göstermez.</p><Link href="/ekosistem" className="link-arrow mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em]">Ekosistemi keşfet <ArrowUpRight size={14} /></Link></div></div>}
  </div></div>;
}
