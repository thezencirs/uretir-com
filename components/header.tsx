"use client";
import Link from "next/link";
import { analyticsAttributes } from "@/lib/analytics";
import { Languages, Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
const items = [{path:"/",tr:"Ana Sayfa",en:"Home"},{path:"/gelismeler",tr:"Gelişmeler",en:"Updates"},{path:"/harita",tr:"Harita",en:"Map"},{path:"/araclar",tr:"Araçlar",en:"Tools"},{path:"/uygulamalar",tr:"Uygulamalar",en:"Apps"}];
export function Header({showPreviewLinks = false}: {showPreviewLinks?: boolean}) {
  const pathname=usePathname(); const english=/^\/en(?:\/|$)/.test(pathname);
  const base=pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const [open,setOpen]=useState(false);
  const translated=items.some(i=>i.path===base)||base.startsWith("/urun/");
  const languageHref=english?base:translated?"/en"+(base==="/"?"":base):"https://translate.google.com/translate?sl=tr&tl=en&u="+encodeURIComponent("https://www.uretir.com"+base);
  useEffect(()=>{document.documentElement.lang=english?"en":"tr"; const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[english]);
  const nav=items.map(item=><Link {...analyticsAttributes({event:"navigation_select",surface:"header",target:item.path === "/" ? "home" : item.path.slice(1)})} key={item.path} href={(english?"/en":"")+(item.path==="/"?(english?"":"/"):item.path)} onClick={()=>setOpen(false)} className="nav-link" aria-current={base===item.path?"page":undefined} data-active={base===item.path}>{english?item.en:item.tr}</Link>);
  return <header className="site-header sticky top-0 z-50"><div className="section-wrap flex min-h-[78px] items-center justify-between gap-3">
    <Link href={english?"/en":"/"} aria-label={english?"Uretir home":"Üretir ana sayfa"} className="font-display text-[30px] font-bold tracking-[-.1em]">üretir<span className="text-[#92bb39]">.</span></Link>
    <nav className="hidden items-center gap-6 lg:flex" aria-label={english?"Main navigation":"Ana gezinme"}>{nav}</nav>
    <div className="flex items-center gap-2"><Link href={english?"/en#kesfet":"/ara"} className="header-search focus-ring" aria-label={english?"Search":"Ara"}><Search size={17}/><span className="hidden sm:inline">{english?"Search":"Ara"}</span></Link>
    <a href={languageHref} hrefLang={english?"tr":"en"} className="header-search focus-ring" aria-label={english?"Türkçe sürüme geç":"Switch to English"} title={!english&&!translated?"Google Çeviri ile İngilizce oku":undefined}><Languages size={17}/><span>{english?"TR":"EN"}</span></a><ThemeToggle english={english}/>
    {showPreviewLinks&&<Link className="hidden xl:block text-sm" href="/yonetim">Yönetim</Link>}
    <button onClick={()=>setOpen(!open)} className="focus-ring p-3 lg:hidden" aria-expanded={open} aria-controls="mobile-navigation" aria-label={english?(open?"Close menu":"Open menu"):(open?"Menüyü kapat":"Menüyü aç")}>{open?<X size={20}/>:<Menu size={20}/>}</button></div>
    </div>{open&&<nav id="mobile-navigation" aria-label={english?"Mobile navigation":"Mobil gezinme"} className="section-wrap grid gap-5 border-t hairline py-6 lg:hidden">{nav}</nav>}</header>;
}
