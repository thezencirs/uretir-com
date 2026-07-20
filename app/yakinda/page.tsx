import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Yakında",
  description: "Üretir ekosisteminin yeni yapay zekâ araçları burada yayınlanacak.",
  alternates: { canonical: "/yakinda" },
  openGraph: { title: "Yakında — Üretir", description: "Üretir ekosisteminin yeni yapay zekâ araçları burada yayınlanacak.", url: "/yakinda", type: "website" },
};

const upcomingTools = [
  { number: "01", name: "TeşvikAI", description: "Devlet teşviklerini ve destekleri keşfedin." },
  { number: "02", name: "HibeAI", description: "Hibe programlarını takip edin ve başvurun." },
  { number: "03", name: "FiyatAI", description: "Hammadde ve ürün fiyatlarını karşılaştırın." },
  { number: "04", name: "EnerjiAI", description: "Enerji maliyetlerinizi optimize edin." },
  { number: "05", name: "İhracatAI", description: "İhracat süreçlerinizi yapay zekâ ile yönetin." },
  { number: "06", name: "CVAI", description: "Profesyonel özgeçmiş ve portfolyo oluşturun." },
];

export default function YakindaPage() {
  return <div className="page-reveal">
    <div className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Ekosistem", href: "/ekosistem" }, { label: "Yakında" }]} />
      <div className="mt-14 max-w-4xl">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border hairline"><Sparkles size={20} className="text-[#8b80c2]" /></span>
          <p className="eyebrow">Üretir Ekosistemi</p>
        </div>
        <h1 className="mt-8 font-display text-5xl leading-[.9] md:text-8xl">Yeni araçlar<br /><span className="italic text-[#8b80c2]">yakında.</span></h1>
        <p className="mt-8 max-w-2xl text-base leading-7 text-muted md:text-xl md:leading-8">Üretir ekosistemi büyüyor. Yapay zekâ destekli yeni araçlarımız geliştirme aşamasında. İşte yol haritamız:</p>
      </div>
    </div>

    <div className="section-wrap pb-20 md:pb-32">
      <div className="grid gap-0 border-t hairline">
        {upcomingTools.map((tool) => (
          <div key={tool.number} className="group flex items-center gap-6 border-b hairline py-6 transition duration-300 hover:bg-surface md:gap-10 md:px-4 md:py-8">
            <span className="font-display text-3xl text-muted/20 md:text-4xl">{tool.number}</span>
            <div className="flex-1">
              <h2 className="text-sm font-bold md:text-base">{tool.name}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">{tool.description}</p>
            </div>
            <span className="hidden text-[10px] font-bold uppercase tracking-[.14em] text-muted sm:block">Geliştiriliyor</span>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t hairline pt-10">
        <p className="eyebrow">Bülten</p>
        <p className="mt-4 max-w-lg text-sm leading-7 text-muted">Yeni araçlardan ilk siz haberdar olun. Bültenimize abone olarak lansman tarihlerini kaçırmayın.</p>
        <Link href="/" className="link-arrow mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]">Ana sayfaya dön <ArrowUpRight size={14} /></Link>
      </div>
    </div>
  </div>;
}
