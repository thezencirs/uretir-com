import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleAlert, Compass, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

type ToolFoundation = {
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  promise: string;
  capabilities: Array<{ title: string; description: string }>;
  steps: string[];
  boundary: string;
};

export function AIToolFoundationPage({ tool }: { tool: ToolFoundation }) {
  return <div className="page-reveal">
    <section className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Araçlar", href: "/araclar" }, { label: tool.name }]} />
      <div className="mt-12 grid gap-12 border-b hairline pb-14 md:grid-cols-[1.15fr_.85fr] md:items-end md:pb-20">
        <div>
          <p className="rule-label">{tool.eyebrow}</p>
          <h1 className="mt-7 max-w-5xl font-display text-[clamp(3.5rem,8vw,8rem)] leading-[.86] tracking-[-.075em]">{tool.title}</h1>
          <p className="mt-8 max-w-2xl text-base leading-7 text-muted">{tool.description}</p>
          <Link href="#nasil-calisir" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 text-xs font-bold text-[color:var(--background)] transition hover:opacity-80">Nasıl çalışacağını gör <ArrowUpRight size={15} /></Link>
        </div>
        <aside className="border hairline bg-[color:var(--surface)] p-6 md:p-8" aria-label={`${tool.name} ürün durumu`}>
          <div className="flex items-center justify-between gap-4"><p className="eyebrow">Ürün durumu</p><span className="h-3 w-3 rounded-full" style={{ backgroundColor: tool.accent }} /></div>
          <h2 className="mt-5 font-display text-3xl">Hazırlık aşamasında</h2>
          <p className="mt-4 text-sm leading-7 text-muted">Ürün çerçevesi ve kullanıcı akışı hazır. Canlı veri veya otomatik karar özelliği henüz sunulmuyor.</p>
          <div className="mt-6 flex items-start gap-3 border-t hairline pt-5 text-xs leading-5 text-muted"><CircleAlert size={16} className="mt-0.5 shrink-0" /><span>{tool.boundary}</span></div>
        </aside>
      </div>
    </section>

    <section id="nasil-calisir" className="section-wrap py-10 md:py-16">
      <div className="grid gap-5 md:grid-cols-3">
        {tool.capabilities.map((capability, index) => <article key={capability.title} className="border-t hairline pt-5"><span className="font-display text-3xl text-muted/30">0{index + 1}</span><h2 className="mt-8 font-display text-2xl">{capability.title}</h2><p className="mt-3 text-sm leading-6 text-muted">{capability.description}</p></article>)}
      </div>
    </section>

    <section className="section-wrap py-12 md:py-20">
      <div className="grid gap-8 border-y hairline py-10 md:grid-cols-[.75fr_1.25fr] md:items-center"><div><p className="eyebrow">Ürün ilkesi</p><Sparkles className="mt-8" size={28} strokeWidth={1.4} style={{ color: tool.accent }} /></div><blockquote className="font-display text-3xl leading-tight md:text-5xl">“{tool.promise}”</blockquote></div>
    </section>

    <section className="section-wrap pb-20 md:pb-32">
      <div className="grid gap-10 md:grid-cols-[.7fr_1.3fr]">
        <div><Compass size={25} style={{ color: tool.accent }} /><p className="mt-6 eyebrow">Planlanan akış</p><h2 className="mt-5 font-display text-4xl md:text-5xl">Kısa, anlaşılır,<br /><em>kontrollü.</em></h2></div>
        <ol className="border-t hairline">{tool.steps.map((step, index) => <li key={step} className="flex gap-5 border-b hairline py-5 text-sm leading-7"><CheckCircle2 size={17} className="mt-1 shrink-0" style={{ color: tool.accent }} /><span><strong className="mr-2">{index + 1}.</strong>{step}</span></li>)}</ol>
      </div>
      <div className="mt-16 flex flex-wrap gap-3"><Link href="/araclar" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 text-xs font-bold text-[color:var(--background)]">Bütün araçlar <ArrowUpRight size={15} /></Link><Link href="/iletisim" className="inline-flex min-h-11 items-center gap-2 rounded-full border hairline px-5 text-xs font-bold">Bu araca katkı ver <ArrowUpRight size={15} /></Link></div>
    </section>
  </div>;
}
