import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "PuanAI",
  description: "Banka kampanyalarını, kredi kartı avantajlarını ve puan kazanımlarını tek merkezden takip edin.",
  alternates: { canonical: "/puan-ai" },
  openGraph: { title: "PuanAI — Üretir", description: "Banka kampanyalarını, kredi kartı avantajlarını ve puan kazanımlarını tek merkezden takip edin.", url: "/puan-ai", type: "website" },
};

export default function PuanAIPage() {
  return <div className="page-reveal">
    <div className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Ekosistem", href: "/ekosistem" }, { label: "PuanAI" }]} />
      <div className="mt-14 max-w-4xl">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border hairline"><Zap size={20} className="text-[#78a5b6]" /></span>
          <p className="eyebrow">Üretir Ekosistemi</p>
        </div>
        <h1 className="mt-8 font-display text-5xl leading-[.9] md:text-8xl">Puan<span className="italic text-[#78a5b6]">AI</span></h1>
        <p className="mt-8 max-w-2xl text-base leading-7 text-muted md:text-xl md:leading-8">Banka kampanyalarını, kredi kartı avantajlarını ve puan kazanımlarını tek merkezden takip edin. Yapay zekâ destekli akıllı öneriler ile en avantajlı kartı saniyeler içinde bulun.</p>
      </div>
    </div>

    <div className="section-wrap pb-20 md:pb-32">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { number: "01", title: "Kampanya Takibi", description: "Tüm banka kampanyalarını tek ekranda görüntüleyin ve süreleri takip edin." },
          { number: "02", title: "Kart Karşılaştırma", description: "Kredi kartlarını yan yana karşılaştırarak size en uygun kartı seçin." },
          { number: "03", title: "Akıllı Öneriler", description: "Harcama alışkanlıklarınıza göre yapay zekâ destekli kart ve kampanya önerileri alın." },
        ].map((item) => (
          <div key={item.number} className="group border hairline p-6 transition duration-300 hover:bg-surface md:p-8">
            <span className="font-display text-4xl text-muted/20">{item.number}</span>
            <h2 className="mt-8 text-sm font-bold">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t hairline pt-10">
        <p className="eyebrow">Durum</p>
        <p className="mt-4 max-w-lg text-sm leading-7 text-muted">PuanAI şu anda geliştirme aşamasındadır. Lansman tarihinde haberdar olmak için bültenimize abone olabilirsiniz.</p>
        <Link href="/blog" className="link-arrow mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]">Makalelere göz atın <ArrowUpRight size={14} /></Link>
      </div>
    </div>
  </div>;
}
