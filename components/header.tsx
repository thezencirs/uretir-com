"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [{ href: "/blog", label: "Keşfet" }, { href: "/hakkimizda", label: "Hakkımızda" }, { href: "/iletisim", label: "İletişim" }];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="site-header sticky top-0 z-50">
    <div className="section-wrap flex h-[78px] items-center justify-between">
      <Link href="/" className="group flex items-center gap-3" aria-label="Üretir ana sayfa"><span className="font-display text-[30px] font-bold tracking-[-.1em]">üretir<span className="text-[#92bb39]">.</span></span><span className="hidden border-l hairline pl-3 text-[9px] font-bold uppercase tracking-[.18em] text-muted sm:block">Journal<br />& studio</span></Link>
      <nav className="hidden items-center gap-8 md:flex" aria-label="Ana navigasyon">
        {navItems.map((item) => <Link key={item.href} href={item.href} data-active={pathname === item.href || pathname.startsWith(`${item.href}/`)} className="nav-link">{item.label}</Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/blog" aria-label="Yazılarda ara" className="header-search focus-ring"><Search size={15} strokeWidth={1.8} /><span className="hidden sm:inline">Ara</span><span className="header-shortcut hidden sm:inline">⌘ K</span></Link>
        <ThemeToggle />
        <button onClick={() => setOpen(!open)} aria-label={open ? "Menüyü kapat" : "Menüyü aç"} className="focus-ring rounded-full p-2 text-muted transition hover:bg-black/5 dark:hover:bg-white/10 md:hidden">{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
    </div>
    {open && <nav className="mobile-menu section-wrap border-t hairline py-3 md:hidden" aria-label="Mobil navigasyon">{navItems.map((item, index) => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className="flex items-center justify-between border-b hairline py-4 text-sm"><span>{item.label}</span><span className="font-display text-xl text-muted">0{index + 1}</span></Link>)}<Link onClick={() => setOpen(false)} href="/kategori/yapay-zeka" className="flex items-center justify-between py-4 text-sm text-muted"><span>Popüler kategori</span><span>Yapay zekâ →</span></Link></nav>}
  </header>;
}
