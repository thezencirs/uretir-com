import { CalendarDays, Clock3, ExternalLink, ShieldCheck, TriangleAlert } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EditorialReviewNotice } from "@/components/editorial-review-notice";
import { AuthorityReadinessNotice } from "@/components/authority-readiness-notice";
import { ContentDiscoverySection } from "@/components/content-discovery-section";
import { getContentHub, type HubGuide } from "@/lib/content-hubs";
import type { ContentDocument } from "@/lib/content-model";
import { isIndexableReference } from "@/lib/publication";
import { getDocumentDiscovery } from "@/lib/content-discovery";
import { toSlug } from "@/lib/routes";

const answerLabels = {
  what: "Ne?",
  why: "Neden?",
  how: "Nasıl?",
  who: "Kim?",
  when: "Ne zaman?",
  where: "Nerede?",
} as const;

export function HubGuidePage({ guide, document }: { guide: HubGuide; document: ContentDocument }) {
  const hub = getContentHub(guide.hubId);
  if (!hub) return null;
  const indexable = isIndexableReference(document);
  const discoveryItems = getDocumentDiscovery(document, { includeReview: !indexable, limit: 10 });
  const sourceRecords = guide.editorial?.sources ?? guide.sources;

  return <article className="page-reveal">
    <header className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Araçlar", href: "/araclar" }, { label: hub.name, href: hub.path }, { label: guide.title }]} />
      {!indexable && <><EditorialReviewNotice /><AuthorityReadinessNotice document={document} /></>}
      <div className="mt-10 max-w-5xl">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[.12em] text-muted">
          <span style={{ color: hub.accent }}>{hub.name}</span><span aria-hidden="true">/</span><span>{guide.intent} niyeti</span><span aria-hidden="true">/</span><span>{indexable ? "Yayında" : "İncelemede"}</span>
        </div>
        <h1 className="mt-7 font-display text-[clamp(3.3rem,7vw,7rem)] leading-[.88] tracking-[-.075em]">{guide.title}</h1>
        <p className="mt-8 max-w-3xl text-base leading-8 text-muted">{guide.description}</p>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t hairline pt-5 text-xs text-muted">
          <span className="inline-flex items-center gap-2"><CalendarDays size={14} aria-hidden="true" /> {indexable ? `Yayın: ${formatDate(document.publishedAt)} · güncelleme ${formatDate(document.updatedAt)}` : `Yayınlanmadı · son düzenleme ${formatDate(document.updatedAt)}`}</span>
          <span className="inline-flex items-center gap-2"><Clock3 size={14} aria-hidden="true" /> {document.readTime}</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck size={14} aria-hidden="true" /> {indexable ? "İnsan incelemesi tamamlandı" : "İnsan incelemesi bekliyor"}</span>
        </div>
      </div>
    </header>

    <div className="section-wrap grid gap-12 pb-20 md:grid-cols-[minmax(0,1fr)_280px] md:pb-28">
      <div className="min-w-0">
        <section className="border-l-4 bg-[color:var(--surface)] p-6 md:p-8" style={{ borderColor: hub.accent }}>
          <p className="eyebrow">Hızlı cevap</p>
          <p className="mt-5 font-display text-2xl leading-snug md:text-3xl">{guide.quickAnswer}</p>
        </section>

        <section className="mt-14" aria-labelledby="temel-cevaplar">
          <p className="eyebrow">Kapsam</p>
          <h2 id="temel-cevaplar" className="mt-4 font-display text-4xl">Altı temel cevap.</h2>
          <div className="mt-7 grid gap-px border hairline bg-[color:var(--line)] sm:grid-cols-2">
            {Object.entries(guide.answers).map(([key, answer]) => <div key={key} className="bg-[color:var(--background)] p-6">
              <h3 className="font-display text-2xl" style={{ color: hub.accent }}>{answerLabels[key as keyof typeof answerLabels]}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{answer}</p>
            </div>)}
          </div>
        </section>

        <section className="mt-16" aria-labelledby="uygulama-adimlari">
          <p className="eyebrow">Uygulama</p>
          <h2 id="uygulama-adimlari" className="mt-4 font-display text-4xl">Adım adım ilerleyin.</h2>
          <ol className="mt-7 border-t hairline">
            {guide.steps.map((step, index) => <li key={step} className="grid grid-cols-[42px_1fr] gap-4 border-b hairline py-5">
              <span className="font-display text-2xl text-muted/40">{String(index + 1).padStart(2, "0")}</span>
              <p className="text-sm leading-7">{step}</p>
            </li>)}
          </ol>
        </section>

        <section className="mt-16 border border-[#d6c58a] bg-[#fbf7e8] p-6 text-[#5b512d] dark:border-[#685f38] dark:bg-[#2c291d] dark:text-[#ded4a3]" aria-labelledby="riskler">
          <div className="flex items-center gap-3"><TriangleAlert size={18} aria-hidden="true" /><h2 id="riskler" className="font-display text-2xl">Kaçınılması gerekenler</h2></div>
          <ul className="mt-5 grid gap-3">
            {guide.pitfalls.map((pitfall) => <li key={pitfall} className="flex items-start gap-3 text-sm leading-6"><span aria-hidden="true">—</span>{pitfall}</li>)}
          </ul>
        </section>

        <section className="mt-16" aria-labelledby="kaynaklar">
          <p className="eyebrow">Kaynak şeffaflığı</p>
          <h2 id="kaynaklar" className="mt-4 font-display text-4xl">Resmî ve birincil kaynaklar.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{indexable ? "Kaynaklar iddiaların kapsamını ve güncelliğini doğrulamak için kayıt altında tutulur." : "Bu bağlantılar yöntem ve doğrulama için başlangıç noktalarıdır. Rehber insan editoryal incelemesi tamamlanana kadar yayımlanmış referans sayılmaz."}</p>
          <div className="mt-7 grid gap-3">
            {sourceRecords.map((source) => <a key={source.id} href={source.href} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-5 border hairline p-5 transition hover:border-[color:var(--foreground)]">
              <span><strong className="block text-sm">{source.title}</strong><span className="mt-2 block text-xs text-muted">{source.publisher} · Erişim: {formatDate(source.accessedAt)}</span></span>
              <ExternalLink size={15} className="shrink-0 text-muted transition group-hover:text-[color:var(--foreground)]" aria-hidden="true" />
            </a>)}
          </div>
        </section>

        <section id="sss" className="mt-16" aria-labelledby="sss-baslik">
          <p className="eyebrow">Sıkça sorulan sorular</p>
          <h2 id="sss-baslik" className="mt-4 font-display text-4xl">Kısa ve açık.</h2>
          <div className="mt-7 border-t hairline">
            {guide.faq.map((item, index) => <details id={`sss-${toSlug(item.question)}-${index + 1}`} key={item.question} className="group border-b hairline py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl">{item.question}<span className="text-muted transition group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="max-w-2xl pt-4 text-sm leading-7 text-muted">{item.answer}</p>
            </details>)}
          </div>
        </section>
      </div>

      <aside className="space-y-8">
        <nav className="border-t hairline pt-5 md:sticky md:top-28" aria-label="Rehber içindekiler">
          <p className="eyebrow">Bu rehberde</p>
          <div className="mt-4 grid gap-3 text-xs text-muted">
            <a href="#temel-cevaplar">Altı temel cevap</a>
            <a href="#uygulama-adimlari">Uygulama adımları</a>
            <a href="#riskler">Kaçınılması gerekenler</a>
            <a href="#kaynaklar">Resmî kaynaklar</a>
            <a href="#sss">Sıkça sorulanlar</a>
          </div>
          <div className="mt-7 border-t hairline pt-5">
            <p className="eyebrow">İlgili konular</p>
            <div className="mt-4 flex flex-wrap gap-2">{guide.relatedTopics.map((topic) => <span key={topic} className="rounded-full bg-[color:var(--surface)] px-3 py-2 text-[10px] text-muted">{topic}</span>)}</div>
          </div>
        </nav>
      </aside>
    </div>

    <ContentDiscoverySection items={discoveryItems} eyebrow="Sonraki adımlar" title="Araştırmaya devam edin." />
  </article>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}
