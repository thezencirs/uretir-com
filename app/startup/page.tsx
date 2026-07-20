import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Rocket } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Startup Vizyonu",
  description: "Üretir'in Türkiye'nin üretim teknolojileri platformu olma vizyonu ve yol haritası.",
  alternates: { canonical: "/startup" },
  openGraph: { title: "Startup Vizyonu — Üretir", description: "Üretir'in Türkiye'nin üretim teknolojileri platformu olma vizyonu ve yol haritası.", url: "/startup", type: "website" },
};

const milestones = [
  { phase: "Faz 1", title: "İçerik Platformu", description: "SEO odaklı, uzman kalitesinde makaleler ve rehberlerle organik büyüme.", status: "Aktif" },
  { phase: "Faz 2", title: "AI Araçları", description: "PuanAI ile başlayan, TeşvikAI ve HibeAI ile büyüyen yapay zekâ ekosistemi.", status: "Geliştiriliyor" },
  { phase: "Faz 3", title: "Topluluk", description: "Kullanıcıların deneyim paylaştığı, liste oluşturduğu ve birbirini desteklediği topluluk.", status: "Planlama" },
  { phase: "Faz 4", title: "Marketplace", description: "Danışman, yazılımcı, üretici ve yatırımcıyı buluşturan dijital pazar yeri.", status: "Vizyon" },
];

export default function StartupPage() {
  return <div className="page-reveal">
    <div className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Ekosistem", href: "/ekosistem" }, { label: "Startup Vizyonu" }]} />
      <div className="mt-14 max-w-4xl">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border hairline"><Rocket size={20} className="text-[#d97835]" /></span>
          <p className="eyebrow">Üretir Ekosistemi</p>
        </div>
        <h1 className="mt-8 font-display text-5xl leading-[.9] md:text-8xl">Startup<br /><span className="italic text-[#d97835]">Vizyonu</span></h1>
        <p className="mt-8 max-w-2xl text-base leading-7 text-muted md:text-xl md:leading-8">Üretir, sadece bir web sitesi değildir. Türkiye&apos;den çıkacak, milyonlarca kullanıcıya hizmet veren ve uluslararası pazara açılabilecek bir teknoloji şirketi inşa ediyoruz.</p>
      </div>
    </div>

    <div className="section-wrap pb-20 md:pb-32">
      <div className="grid gap-6 sm:grid-cols-2">
        {milestones.map((milestone, index) => (
          <div key={milestone.phase} className="group border hairline p-6 transition duration-300 hover:bg-surface md:p-8">
            <div className="flex items-start justify-between">
              <span className="font-display text-4xl text-muted/20">{String(index + 1).padStart(2, "0")}</span>
              <span className="rounded-full border hairline px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-muted">{milestone.status}</span>
            </div>
            <p className="mt-6 eyebrow">{milestone.phase}</p>
            <h2 className="mt-3 font-display text-2xl leading-none">{milestone.title}</h2>
            <p className="mt-4 text-sm leading-6 text-muted">{milestone.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 border hairline bg-surface p-8 md:p-16">
        <p className="eyebrow">Misyon</p>
        <p className="mt-6 max-w-3xl font-display text-3xl leading-[1.05] md:text-5xl">İnsanların <span className="italic text-[#769d32]">üretmesine</span>, karar vermesine ve büyümesine yardımcı olan bütünleşik bir teknoloji platformu.</p>
        <Link href="/hakkimizda" className="link-arrow mt-10 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]">Hakkımızda <ArrowUpRight size={14} /></Link>
      </div>
    </div>
  </div>;
}
