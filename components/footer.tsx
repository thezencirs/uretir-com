"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { NewsletterForm } from "@/components/newsletter-form";
import { analyticsAttributes } from "@/lib/analytics";

export function Footer() {
  const english = usePathname().startsWith("/en");
  if (english) return <footer className="mt-28 bg-[#171916] text-[#f1f2eb]">
    <div className="section-wrap border-b border-white/10 py-16 md:py-24"><div className="grid gap-10 md:grid-cols-[1.2fr_.8fr] md:items-end"><div><p className="eyebrow text-[#848b80]">For your next idea</p><h2 className="mt-5 max-w-3xl font-display text-5xl leading-[.9] md:text-7xl">Good ideas,<br /><span className="italic text-[#c8f560]">at a calm pace.</span></h2></div><div><p className="max-w-sm text-sm leading-6 text-[#a9ada2]">Production stories, useful questions and practical tools.</p><NewsletterForm compact language="en" /></div></div></div>
    <div className="section-wrap grid gap-14 py-14 md:grid-cols-[1.5fr_1fr_1fr] md:py-20"><div><Link href="/en" className="font-display text-4xl font-bold tracking-[-.1em]">üretir<span className="text-[#c8f560]">.</span></Link><p className="mt-5 max-w-xs text-sm leading-6 text-[#a9ada2]">Production, technology and inspiration for people who turn ideas into reality.</p></div><div><p className="eyebrow text-[#848b80]">Explore</p><div className="mt-5 grid gap-3 text-sm text-[#c4c8bd]"><Link href="/en/araclar">AI tools</Link><Link href="/en/uygulamalar">Apps</Link><Link href="/en/harita">Map</Link><Link href="/en/gelismeler">Updates</Link></div></div><div><p className="eyebrow text-[#848b80]">Uretir</p><div className="mt-5 grid gap-3 text-sm text-[#c4c8bd]"><Link href="/">Türkçe</Link><a href="/feed.xml">RSS feed</a><a href="mailto:merhaba@uretir.com">Contact <ArrowUpRight size={14} className="inline" /></a></div></div></div>
    <div className="section-wrap flex flex-col justify-between gap-3 border-t border-white/10 py-5 text-[11px] text-[#777d73] sm:flex-row"><span>© 2026 Uretir. All rights reserved.</span><span>Made with curiosity, care and collaboration.</span></div>
  </footer>;
  return <footer className="mt-28 bg-[#171916] text-[#f1f2eb]">
    <div className="section-wrap border-b border-white/10 py-16 md:py-24"><div className="grid gap-10 md:grid-cols-[1.2fr_.8fr] md:items-end"><div><p className="eyebrow text-[#848b80]">Bir sonraki fikrin için</p><h2 className="mt-5 max-w-3xl font-display text-5xl leading-[.9] md:text-7xl">İyi fikirler,<br /><span className="italic text-[#c8f560]">düzenli aralıklarla.</span></h2></div><div><p className="max-w-sm text-sm leading-6 text-[#a9ada2]">Üretim hikâyeleri, iyi sorular ve ilham veren araçlar. Haftada bir gelen sakin bir not.</p><NewsletterForm compact /></div></div></div>
    <div className="section-wrap grid gap-14 py-14 md:grid-cols-[1.5fr_1fr_1fr] md:py-20">
      <div><Link href="/" className="font-display text-4xl font-bold tracking-[-.1em]">üretir<span className="text-[#c8f560]">.</span></Link><p className="mt-5 max-w-xs text-sm leading-6 text-[#a9ada2]">Türkiye üretir, gençler yetişir.</p><Link href="/iletisim" className="link-arrow mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-bold text-[#c8cfc2] transition hover:border-white/40 hover:text-white" {...analyticsAttributes({ event: "contact_select", surface: "footer", target: "contact-page" })}>Bize ulaşın <ArrowUpRight size={14} /></Link></div>
      <div><p className="eyebrow text-[#848b80]">Keşfet</p><div className="mt-5 grid gap-3 text-sm text-[#c4c8bd]"><Link href="/gelismeler">Gelişmeler</Link><Link href="/ekosistem">Ekosistem</Link><Link href="/cozumler">Çözümler</Link><Link href="/girisimler">Girişimler</Link><Link href="/kaynaklar">Kaynaklar</Link></div></div>
      <div><p className="eyebrow text-[#848b80]">Üretir</p><div className="mt-5 grid gap-3 text-sm text-[#c4c8bd]"><Link href="/hakkimizda">Hakkımızda</Link><Link href="/iletisim">İletişim</Link><Link href="/gizlilik-politikasi">Gizlilik politikası</Link><Link href="/yonetici">Editör girişi</Link><a href="/feed.xml" {...analyticsAttributes({ event: "rss_select", surface: "footer", target: "feed" })}>RSS akışı</a><a href="mailto:merhaba@uretir.com" className="inline-flex items-center gap-1" {...analyticsAttributes({ event: "contact_select", surface: "footer", target: "email" })}>Bize yazın <ArrowUpRight size={14} /></a></div></div>
    </div>
    <div className="section-wrap flex flex-col justify-between gap-3 border-t border-white/10 py-5 text-[11px] text-[#777d73] sm:flex-row"><span>© 2026 Üretir. Tüm hakları saklıdır.</span><span>Merakla, özenle ve birlikte üretildi.</span></div>
  </footer>;
}
