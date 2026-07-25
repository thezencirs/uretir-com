import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  description: "Aradığınız Üretir sayfası bulunamadı.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function NotFound() {
  return <section className="section-wrap flex min-h-[70vh] items-center py-16 md:py-24">
    <div className="grid w-full gap-12 border-y hairline py-14 md:grid-cols-[.55fr_1.45fr] md:items-end md:py-20">
      <div>
        <p className="font-display text-[clamp(6rem,17vw,13rem)] leading-[.7] text-muted/20">404</p>
        <p className="mt-8 eyebrow">Bu rota bilgi grafiğinde yok</p>
      </div>
      <div>
        <h1 className="font-display text-5xl leading-[.9] md:text-7xl">Aradığınız sayfayı<br /><em className="text-[#769d32]">bulamadık.</em></h1>
        <p className="mt-7 max-w-xl text-sm leading-7 text-muted">Bağlantı değişmiş veya içerik henüz yayımlanmamış olabilir. Aramayı kullanabilir ya da bilgi merkezlerinden devam edebilirsiniz.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/ara" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 text-xs font-bold text-[color:var(--background)]"><Search size={15} aria-hidden="true" /> İçerikte ara</Link>
          <Link href="/araclar" className="inline-flex min-h-11 items-center gap-2 rounded-full border hairline px-5 text-xs font-bold">Bilgi merkezleri <ArrowUpRight size={15} aria-hidden="true" /></Link>
          <Link href="/" className="inline-flex min-h-11 items-center px-3 text-xs font-bold text-muted">Ana sayfa</Link>
        </div>
      </div>
    </div>
  </section>;
}
