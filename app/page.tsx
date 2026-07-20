import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Search, Sparkles } from "lucide-react";
import { HeroArt } from "@/components/hero-art";
import { NewsletterForm } from "@/components/newsletter-form";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { categories, posts } from "@/lib/posts";

export default function HomePage() {
  return <div className="page-reveal">
    <section className="section-wrap grid gap-12 py-14 md:min-h-[calc(100vh-78px)] md:grid-cols-[.9fr_1.1fr] md:items-center md:gap-20 md:py-20">
      <div className="max-w-xl">
        <p className="rule-label">Merak edenler için bir yayın</p>
        <h1 className="mt-8 display-lg">Fikri<br /><span className="italic text-[#769d32]">gerçeğe</span><br />dönüştür.</h1>
        <p className="mt-8 max-w-md text-base leading-7 text-muted md:text-lg">Üretim, teknoloji ve yarının dünyasını inşa eden fikirler üzerine sakin bir keşif alanı.</p>
        <form action="/blog" className="mt-9 flex max-w-md items-center gap-3 border-b hairline py-3.5"><Search size={17} className="shrink-0 text-muted" /><label className="sr-only" htmlFor="home-search">Ne arıyorsun?</label><input id="home-search" name="q" placeholder="Bir konu, fikir veya araç ara" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" /><button className="text-[10px] font-bold uppercase tracking-[.16em] text-muted transition hover:text-[color:var(--foreground)]">Ara</button></form>
        <div className="mt-7 flex flex-wrap gap-3"><Link href="/blog" className="focus-ring inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 py-3 text-xs font-bold text-[color:var(--background)] transition hover:opacity-80">Keşfetmeye başla <ArrowUpRight size={15} /></Link><Link href="#manifesto" className="focus-ring inline-flex items-center gap-2 rounded-full border hairline px-5 py-3 text-xs font-bold transition hover:bg-surface">Biz kimiz? <ArrowDownRight size={15} /></Link></div>
        <div className="mt-14 grid max-w-md grid-cols-3 border-t hairline pt-4 text-[10px] text-muted"><div><span className="font-bold text-[color:var(--foreground)]">01</span><p className="mt-2">Merak</p></div><div><span className="font-bold text-[color:var(--foreground)]">02</span><p className="mt-2">Yöntem</p></div><div><span className="font-bold text-[color:var(--foreground)]">03</span><p className="mt-2">Paylaşım</p></div></div>
      </div>
      <div className="relative"><HeroArt /><span className="absolute -bottom-3 -left-3 border hairline bg-[color:var(--background)] px-4 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-muted md:left-[-18px]">01 — 06 / Sorular</span></div>
    </section>

    <div className="border-y hairline"><div className="section-wrap flex flex-wrap items-center justify-between gap-4 py-4 text-[10px] font-bold uppercase tracking-[.17em] text-muted"><span>Kim üretir?</span><span className="hidden opacity-40 sm:inline">—</span><span>Ne üretir?</span><span className="hidden opacity-40 sm:inline">—</span><span>Nasıl üretir?</span><span className="hidden opacity-40 sm:inline">—</span><span>Neden üretir?</span></div></div>

    <section id="manifesto" className="border-b hairline bg-surface"><div className="section-wrap grid gap-10 py-20 md:grid-cols-[.65fr_1.35fr] md:py-28"><p className="eyebrow">Manifesto / 001</p><div><p className="max-w-4xl font-display text-4xl leading-[1.02] md:text-6xl">Dünyayı değiştiren şey, <span className="text-[#769d32]">daha iyi sorular</span> sormakla başlar.</p><div className="mt-10 grid gap-8 border-t hairline pt-6 text-sm leading-7 text-muted md:grid-cols-2"><p>Üretir, merakın peşinden gidenlerin buluşma noktası. Bir makinenin nasıl çalıştığından bir fikrin nasıl hayata geçtiğine kadar, üretmenin her halini inceliyoruz.</p><p>Gürültüyü azaltıyor, iyi fikirlere alan açıyoruz. Çünkü gelecek, onu bekleyenlerin değil; onu özenle üretenlerin.</p></div></div></div></section>

    <section className="section-wrap py-20 md:py-32"><SectionHeading eyebrow="Editörün seçkisi" title="Şimdi okuyun" link="/blog" /><PostCard post={posts[0]} featured /></section>

    <section className="section-wrap pb-20 md:pb-32"><SectionHeading eyebrow="Son yazılar" title="Merakın peşinde" link="/blog" /><div className="grid gap-x-8 gap-y-14 md:grid-cols-3">{posts.slice(1, 4).map((post, index) => <div key={post.slug} className="animate-rise" style={{ animationDelay: `${index * 80}ms` }}><PostCard post={post} /></div>)}</div></section>

    <section className="border-y hairline"><div className="section-wrap py-20 md:py-32"><SectionHeading eyebrow="Alanlar" title="Neyi üretirsin?" /><div className="grid border-l hairline md:grid-cols-3 lg:grid-cols-6">{categories.map((category, index) => <Link href={`/kategori/${category.slug}`} key={category.name} className="group border-r border-b hairline p-5 transition duration-300 hover:bg-[color:var(--surface-strong)] md:p-6 lg:border-b-0"><div className="flex items-start justify-between"><span className={`category-dot category-${category.color}`} /><span className="text-[10px] font-bold text-muted">{String(index + 1).padStart(2, "0")}</span></div><h3 className="mt-16 font-display text-2xl leading-none transition group-hover:text-[#6e9630]">{category.name}</h3><p className="category-copy mt-4">{category.description}</p><div className="mt-7 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.12em] text-muted"><span>{category.count}</span><ChevronRight className="transition duration-300 group-hover:translate-x-1" size={16} /></div></Link>)}</div></div></section>

    <section className="section-wrap py-20 md:py-32"><div className="relative overflow-hidden border hairline bg-[#d9f18e] p-8 text-[#172013] md:p-16"><div className="absolute right-[-4%] top-[-22%] font-display text-[23rem] leading-none text-[#c4df77]">&amp;</div><div className="relative z-10 max-w-2xl"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]"><Sparkles size={14} /> Üretir bülteni</div><h2 className="mt-6 max-w-xl font-display text-5xl leading-[.9] md:text-7xl">İyi fikirler,<br /><span className="italic">düzenli aralıklarla.</span></h2><p className="mt-6 max-w-md text-sm leading-6 text-[#4f6330]">Haftada bir; okuma önerileri, üretim hikâyeleri ve dünyayı değiştiren küçük notlar.</p><NewsletterForm /></div></div></section>
  </div>;
}
