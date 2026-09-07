"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { analyticsAttributes } from "@/lib/analytics";

const navItems = [{ href: "/kesfet", label: "Keşfet" }, { href: "/map", label: "Map" }, { href: "/blog", label: "Journal" }, { href: "/araclar", label: "Araçlar" }, { href: "/ekosistem", label: "Ekosistem" }];

export function Header({ showPreviewLinks = false }: { showPreviewLinks?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return <header className="site-header sticky top-0 z-50">
    <div className="section-wrap flex h-[78px] items-center justify-between">
      <Link href="/" className="group flex items-center gap-3" aria-label="Üretir ana sayfa"><span className="font-display text-[30px] font-bold tracking-[-.1em]">üretir<span className="text-[#92bb39]">.</span></span><span className="hidden border-l hairline pl-3 text-[9px] font-bold uppercase tracking-[.18em] text-muted sm:block">Journal<br />& studio</span></Link>
      <nav className="hidden items-center gap-8 md:flex" aria-label="Ana navigasyon">
        {navItems.map((item) => { const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} data-active={active} aria-current={active ? "page" : undefined} className="nav-link" {...analyticsAttributes({ event: "navigation_select", surface: "header", target: item.href === "/" ? "home" : item.href.slice(1) })}>{item.label}</Link>; })}
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/map" className="rounded-full bg-[#e3edce] px-3 py-2 text-xs font-semibold text-[#385c25] md:hidden">Map</Link>
        {showPreviewLinks && <Link href="/uretir-id" className="hidden rounded-full bg-[color:var(--foreground)] px-3.5 py-2 text-[10px] font-bold text-[color:var(--background)] transition hover:opacity-80 sm:inline-flex">Uretir ID</Link>}
        <Link href="/ara" aria-label="Üretir içinde ara" className="header-search focus-ring" {...analyticsAttributes({ event: "navigation_select", surface: "header", target: "search" })}><Search size={15} strokeWidth={1.8} /><span className="hidden sm:inline">Ara</span></Link>
        <ThemeToggle />
        <button onClick={() => setOpen(!open)} aria-label={open ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={open} aria-controls="mobile-navigation" className="focus-ring rounded-full p-2 text-muted transition hover:bg-black/5 dark:hover:bg-white/10 md:hidden">{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
    </div>
    {open && <nav id="mobile-navigation" className="mobile-menu section-wrap border-t hairline py-3 md:hidden" aria-label="Mobil navigasyon">{navItems.map((item, index) => { const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link onClick={() => setOpen(false)} key={item.href} href={item.href} aria-current={active ? "page" : undefined} className="flex items-center justify-between border-b hairline py-4 text-sm" {...analyticsAttributes({ event: "navigation_select", surface: "header", target: item.href === "/" ? "home" : item.href.slice(1) })}><span>{item.label}</span><span className="font-display text-xl text-muted">0{index + 1}</span></Link>; })}{showPreviewLinks && <Link onClick={() => setOpen(false)} href="/kategori/yapay-zeka" className="flex items-center justify-between py-4 text-sm text-muted" {...analyticsAttributes({ event: "navigation_select", surface: "header", target: "kategori/yapay-zeka" })}><span>Popüler kategori</span><span>Yapay zekâ →</span></Link>}</nav>}
  </header>;
}
