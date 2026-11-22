"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Briefcase,
  Calculator,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Landmark,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AdSlot } from "@/components/google-monetization";
import { LiveSectorNews } from "@/components/live-sector-news";
import { JsonLd } from "@/components/json-ld";
import {
  BANK_PROMOTIONS,
  RECRUITMENT_TRACKS,
  type EducationLevel,
  type InstitutionGroup,
} from "@/lib/tesvik-memur-data";

const SALARY_PRESETS = [
  { label: "En Düşük Emekli", amount: 16500 },
  { label: "En Düşük Memur", amount: 44800 },
  { label: "Öğretmen (1/4)", amount: 52900 },
  { label: "Hemşire (Lisans)", amount: 54200 },
  { label: "Polis Memuru", amount: 58900 },
  { label: "Mühendis (1/4)", amount: 67500 },
];

const MEMUR_FAQ = [
  {
    q: "KPSS şartsız memur ve sürekli kamu işçisi alımı nereden takip edilir?",
    a: "KPSS şartı aranmayan sürekli işçi (temizlik, güvenlik, klinik destek, şoför, teknisyen) ve belediye personel alımları İŞKUR e-Şube (esube.iskur.gov.tr) ile İŞKUR Kurum Dışı Kamu İşçi İlanları sayfasından yayımlanır ve noter kurasıyla belirlenir.",
  },
  {
    q: "50, 55 ve 60 KPSS puanıyla hangi kurumlar personel alıyor?",
    a: "Adalet Bakanlığı, Gençlik ve Spor Bakanlığı (Yurt Yönetim / Destek / Koruma ve Güvenlik), Aile ve Sosyal Hizmetler Bakanlığı, devlet üniversiteleri ve belediyeler 50 ila 60 KPSS taban puanıyla Cumhurbaşkanlığı Kariyer Kapısı üzerinden 4/B sözleşmeli personel ve zabıta/itfaiye alımı yapmaktadır.",
  },
  {
    q: "Emekli banka promosyonu değiştirmek için 3 yılın dolması şart mı?",
    a: "Hayır. Emekliler 3 yıllık taahhüt süresi dolmadan da daha yüksek promosyon veren bir bankaya geçiş yapabilir. Eski bankada kalan taahhüt süresine ait tutar (kıstelyevm) iade edilerek yeni bankanın tam promosyonu alınabilir.",
  },
  {
    q: "Memur ve emekli maaş zam oranı nasıl hesaplanır?",
    a: "SSK ve Bağ-Kur emeklileri 6 aylık TÜİK TÜFE enflasyon oranı kadar zam alır. Memur ve memur emeklileri ise Toplu Sözleşme zammına ek olarak oluşan 6 aylık enflasyon farkını kümülatif olarak alır.",
  },
];

const memurFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: MEMUR_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export function MemurAIHub() {
  const [education, setEducation] = useState<EducationLevel>("all");
  const [kpssScore, setKpssScore] = useState<number>(60);
  const [group, setGroup] = useState<InstitutionGroup>("all");

  // Maaş & Enflasyon Farkı Hesaplayıcı State
  const [currentSalary, setCurrentSalary] = useState<number>(44800);
  const [increaseRatePct, setIncreaseRatePct] = useState<number>(15.5);

  const matchedTracks = useMemo(() => {
    return RECRUITMENT_TRACKS.filter((track) => {
      const eduMatch =
        education === "all" || track.educationLevels.includes(education as Exclude<EducationLevel, "all">);
      const groupMatch = group === "all" || track.group === group;
      const scoreMatch = kpssScore === 0 ? track.minKpssScore === 0 : track.minKpssScore <= kpssScore;
      return eduMatch && groupMatch && scoreMatch;
    });
  }, [education, kpssScore, group]);

  const salaryCalc = useMemo(() => {
    const base = Math.max(0, currentSalary);
    const rate = Math.max(0, increaseRatePct) / 100;
    const increaseTL = Math.round(base * rate);
    const newSalaryTL = base + increaseTL;
    const fourteenDayDiffTL = Math.round((increaseTL / 30) * 14);
    return { increaseTL, newSalaryTL, fourteenDayDiffTL };
  }, [currentSalary, increaseRatePct]);

  function shareMemurOnWhatsApp() {
    const scoreText = kpssScore === 0 ? "KPSS Şartsız" : `${kpssScore} KPSS puanıyla`;
    const text = `MemurAI üzerinde ${scoreText} başvurabileceğim ${matchedTracks.length} kamu alım grubunu ve yeni zamlı maaş tablosunu inceledim: https://www.uretir.com/memur-ai`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="page-reveal pb-16">
      <JsonLd data={memurFaqSchema} />

      {/* 1. Hero & KPSS / Eğitim Kamu İlan Eşleştirme Robotu */}
      <section className="section-wrap pt-8 md:pt-12" aria-labelledby="memur-hero-heading">
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/85 via-[#0e1526] to-[#090d16] p-6 text-white shadow-xl md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#c8f560] px-3.5 py-1 text-xs font-extrabold tracking-wider text-[#090d16]">
              <Sparkles size={14} /> 2. GALAKSİ · MEMURAI KAMU PERSONELİ, KPSS &amp; MAAŞ MERKEZİ
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <ShieldCheck size={15} /> Kariyer Kapısı, İŞKUR, Resmî Gazete &amp; SGK Doğrulamalı
            </span>
          </div>

          <h1 id="memur-hero-heading" className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
            Memur Alımı İlanları, KPSS Puan Robotu ve Kamu Maaş / Promosyon Hesaplama
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            Eğitim düzeyinizi ve KPSS puanınızı seçin; <strong>KPSS Şartsız Kamu İşçisi Kura İlanlarını</strong>,{" "}
            <strong>50–60 KPSS İle Sözleşmeli Memur Alan Bakanlıkları</strong>,{" "}
            <strong>Belediye Zabıta/İtfaiye Alımlarını</strong>, <strong>Memur/Emekli Maaş Zammını</strong> ve{" "}
            <strong>En Yüksek Banka Promosyonlarını</strong> tek ekranda karşılaştırın.
          </p>

          {/* KPSS & Eğitim Filtreleme Robotu */}
          <div className="mt-7 grid gap-6 rounded-2xl border border-white/15 bg-white/[0.04] p-5 md:grid-cols-12 md:p-6">
            <div className="space-y-4 md:col-span-8">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  1. Eğitim Durumunuz / Başvuru Türünüz
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "Tüm Mezuniyetler" },
                    { id: "kpss_sartsiz", label: "🎯 KPSS Şartsız (Kura / İŞKUR)" },
                    { id: "lise", label: "Lise / Ortaöğretim (P94)" },
                    { id: "onlisans", label: "Önlisans (P93)" },
                    { id: "lisans", label: "Lisans (P3)" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setEducation(item.id as EducationLevel);
                        if (item.id === "kpss_sartsiz") setKpssScore(0);
                        else if (kpssScore === 0) setKpssScore(60);
                      }}
                      className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                        education === item.id
                          ? "bg-[#c8f560] text-[#090d16]"
                          : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    2. KPSS Puanınız (veya KPSS Şartsız)
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      { score: 0, label: "Şartsız" },
                      { score: 50, label: "50+" },
                      { score: 55, label: "55+" },
                      { score: 60, label: "60+" },
                      { score: 65, label: "65+" },
                      { score: 70, label: "70+" },
                    ].map((preset) => (
                      <button
                        key={preset.score}
                        type="button"
                        onClick={() => setKpssScore(preset.score)}
                        className={`flex-1 rounded-xl px-2.5 py-2 text-xs font-extrabold transition ${
                          kpssScore === preset.score
                            ? "bg-[#c8f560] text-[#090d16]"
                            : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    3. Kurum / Kadro Grubu
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      { id: "all", label: "Tümü" },
                      { id: "iskur_isci", label: "İŞKUR İşçi" },
                      { id: "bakanlik", label: "Bakanlık 4/B" },
                      { id: "belediye", label: "Belediye" },
                      { id: "adliye_guvenlik", label: "Promosyon" },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGroup(g.id as InstitutionGroup)}
                        className={`rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                          group === g.id
                            ? "bg-[#c8f560] text-[#090d16]"
                            : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-[#c8f560]/40 bg-[#c8f560]/10 p-5 md:col-span-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#c8f560]">
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase size={15} /> EŞLEŞEN KAMU ALIM ROTASI
                  </span>
                  <span>{kpssScore === 0 ? "KPSS Şartsız" : `${kpssScore} KPSS`}</span>
                </div>
                <div className="mt-2 font-display text-3xl font-extrabold text-white">
                  {matchedTracks.length} Ana Alım Kanalı
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Seçtiğiniz puan ve mezuniyet düzeyine uygun resmî Kariyer Kapısı, İŞKUR ve belediye başvuru kanalları
                  aşağıda listelenmiştir.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={shareMemurOnWhatsApp}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-black transition hover:bg-amber-300"
                >
                  <Share2 size={14} /> İlanları WhatsApp&apos;ta Paylaş
                </button>
                <Link
                  href="/tesvik-ai"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-white/20"
                >
                  TeşvikAI →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google AdSense Üst Reklam Yuvası */}
      <div className="section-wrap my-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MEMUR_TOP || "memur-top"} />
      </div>

      {/* 2. Kamu Alım İlanları & Başvuru Rehberleri */}
      <section className="section-wrap mt-8" aria-labelledby="memur-tracks-heading">
        <span className="eyebrow text-muted">RESMÎ BAŞVURU KANALLARI &amp; KADROLAR</span>
        <h2 id="memur-tracks-heading" className="mt-1 font-display text-2xl font-bold md:text-3xl">
          Güncel Memur, Sözleşmeli Personel ve KPSS Şartsız Kamu İşçisi Alım Grupları
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {matchedTracks.map((track) => (
            <article
              key={track.id}
              className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm transition hover:border-black/25 dark:border-white/10 dark:bg-[#0c1222]"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300">
                    {track.badge}
                  </span>
                  <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-bold dark:bg-white/10">
                    {track.minKpssScore === 0 ? "KPSS Şartsız / Kura" : `En Az ${track.minKpssScore} KPSS`}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-xl font-bold leading-snug">
                  <Link href={`/memur-ai/${track.slug}`} className="hover:underline">
                    {track.title}
                  </Link>
                </h3>
                <p className="mt-1 text-xs font-semibold text-muted">{track.institution}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted">{track.summary}</p>

                <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.02] p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="text-xs font-extrabold text-amber-700 dark:text-[#c8f560]">
                    Başlıca Alım Yapılan Kadro ve Unvanlar:
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {track.positions.map((pos) => (
                      <span
                        key={pos}
                        className="rounded-lg border border-black/10 bg-white px-2.5 py-1 text-[11px] font-bold dark:border-white/10 dark:bg-black/30"
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>

                <ul className="mt-3 space-y-1.5 text-xs">
                  {track.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4 dark:border-white/10">
                <Link
                  href={`/memur-ai/${track.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold underline"
                >
                  Kadro &amp; Şart Detayları <ArrowRight size={13} />
                </Link>
                <a
                  href={track.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-extrabold text-[#c8f560] transition hover:opacity-90 dark:bg-[#c8f560] dark:text-[#090d16]"
                >
                  Resmî İlan Portalını Aç <ExternalLink size={13} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Memur & Emekli Maaş Zammı + 14 Günlük Fark Hesaplayıcı */}
      <section className="section-wrap mt-12" aria-labelledby="memur-salary-heading">
        <div className="rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm dark:border-white/15 dark:bg-[#0c1222] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#c8f560]/25 px-3 py-1 text-xs font-extrabold text-black dark:bg-[#c8f560]/20 dark:text-[#c8f560]">
              <Calculator size={14} /> CANLI MAAŞ &amp; ENFLASYON FARKI SİMÜLATÖRÜ
            </span>
            <span className="text-xs font-semibold text-muted">6 Aylık TÜFE + Toplu Sözleşme Katsayısı</span>
          </div>

          <h2 id="memur-salary-heading" className="mt-3 font-display text-2xl font-bold md:text-3xl">
            Memur ve Emekli Maaş Zammı + 14 Günlük Fark Hesaplama Robotu
          </h2>
          <p className="mt-1 text-xs text-muted md:text-sm">
            Unvanınızı seçin veya mevcut net maaşınızı girin; zam oranına göre yeni net maaşınızı ve hesabınıza yatacak
            14 günlük maaş farkını anında hesaplayın.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-12">
            <div className="space-y-4 md:col-span-7">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Hızlı Unvan / Maaş Seçimi
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SALARY_PRESETS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setCurrentSalary(item.amount)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                        currentSalary === item.amount
                          ? "bg-black text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                          : "border border-black/15 bg-black/[0.03] dark:border-white/15 dark:bg-white/[0.04]"
                      }`}
                    >
                      {item.label} ({item.amount.toLocaleString("tr-TR")} TL)
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="memur-current-salary" className="block text-xs font-bold uppercase text-muted">
                    Mevcut Net Maaşınız (TL)
                  </label>
                  <input
                    id="memur-current-salary"
                    type="number"
                    min={10000}
                    step={500}
                    value={currentSalary}
                    onChange={(e) => setCurrentSalary(Number(e.target.value) || 0)}
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-4 py-2.5 text-base font-extrabold dark:border-white/20"
                  />
                </div>
                <div>
                  <label htmlFor="memur-rate-input" className="block text-xs font-bold uppercase text-muted">
                    Toplam Zam Oranı (% TÜFE + Sözleşme)
                  </label>
                  <div className="mt-1.5 flex gap-1.5">
                    {[11.5, 15.5, 19.3, 25.0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setIncreaseRatePct(rate)}
                        className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold transition ${
                          increaseRatePct === rate
                            ? "bg-black text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                            : "border border-black/15 dark:border-white/15"
                        }`}
                      >
                        %{rate}
                      </button>
                    ))}
                  </div>
                  <input
                    id="memur-rate-input"
                    type="number"
                    step={0.1}
                    min={1}
                    max={100}
                    value={increaseRatePct}
                    onChange={(e) => setIncreaseRatePct(Number(e.target.value) || 0)}
                    className="mt-2 w-full rounded-xl border border-black/15 bg-transparent px-3 py-2 text-sm font-bold dark:border-white/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5 md:col-span-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-[#c8f560]">
                  HESAPLANAN YENİ ZAMLI NET MAAŞ
                </span>
                <div className="mt-2 font-display text-3xl font-extrabold md:text-4xl">
                  {salaryCalc.newSalaryTL.toLocaleString("tr-TR")} TL
                </div>
                <div className="mt-4 space-y-2 border-t border-black/10 pt-3 text-xs dark:border-white/10">
                  <div className="flex justify-between">
                    <span className="text-muted">Aylık Net Maaş Artışı:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-[#c8f560]">
                      +{salaryCalc.increaseTL.toLocaleString("tr-TR")} TL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">14 Günlük Maaş Farkı Ödemesi:</span>
                    <span className="font-extrabold">+{salaryCalc.fourteenDayDiffTL.toLocaleString("tr-TR")} TL</span>
                  </div>
                </div>
              </div>
              <Link
                href="/memur-ai/memur-ve-emekli-maas-zammi-hesaplama"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-extrabold text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
              >
                Unvan Bazlı Tam Maaş Tablosunu Aç <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="section-wrap mt-10">
        <LiveSectorNews
          defaultSector="memur-ai"
          showTabs={false}
          title="Canlı KPSS, Kamu Personeli Alımı & Emekli Promosyon Haberleri"
          subtitle="Kariyer Kapısı, İŞKUR, ÖSYM ve bankaların maaş/promosyon güncellemelerinden saatlik canlı duyuru akışı."
          limit={6}
          sectionId="memur-live-news"
        />
      </div>

      {/* Google AdSense Orta Reklam Yuvası */}
      <div className="section-wrap my-8">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MEMUR_MID || "memur-mid"} />
      </div>

      {/* 4. Emekli & Memur Banka Promosyonu Karşılaştırma Tablosu */}
      <section className="section-wrap mt-10" aria-labelledby="memur-promo-heading">
        <div className="rounded-3xl border border-black/10 bg-white/95 p-6 dark:border-white/10 dark:bg-[#0c1222] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-[#c8f560]">
              <Landmark size={15} /> BANKA PROMOSYON KARŞILAŞTIRMA MASASI
            </span>
            <Link
              href="/memur-ai/emekli-banka-promosyonu-karsilastirma"
              className="text-xs font-extrabold underline"
            >
              Detaylı Banka Promosyon Rehberi →
            </Link>
          </div>
          <h2 id="memur-promo-heading" className="mt-2 font-display text-2xl font-bold md:text-3xl">
            En Yüksek Emekli ve Maaş Promosyonu Veren Bankalar
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-black/10 text-[11px] uppercase tracking-wider text-muted dark:border-white/10">
                  <th className="py-3 pr-4">Banka</th>
                  <th className="px-3 py-3">10.000 TL Altı</th>
                  <th className="px-3 py-3">10.000 – 14.999 TL</th>
                  <th className="px-3 py-3">15.000 – 19.999 TL</th>
                  <th className="px-3 py-3">20.000 TL ve Üzeri</th>
                  <th className="py-3 pl-3">Ek Avantaj</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10">
                {BANK_PROMOTIONS.map((row) => (
                  <tr key={row.bank} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="py-3.5 pr-4 font-extrabold">{row.bank}</td>
                    <td className="px-3 py-3.5">{row.tier1}</td>
                    <td className="px-3 py-3.5">{row.tier2}</td>
                    <td className="px-3 py-3.5">{row.tier3}</td>
                    <td className="px-3 py-3.5 font-extrabold text-emerald-700 dark:text-[#c8f560]">{row.tier4}</td>
                    <td className="py-3.5 pl-3 text-muted">{row.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Sıkça Sorulan Sorular */}
      <section className="section-wrap mt-10" aria-labelledby="memur-faq-heading">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.02] md:p-8">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-muted">
            <HelpCircle size={15} /> SIKÇA SORULAN SORULAR (MEMUR ALIMI, KPSS &amp; PROMOSYON)
          </div>
          <h2 id="memur-faq-heading" className="mt-2 font-display text-2xl font-bold md:text-3xl">
            Kamu Personeli Alımı ve Maaş/Promosyon Hakkında Merak Edilenler
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {MEMUR_FAQ.map((item) => (
              <article
                key={item.q}
                className="rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <h3 className="text-sm font-extrabold">{item.q}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.a}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-muted">
            <Award size={15} className="shrink-0 text-amber-500" />
            <span>
              MemurAI üzerindeki tüm alım grupları Cumhurbaşkanlığı Kariyer Kapısı, ÖSYM, Resmî Gazete ve İŞKUR resmî
              duyuru sistemlerine doğrudan bağlantı verir; hiçbir zaman başvuru ücreti veya şifre talep etmez.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
