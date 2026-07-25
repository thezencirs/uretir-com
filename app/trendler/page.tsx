import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BarChart3, CircleAlert, Database, Radar, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { trendSources } from "@/lib/trend-discovery";

export const metadata: Metadata = {
  title: "Trend Keşif Merkezi",
  description: "Üretim, teknoloji, yatırım ve AI konularında doğrulanmış sinyallerden editoryal fırsat üretmek için hazırlanan trend analiz mimarisi.",
  alternates: { canonical: "/trendler" },
  robots: { index: false, follow: true },
  openGraph: { title: "Trend Keşif Merkezi — Üretir", description: "Doğrulanmış sinyaller için şeffaf trend keşif mimarisi.", url: "/trendler", type: "website" },
};

const modules = [
  { icon: Radar, title: "Sinyal toplama", description: "Arama, resmî istatistik ve kurum duyurularını kaynak kimliği ve gözlem zamanı ile kaydeder." },
  { icon: ShieldCheck, title: "Kanıt eşiği", description: "Tek kaynaktan veya doğrulanmamış gözlemden trend sonucu üretmez." },
  { icon: BarChart3, title: "Editoryal değerlendirme", description: "Yükselen talebi kullanıcı sorusu, mevcut kapsam ve özgün değer açısından inceler." },
];

export default function TrendsPage() {
  const connectedSources = trendSources.filter((source) => source.status === "connected");
  return <div className="page-reveal">
    <section className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Araçlar", href: "/araclar" }, { label: "Trend Keşif Merkezi" }]} />
      <div className="mt-12 grid gap-12 border-b hairline pb-14 md:grid-cols-[1.1fr_.9fr] md:items-end md:pb-20">
        <div>
          <p className="rule-label">Üretir / Trend keşfi</p>
          <h1 className="mt-7 display-lg">Sinyali gör.<br /><span className="italic text-[#d97835]">Trendi uydurma.</span></h1>
          <p className="mt-8 max-w-2xl text-base leading-7 text-muted">Bu merkez; yükselen aramaları, sektör hareketlerini, teknoloji ve kamu güncellemelerini güvenilir veri kaynaklarından değerlendirmek için hazırlanıyor.</p>
        </div>
        <aside className="border border-[#d6c58a] bg-[#fbf7e8] p-6 text-[#5b512d] dark:border-[#685f38] dark:bg-[#2c291d] dark:text-[#ded4a3]">
          <div className="flex items-center gap-3"><CircleAlert size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[.12em]">Canlı sinyal bağlı değil</p></div>
          <p className="mt-4 text-sm leading-7">Şu anda trend, yükselen arama veya içerik fırsatı gösterilmiyor. En az iki farklı doğrulanmış sinyal olmadan aday konu üretilemez.</p>
        </aside>
      </div>
    </section>

    <section className="section-wrap py-12 md:py-20">
      <div className="grid gap-5 md:grid-cols-3">{modules.map(({ icon: Icon, title, description }, index) => <article key={title} className="border-t hairline pt-5"><div className="flex items-center justify-between"><Icon size={20} className="text-[#d97835]" aria-hidden="true" /><span className="font-display text-3xl text-muted/25">0{index + 1}</span></div><h2 className="mt-9 font-display text-3xl">{title}</h2><p className="mt-4 text-sm leading-7 text-muted">{description}</p></article>)}</div>
    </section>

    <section className="section-wrap py-12 md:py-20">
      <div className="grid gap-10 md:grid-cols-[.7fr_1.3fr]">
        <div><p className="eyebrow">Kaynak kayıtları</p><h2 className="mt-5 font-display text-4xl md:text-5xl">Bağlantıdan önce<br /><em>kaynak sözleşmesi.</em></h2><p className="mt-5 text-sm leading-7 text-muted">{connectedSources.length} canlı kaynak bağlı. Bağlantı durumu sonuç üretiminden ayrı tutulur.</p></div>
        <div className="border-t hairline">{trendSources.map((source) => <a key={source.id} href={source.href} target="_blank" rel="noopener noreferrer" className="group grid gap-3 border-b hairline py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <span><strong className="block text-sm">{source.name}</strong><small className="mt-1 block text-xs text-muted">{source.kind.replaceAll("_", " ")} · hedef tazelik {source.freshnessTargetHours} saat</small></span>
          <span className="rounded-full border hairline px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] text-muted">Bağlı değil</span>
          <ArrowUpRight size={15} className="hidden text-muted transition group-hover:-translate-y-1 group-hover:translate-x-1 sm:block" aria-hidden="true" />
        </a>)}</div>
      </div>
    </section>

    <section className="section-wrap pb-20 md:pb-32">
      <div className="border hairline bg-[color:var(--surface)] p-7 md:p-10">
        <Database size={22} className="text-[#d97835]" aria-hidden="true" />
        <h2 className="mt-6 font-display text-3xl">Bir sonraki güvenli adım</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Önce Search Console birinci taraf verisini salt-okunur bağlamak, ardından resmî istatistik veya kurum duyurusu ile çapraz doğrulamak. Sonuçlar otomatik yayınlanmaz; editoryal fırsat kuyruğuna girer.</p>
        <Link href="/uretir-ai" className="link-arrow mt-7 inline-flex items-center gap-2 text-xs font-bold">UretirAI bilgi mimarisi <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
    </section>
  </div>;
}
