"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Flame, Search, ShieldCheck, Sparkles } from "lucide-react";
import { PuanWalletCalculator } from "@/components/viral-calculators";
import { AdSlot } from "@/components/google-monetization";
import { JsonLd } from "@/components/json-ld";

const TRENDING_SEARCHES = [
  { label: "💳 Market 2.000 TL Hangi Kart?", href: "/puan-ai" },
  { label: "💰 100.000 TL Aylık Mevduat Getirisi", href: "/finans-ai" },
  { label: "🏷️ 30 Günlük Dip Fiyat & Sahte İndirim Testi", href: "/indirim-ai" },
  { label: "🏠 Ev Kira Çarpanı (Amortisman) Hesaplama", href: "/ev-ai" },
  { label: "🚗 2. El Araç Değerleme & Sıfır Liste Fiyatı", href: "/araba-ai" },
  { label: "🗺️ 81 İl Son Dakika Türkiye Haritası", href: "/haber-ai" },
  { label: "⚽ Süper Lig xG & UEFA Ülke Puanı", href: "/spor-ai" },
  { label: "🎮 Steam MENA-USD İndirim Radarı", href: "/oyun-ai" },
];

const CORE_TOOLS = [
  {
    slug: "puan-ai",
    href: "/puan-ai",
    badge: "BANKA & KART PUAN",
    title: "PuanAI · Kredi Kartı Kampanya ve Taksit Asistanı",
    desc: "Axess, Bonus, World, Maximum, Bankkart, Paraf ve CardFinans kampanyalarını harcamadan önce karşılaştırın; cüzdanınızdaki kartla maksimum puanı yakalayın.",
    metric: "8 Banka Resmî Dizin · FreeClaude AI",
  },
  {
    slug: "finans-ai",
    href: "/finans-ai",
    badge: "CANLI PİYASA & FAİZ",
    title: "FinansAI · Döviz, Gram Altın, Mevduat ve BIST 100",
    desc: "TCMB gösterge kurları, 24 ayar gram altın, Borsa İstanbul, 32 günlük mevduat faizi simülatörü ve kişisel yatırım sepeti çevirici.",
    metric: "TCMB & BIST Kaynaklı · Canlı Sepet",
  },
  {
    slug: "indirim-ai",
    href: "/indirim-ai",
    badge: "GERÇEK İNDİRİM RADARI",
    title: "İndirimAI · 30/90/360 Gün Fiyat Geçmişi & Dip Fiyatlar",
    desc: "Şişirilmiş etiket indirimlerini eleyin. Mağaza fiyat geçmişini banka kartı puanıyla birleştirerek cebinizden çıkacak gerçek dip maliyeti hesaplayın.",
    metric: "Sahte İndirim Dedektörü · Kuponlar",
  },
  {
    slug: "ev-ai",
    href: "/ev-ai",
    badge: "EMLAK & KAMU İHALE",
    title: "EvAI · Konut Kira Çarpanı, m² Endeksi ve Kamu İhaleleri",
    desc: "Satılık daire ve arsaları bölgesel m² medyanı ve kira amortisman süresiyle (yıl) test edin; resmî kamu/icra taşınmaz ilanlarını haritada inceleyin.",
    metric: "Kira Amortisman Hesaplayıcı · Haritalı",
  },
  {
    slug: "araba-ai",
    href: "/araba-ai",
    badge: "SIFIR & 2. EL OTOMOBİL",
    title: "ArabaAI · Sıfır Araç Liste Fiyatları ve 2. El Değerleme",
    desc: "BYD, Renault, Toyota, VW, Peugeot, Ford sıfır liste fiyatlarını ve 2. el araçlarda yaş, KM, boya/değişen farkına göre adil piyasa değerini hesaplayın.",
    metric: "Ekspertiz & Pazarlık Hesaplayıcı",
  },
  {
    slug: "haber-ai",
    href: "/haber-ai",
    badge: "81 İL GÜNDEM HARİTASI",
    title: "HaberAI · 81 İl Kaynaklı Türkiye Gündem Haritası",
    desc: "Türkiye'nin 81 ilindeki ekonomi, üretim, bilim ve yerel gelişmeleri birincil haber kaynağı ve zaman damgasıyla interaktif harita üzerinde takip edin.",
    metric: "81 İl Canlı Harita · Kaynak Doğrulamalı",
  },
  {
    slug: "spor-ai",
    href: "/spor-ai",
    badge: "FUTBOL & VERİ ANALİZİ",
    title: "SporAI · Süper Lig xG Analizi ve UEFA Ülke Puanı",
    desc: "Süper Lig gol beklentisi (xG) tablolarını, şampiyonluk olasılıklarını ve Türkiye'nin UEFA ülke puanı sıralamasındaki anlık durumunu inceleyin.",
    metric: "Süper Lig xG · UEFA Katsayı Radarı",
  },
  {
    slug: "oyun-ai",
    href: "/oyun-ai",
    badge: "OYUN & MENA-USD RADARI",
    title: "OyunAI · Steam MENA-USD İndirimleri ve Türk Stüdyoları",
    desc: "Steam MENA-USD bölgesel fiyat düşüşlerini, haftanın ücretsiz oyunlarını, Türk oyun stüdyolarını ve refleks/hafıza oyunlarını keşfedin.",
    metric: "Steam Dip Fiyatlar · Türk Oyun Ekosistemi",
  },
];

const HOME_FAQ = [
  {
    q: "Üretir (uretir.com) nedir ve verileri nereden alır?",
    a: "Üretir; finans, banka kampanyaları, e-ticaret fiyat geçmişi, konut/otomobil değerleme ve 81 il haber gündemini birincil resmî kaynaklarla (TCMB, resmî banka kampanya sayfaları, kamu ilanları ve ajanslar) doğrulayarak sunan 8 otonom yapay zekâ aracının ortak platformudur.",
  },
  {
    q: "PuanAI kredi kartı kampanya hesaplaması için kart numarası ister mi?",
    a: "Hayır. PuanAI hiçbir zaman kart numarası, T.C. kimlik numarası veya bankacılık şifresi istemez. Sadece sahip olduğunuz kart programını (Bonus, World, Maximum, Axess, Bankkart vb.) ve harcama tutarınızı seçerek hangi kampanyadan kaç TL puan kazanacağınızı görürsünüz.",
  },
  {
    q: "İndirimAI sahte indirimleri nasıl tespit eder?",
    a: "İndirimAI, ürünün 30, 90 ve 360 günlük fiyat gözlemlerini ve mağazalar arası medyan değerini karşılaştırır. Üstü çizili fiyat şişirilmişse uyarı verir; ayrıca PuanAI banka puanını düşerek cebinizden çıkacak net dip maliyeti hesaplar.",
  },
  {
    q: "EvAI kira çarpanı (amortisman süresi) nasıl hesaplanır?",
    a: "Konutun satış fiyatının yıllık toplam kira gelirine bölünmesiyle bulunur. Türkiye genelinde 14–16 yıl altı yüksek kira getirili fırsat, 20 yıl üzeri ise yüksek fiyatlı/pazarlık gerektiren konut olarak değerlendirilir.",
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

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return;
    if (q.includes("kart") || q.includes("puan") || q.includes("bonus") || q.includes("world") || q.includes("axess") || q.includes("maximum") || q.includes("bankkart") || q.includes("market") || q.includes("akaryakıt")) {
      router.push("/puan-ai");
    } else if (q.includes("altın") || q.includes("dolar") || q.includes("euro") || q.includes("faiz") || q.includes("mevduat") || q.includes("borsa") || q.includes("bist")) {
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

  return (
    <div id="canli-merkez" className="relative z-10 border-t border-white/10 bg-[var(--background)] pb-16 pt-12">
      <JsonLd data={homeFaqSchema} />

      {/* 1. Birleşik Komut & Trend Arama Merkezi */}
      <section className="section-wrap" aria-labelledby="home-command-heading">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-lg dark:border-white/15 dark:bg-[#0c1222] md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#c8f560]/25 px-3.5 py-1 text-xs font-extrabold tracking-wider text-black dark:bg-[#c8f560]/20 dark:text-[#c8f560]">
              <Sparkles size={14} /> ÜRETİR CANLI KARAR &amp; HESAPLAMA MERKEZİ
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <ShieldCheck size={15} className="text-emerald-500" /> Resmî Kaynak &amp; Gerçek Zamanlı Veri Doğrulaması
            </span>
          </div>

          <h1 id="home-command-heading" className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
            Harcamadan, yatırım yapmadan ve satın almadan önce doğrula.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
            Türkiye&apos;nin en çok aranan kredi kartı puanlarını, mevduat/altın getirilerini, 360 günlük gerçek e-ticaret dip fiyatlarını,
            konut kira çarpanlarını, sıfır/2. el otomobil değerlemelerini ve 81 il gündemini tek merkezde hesaplayın.
          </p>

          <form action="/ara" method="get" onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row" role="search">
            <div className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ne hesaplamak istiyorsun? (Örn: Market 2000 TL hangi kart, 100 bin TL faiz, kira çarpanı, sıfır araç...)"
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

      {/* 2. Doğrudan Ana Sayfada Çalışan İnteraktif Kart Cüzdanım & Puan Hesaplayıcı */}
      <PuanWalletCalculator />

      {/* 3. 8 Otonom Yapay Zekâ Aracı Görünür Rehber Grid (SEO & AdSense İçin Tam Erişilebilir) */}
      <section className="section-wrap mt-12" aria-labelledby="home-tools-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-muted">8 OTONOM YAPAY ZEKÂ ARACI</span>
            <h2 id="home-tools-heading" className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Üretir Araçları &amp; Canlı Veri Masaları
            </h2>
          </div>
          <Link href="/kesfet" className="inline-flex items-center gap-1.5 text-xs font-extrabold underline">
            Tüm Ekosistemi ve Rehberleri Gör <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.href}
              className="group flex flex-col justify-between rounded-2xl border border-black/10 bg-white/80 p-5 transition hover:-translate-y-0.5 hover:border-black/30 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#c8f560]/60"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[#c8f560]/25 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-black dark:bg-[#c8f560]/15 dark:text-[#c8f560]">
                    {tool.badge}
                  </span>
                  <ArrowUpRight size={16} className="text-muted transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold leading-snug">{tool.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{tool.desc}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[11px] font-bold text-muted dark:border-white/10">
                <span>{tool.metric}</span>
                <span className="text-black dark:text-[#c8f560]">Aç →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Google AdSense Leaderboard Slot (Aktif olduğunda otomatik render edilir) */}
      <div className="section-wrap my-8">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD || "home-leaderboard"} />
      </div>

      {/* 4. SEO & Google AdSense E-E-A-T Sıkça Sorulan Sorular ve Metodoloji */}
      <section className="section-wrap mt-10" aria-labelledby="home-faq-heading">
        <div className="rounded-2xl border border-black/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.02] md:p-8">
          <div className="max-w-3xl">
            <span className="eyebrow text-muted">ŞEFFAF METODOLOJİ &amp; SIKÇA SORULAN SORULAR</span>
            <h2 id="home-faq-heading" className="mt-2 font-display text-2xl font-bold md:text-3xl">
              Neden Üretir? Doğrulanmış Veri ve Tüketici Karar Rehberi
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Üretir&apos;de yayımlanan hiçbir veri kaynağından bağımsız üretilmez. Her kredi kartı kampanyası, döviz/altın kuru,
              indirim geçmişi ve taşınmaz analizi birincil resmî bağlantısıyla birlikte sunulur.
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
