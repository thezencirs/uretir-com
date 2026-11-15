"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Filter,
  HandCoins,
  HelpCircle,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AdSlot } from "@/components/google-monetization";
import { JsonLd } from "@/components/json-ld";
import {
  ONE_THIRD_THRESHOLD,
  SUPPORT_PROGRAMS,
  TWO_THIRDS_THRESHOLD,
  type SupportCategory,
} from "@/lib/tesvik-memur-data";

const TESVIK_FAQ = [
  {
    q: "Aile destek ödemesi ve sosyal yardımlarda hane içi kişi başı gelir nasıl hesaplanır?",
    a: "Aynı adreste ikamet eden tüm bireylerin aylık toplam net gelirleri toplanır ve hanede yaşayan toplam kişi sayısına bölünür. Çıkan tutar net asgari ücretin 1/3'ünün altındaysa SED, Şartlı Eğitim, Elektrik/Doğalgaz ve Yaşlı/Engelli aylığı; 2/3'ünün altındaysa Evde Bakım Maaşı ve Gençlik Fonu Evlilik Kredisi kriterini sağlar.",
  },
  {
    q: "Yeni doğum yardımı (çocuk parası) başvurusu için gelir şartı var mı?",
    a: "Hayır. Aile ve Sosyal Hizmetler Bakanlığı tarafından verilen Doğum Yardımı'nda gelir kriteri aranmaz. 1. çocuk için tek seferlik 5.000 TL, 2. çocuk için 5 yaşını doldurana kadar aylık 1.500 TL, 3. ve sonraki çocuklar için aylık 5.000 TL e-Devlet başvurusuyla ödenir.",
  },
  {
    q: "150.000 TL faizsiz evlilik kredisine kimler başvurabilir?",
    a: "Aile ve Gençlik Fonu kapsamında 18-29 yaş aralığındaki genç çiftler, resmî nikâh tarihlerine 2 ila 6 ay kala e-Devlet üzerinden başvurabilir. İlk 2 yıl geri ödeme yoktur, sonraki 48 ayda faizsiz olarak taksitlendirilir.",
  },
  {
    q: "e-Devlet sosyal yardım başvurusu kaç günde sonuçlanır?",
    a: "e-Devlet 'Sosyal Yardım Başvuru Hizmeti' ekranından yapılan başvurular, ikametinizin bağlı olduğu Sosyal Yardımlaşma ve Dayanışma Vakfı (SYDV) mütevelli heyeti tarafından ortalama 15 ila 30 gün içinde incelenerek e-Devlet üzerinden bildirilir.",
  },
];

const tesvikFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: TESVIK_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export function TesvikAIHub() {
  const [householdIncome, setHouseholdIncome] = useState<number>(28000);
  const [householdSize, setHouseholdSize] = useState<number>(4);
  const [hasChildren, setHasChildren] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory>("all");

  const perCapitaIncome = useMemo(() => {
    const safeSize = Math.max(1, householdSize);
    return Math.round(Math.max(0, householdIncome) / safeSize);
  }, [householdIncome, householdSize]);

  const evaluatedPrograms = useMemo(() => {
    return SUPPORT_PROGRAMS.filter((prog) => selectedCategory === "all" || prog.category === selectedCategory).map(
      (prog) => {
        let status: "eligible" | "borderline" | "entrepreneur" | "over_limit" = "eligible";
        let statusLabel = "✅ Gelir Şartsız · Başvuruya Açık";

        if (prog.incomeRuleType === "entrepreneur") {
          status = "entrepreneur";
          statusLabel = "🚀 Girişimci / İş Arayan Kriterine Göre Açık";
        } else if (prog.incomeRuleType === "one_third_min_wage") {
          if (perCapitaIncome <= ONE_THIRD_THRESHOLD) {
            status = "eligible";
            statusLabel = "✅ 1/3 Gelir Kriterine Uygun";
          } else if (perCapitaIncome <= ONE_THIRD_THRESHOLD * 1.18) {
            status = "borderline";
            statusLabel = "⚠️ Sınırda · SYDV Kira/Gider Düşümü İle Uygun Olabilir";
          } else {
            status = "over_limit";
            statusLabel = "ℹ️ Kişi Başı Gelir 1/3 Sınırının Üzerinde";
          }
        } else if (prog.incomeRuleType === "two_thirds_min_wage") {
          if (perCapitaIncome <= TWO_THIRDS_THRESHOLD) {
            status = "eligible";
            statusLabel = "✅ 2/3 Gelir Kriterine Uygun";
          } else if (perCapitaIncome <= TWO_THIRDS_THRESHOLD * 1.15) {
            status = "borderline";
            statusLabel = "⚠️ Gelir Sınırına Yakın · Kurum İncelemesi";
          } else {
            status = "over_limit";
            statusLabel = "ℹ️ Kişi Başı Gelir 2/3 Sınırının Üzerinde";
          }
        }

        if (prog.requiresChildren && !hasChildren && status === "eligible") {
          status = "borderline";
          statusLabel = "👶 Çocuk Şartı Bulunuyor";
        }

        return { ...prog, status, statusLabel };
      }
    );
  }, [perCapitaIncome, selectedCategory, hasChildren]);

  const eligibleCount = evaluatedPrograms.filter((p) => p.status === "eligible" || p.status === "entrepreneur").length;

  function shareOnWhatsApp() {
    const text = `TeşvikAI ile hane gelirimize göre (Kişi başı ${perCapitaIncome.toLocaleString("tr-TR")} TL) başvurabileceğimiz ${eligibleCount} devlet ve aile yardımını hesapladım: https://www.uretir.com/tesvik-ai`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="page-reveal pb-16">
      <JsonLd data={tesvikFaqSchema} />

      {/* Hero & Hane Geliri Uygunluk Sihirbazı */}
      <section className="section-wrap pt-8 md:pt-12" aria-labelledby="tesvik-hero-heading">
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/90 via-[#0c1424] to-[#090d16] p-6 text-white shadow-xl md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#c8f560] px-3.5 py-1 text-xs font-extrabold tracking-wider text-[#090d16]">
              <Sparkles size={14} /> 1. GALAKSİ · TEŞVİKAI AİLE YARDIMLARI &amp; DEVLET DESTEKLERİ
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck size={15} /> e-Devlet, Aile Bakanlığı, İŞKUR &amp; KOSGEB Resmî Kriterleri
            </span>
          </div>

          <h1 id="tesvik-hero-heading" className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
            Aile Yardımları, Sosyal Destekler ve Devlet Teşvikleri Hesaplama Robotu
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            Hane gelirinizi ve kişi sayısını girin; <strong>Doğum ve Çocuk Yardımı (5.000 TL/Ay)</strong>,{" "}
            <strong>SED Maaşı</strong>, <strong>150.000 TL Faizsiz Evlilik Kredisi</strong>,{" "}
            <strong>Evde Bakım Aylığı</strong>, <strong>Doğalgaz/Elektrik Fatura Desteği</strong>,{" "}
            <strong>Kira Yardımı</strong> ve <strong>KOSGEB/İŞKUR</strong> programlarından hangilerine
            başvurabileceğinizi saniyeler içinde görün.
          </p>

          {/* İnteraktif Hesaplama Paneli */}
          <div className="mt-7 grid gap-6 rounded-2xl border border-white/15 bg-white/[0.04] p-5 md:grid-cols-12 md:p-6">
            <div className="space-y-4 md:col-span-7">
              <div>
                <label
                  htmlFor="tesvik-income-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  1. Hane Toplam Aylık Geliri (Eve Giren Toplam Net TL)
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[0, 17000, 22104, 28000, 40000, 55000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setHouseholdIncome(preset)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        householdIncome === preset
                          ? "bg-[#c8f560] text-[#090d16]"
                          : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      {preset === 0 ? "Gelir Yok (0 TL)" : `${preset.toLocaleString("tr-TR")} TL`}
                    </button>
                  ))}
                </div>
                <input
                  id="tesvik-income-input"
                  type="number"
                  min={0}
                  step={500}
                  value={householdIncome}
                  onChange={(e) => setHouseholdIncome(Number(e.target.value) || 0)}
                  className="mt-2.5 w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-lg font-extrabold text-white focus:border-[#c8f560] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    2. Hanede Yaşayan Kişi Sayısı
                  </span>
                  <div className="mt-2 flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setHouseholdSize(num)}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-extrabold transition ${
                          householdSize === num
                            ? "bg-[#c8f560] text-[#090d16]"
                            : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        {num === 6 ? "6+" : num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    3. Hanede Çocuk / Öğrenci Var mı?
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasChildren(true)}
                      className={`rounded-xl py-2.5 text-xs font-extrabold transition ${
                        hasChildren
                          ? "bg-[#c8f560] text-[#090d16]"
                          : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      Evet, Çocuk Var
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasChildren(false)}
                      className={`rounded-xl py-2.5 text-xs font-extrabold transition ${
                        !hasChildren
                          ? "bg-[#c8f560] text-[#090d16]"
                          : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      Hayır
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Sonuç Kartı */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#c8f560]/40 bg-[#c8f560]/10 p-5 md:col-span-5">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#c8f560]">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={15} /> HANE İÇİ KİŞİ BAŞI GELİRİNİZ
                  </span>
                  <span>{householdSize} Kişilik Hane</span>
                </div>
                <div className="mt-2 font-display text-3xl font-extrabold text-white md:text-4xl">
                  {perCapitaIncome.toLocaleString("tr-TR")} TL{" "}
                  <span className="text-sm font-semibold text-slate-300">/ kişi başı</span>
                </div>

                <div className="mt-4 space-y-2 border-t border-white/15 pt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Sosyal Yardım Sınırı (1/3):</span>
                    <span className="font-bold text-white">
                      {ONE_THIRD_THRESHOLD.toLocaleString("tr-TR")} TL{" "}
                      {perCapitaIncome <= ONE_THIRD_THRESHOLD ? "✅ Uygun" : "⚠️ Aşıyor"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Evde Bakım / Genç Kredi (2/3):</span>
                    <span className="font-bold text-white">
                      {TWO_THIRDS_THRESHOLD.toLocaleString("tr-TR")} TL{" "}
                      {perCapitaIncome <= TWO_THIRDS_THRESHOLD ? "✅ Uygun" : "⚠️ Aşıyor"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Eşleşen Aktif Destek Grubu:</span>
                    <span className="rounded-full bg-[#c8f560] px-2.5 py-0.5 font-extrabold text-[#090d16]">
                      {eligibleCount} Destek Paketi Uygun
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={shareOnWhatsApp}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-black transition hover:bg-emerald-400"
                >
                  <Share2 size={14} /> Sonucu WhatsApp&apos;ta Paylaş
                </button>
                <Link
                  href="/memur-ai"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-white/20"
                >
                  MemurAI Kamu İlanları →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google AdSense Üst Reklam Yuvası */}
      <div className="section-wrap my-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TESVIK_TOP || "tesvik-top"} />
      </div>

      {/* Kategori Filtreleri & Tüm Aile Yardımları / Teşvik Listesi */}
      <section className="section-wrap mt-8" aria-labelledby="tesvik-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-muted">DOĞRULANMIŞ 2026 DEVLET DESTEKLERİ REHBERİ</span>
            <h2 id="tesvik-list-heading" className="mt-1 font-display text-2xl font-bold md:text-3xl">
              Tüm Aile Yardımları, Sosyal Ödemeler ve Hibe Programları
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={15} className="text-muted" />
            {[
              { id: "all", label: "Tüm Destekler" },
              { id: "aile_cocuk", label: "👶 Aile, Doğum & Çocuk" },
              { id: "evlilik_genc", label: "💍 150 Bin TL Evlilik Kredisi" },
              { id: "bakim_engelli", label: "🩺 Evde Bakım & 65 Yaş / Engelli" },
              { id: "fatura_kira", label: "🏠 Kira, Doğalgaz & Elektrik" },
              { id: "iskur_kosgeb", label: "🚀 İŞKUR İUP & KOSGEB Hibe" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as SupportCategory)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                  selectedCategory === tab.id
                    ? "bg-black text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                    : "border border-black/15 bg-black/[0.03] hover:bg-black/[0.07] dark:border-white/15 dark:bg-white/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {evaluatedPrograms.map((prog) => (
            <article
              key={prog.id}
              className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm transition hover:border-black/25 dark:border-white/10 dark:bg-[#0c1222]"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                    {prog.badge}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                      prog.status === "eligible" || prog.status === "entrepreneur"
                        ? "bg-[#c8f560]/30 text-black dark:bg-[#c8f560]/20 dark:text-[#c8f560]"
                        : prog.status === "borderline"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                          : "bg-black/5 text-muted dark:bg-white/5"
                    }`}
                  >
                    {prog.statusLabel}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-xl font-bold leading-snug">
                  <Link href={`/tesvik-ai/${prog.slug}`} className="hover:underline">
                    {prog.title}
                  </Link>
                </h3>
                <p className="mt-1 text-xs font-semibold text-muted">Yetkili Kurum: {prog.institution}</p>

                <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.02] p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 dark:text-[#c8f560]">
                    <HandCoins size={15} /> Ödeme / Destek Tutarı:
                  </div>
                  <p className="mt-1 text-sm font-bold">{prog.amountSummary}</p>
                  <p className="mt-0.5 text-xs text-muted">Ödeme planı: {prog.paymentFrequency}</p>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted">{prog.summary}</p>

                <ul className="mt-3 space-y-1.5 text-xs">
                  {prog.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4 dark:border-white/10">
                <Link
                  href={`/tesvik-ai/${prog.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold underline"
                >
                  Adım Adım Başvuru Rehberi <ArrowRight size={13} />
                </Link>
                <a
                  href={prog.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-extrabold text-[#c8f560] transition hover:opacity-90 dark:bg-[#c8f560] dark:text-[#090d16]"
                >
                  e-Devlet / Resmî Başvuru <ExternalLink size={13} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Google AdSense Orta Reklam Yuvası */}
      <div className="section-wrap my-8">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TESVIK_MID || "tesvik-mid"} />
      </div>

      {/* Sıkça Sorulan Sorular & Yasal Şeffaflık */}
      <section className="section-wrap mt-10" aria-labelledby="tesvik-faq-heading">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.02] md:p-8">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-muted">
            <HelpCircle size={15} /> SIKÇA SORULAN SORULAR (AİLE YARDIMLARI &amp; DEVLET TEŞVİKLERİ)
          </div>
          <h2 id="tesvik-faq-heading" className="mt-2 font-display text-2xl font-bold md:text-3xl">
            Sosyal Yardım Başvurusu ve Gelir Testi Hakkında Merak Edilenler
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {TESVIK_FAQ.map((item) => (
              <article
                key={item.q}
                className="rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <h3 className="text-sm font-extrabold">{item.q}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.a}</p>
              </article>
            ))}
          </div>

          <p className="mt-5 text-xs text-muted">
            <strong>Resmî Bilgilendirme:</strong> TeşvikAI üzerindeki hesaplamalar yürürlükteki 2022 sayılı Kanun, 2828
            sayılı Sosyal Hizmetler Kanunu, Aile ve Gençlik Fonu Yönetmeliği ve KOSGEB/İŞKUR uygulama esaslarına göre
            ön bilgilendirme sunar. Kesin hak sahipliği kararı ilgili bakanlık ve SYDV mütevelli heyetine aittir.
          </p>
        </div>
      </section>
    </div>
  );
}
