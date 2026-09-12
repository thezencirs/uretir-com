import Link from "next/link";
import { ToolShortcuts } from "@/components/tool-shortcuts";
import { getPublishedContent } from "@/lib/site-content-store";
import { publicNews } from "@/lib/site-content-model";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Layers, Rocket, Search, Sparkles, Zap } from "lucide-react";
import { HeroArt } from "@/components/hero-art";
import { NewsletterForm } from "@/components/newsletter-form";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { categories, posts } from "@/lib/posts";
import { createArticleDocument } from "@/lib/content-factory";
import { analyticsAttributes } from "@/lib/analytics";
import { isIndexableReference, isVisibleReference } from "@/lib/publication";

const ecosystemCards = [
  { number: "01", icon: Layers, title: "HaberAI", description: "Şehrini seç, kaynaklı haberleri Türkiye haritasında takip et", color: "#769d32", href: "/haber-ai" },
  { number: "02", icon: Zap, title: "PuanAI", description: "Doğrulanmış kampanyalarla alışveriş kararını açıkla", color: "#78a5b6", href: "/puan-ai" },
  { number: "03", icon: Sparkles, title: "AI Merkezleri", description: "Kaynaklı rehberler ve gelecek ürünler", color: "#8b80c2", href: "/araclar" },
  { number: "04", icon: Rocket, title: "Startup Vizyonu", description: "Türkiye'nin üretim teknolojileri platformu", color: "#d97835", href: "/startup" },
];

const visiblePosts = posts.filter((post) => isVisibleReference(createArticleDocument(post)));
const visibleCategories = categories.filter((category) => visiblePosts.some((post) => post.category === category.name));

export default async function HomePage() {
  const content = await getPublishedContent();
  const latestNews = publicNews(content.news).slice(0, 3);
  return <div className="page-reveal">
    <ToolShortcuts />
    <section className="home-entry">
      <div className="section-wrap home-entry__grid">
      <div className="home-entry__copy">
        <div className="flex items-center gap-4">
          <p className="rule-label">{content.home.eyebrow}</p>
          <span className="hidden h-[1px] flex-1 bg-gradient-to-r from-[color:var(--line)] to-transparent sm:block" />
        </div>
        <div className="relative mt-8">
          <h1 className="relative display-lg" style={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{content.home.title}</h1>
        </div>
        <p className="mt-8 max-w-md text-base leading-7 text-muted md:text-lg">{content.home.description}</p>
        <form action="/ara" className="group mt-9 flex max-w-md items-center gap-3 border-b hairline py-3.5 transition-colors focus-within:border-[#769d32]" {...analyticsAttributes({ event: "search_submit", surface: "global_search", target: "home" })}><Search size={17} className="shrink-0 text-muted transition group-focus-within:text-[#769d32]" /><label className="sr-only" htmlFor="home-search">Ne arıyorsun?</label><input id="home-search" name="q" maxLength={120} placeholder="Şirket, ürün, rehber veya AI merkezi ara" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" /><button className="text-[10px] font-bold uppercase tracking-[.16em] text-muted transition hover:text-[color:var(--foreground)]">Ara</button></form>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/blog" className="focus-ring inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-6 py-3.5 text-xs font-bold text-[color:var(--background)] shadow-[0_4px_20px_rgba(118,157,50,.15)] transition hover:shadow-[0_8px_30px_rgba(118,157,50,.25)] hover:opacity-90">Keşfetmeye başla <ArrowUpRight size={15} /></Link>
          <Link href="#manifesto" className="focus-ring inline-flex items-center gap-2 rounded-full border hairline px-6 py-3.5 text-xs font-bold transition hover:bg-surface hover:shadow-[0_4px_16px_rgba(0,0,0,.04)]">Biz kimiz? <ArrowDownRight size={15} /></Link>
        </div>
        <div className="mt-14 flex items-center gap-6 border-t hairline pt-5">
          <div className="grid max-w-md flex-1 grid-cols-3 text-[10px] text-muted"><div><span className="font-bold text-[color:var(--foreground)]">01</span><p className="mt-2">Merak</p></div><div><span className="font-bold text-[color:var(--foreground)]">02</span><p className="mt-2">Yöntem</p></div><div><span className="font-bold text-[color:var(--foreground)]">03</span><p className="mt-2">Paylaşım</p></div></div>
        </div>
      </div>
      <div className="home-entry__visual"><HeroArt /></div>
      </div>
    </section>

    <section className="section-wrap py-12" aria-label="Gelişmeler"><div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-current pb-5"><h2 className="text-3xl font-black">{content.developmentsTitle}</h2><Link href="/gelismeler" className="text-sm font-bold underline">Tüm gelişmeler ↗</Link></div><div className="grid md:grid-cols-3">{latestNews.map((item,index) => <Link href={"/gelismeler#" + item.id} key={item.id} className="border-b hairline p-6 transition hover:bg-surface"><span className="text-sm font-bold">{String(index+1).padStart(2,"0")} / {content.categories.find(category => category.id === item.category)?.label}</span><h3 className="mt-5 text-xl font-bold leading-snug">{item.title}</h3><p className="mt-4 text-base leading-7 text-muted">{item.summary}</p></Link>)}</div></section>

    <section className="border-y hairline bg-surface">
      <div className="section-wrap py-20 md:py-28">
        <p className="eyebrow">Platform / Çözümler</p>
        <h2 className="mt-6 font-display text-4xl leading-[.95] md:text-6xl">{content.home.ecosystemTitle}</h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted">Her biri birbirini besleyen araçlar, içerikler ve yapay zeka servisleri. Tek platform, sınırsız olanak.</p>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ecosystemCards.map((card, index) => {
            const Icon = card.icon;
            return <Link href={card.href} key={card.title} className="group relative overflow-hidden border hairline bg-[color:var(--background)] p-6 transition duration-300 hover:border-[color:var(--foreground)] hover:shadow-[0_16px_48px_rgba(0,0,0,.07)] animate-rise md:p-7" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-start justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border hairline transition duration-300 group-hover:border-transparent" style={{ backgroundColor: "transparent" }}><Icon size={18} style={{ color: card.color }} className="transition duration-300 group-hover:scale-110" /></span>
                <span className="font-display text-2xl text-muted/30 transition duration-300 group-hover:text-muted/60">{card.number}</span>
              </div>
              <h3 className="mt-8 font-display text-2xl leading-none tracking-tight">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
              <div className="mt-8 flex items-center justify-between">
                <div className="h-[2px] w-8 transition-all duration-500 group-hover:w-3/4" style={{ backgroundColor: card.color }} />
                <span className="text-muted/0 transition-all duration-300 group-hover:text-muted/60"><ArrowUpRight size={14} /></span>
              </div>
            </Link>;
          })}
        </div>
      </div>
    </section>

    <div className="border-y hairline"><div className="section-wrap flex flex-wrap items-center justify-between gap-4 py-4 text-[10px] font-bold uppercase tracking-[.17em] text-muted"><span className="transition duration-200 hover:text-[color:var(--foreground)]">Kim üretir?</span><span className="hidden opacity-40 sm:inline">—</span><span className="transition duration-200 hover:text-[color:var(--foreground)]">Ne üretir?</span><span className="hidden opacity-40 sm:inline">—</span><span className="transition duration-200 hover:text-[color:var(--foreground)]">Nasıl üretir?</span><span className="hidden opacity-40 sm:inline">—</span><span className="transition duration-200 hover:text-[color:var(--foreground)]">Neden üretir?</span></div></div>

    <section id="manifesto" className="border-b hairline bg-surface"><div className="section-wrap grid gap-10 py-20 md:grid-cols-[.65fr_1.35fr] md:py-28"><p className="eyebrow">Manifesto / 001</p><div><p className="max-w-4xl font-display text-4xl leading-[1.02] md:text-6xl md:leading-[.98]">{content.home.manifesto}</p><div className="mt-12 grid gap-8 border-t hairline pt-8 text-sm leading-7 text-muted md:grid-cols-2"><p>Üretir, merakın peşinden gidenlerin buluşma noktası. Bir makinenin nasıl çalıştığından bir fikrin nasıl hayata geçtiğine kadar, üretmenin her halini inceliyoruz.</p><p>Gürültüyü azaltıyor, iyi fikirlere alan açıyoruz. Çünkü gelecek, onu bekleyenlerin değil; onu özenle üretenlerin.</p></div></div></div></section>

    {visiblePosts.length > 0 ? <>
      <section className="section-wrap py-20 md:py-32"><SectionHeading eyebrow="Editörün seçkisi" title="Şimdi okuyun." link="/blog" /><PostCard post={visiblePosts[0]} featured reviewMode={!isIndexableReference(createArticleDocument(visiblePosts[0]))} /></section>
      {visiblePosts.length > 1 && <section className="section-wrap pb-20 md:pb-32"><SectionHeading eyebrow="Son yazılar" title="Merakın peşinde." link="/blog" /><div className="grid gap-x-8 gap-y-14 md:grid-cols-3">{visiblePosts.slice(1, 4).map((post, index) => <div key={post.slug} className="animate-rise" style={{ animationDelay: `${index * 80}ms` }}><PostCard post={post} reviewMode={!isIndexableReference(createArticleDocument(post))} /></div>)}</div></section>}
    </> : <section className="section-wrap py-20 md:py-28"><div className="grid gap-8 border-y hairline py-12 md:grid-cols-[.7fr_1.3fr] md:items-center"><p className="eyebrow">Editoryal yayın kapısı</p><div><h2 className="font-display text-4xl md:text-6xl">Hazır olmayan içerik<br /><em className="text-[#769d32]">yayına çıkmaz.</em></h2><p className="mt-6 max-w-xl text-sm leading-7 text-muted">İlk kaynaklı üretim dosyaları resmî referans, alan uzmanı ve güncelleme planı tamamlandıktan sonra burada görünecek.</p></div></div></section>}

    {visibleCategories.length > 0 && <section className="border-y hairline"><div className="section-wrap py-20 md:py-32"><SectionHeading eyebrow="Alanlar" title="Neyi üretirsin?" /><div className="grid border-l hairline md:grid-cols-3 lg:grid-cols-6">{visibleCategories.map((category, index) => <Link href={`/kategori/${category.slug}`} key={category.name} className="group border-r border-b hairline p-5 transition duration-300 hover:bg-[color:var(--surface-strong)] md:p-6 lg:border-b-0"><div className="flex items-start justify-between"><span className={`category-dot category-${category.color} transition duration-300 group-hover:scale-125`} /><span className="text-[10px] font-bold text-muted transition duration-300 group-hover:text-[color:var(--foreground)]">{String(index + 1).padStart(2, "0")}</span></div><h3 className="mt-16 font-display text-2xl leading-none transition group-hover:text-[#6e9630]">{category.name}</h3><p className="category-copy mt-4">{category.description}</p><div className="mt-7 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.12em] text-muted"><span>{category.count}</span><ChevronRight className="transition duration-300 group-hover:translate-x-1" size={16} /></div></Link>)}</div></div></section>}

    <section className="section-wrap py-20 md:py-32"><div className="relative overflow-hidden border hairline bg-[#d9f18e] p-8 text-[#172013] md:p-16"><div className="absolute right-[-4%] top-[-22%] font-display text-[23rem] leading-none text-[#c4df77]">&amp;</div><div className="relative z-10 max-w-2xl"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]"><Sparkles size={14} /> Üretir bülteni</div><h2 className="mt-6 max-w-xl font-display text-5xl leading-[.9] md:text-7xl">İyi fikirler,<br /><span className="italic">düzenli aralıklarla.</span></h2><p className="mt-6 max-w-md text-base leading-7 text-[#4f6330]">Haftada bir; okuma önerileri, üretim hikâyeleri ve dünyayı değiştiren küçük notlar.</p><NewsletterForm /></div></div></section>
  </div>;
}
