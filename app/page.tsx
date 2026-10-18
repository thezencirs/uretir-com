import Link from "next/link";
import { ToolShortcuts } from "@/components/tool-shortcuts";
import { FinanceStrip } from "@/components/finance-strip";
import { getPublishedContent } from "@/lib/site-content-store";
import { publicNews } from "@/lib/site-content-model";
import { ArrowDownRight, ArrowUpRight, CarFront, ChartNoAxesCombined, ChevronRight, Gamepad2, House, Layers, MapPinned, Rocket, Search, Sparkles, Tags, Trophy, WalletCards, Zap } from "lucide-react";
import { HeroArt } from "@/components/hero-art";
import { NewsletterForm } from "@/components/newsletter-form";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { categories, posts } from "@/lib/posts";
import { createArticleDocument } from "@/lib/content-factory";
import { analyticsAttributes } from "@/lib/analytics";
import { isIndexableReference, isVisibleReference } from "@/lib/publication";

const ecosystemCards = [
  { number: "01", icon: MapPinned, title: "HaberAI · 81 İl Haritası", description: "81 ilin tamamında resmi ajans ve kurum kaynaklı sıcak gündemi interaktif haritada takip et", color: "#769d32", href: "/haber-ai" },
  { number: "02", icon: WalletCards, title: "PuanAI · Kart Kampanya", description: "Bankaların resmi kredi kartı puan, nakit iade ve taksit kampanyalarını net kazanca göre kıyasla", color: "#78a5b6", href: "/puan-ai" },
  { number: "03", icon: Tags, title: "İndirimAI · Dip Fiyat", description: "30/90/360 günlük gerçek fiyat geçmişi, kupon kodları ve sahte indirim filtresiyle fırsatları yakala", color: "#f6ad55", href: "/indirim-ai" },
  { number: "04", icon: ChartNoAxesCombined, title: "FinansAI · Canlı Piyasa", description: "Dolar, Euro, Gram Altın, BIST 100, Bitcoin ve Brent Petrol verilerini tek ekranda izle", color: "#4fd1c5", href: "/finans-ai" },
  { number: "05", icon: Trophy, title: "SporAI · Süper Lig & UEFA", description: "Süper Lig xG beklentisi, UEFA ülke puanı sıralaması, EuroLeague ve spor ekonomisi verilerini incele", color: "#2d8a62", href: "/spor-ai" },
  { number: "06", icon: Gamepad2, title: "OyunAI · Gaming & Hafıza", description: "Steam MENA-USD, Epic Games ve konsol indirimlerini takip et; reklamsız kelime hafıza oyununu oyna", color: "#8a5cf6", href: "/oyun-ai" },
  { number: "07", icon: CarFront, title: "ArabaAI · Çoklu Platform Araç", description: "Sahibinden, Arabam.com, Letgo ve resmi distribütör sıfır liste fiyatlarını fotoğraflı vitrinde kıyasla", color: "#63b3ed", href: "/araba-ai" },
  { number: "08", icon: House, title: "EvAI · Çoklu Platform Emlak", description: "Sahibinden, Emlakjet, Hepsiemlak, Letgo ve kamu ihale konut/arsa ilanlarını m² medyanıyla karşılaştır", color: "#f687b3", href: "/ev-ai" },
];

const quickMapCities = [
  { code: "34", name: "İstanbul", region: "Marmara" },
  { code: "06", name: "Ankara", region: "İç Anadolu" },
  { code: "35", name: "İzmir", region: "Ege" },
  { code: "16", name: "Bursa", region: "Marmara" },
  { code: "07", name: "Antalya", region: "Akdeniz" },
  { code: "01", name: "Adana", region: "Akdeniz" },
  { code: "42", name: "Konya", region: "İç Anadolu" },
  { code: "27", name: "Gaziantep", region: "Güneydoğu" },
  { code: "61", name: "Trabzon", region: "Karadeniz" },
  { code: "25", name: "Erzurum", region: "Doğu Anadolu" },
  { code: "21", name: "Diyarbakır", region: "Güneydoğu" },
  { code: "55", name: "Samsun", region: "Karadeniz" },
];

const openSourceEngines = [
  {
    name: "Next.js & React 19",
    repo: "https://github.com/vercel/next.js",
    stars: "130K+ ★",
    role: "Üretir Web & OG Görsel Kart Motoru",
    desc: "Milisaniyelik sayfa açılışı, dinamik görsel kart üretimi ve Google SEO yapılandırılmış veri mimarisi.",
  },
  {
    name: "FFmpeg & Sharp",
    repo: "https://github.com/lovell/sharp",
    stars: "30K+ ★",
    role: "9:16 Akıcı 30 FPS Fon Müzikli Video Hattı",
    desc: "09:00, 12:00, 15:00 ve 20:00 yayınlarında 30 FPS akıcı fon müzikli 1080x1920 dikey Reels ve Shorts video işleme.",
  },
  {
    name: "Edge-TTS Neural Voice",
    repo: "https://github.com/rany2/edge-tts",
    stars: "8K+ ★",
    role: "Stereo Broadcast Fon & Ses Motoru",
    desc: "8 AI kategorisini sinematik stereo fon müziği ve görsel veri grafikleriyle sunan stüdyo motoru.",
  },
  {
    name: "Instagrapi & Telegram Bot API",
    repo: "https://github.com/subzeroid/instagrapi",
    stars: "5K+ ★",
    role: "Çok Kanallı Sosyal Medya Otomasyonu",
    desc: "@uretirbot üzerinden tek tuşla tetiklenen Instagram (@uretirai), YouTube (@Uretir) ve WhatsApp dağıtımı.",
  },
];

const seoReferenceClusters = [
  { href: "/haber-ai", label: "81 İl Son Dakika Türkiye Haber Haritası", tag: "HaberAI" },
  { href: "/puan-ai", label: "Doğrulanmış Kredi Kartı Kampanya ve Taksit Karşılaştırma", tag: "PuanAI" },
  { href: "/indirim-ai", label: "30-90-360 Günlük E-Ticaret Fiyat Geçmişi ve Dip Fiyat Radarı", tag: "İndirimAI" },
  { href: "/finans-ai", label: "Canlı Döviz, Gram Altın, BIST 100 ve Kripto Takibi", tag: "FinansAI" },
  { href: "/spor-ai", label: "Süper Lig xG Beklentisi, UEFA Ülke Puanı ve Spor Ekonomisi", tag: "SporAI" },
  { href: "/oyun-ai", label: "Steam & Epic Oyun İndirimleri, Türk Stüdyoları ve Hafıza Oyunu", tag: "OyunAI" },
  { href: "/araba-ai", label: "Sahibinden, Arabam.com, Letgo ve Sıfır Araç Fiyat Kıyaslama", tag: "ArabaAI" },
  { href: "/ev-ai", label: "Sahibinden, Emlakjet, Hepsiemlak, Letgo ve Kamu İhale Konut Analizi", tag: "EvAI" },
  { href: "/cozumler", label: "Yapay Zekâ Karar Destek Araçları ve Üretir Çözümleri", tag: "Çözümler" },
  { href: "/ekosistem/harita", label: "Türkiye Girişim, Teknoloji ve Üretici Ekosistem Haritası", tag: "Harita" },
  { href: "/ekosistem/marketplace", label: "Kanıt Odaklı Güvenli İlan ve Pazar Yeri Altyapısı", tag: "Marketplace" },
  { href: "/iletisim", label: "Kurumsal İletişim, Sponsorluk ve Reklam İş Birlikleri", tag: "Reklam & İletişim" },
];

const visiblePosts = posts.filter((post) => isVisibleReference(createArticleDocument(post)));
const visibleCategories = categories.filter((category) => visiblePosts.some((post) => post.category === category.name));

export default async function HomePage() {
  const content = await getPublishedContent();
  const latestNews = publicNews(content.news).slice(0, 3);
  return <div className="page-reveal">
    <ToolShortcuts />
    <div className="section-wrap py-4">
      <FinanceStrip />
    </div>

    <section className="section-wrap py-6" aria-label="Canlı Komuta ve Hızlı Etkileşim Merkezi">
      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-2xl border hairline bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#769d32]">🗺️ HABERAI · 81 İL İNTERAKTİF TÜRKİYE HARİTASI</span>
            <Link href="/haber-ai" className="text-xs font-bold underline hover:text-[#769d32]">Tam ekran haritayı aç ↗</Link>
          </div>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">Şehrini seç, 81 ilin sıcak gündemini haritada incele.</h2>
          <p className="mt-2 text-xs leading-6 text-muted">Anadolu Ajansı, TRT Haber ve resmi kurum kaynaklı şehir bültenleri 7 coğrafi bölge ve 81 il plaka koduyla anlık güncellenir.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickMapCities.map((c) => (
              <Link
                key={c.code}
                href={`/haber-ai?city=${c.code}`}
                className="inline-flex items-center gap-1.5 rounded-full border hairline bg-[color:var(--background)] px-3 py-1.5 text-xs font-semibold transition hover:border-[#769d32] hover:text-[#769d32]"
              >
                <span className="font-mono text-[10px] font-bold opacity-60">{c.code}</span>
                <span>{c.name}</span>
              </Link>
            ))}
            <Link
              href="/haber-ai"
              className="inline-flex items-center gap-1 rounded-full bg-[#769d32] px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              81 İlin Tamamı <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border hairline bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#d97835]">🔥 İNDİRİMAI · GÜNÜN DOĞRULANMIŞ KANCASI</span>
            <Link href="/indirim-ai" className="text-xs font-bold underline hover:text-[#d97835]">Tüm fırsatlar ↗</Link>
          </div>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">Dyson 360° Combi Filtrede 2 Al 1 Öde (-%50)</h2>
          <p className="mt-2 text-xs leading-6 text-muted">Sepette <strong>COMBI360</strong> kupon koduyla 2 adet alımda birim fiyat <strong>3.899 TL</strong> yerine <strong>1.949,50 TL</strong>. 360 günlük dip fiyat doğrulaması yapıldı.</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t hairline pt-4">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">Kupon Kodu &amp; Birim Fiyat</span>
              <strong className="text-sm font-black text-[#769d32]">COMBI360 · 1.949,50 TL</strong>
            </div>
            <div className="flex gap-2">
              <Link href="/indirim-ai" className="inline-flex items-center gap-1 rounded-full border hairline bg-[color:var(--background)] px-3.5 py-2 text-xs font-bold transition hover:border-[#769d32]">
                Fiyat Grafiği <ArrowUpRight size={13} />
              </Link>
              <Link href="/puan-ai" className="inline-flex items-center gap-1 rounded-full border hairline bg-[color:var(--background)] px-3.5 py-2 text-xs font-bold transition hover:border-[#769d32]">
                Kart Puanı Ekle <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

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
          <Link href="/haber-ai" className="focus-ring inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-6 py-3.5 text-xs font-bold text-[color:var(--background)] shadow-[0_4px_20px_rgba(118,157,50,.15)] transition hover:shadow-[0_8px_30px_rgba(118,157,50,.25)] hover:opacity-90">81 İl Haritasını Aç <ArrowUpRight size={15} /></Link>
          <Link href="/indirim-ai" className="focus-ring inline-flex items-center gap-2 rounded-full border hairline px-6 py-3.5 text-xs font-bold transition hover:bg-surface hover:shadow-[0_4px_16px_rgba(0,0,0,.04)]">İndirim Radarı <ArrowUpRight size={15} /></Link>
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
        <p className="mt-6 max-w-xl text-base leading-7 text-muted">Her biri birbirini besleyen 6 canlı yapay zeka veri aracı ve 6 resmi WhatsApp kanalı. Tek platform, doğrulanmış referans.</p>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

    <section id="manifesto" className="border-b hairline bg-surface"><div className="section-wrap grid gap-10 py-20 md:grid-cols-[.65fr_1.35fr] md:py-28"><p className="eyebrow">Manifesto / 001 · Üretir&apos;in Amacı</p><div><p className="max-w-4xl font-display text-4xl leading-[1.02] md:text-6xl md:leading-[.98]">{content.home.manifesto}</p><div className="mt-12 grid gap-8 border-t hairline pt-8 text-sm leading-7 text-muted md:grid-cols-2"><p>Üretir, merakın peşinden gidenlerin buluşma noktası. Türkiye&apos;de yaşayan her gencin, girişimcinin ve tüketicinin manipülasyondan uzak, <strong>kaynaklı veriyle</strong> karar vermesini sağlıyoruz: gerçek indirim geçmişi (İndirimAI), doğrulanmış kart kampanyaları (PuanAI), şeffaf piyasa verisi (FinansAI), 81 il gündemi (HaberAI), resmî sıfır araç referansı (ArabaAI) ve bölgesel konut analizi (EvAI).</p><p>Her gün Türkiye saatiyle <strong>09:00, 12:00, 15:00 ve 20:00</strong> kuşaklarında canlı verilerimiz doğal Türkçe seslendirmeli dikey motion-graphic kısa videolara dönüştürülerek <a href="https://www.instagram.com/uretirai" target="_blank" rel="noopener noreferrer" className="underline">Instagram (@uretirai)</a>, <a href="https://www.youtube.com/@Uretir" target="_blank" rel="noopener noreferrer" className="underline">YouTube (@Uretir)</a>, <a href="https://t.me/uretirbot" target="_blank" rel="noopener noreferrer" className="underline">Telegram (@uretirbot)</a> ve 6 WhatsApp kanalımızda eşzamanlı yayımlanır.</p></div></div></div></section>

    <section className="border-b hairline py-20 md:py-24" aria-label="Açık Kaynak Teknoloji Altyapısı">
      <div className="section-wrap">
        <p className="eyebrow">Açık Kaynak Gücü · GitHub Ekosistemi</p>
        <h2 className="mt-4 font-display text-3xl md:text-5xl">Kendini ispatlamış açık kaynak motorlarla çalışır.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Üretir; veri doğrulama, görsel kart üretimi, doğal sesli motion-graphic video sentezi ve çok kanallı sosyal medya otomasyonu için dünyada en çok yıldız alan açık kaynak teknolojileri bir araya getirir.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {openSourceEngines.map((eng) => (
            <a key={eng.name} href={eng.repo} target="_blank" rel="noopener noreferrer" className="group block border hairline bg-[color:var(--background)] p-6 transition hover:border-[#769d32]">
              <div className="flex items-center justify-between text-xs font-bold text-[#769d32]">
                <span>{eng.role}</span>
                <span>{eng.stars}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl group-hover:underline">{eng.name} ↗</h3>
              <p className="mt-3 text-xs leading-6 text-muted">{eng.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>

    <section className="border-b hairline bg-surface py-16 md:py-20" aria-label="Kurumsal Referans ve Konu Ağı">
      <div className="section-wrap">
        <p className="eyebrow">Üretir Dizin &amp; Referans Bağlantıları</p>
        <h2 className="mt-4 font-display text-3xl md:text-4xl">Hızlı erişim ve araştırma rehberi.</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {seoReferenceClusters.map((ref) => (
            <Link key={ref.href} href={ref.href} className="group flex items-center justify-between rounded-xl border hairline bg-[color:var(--background)] px-4 py-3.5 text-sm transition hover:border-[#769d32]">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#769d32]">{ref.tag}</span>
                <strong className="mt-0.5 block font-semibold group-hover:underline">{ref.label}</strong>
              </div>
              <ArrowUpRight size={15} className="shrink-0 text-muted group-hover:text-[#769d32]" />
            </Link>
          ))}
        </div>
      </div>
    </section>

    {visiblePosts.length > 0 ? <>
      <section className="section-wrap py-20 md:py-32"><SectionHeading eyebrow="Editörün seçkisi" title="Şimdi okuyun." link="/blog" /><PostCard post={visiblePosts[0]} featured reviewMode={!isIndexableReference(createArticleDocument(visiblePosts[0]))} /></section>
      {visiblePosts.length > 1 && <section className="section-wrap pb-20 md:pb-32"><SectionHeading eyebrow="Son yazılar" title="Merakın peşinde." link="/blog" /><div className="grid gap-x-8 gap-y-14 md:grid-cols-3">{visiblePosts.slice(1, 4).map((post, index) => <div key={post.slug} className="animate-rise" style={{ animationDelay: `${index * 80}ms` }}><PostCard post={post} reviewMode={!isIndexableReference(createArticleDocument(post))} /></div>)}</div></section>}
    </> : <section className="section-wrap py-20 md:py-28"><div className="grid gap-8 border-y hairline py-12 md:grid-cols-[.7fr_1.3fr] md:items-center"><p className="eyebrow">Editoryal yayın kapısı</p><div><h2 className="font-display text-4xl md:text-6xl">Hazır olmayan içerik<br /><em className="text-[#769d32]">yayına çıkmaz.</em></h2><p className="mt-6 max-w-xl text-sm leading-7 text-muted">İlk kaynaklı üretim dosyaları resmî referans, alan uzmanı ve güncelleme planı tamamlandıktan sonra burada görünecek.</p></div></div></section>}

    {visibleCategories.length > 0 && <section className="border-y hairline"><div className="section-wrap py-20 md:py-32"><SectionHeading eyebrow="Alanlar" title="Neyi üretirsin?" /><div className="grid border-l hairline md:grid-cols-3 lg:grid-cols-6">{visibleCategories.map((category, index) => <Link href={`/kategori/${category.slug}`} key={category.name} className="group border-r border-b hairline p-5 transition duration-300 hover:bg-[color:var(--surface-strong)] md:p-6 lg:border-b-0"><div className="flex items-start justify-between"><span className={`category-dot category-${category.color} transition duration-300 group-hover:scale-125`} /><span className="text-[10px] font-bold text-muted transition duration-300 group-hover:text-[color:var(--foreground)]">{String(index + 1).padStart(2, "0")}</span></div><h3 className="mt-16 font-display text-2xl leading-none transition group-hover:text-[#6e9630]">{category.name}</h3><p className="category-copy mt-4">{category.description}</p><div className="mt-7 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.12em] text-muted"><span>{category.count}</span><ChevronRight className="transition duration-300 group-hover:translate-x-1" size={16} /></div></Link>)}</div></div></section>}

    <section className="section-wrap py-20 md:py-32"><div className="relative overflow-hidden border hairline bg-[#d9f18e] p-8 text-[#172013] md:p-16"><div className="absolute right-[-4%] top-[-22%] font-display text-[23rem] leading-none text-[#c4df77]">&amp;</div><div className="relative z-10 max-w-2xl"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em]"><Sparkles size={14} /> Üretir bülteni</div><h2 className="mt-6 max-w-xl font-display text-5xl leading-[.9] md:text-7xl">İyi fikirler,<br /><span className="italic">düzenli aralıklarla.</span></h2><p className="mt-6 max-w-md text-base leading-7 text-[#4f6330]">Haftada bir; okuma önerileri, üretim hikâyeleri ve dünyayı değiştiren küçük notlar.</p><NewsletterForm /></div></div></section>
  </div>;
}
