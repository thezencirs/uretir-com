import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Araçlar",
  description: "Üretir yapay zekâ araçları: PuanAI, TeşvikAI, HibeAI ve daha fazlası.",
  alternates: { canonical: "/araclar" },
  openGraph: { title: "Araçlar — Üretir", description: "Üretir yapay zekâ araçları: PuanAI, TeşvikAI, HibeAI ve daha fazlası.", url: "/araclar", type: "website" },
};

const tools = [
  { name: "PuanAI", description: "Banka kampanyalarını tek yerden takip edin.", href: "/puan-ai", color: "#78a5b6", status: "Geliştiriliyor" },
  { name: "TeşvikAI", description: "Devlet teşviklerini ve destekleri keşfedin.", href: "/yakinda", color: "#8b80c2", status: "Yakında" },
  { name: "HibeAI", description: "Hibe programlarını takip edin.", href: "/yakinda", color: "#8b80c2", status: "Yakında" },
  { name: "FiyatAI", description: "Hammadde ve ürün fiyatlarını karşılaştırın.", href: "/yakinda", color: "#d97835", status: "Yakında" },
  { name: "EnerjiAI", description: "Enerji maliyetlerinizi optimize edin.", href: "/yakinda", color: "#769d32", status: "Yakında" },
  { name: "İhracatAI", description: "İhracat süreçlerinizi yapay zekâ ile yönetin.", href: "/yakinda", color: "#b26959", status: "Yakında" },
];

export default function AraclarPage() {
  return <div className="page-reveal">
    <div className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Araçlar" }]} />
      <div className="mt-12 grid gap-12 border-b hairline pb-14 md:grid-cols-[1.15fr_.85fr] md:items-end md:pb-20">
        <div>
          <p className="rule-label">Üretir / Araçlar</p>
          <h1 className="mt-7 display-lg">Yapay zekâ<br /><span className="italic text-[#769d32]">araçları.</span></h1>
          <p className="mt-8 max-w-lg text-base leading-7 text-muted">İşinizi kolaylaştıran, kararlarınızı güçlendiren ve size zaman kazandıran akıllı araçlar.</p>
        </div>
        <div className="grid max-w-sm grid-cols-2 border-t hairline pt-5 text-sm">
          <div>
            <p className="font-display text-4xl">{String(tools.length).padStart(2, "0")}</p>
            <p className="mt-2 text-xs text-muted">Planlanan araç</p>
          </div>
          <div>
            <p className="font-display text-4xl">01</p>
            <p className="mt-2 text-xs text-muted">Geliştirmede</p>
          </div>
        </div>
      </div>
    </div>

    <div className="section-wrap pb-20 md:pb-32">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <Link href={tool.href} key={tool.name} className="group border hairline p-6 transition duration-300 hover:border-[color:var(--foreground)] hover:shadow-[0_12px_40px_rgba(0,0,0,.06)] md:p-8">
            <div className="flex items-start justify-between">
              <span className="font-display text-3xl text-muted/20">{String(index + 1).padStart(2, "0")}</span>
              <span className="rounded-full border hairline px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-muted">{tool.status}</span>
            </div>
            <h2 className="mt-10 font-display text-2xl leading-none transition group-hover:text-[#6e9630]">{tool.name}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{tool.description}</p>
            <div className="mt-8 h-[2px] w-8 transition-all duration-500 group-hover:w-full" style={{ backgroundColor: tool.color }} />
          </Link>
        ))}
      </div>

      <div className="mt-16 border-t hairline pt-10">
        <p className="eyebrow">Öneri</p>
        <p className="mt-4 max-w-lg text-sm leading-7 text-muted">Bir araç fikriniz mi var? Bizimle paylaşın ve platformun geleceğini birlikte şekillendirelim.</p>
        <Link href="/iletisim" className="link-arrow mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]">İletişime geçin <ArrowUpRight size={14} /></Link>
      </div>
    </div>
  </div>;
}
