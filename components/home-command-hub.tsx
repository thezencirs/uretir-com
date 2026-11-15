"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Flame, Orbit, Search, ShieldCheck, Sparkles } from "lucide-react";
import { PuanWalletCalculator } from "@/components/viral-calculators";
import { AdSlot } from "@/components/google-monetization";
import { JsonLd } from "@/components/json-ld";
import { GALAXY_CLUSTERS, SUPPORT_PROGRAMS, RECRUITMENT_TRACKS } from "@/lib/tesvik-memur-data";

const TRENDING_SEARCHES = [
  { label: "🍼 Yeni Doğum & Çocuk Yardımı (5.000 TL/Ay)", href: "/tesvik-ai/dogum-ve-cocuk-yardimi" },
  { label: "💍 150.000 TL Faizsiz Evlilik Kredisi Şartları", href: "/tesvik-ai/evlenecek-genclere-150-bin-tl-faizsiz-evlilik-kredisi" },
  { label: "🎯 KPSS Şartsız Kamu İşçisi & İŞKUR İUP", href: "/memur-ai/kpss-sartsiz-kamu-isci-alimi-ve-iskur-iup" },
  { label: "🏦 En Yüksek Emekli Banka Promosyonu (20.000 TL)", href: "/memur-ai/emekli-banka-promosyonu-karsilastirma" },
  { label: "📋 50 - 60 KPSS İle Memur Alan Kurumlar", href: "/memur-ai/dusuk-kpss-puaniyla-50-55-60-memur-alimi" },
  { label: "🩺 Evde Bakım Maaşı & SED Gelir Kriteri Robotu", href: "/tesvik-ai" },
  { label: "💳 Market 2.000 TL Hangi Kart Puan Verir?", href: "/puan-ai" },
  { label: "💰 100.000 TL 32 Günlük Mevduat Getirisi", href: "/finans-ai" },
];

const HOME_FAQ = [
  {
    q: "Üretir (uretir.com) nedir ve hangi galaksi kümelerinden oluşur?",
    a: "Üretir; 1) Yardım, Teşvik & Tasarruf (TeşvikAI, PuanAI, İndirimAI), 2) Memur, Kariyer & Kamu İlan (MemurAI, KPSS Robotu, Maaş/Promosyon), 3) Finans, Varlık & Gündem (FinansAI, EvAI, ArabaAI, HaberAI) ve 4) Teknoloji, Yapay Zekâ & Oyun (ÜretirAI, SporAI, OyunAI) olmak üzere 4 ana galakside çalışan karar ve hesaplama platformudur.",
  },
  {
    q: "TeşvikAI aile yardımları ve devlet desteği robotu nasıl çalışır?",
    a: "Hane toplam gelirinizi ve kişi sayısını girdiğinizde, kişi başı gelirinizi asgari ücretin 1/3 ve 2/3 sınırlarıyla karşılaştırır; Doğum Yardımı, SED, 150.000 TL Faizsiz Evlilik Kredisi, Evde Bakım Maaşı, Fatura/Kira Desteği ve KOSGEB hibelerinden hangilerine başvurabileceğinizi resmî e-Devlet linkleriyle listeler.",
  },
  {
    q: "MemurAI KPSS puan robotu ve maaş/promosyon hesaplayıcı neleri kapsar?",
    a: "Eğitim düzeyinize (Lise, Önlisans, Lisans) ve KPSS puanınıza (KPSS şartsız noter kurası, 50, 55, 60, 70+ puan) göre Cumhurbaşkanlığı Kariyer Kapısı, İŞKUR ve belediye ilanlarını eşleştirir; ayrıca 6 aylık enflasyon farkıyla yeni memur/emekli maaşını ve banka promosyonlarını hesaplar.",
  },
  {
    q: "PuanAI ve İndirimAI kart numarası veya kişisel şifre ister mi?",
    a: "Hayır. Üretir üzerindeki hiçbir araç kart numarası, T.C. kimlik numarası veya e-Devlet/banka şifresi istemez. Tüm hesaplamalar tarayıcınızda şeffaf biçimde yapılır ve yalnızca resmî kurum sayfalarına yönlendirir.",
  },
];

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export function HomeCommandHub() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCluster, setActiveCluster] = useState<string>("all");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return;
    if (
      q.includes("teşvik") ||
      q.includes("tesvik") ||
      q.includes("yardım") ||
      q.includes("yardim") ||
      q.includes("doğum") ||
      q.includes("dogum") ||
      q.includes("çocuk") ||
      q.includes("sed") ||
      q.includes("evlilik") ||
      q.includes("bakım") ||
      q.includes("kosgeb") ||
      q.includes("hibe") ||
      q.includes("fatura")
    ) {
      router.push("/tesvik-ai");
    } else if (
      q.includes("memur") ||
      q.includes("kpss") ||
      q.includes("işkur") ||
      q.includes("iskur") ||
      q.includes("iup") ||
      q.includes("zabıta") ||
      q.includes("itfaiye") ||
      q.includes("promosyon") ||
      q.includes("emekli") ||
      q.includes("maaş") ||
      q.includes("maas") ||
      q.includes("kadro")
    ) {
      router.push("/memur-ai");
    } else if (
      q.includes("kart") ||
      q.includes("puan") ||
      q.includes("bonus") ||
      q.includes("world") ||
      q.includes("axess") ||
      q.includes("maximum") ||
      q.includes("bankkart") ||
      q.includes("market") ||
      q.includes("akaryakıt")
    ) {
      router.push("/puan-ai");
    } else if (
      q.includes("altın") ||
      q.includes("dolar") ||
      q.includes("euro") ||
      q.includes("faiz") ||
      q.includes("mevduat") ||
      q.includes("borsa") ||
      q.includes("bist")
    ) {
      router.push("/finans-ai");
    } else if (q.includes("indirim") || q.includes("kupon") || q.includes("fiyat") || q.includes("ucuz")) {
      router.push("/indirim-ai");
    } else if (q.includes("ev") || q.includes("kira") || q.includes("konut") || q.includes("arsa") || q.includes("ihale") || q.includes("m2")) {
      router.push("/ev-ai");
    } else if (q.includes("araba") || q.includes("araç") || q.includes("otomobil") || q.includes("tramer") || q.includes("km")) {
      router.push("/araba-ai");
    } else if (q.includes("maç") || q.includes("süper lig") || q.includes("uefa") || q.includes("spor")) {
      router.push("/spor-ai");
    } else if (q.includes("oyun") || q.includes("steam")) {
      router.push("/oyun-ai");
    } else {
      router.push(`/ara?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const visibleClusters =
    activeCluster === "all"
      ? GALAXY_CLUSTERS
      : GALAXY_CLUSTERS.filter((cluster) => cluster.id === activeCluster);

  return (
    <div id="canli-merkez" className="relative z-10 border-t border-white/10 bg-[var(--background)] pb-16 pt-12">
      <JsonLd data={homeFaqSchema} />

      {/* 1. Birleşik Komut & Trend Arama Merkezi */}
      <section className="section-wrap" aria-labelledby="home-command-heading">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-lg dark:border-white/15 dark:bg-[#0c1222] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#c8f560]/25 px-3.5 py-1 text-xs font-extrabold tracking-wider text-black dark:bg-[#c8f560]/20 dark:text-[#c8f560]">
              <Sparkles size={14} /> ÜRETİR EVRENİ · 4 GALAKSİ &amp; 10 CANLI HESAPLAMA ARACI
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <ShieldCheck size={15} className="text-emerald-500" /> e-Devlet, Kariyer Kapısı, TCMB &amp; Resmî Banka Kaynaklı
            </span>
          </div>

          <h1 id="home-command-heading" className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
            Aile yardımlarından memur alımına, banka puanından mevduata tek karar merkezi.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
            Hane gelirinize göre çıkan <strong>aile ve devlet yardımlarını (TeşvikAI)</strong>, KPSS puanınıza göre{" "}
            <strong>güncel kamu/memur ilanlarını ve emekli promosyonlarını (MemurAI)</strong>, kredi kartı puanlarını,
            32 günlük mevduat faizini ve konut/araç değerlemelerini saniyeler içinde hesaplayın.
          </p>

          <form action="/ara" method="get" onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row" role="search">
            <div className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ne arıyorsun? (Örn: Doğum yardımı, 150 bin TL evlilik kredisi, KPSS şartsız memur, emekli promosyon, 100 bin TL faiz...)"
                aria-label="Tüm Üretir yapay zekâ araçlarında ara"
                className="w-full rounded-2xl border border-black/15 bg-transparent py-3.5 pl-11 pr-4 text-sm font-semibold focus:border-black focus:outline-none dark:border-white/20 dark:focus:border-[#c8f560]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-7 py-3.5 text-sm font-extrabold text-[#c8f560] transition hover:opacity-90 dark:bg-[#c8f560] dark:text-[#090d16]"
            >
              Araca Git <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted">
              <Flame size={14} className="text-orange-500" /> Türkiye&apos;de Şu An En Çok Araştırılanlar:
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-3.5 py-1.5 text-xs font-bold transition hover:border-black/30 hover:bg-black/[0.07] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-[#c8f560]/60"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hızlı Giriş: TeşvikAI (Aile Yardımları) & MemurAI (Kamu İlan/Maaş) Vitrin Kartları */}
      <section className="section-wrap mt-8" aria-label="Öne çıkan devlet desteği ve kamu kariyer robotları">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col justify-between rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/90 via-[#0c1424] to-[#090d16] p-6 text-white shadow-lg">
            <div>
              <span className="inline-block rounded-full bg-[#c8f560] px-3 py-1 text-[11px] font-extrabold text-[#090d16]">
                1. GALAKSİ · YARDIM, TEŞVİK &amp; TASARRUF
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">
                TeşvikAI · Aile Yardımları ve e-Devlet Sosyal Destek Robotu
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 md:text-sm">
                Hane gelirinizi ve kişi sayısını yazın; <strong>Doğum Yardımı (5.000 TL/Ay)</strong>,{" "}
                <strong>SED Çocuk Maaşı</strong>, <strong>150.000 TL Faizsiz Evlilik Kredisi</strong>,{" "}
                <strong>Evde Bakım Maaşı</strong> ve <strong>KOSGEB Hibeleri</strong> arasından size çıkanları görün.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {SUPPORT_PROGRAMS.slice(0, 4).map((prog) => (
                  <Link
                    key={prog.id}
                    href={`/tesvik-ai/${prog.slug}`}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-emerald-200 transition hover:bg-white/15"
                  >
                    {prog.shortTitle} →
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
              <span className="text-xs font-semibold text-emerald-300">Asgari Ücret 1/3 ve 2/3 Gelir Testi</span>
              <Link
                href="/tesvik-ai"
                className="inline-flex items-center gap-2 rounded-xl bg-[#c8f560] px-5 py-2.5 text-xs font-extrabold text-[#090d16] transition hover:opacity-95"
              >
                Aile Yardımı Robotunu Aç <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/85 via-[#0e1526] to-[#090d16] p-6 text-white shadow-lg">
            <div>
              <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold text-[#090d16]">
                2. GALAKSİ · MEMUR, KARİYER &amp; MAAŞ
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">
                MemurAI · Kamu Personeli Alımı, KPSS Robotu &amp; Promosyon
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 md:text-sm">
                Mezuniyetinizi ve KPSS puanınızı seçin; <strong>KPSS Şartsız Kamu İşçisi Kura İlanlarını</strong>,{" "}
                <strong>50–60 KPSS İle Memur Alan Kurumları</strong>, <strong>Zabıta/İtfaiye Alımlarını</strong>,{" "}
                <strong>Maaş Zammını</strong> ve <strong>Emekli Banka Promosyonlarını</strong> karşılaştırın.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {RECRUITMENT_TRACKS.slice(0, 4).map((track) => (
                  <Link
                    key={track.id}
                    href={`/memur-ai/${track.slug}`}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-amber-200 transition hover:bg-white/15"
                  >
                    {track.shortTitle} →
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
              <span className="text-xs font-semibold text-amber-300">Kariyer Kapısı · İŞKUR · Maaş &amp; Promosyon</span>
              <Link
                href="/memur-ai"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-[#090d16] transition hover:opacity-95"
              >
                Memur &amp; KPSS Robotunu Aç <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Doğrudan Ana Sayfada Çalışan İnteraktif Kart Cüzdanım & Puan Hesaplayıcı */}
      <PuanWalletCalculator />

      {/* 4. 4 Galaksi Kümesi & Tüm Yapay Zekâ Araçları (Tutarlı Üst Başlık Mimarisi) */}
      <section id="araclar" className="section-wrap mt-12" aria-labelledby="home-tools-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted">
              <Orbit size={15} /> ÜRETİR EVRENİ · 4 ANA GALAKSİ KÜMESİ
            </span>
            <h2 id="home-tools-heading" className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Galaksi Kümeleri &amp; Canlı Hesaplama Masaları
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Tüm Evren (4 Galaksi)" },
              { id: "yardim-tasarruf", label: "1. Yardım, Teşvik & Tasarruf" },
              { id: "memur-kariyer", label: "2. Memur, Kariyer & Kamu" },
              { id: "finans-gundem", label: "3. Finans, Emlak & Gündem" },
              { id: "teknoloji-uretim", label: "4. Teknoloji, Spor & Oyun" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCluster(tab.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                  activeCluster === tab.id
                    ? "bg-black text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                    : "border border-black/15 bg-black/[0.03] hover:bg-black/[0.07] dark:border-white/15 dark:bg-white/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {visibleClusters.map((cluster) => (
            <div
              key={cluster.id}
              className="rounded-3xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-white/[0.02] md:p-8"
            >
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
                <div>
                  <span className="rounded-full bg-[#c8f560]/25 px-3 py-1 text-[10px] font-extrabold tracking-wider text-black dark:bg-[#c8f560]/15 dark:text-[#c8f560]">
                    {cluster.badge}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold">{cluster.name}</h3>
                  <p className="mt-1 text-xs text-muted md:text-sm">{cluster.description}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cluster.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={tool.href}
                    className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-white/90 p-5 transition hover:-translate-y-0.5 hover:border-black/30 hover:shadow-md dark:border-white/10 dark:bg-[#0c1222] dark:hover:border-[#c8f560]/60"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider dark:bg-white/10 dark:text-[#c8f560]">
                          {tool.badge}
                        </span>
                        <ArrowUpRight
                          size={16}
                          className="text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </div>
                      <h4 className="mt-3 font-display text-lg font-bold leading-snug">{tool.title}</h4>
                      <p className="mt-2 text-xs leading-relaxed text-muted">{tool.desc}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[11px] font-bold text-muted dark:border-white/10">
                      <span>{tool.metric}</span>
                      <span className="text-black dark:text-[#c8f560]">Aç →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Google AdSense Leaderboard Slot */}
      <div className="section-wrap my-8">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD || "home-leaderboard"} />
      </div>

      {/* 5. SEO & Google AdSense E-E-A-T Sıkça Sorulan Sorular ve Metodoloji */}
      <section className="section-wrap mt-10" aria-labelledby="home-faq-heading">
        <div className="rounded-2xl border border-black/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.02] md:p-8">
          <div className="max-w-3xl">
            <span className="eyebrow text-muted">ŞEFFAF METODOLOJİ &amp; SIKÇA SORULAN SORULAR</span>
            <h2 id="home-faq-heading" className="mt-2 font-display text-2xl font-bold md:text-3xl">
              Neden Üretir? Doğrulanmış Veri ve Tüketici Karar Rehberi
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Üretir&apos;de yayımlanan hiçbir veri kaynağından bağımsız üretilmez. Her devlet teşviki, kamu personeli
              ilanı, kredi kartı kampanyası, döviz/altın kuru ve taşınmaz analizi birincil resmî bağlantısıyla birlikte
              sunulur.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {HOME_FAQ.map((item) => (
              <article
                key={item.q}
                className="rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <h3 className="text-sm font-extrabold">{item.q}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.a}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-4 text-xs text-muted dark:border-white/10">
            <div className="flex flex-wrap gap-4 font-semibold">
              <Link href="/tesvik-ai" className="underline">TeşvikAI Aile Yardımları</Link>
              <Link href="/memur-ai" className="underline">MemurAI Kamu İlanları</Link>
              <Link href="/hakkimizda" className="underline">Hakkımızda &amp; Yayın İlkeleri</Link>
              <Link href="/gizlilik-politikasi" className="underline">Gizlilik ve Çerez Politikası</Link>
              <Link href="/kullanim-kosullari" className="underline">Kullanım Koşulları &amp; Yasal Uyarı</Link>
              <Link href="/iletisim" className="underline">İletişim &amp; Reklam</Link>
            </div>
            <span>Türkiye üretir, gençler yetişir.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
