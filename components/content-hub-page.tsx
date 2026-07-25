import Link from "next/link";
import { ArrowDown, ArrowUpRight, CircleAlert, Network, ShieldCheck, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HubKnowledgeSection } from "@/components/hub-knowledge-section";
import { KnowledgeGraphFoundation } from "@/components/knowledge-graph-foundation";
import { contentHubs, type ContentHubId } from "@/lib/content-hubs";

export function ContentHubPage({ hubId }: { hubId: ContentHubId }) {
  const hub = contentHubs.find((item) => item.id === hubId);
  if (!hub) return null;
  const relatedHubs = contentHubs.filter((item) => item.id !== hubId);

  return <div className="page-reveal">
    <section className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Araçlar", href: "/araclar" }, { label: hub.name }]} />
      <div className="mt-12 grid gap-12 border-b hairline pb-14 md:grid-cols-[1.15fr_.85fr] md:items-end md:pb-20">
        <div>
          <p className="rule-label">{hub.eyebrow}</p>
          <h1 className="mt-7 max-w-5xl font-display text-[clamp(3.5rem,8vw,8rem)] leading-[.86] tracking-[-.075em]">{hub.title}</h1>
          <p className="mt-8 max-w-2xl text-base leading-7 text-muted">{hub.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={hub.cta.href} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 text-xs font-bold text-[color:var(--background)] transition hover:opacity-80">{hub.cta.label} <ArrowDown size={15} aria-hidden="true" /></Link>
            <Link href="/araclar" className="inline-flex min-h-11 items-center gap-2 rounded-full border hairline px-5 text-xs font-bold transition hover:bg-[color:var(--surface)]">Tüm merkezler <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
        <aside className="border hairline bg-[color:var(--surface)] p-6 md:p-8" aria-label={`${hub.name} ürün durumu`}>
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow">Ürün durumu</p>
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: hub.accent }} aria-hidden="true" />
          </div>
          <h2 className="mt-5 font-display text-3xl">{hub.availabilityLabel}</h2>
          <p className="mt-4 text-sm leading-7 text-muted">{hub.availabilityNote}</p>
          <div className="mt-6 flex items-start gap-3 border-t hairline pt-5 text-xs leading-5 text-muted">
            <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>Durum ve kaynak bilgisi ürün vaadinden önce gelir. Doğrulanmamış veri canlı sonuç gibi gösterilmez.</span>
          </div>
        </aside>
      </div>
    </section>

    <section className="section-wrap py-8 md:py-14">
      <div className="grid gap-5 md:grid-cols-3">
        {hub.capabilities.map((capability, index) => <article key={capability.title} className="border-t hairline pt-5">
          <span className="font-display text-3xl text-muted/30">0{index + 1}</span>
          <h2 className="mt-8 font-display text-2xl">{capability.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{capability.description}</p>
        </article>)}
      </div>
    </section>

    {hubId === "uretir-ai" && <KnowledgeGraphFoundation />}

    <section className="section-wrap py-12 md:py-20">
      <div className="grid gap-8 border-y hairline py-10 md:grid-cols-[.75fr_1.25fr] md:items-center">
        <div>
          <p className="eyebrow">Ürün ilkesi</p>
          <Sparkles className="mt-8" size={28} strokeWidth={1.4} style={{ color: hub.accent }} aria-hidden="true" />
        </div>
        <blockquote className="font-display text-3xl leading-tight md:text-5xl">“{hub.productPromise}”</blockquote>
      </div>
    </section>

    <HubKnowledgeSection hubId={hubId} />

    <section className="section-wrap py-16 md:py-24">
      <div className="grid gap-10 md:grid-cols-[.7fr_1.3fr]">
        <div>
          <p className="eyebrow">Sıkça sorulanlar</p>
          <h2 className="mt-5 font-display text-4xl md:text-5xl">Sınırlar açık,<br /><em>yanıtlar net.</em></h2>
        </div>
        <div className="border-t hairline">
          {hub.faq.map((item) => <details key={item.question} className="group border-b hairline py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl">
              {item.question}<span className="text-muted transition group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="max-w-2xl pt-4 text-sm leading-7 text-muted">{item.answer}</p>
          </details>)}
        </div>
      </div>
    </section>

    <section className="section-wrap pb-20 md:pb-32">
      <div className="border hairline bg-[#171916] p-7 text-[#f1f2eb] md:p-12">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <Network size={25} className="text-[#c8f560]" aria-hidden="true" />
            <p className="mt-6 eyebrow text-[#848b80]">Bağlantılı ekosistem</p>
            <h2 className="mt-4 font-display text-4xl">{hub.cta.title}</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#a9ada2]">{hub.cta.description}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {relatedHubs.map((item) => <Link key={item.id} href={item.path} className="group flex min-h-28 items-end justify-between gap-4 border border-white/10 p-5 transition hover:border-white/35">
              <span><small className="block text-[9px] font-bold uppercase tracking-[.14em] text-[#848b80]">{item.availabilityLabel}</small><strong className="mt-2 block font-display text-2xl">{item.name}</strong></span>
              <ArrowUpRight size={16} className="text-[#c8f560] transition group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
            </Link>)}
          </div>
        </div>
        <div className="mt-8 flex items-start gap-3 border-t border-white/10 pt-6 text-xs leading-6 text-[#a9ada2]">
          <ShieldCheck size={17} className="mt-1 shrink-0 text-[#c8f560]" aria-hidden="true" />
          <p>Her merkez aynı kimlik, kaynak, güncellik ve editoryal inceleme sözleşmesini kullanır. Böylece ürünler ayrı sayfalar değil, birbirini güçlendiren bir bilgi ağı olarak büyür.</p>
        </div>
      </div>
    </section>
  </div>;
}
