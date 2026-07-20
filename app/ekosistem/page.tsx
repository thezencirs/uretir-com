import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Layers, Rocket, Sparkles, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Ekosistem",
  description: "Üretir ekosistemi: Birbirini besleyen araçlar, içerikler ve yapay zekâ servisleri.",
  alternates: { canonical: "/ekosistem" },
  openGraph: { title: "Ekosistem — Üretir", description: "Üretir ekosistemi: Birbirini besleyen araçlar, içerikler ve yapay zekâ servisleri.", url: "/ekosistem", type: "website" },
};

const ecosystemItems = [
  { icon: Layers, title: "Üretir", description: "Üretim, teknoloji ve yapay zekâ üzerine uzman kalitesinde makaleler, rehberler ve içerikler.", href: "/", color: "#769d32" },
  { icon: Zap, title: "PuanAI", description: "Banka kampanyalarını, kredi kartı avantajlarını ve puan kazanımlarını tek merkezden takip edin.", href: "/puan-ai", color: "#78a5b6" },
  { icon: Sparkles, title: "AI Araçları", description: "TeşvikAI, HibeAI, FiyatAI ve daha fazlası. Yapay zekâ destekli yeni araçlar geliştirme aşamasında.", href: "/yakinda", color: "#8b80c2" },
  { icon: Rocket, title: "Startup Vizyonu", description: "Türkiye'den çıkacak, milyonlarca kullanıcıya hizmet veren bir teknoloji platformu inşa ediyoruz.", href: "/startup", color: "#d97835" },
];

export default function EkosistemPage() {
  return <div className="page-reveal">
    <div className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Ekosistem" }]} />
      <div className="mt-12 max-w-4xl">
        <p className="rule-label">Üretir / Platform</p>
        <h1 className="mt-7 display-lg">Üretir<br /><span className="italic text-[#769d32]">Ekosistemi.</span></h1>
        <p className="mt-8 max-w-2xl text-base leading-7 text-muted md:text-xl md:leading-8">Her biri birbirini besleyen araçlar, içerikler ve yapay zekâ servisleri. Tek platform, sınırsız olanak.</p>
      </div>
    </div>

    <div className="section-wrap pb-20 md:pb-32">
      <div className="grid gap-6 sm:grid-cols-2">
        {ecosystemItems.map((item, index) => {
          const Icon = item.icon;
          return <Link href={item.href} key={item.title} className="group border hairline p-6 transition duration-300 hover:border-[color:var(--foreground)] hover:shadow-[0_12px_40px_rgba(0,0,0,.06)] md:p-10">
            <div className="flex items-start justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border hairline transition duration-300 group-hover:border-transparent"><Icon size={22} style={{ color: item.color }} className="transition duration-300 group-hover:scale-110" /></span>
              <span className="font-display text-3xl text-muted/20">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <h2 className="mt-10 font-display text-3xl leading-none tracking-tight transition group-hover:text-[#6e9630]">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-muted">{item.description}</p>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-muted transition group-hover:gap-3">Keşfet <ArrowUpRight size={13} /></div>
          </Link>;
        })}
      </div>

      <div className="mt-20 grid gap-0 border-y hairline sm:grid-cols-4">
        {[
          { label: "İçerik", value: "SEO" },
          { label: "Yapay Zekâ", value: "AI" },
          { label: "Araçlar", value: "SaaS" },
          { label: "Topluluk", value: "2026" },
        ].map((stat, index) => (
          <div key={stat.label} className={`p-6 ${index < 3 ? "border-b hairline sm:border-b-0 sm:border-r" : ""}`}>
            <p className="font-display text-4xl">{stat.value}</p>
            <p className="mt-3 text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>;
}
