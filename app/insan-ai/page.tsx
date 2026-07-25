import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, CircleAlert, FlaskConical, Lightbulb, UserRound } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { insanAIProfiles } from "@/lib/insan-ai";

export const metadata: Metadata = {
  title: "InsanAI — Üreten insanların bilgi merkezi",
  description: "Bilim insanları, mühendisler, mucitler, araştırmacılar ve girişimciler için kaynaklı profil mimarisi.",
  alternates: { canonical: "/insan-ai" },
  robots: { index: false, follow: true },
  openGraph: { title: "InsanAI — Üretir", description: "Üreten insanların katkılarını güvenilir kaynaklarla anlatmak için hazırlanan bilgi merkezi.", url: "/insan-ai", type: "website" },
};

const profileDimensions = [
  { icon: UserRound, title: "Yaşam ve bağlam", description: "Biyografiyi söylenti veya kopya anlatıdan değil, güvenilir kaynaklardan özgün biçimde özetler." },
  { icon: FlaskConical, title: "Katkı ve araştırma", description: "Araştırma, buluş ve teknik katkıları ilgili yayın ve kurum kayıtlarına bağlar." },
  { icon: Lightbulb, title: "Fikir ve etki", description: "Bir kişinin etkisini ilgili teknoloji, şirket, kurum, kitap ve makalelerle ilişkilendirir." },
];

export default function InsanAIPage() {
  return <div className="page-reveal">
    <section className="section-wrap py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Araçlar", href: "/araclar" }, { label: "InsanAI" }]} />
      <div className="mt-12 grid gap-12 border-b hairline pb-14 md:grid-cols-[1.1fr_.9fr] md:items-end md:pb-20">
        <div>
          <p className="rule-label">Üretir / İnsanlar</p>
          <h1 className="mt-7 display-lg">Üreten insanları<br /><span className="italic text-[#78a5b6]">kanıtlarıyla anlat.</span></h1>
          <p className="mt-8 max-w-2xl text-base leading-7 text-muted">InsanAI; bilim insanlarını, mühendisleri, mucitleri, araştırmacıları, girişimcileri ve teknoloji liderlerini bilgi grafiğinin parçası olarak anlatmak için hazırlanıyor.</p>
        </div>
        <aside className="border hairline bg-[color:var(--surface)] p-6">
          <div className="flex items-center gap-3"><CircleAlert size={18} className="text-[#78a5b6]" aria-hidden="true" /><p className="eyebrow">Profil kütüphanesi hazırlanıyor</p></div>
          <p className="mt-4 text-sm leading-7 text-muted">{insanAIProfiles.length} yayımlanmış profil var. Kaynak ve uzman incelemesi tamamlanmadan isim veya biyografi oluşturulmaz.</p>
        </aside>
      </div>
    </section>

    <section className="section-wrap py-12 md:py-20">
      <div className="grid gap-5 md:grid-cols-3">{profileDimensions.map(({ icon: Icon, title, description }, index) => <article key={title} className="border-t hairline pt-5"><div className="flex items-center justify-between"><Icon size={20} className="text-[#78a5b6]" aria-hidden="true" /><span className="font-display text-3xl text-muted/25">0{index + 1}</span></div><h2 className="mt-9 font-display text-3xl">{title}</h2><p className="mt-4 text-sm leading-7 text-muted">{description}</p></article>)}</div>
    </section>

    <section className="section-wrap py-12 md:py-20">
      <div className="grid gap-10 border-y hairline py-10 md:grid-cols-[.75fr_1.25fr]">
        <div><BookOpen size={24} className="text-[#78a5b6]" aria-hidden="true" /><p className="mt-6 eyebrow">Profil sözleşmesi</p><h2 className="mt-5 font-display text-4xl">Kopya biyografi değil,<br /><em>kaynaklı katkı haritası.</em></h2></div>
        <div className="grid gap-px bg-[color:var(--line)] sm:grid-cols-2">
          {["Biyografi ve bağlam", "Başlıca katkılar", "Önemli fikirler", "Kitaplar ve konuşmalar", "Araştırma ve yayınlar", "İlgili teknolojiler", "İlgili şirket ve kurumlar", "Resmî ve birincil kaynaklar"].map((item) => <div key={item} className="bg-[color:var(--background)] p-5 text-sm">{item}</div>)}
        </div>
      </div>
    </section>

    <section className="section-wrap pb-20 md:pb-32">
      <div className="border hairline bg-[#171916] p-7 text-[#f1f2eb] md:p-12">
        <p className="eyebrow text-[#848b80]">Yayın güven kapısı</p>
        <h2 className="mt-5 max-w-3xl font-display text-4xl md:text-5xl">En az iki güvenilir kaynak, birincil kanıt ve sorumlu insan incelemesi.</h2>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-[#a9ada2]">Profil şeması ancak biyografi, katkı, kaynak, alan uzmanı, kaynak inceleyen ve sonraki kontrol tarihi tamamlandığında Person yapılandırılmış verisi üretir.</p>
        <Link href="/uretir-ai" className="link-arrow mt-8 inline-flex items-center gap-2 text-xs font-bold text-[#c8f560]">Bilgi grafiğini keşfet <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
    </section>
  </div>;
}
