import Link from "next/link";
import { ArrowUpRight, BookOpen, CircleCheck, Clock3 } from "lucide-react";
import { getContentHub, getHubGuides, type ContentHubId } from "@/lib/content-hubs";
import { createHubGuideDocument } from "@/lib/hub-guide-document";
import { isIndexableReference, isVisibleReference } from "@/lib/publication";

export function HubKnowledgeSection({ hubId, compact = false, includeFaq = false }: { hubId: ContentHubId; compact?: boolean; includeFaq?: boolean }) {
  const hub = getContentHub(hubId);
  const guides = getHubGuides(hubId).filter((guide) => isVisibleReference(createHubGuideDocument(guide)));
  if (!hub) return null;

  return <section id="rehberler" className={compact ? "mt-20 border-t hairline pt-16" : "section-wrap py-20 md:py-28"}>
    <div className="grid gap-8 border-b hairline pb-10 md:grid-cols-[.8fr_1.2fr] md:items-end">
      <div>
        <p className="eyebrow">Arama niyeti / Editoryal kütüphane</p>
        <h2 className="mt-5 font-display text-4xl leading-[.95] md:text-6xl">Sorudan<br /><em style={{ color: hub.accent }}>rehbere.</em></h2>
      </div>
      <div>
        <p className="max-w-xl text-sm leading-7 text-muted">Her rehber gerçek bir kullanıcı sorusunu; ne, neden, nasıl, kim, ne zaman ve nerede cevaplarıyla ele alır. İnceleme tamamlanmayan içerikler arama motorlarına yayınlanmaz.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {hub.intents.map((intent) => <span key={intent} className="rounded-full border hairline px-3 py-2 text-[10px] font-bold uppercase tracking-[.08em] text-muted">{intent}</span>)}
        </div>
      </div>
    </div>

    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {guides.map((guide) => {
        const indexable = isIndexableReference(createHubGuideDocument(guide));
        return <Link key={guide.slug} href={`/rehber/${guide.slug}`} className="group flex min-h-[280px] flex-col border hairline bg-[color:var(--surface)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[color:var(--foreground)] md:p-7">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-muted"><BookOpen size={14} aria-hidden="true" /> {guide.intent}</span>
          <span className="rounded-full border border-[#d6c58a] bg-[#fbf7e8] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#685f38] dark:border-[#685f38] dark:bg-[#2c291d] dark:text-[#ded4a3]">{indexable ? "Yayında" : "İncelemede"}</span>
        </div>
        <h3 className="mt-8 font-display text-2xl leading-[1.05]">{guide.title}</h3>
        <p className="mt-4 text-sm leading-6 text-muted">{guide.description}</p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-muted"><Clock3 size={13} aria-hidden="true" /> {guide.readingTimeMinutes} dk</span>
          <ArrowUpRight size={17} className="transition group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </Link>;
      })}
      {guides.length === 0 && <div className="border hairline bg-[color:var(--surface)] p-8 md:col-span-2 xl:col-span-3"><h3 className="font-display text-3xl">İlk doğrulanmış rehberler hazırlanıyor.</h3><p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Taslak kayıtlar üretim ortamında gösterilmez. Resmî kaynak, uzman incelemesi ve güncelleme planı tamamlanan rehberler burada otomatik olarak görünür.</p></div>}
    </div>

    <div className="mt-7 flex items-start gap-3 border hairline p-4 text-xs leading-6 text-muted">
      <CircleCheck size={17} className="mt-1 shrink-0" aria-hidden="true" />
      <p><strong className="text-[color:var(--foreground)]">Yayın güven kapısı:</strong> Bir rehber; sorumlu alan uzmanı, kaynak inceleyen, yayın tarihi, sonraki kontrol tarihi ve değişiklik kaydı tamamlanmadan indekslenmez veya yapılandırılmış makale verisi üretmez.</p>
    </div>

    {includeFaq && <div className="mt-16 grid gap-8 md:grid-cols-[.7fr_1.3fr]">
      <div>
        <p className="eyebrow">Sıkça sorulanlar</p>
        <h2 className="mt-5 font-display text-4xl md:text-5xl">Veri durumu<br /><em>açık.</em></h2>
      </div>
      <div className="border-t hairline">
        {hub.faq.map((item) => <details key={item.question} className="group border-b hairline py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl">{item.question}<span className="text-muted transition group-open:rotate-45" aria-hidden="true">+</span></summary>
          <p className="max-w-2xl pt-4 text-sm leading-7 text-muted">{item.answer}</p>
        </details>)}
      </div>
    </div>}
  </section>;
}
