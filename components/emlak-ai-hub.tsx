"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  HelpCircle,
  Home,
  Landmark,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AdSlot } from "@/components/google-monetization";
import { JsonLd } from "@/components/json-ld";
import { EMLAK_GUIDES } from "@/lib/insaat-emlak-data";

const EMLAK_FAQ = [
  {
    q: "Konut ve iş yeri kira artış oranı (TÜFE) nasıl hesaplanır?",
    a: "Türk Borçlar Kanunu'nun 344. maddesi uyarınca konut ve çatılı iş yeri kira sözleşmelerinde uygulanabilecek yasal tavan zam oranı, TÜİK tarafından her ayın 3'ünde açıklanan 'On İki Aylık Ortalamalara Göre TÜFE (%)' değişim oranıdır.",
  },
  {
    q: "Ev veya arsa alırken tapu harcı yüzde kaçtır ve kim öder?",
    a: "Tapu harcı, beyan edilen satış bedeli üzerinden binde 20 (%2) alıcı ve binde 20 (%2) satıcı olmak üzere toplam %4 oranında tahsil edilir. Buna ek olarak Tapu ve Kadastro Genel Müdürlüğü (TKGM) döner sermaye hizmet bedeli ödenir.",
  },
  {
    q: "Milli Emlak Hazine arsası satışlarında tapu harcı ve KDV var mı?",
    a: "Hayır. Milli Emlak tarafından ihale yoluyla satılan Hazine taşınmazları KDV'den ve %4 tapu harcından muaftır. Ayrıca satış tarihini izleyen 5 yıl boyunca emlak vergisi ödenmez ve %25 peşinatla 24 ay taksit imkânı sunulur.",
  },
  {
    q: "Ev satışında 5 yıl kuralı (Değer Artış Kazancı Vergisi) nedir?",
    a: "Satın alınan bir gayrimenkul tapu tescil tarihinden itibaren 5 tam yıl geçmeden satılırsa, Yİ-ÜFE endekslemesi sonrasında oluşan net reel kazanç Değer Artış Kazancı Vergisine tabidir. 5 tam yıl dolduktan sonra yapılan satışlarda ise gelir vergisi doğmaz.",
  },
];

const emlakFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: EMLAK_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export function EmlakAIHub() {
  // 1. TÜFE Kira Artış Oranı Hesaplayıcı
  const [currentRent, setCurrentRent] = useState<number>(18000);
  const [tufeRatePct, setTufeRatePct] = useState<number>(48.7);

  // 2. Tapu Harcı & Emlakçı Komisyonu Hesaplayıcı
  const [salePrice, setSalePrice] = useState<number>(3500000);

  // 3. Konut Kredisi Aylık Taksit Hesaplayıcı
  const [loanAmount, setLoanAmount] = useState<number>(1500000);
  const [loanMonths, setLoanMonths] = useState<number>(120);
  const [loanRatePct, setLoanRatePct] = useState<number>(2.79);

  const rentCalc = useMemo(() => {
    const safeRent = Math.max(0, currentRent);
    const increaseTL = Math.round((safeRent * Math.max(0, tufeRatePct)) / 100);
    const newRentTL = safeRent + increaseTL;
    const annualTotalTL = newRentTL * 12;
    return { increaseTL, newRentTL, annualTotalTL };
  }, [currentRent, tufeRatePct]);

  const tapuCalc = useMemo(() => {
    const safePrice = Math.max(0, salePrice);
    const buyerFee = Math.round(safePrice * 0.02);
    const sellerFee = Math.round(safePrice * 0.02);
    const totalTapuFee = buyerFee + sellerFee;
    const donerSermaye = 3850;
    const agentFeeSingleWithVat = Math.round(safePrice * 0.02 * 1.2);
    return { buyerFee, sellerFee, totalTapuFee, donerSermaye, agentFeeSingleWithVat };
  }, [salePrice]);

  const mortgageCalc = useMemo(() => {
    const P = Math.max(50000, loanAmount);
    const n = Math.max(12, loanMonths);
    const r = Math.max(0.1, loanRatePct) / 100;
    const factor = Math.pow(1 + r, n);
    const monthlyInstallment = Math.round((P * r * factor) / (factor - 1));
    const totalRepayment = monthlyInstallment * n;
    const totalInterest = totalRepayment - P;
    return { monthlyInstallment, totalRepayment, totalInterest };
  }, [loanAmount, loanMonths, loanRatePct]);

  function shareEmlakWhatsApp() {
    const text = `EmlakAI ile mevcut ${currentRent.toLocaleString("tr-TR")} TL kiranın %${tufeRatePct} TÜFE artışıyla yeni yasal tavan tutarını (${rentCalc.newRentTL.toLocaleString("tr-TR")} TL) ve tapu harcını hesapladım: https://www.uretir.com/emlak-ai`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="page-reveal pb-16">
      <JsonLd data={emlakFaqSchema} />

      {/* 1. Hero & TÜFE Kira Artış Oranı Robotu */}
      <section className="section-wrap pt-8 md:pt-12" aria-labelledby="emlak-hero-heading">
        <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/90 via-[#101526] to-[#090d16] p-6 text-white shadow-xl md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#c8f560] px-3.5 py-1 text-xs font-extrabold tracking-wider text-[#090d16]">
              <Sparkles size={14} /> 3. GALAKSİ · EMLAKAI KİRA ZAMMI, TAPU HARCI &amp; KONUT KREDİSİ MERKEZİ
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300">
              <ShieldCheck size={15} /> TÜİK 12 Aylık TÜFE, TKGM WebTapu &amp; Milli Emlak Kriterleri
            </span>
          </div>

          <h1 id="emlak-hero-heading" className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
            TÜFE Kira Artış Oranı, Tapu Harcı ve Konut Kredisi Hesaplama Robotu
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            Konut ve iş yeri için <strong>TÜİK 12 Aylık TÜFE Yasal Kira Zammını</strong>, ev/arsa satışında ödenecek{" "}
            <strong>%4 Tapu Harcı ve Döner Sermaye Bedelini</strong>, <strong>120 Ay Konut Kredisi Taksitini</strong> ve{" "}
            <strong>Milli Emlak Hazine Arsası İhalelerini</strong> tek merkezde hesaplayın.
          </p>

          {/* Canlı TÜFE Kira Zammı Paneli */}
          <div className="mt-7 grid gap-6 rounded-2xl border border-white/15 bg-white/[0.04] p-5 md:grid-cols-12 md:p-6">
            <div className="space-y-4 md:col-span-7">
              <div>
                <label htmlFor="emlak-rent-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  1. Mevcut Aylık Kira Bedeliniz (TL)
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[12000, 15000, 18000, 22000, 30000, 45000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCurrentRent(val)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        currentRent === val
                          ? "bg-[#c8f560] text-[#090d16]"
                          : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {val.toLocaleString("tr-TR")} TL
                    </button>
                  ))}
                </div>
                <input
                  id="emlak-rent-input"
                  type="number"
                  min={1000}
                  step={500}
                  value={currentRent}
                  onChange={(e) => setCurrentRent(Number(e.target.value) || 0)}
                  className="mt-2.5 w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-lg font-extrabold text-white focus:border-[#c8f560] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="emlak-tufe-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Kira Artış Oranı (% TÜİK 12 Aylık TÜFE veya Anlaşılan Oran)
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[25.0, 35.0, 42.5, 48.7, 55.2].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTufeRatePct(pct)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        tufeRatePct === pct
                          ? "bg-[#c8f560] text-[#090d16]"
                          : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      %{pct} {pct === 48.7 ? "(TÜFE Referans)" : ""}
                    </button>
                  ))}
                </div>
                <input
                  id="emlak-tufe-input"
                  type="number"
                  min={1}
                  max={200}
                  step={0.1}
                  value={tufeRatePct}
                  onChange={(e) => setTufeRatePct(Number(e.target.value) || 0)}
                  className="mt-2 w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm font-extrabold text-white focus:border-[#c8f560] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-[#c8f560]/40 bg-[#c8f560]/10 p-5 md:col-span-5">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#c8f560]">
                  <span className="inline-flex items-center gap-1.5">
                    <Home size={15} /> YENİ AYLIK KİRA TUTARI
                  </span>
                  <span>+%{tufeRatePct} Artış</span>
                </div>
                <div className="mt-2 font-display text-3xl font-extrabold text-white md:text-4xl">
                  {rentCalc.newRentTL.toLocaleString("tr-TR")} TL
                </div>

                <div className="mt-4 space-y-2 border-t border-white/15 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Mevcut Kira:</span>
                    <span className="font-bold text-white">{currentRent.toLocaleString("tr-TR")} TL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Aylık Net Zam Farkı:</span>
                    <span className="font-bold text-[#c8f560]">+{rentCalc.increaseTL.toLocaleString("tr-TR")} TL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Yeni Dönem 12 Aylık Toplam:</span>
                    <span className="font-bold text-white">{rentCalc.annualTotalTL.toLocaleString("tr-TR")} TL</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={shareEmlakWhatsApp}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-400 px-4 py-2.5 text-xs font-extrabold text-black transition hover:bg-rose-300"
                >
                  <Share2 size={14} /> Kira Hesabını WhatsApp&apos;ta Paylaş
                </button>
                <Link
                  href="/insaat-ai"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-white/20"
                >
                  İnşaatAI →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google AdSense Üst Reklam Yuvası */}
      <div className="section-wrap my-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EMLAK_TOP || "emlak-top"} />
      </div>

      {/* 2. Tapu Harcı (%4) & Konut Kredisi Taksit Simülatörü (Yan Yana 2 Araç) */}
      <section className="section-wrap mt-8" aria-labelledby="emlak-calculators-heading">
        <h2 id="emlak-calculators-heading" className="sr-only">
          Tapu Harcı ve Konut Kredisi Hesaplama Araçları
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tapu Harcı & Komisyon Hesaplayıcı */}
          <div className="rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm dark:border-white/15 dark:bg-[#0c1222]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-extrabold text-rose-700 dark:text-rose-300">
              <FileSpreadsheet size={14} /> WEBTAPU HARÇ &amp; KOMİSYON ROBOTU
            </span>
            <h3 className="mt-3 font-display text-2xl font-bold">
              Tapu Harcı (%4) ve Döner Sermaye Hesaplama
            </h3>

            <div className="mt-4">
              <label htmlFor="tapu-price-input" className="block text-xs font-bold uppercase text-muted">
                Tapu Satış Bedeli (TL)
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[2000000, 3500000, 5000000, 8000000].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSalePrice(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-extrabold ${
                      salePrice === p
                        ? "bg-black text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                        : "border border-black/15 dark:border-white/15"
                    }`}
                  >
                    {(p / 1000000).toLocaleString("tr-TR")} Milyon TL
                  </button>
                ))}
              </div>
              <input
                id="tapu-price-input"
                type="number"
                min={100000}
                step={100000}
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value) || 0)}
                className="mt-2 w-full rounded-xl border border-black/15 bg-transparent px-4 py-2.5 text-base font-extrabold dark:border-white/20"
              />
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-xs dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex justify-between">
                <span className="text-muted">Alıcı Tapu Harcı Payı (%2):</span>
                <span className="font-extrabold">{tapuCalc.buyerFee.toLocaleString("tr-TR")} TL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Satıcı Tapu Harcı Payı (%2):</span>
                <span className="font-extrabold">{tapuCalc.sellerFee.toLocaleString("tr-TR")} TL</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 dark:border-white/10">
                <span className="font-bold">Toplam Tapu Harcı (%4):</span>
                <span className="text-sm font-extrabold text-rose-600 dark:text-[#c8f560]">
                  {tapuCalc.totalTapuFee.toLocaleString("tr-TR")} TL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">TKGM Döner Sermaye Hizmet Bedeli:</span>
                <span className="font-bold">{tapuCalc.donerSermaye.toLocaleString("tr-TR")} TL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tek Taraf Emlakçı Hizmet Bedeli (%2 + KDV):</span>
                <span className="font-bold">{tapuCalc.agentFeeSingleWithVat.toLocaleString("tr-TR")} TL</span>
              </div>
            </div>
          </div>

          {/* Konut Kredisi Aylık Taksit Simülatörü */}
          <div className="rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm dark:border-white/15 dark:bg-[#0c1222]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              <Landmark size={14} /> 120 AY KONUT FİNANSMANI ROBOTU
            </span>
            <h3 className="mt-3 font-display text-2xl font-bold">
              Konut Kredisi Aylık Taksit &amp; Geri Ödeme Hesaplama
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="mortgage-amount-input" className="block text-xs font-bold uppercase text-muted">
                  Kredi Tutarı (TL)
                </label>
                <input
                  id="mortgage-amount-input"
                  type="number"
                  min={100000}
                  step={100000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value) || 1000000)}
                  className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3.5 py-2.5 text-sm font-extrabold dark:border-white/20"
                />
              </div>
              <div>
                <label htmlFor="mortgage-rate-input" className="block text-xs font-bold uppercase text-muted">
                  Aylık Faiz (%) &amp; Vade ({loanMonths} Ay)
                </label>
                <div className="mt-1.5 flex gap-1.5">
                  {[1.49, 1.99, 2.79, 3.05].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setLoanRatePct(r)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold ${
                        loanRatePct === r
                          ? "bg-black text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                          : "border border-black/15 dark:border-white/15"
                      }`}
                    >
                      %{r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              {[60, 84, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLoanMonths(m)}
                  className={`flex-1 rounded-xl py-2 text-xs font-extrabold ${
                    loanMonths === m
                      ? "bg-black text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                      : "border border-black/15 dark:border-white/15"
                  }`}
                >
                  {m} Ay ({m / 12} Yıl) Vade
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold">Aylık Kredi Taksiti:</span>
                <span className="font-display text-xl font-extrabold text-emerald-700 dark:text-[#c8f560]">
                  {mortgageCalc.monthlyInstallment.toLocaleString("tr-TR")} TL / ay
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Toplam Geri Ödeme ({loanMonths} Ay):</span>
                <span className="font-extrabold">{mortgageCalc.totalRepayment.toLocaleString("tr-TR")} TL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Toplam Faiz Maliyeti (KKDF/BSMV Muaf):</span>
                <span className="font-bold">{mortgageCalc.totalInterest.toLocaleString("tr-TR")} TL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tüm Emlak, Tapu, Milli Emlak & Kira Rehberleri */}
      <section className="section-wrap mt-12" aria-labelledby="emlak-guides-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-muted">EMLAK, TAPU &amp; MİLLİ EMLAK REHBERLERİ</span>
            <h2 id="emlak-guides-heading" className="mt-1 font-display text-2xl font-bold md:text-3xl">
              Kira Zammı, Tapu Harcı, Milli Emlak Arsa ve Gayrimenkul Vergisi Kılavuzları
            </h2>
          </div>
          <Link href="/ev-ai" className="inline-flex items-center gap-1.5 text-xs font-extrabold underline">
            EvAI Canlı İlan &amp; Harita Masasına Git <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {EMLAK_GUIDES.map((guide) => (
            <article
              key={guide.id}
              className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm transition hover:border-black/25 dark:border-white/10 dark:bg-[#0c1222]"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[11px] font-extrabold text-rose-700 dark:text-rose-300">
                    {guide.badge}
                  </span>
                  <span className="text-[11px] font-semibold text-muted">{guide.institution}</span>
                </div>

                <h3 className="mt-3 font-display text-xl font-bold leading-snug">
                  <Link href={`/emlak-ai/${guide.slug}`} className="hover:underline">
                    {guide.title}
                  </Link>
                </h3>

                <div className="mt-3 rounded-xl border border-black/10 bg-black/[0.02] p-3 text-xs font-bold dark:border-white/10 dark:bg-white/[0.03]">
                  <Calculator size={14} className="mr-1.5 inline text-rose-500" />
                  {guide.metricSummary}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted">{guide.summary}</p>

                <ul className="mt-3 space-y-1.5 text-xs">
                  {guide.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4 dark:border-white/10">
                <Link
                  href={`/emlak-ai/${guide.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold underline"
                >
                  Hesaplama &amp; Rehber Detayı <ArrowRight size={13} />
                </Link>
                <a
                  href={guide.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-extrabold text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                >
                  Resmî Kurum Ekranı <ExternalLink size={13} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Google AdSense Orta Reklam Yuvası */}
      <div className="section-wrap my-8">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_EMLAK_MID || "emlak-mid"} />
      </div>

      {/* 4. Sıkça Sorulan Sorular */}
      <section className="section-wrap mt-10" aria-labelledby="emlak-faq-heading">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.02] md:p-8">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-muted">
            <HelpCircle size={15} /> SIKÇA SORULAN SORULAR (KİRA ZAMMI, TAPU HARCI &amp; MİLLİ EMLAK)
          </div>
          <h2 id="emlak-faq-heading" className="mt-2 font-display text-2xl font-bold md:text-3xl">
            Emlak Alım-Satım, Tapu ve Kira Mevzuatı Hakkında Merak Edilenler
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {EMLAK_FAQ.map((item) => (
              <article
                key={item.q}
                className="rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <h3 className="text-sm font-extrabold">{item.q}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
