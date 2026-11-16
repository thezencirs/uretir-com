"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  ExternalLink,
  HardHat,
  HelpCircle,
  Layers,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AdSlot } from "@/components/google-monetization";
import { JsonLd } from "@/components/json-ld";
import { INSAAT_GUIDES } from "@/lib/insaat-emlak-data";

type BuildSystem = "betonarme" | "celik" | "prefabrik" | "villa_luks";

const BUILD_SYSTEMS: Record<
  BuildSystem,
  { label: string; costPerM2: number; rebarKgPerM2: number; concreteM3PerM2: number; desc: string }
> = {
  betonarme: {
    label: "Betonarme Karkas (III-B Sınıfı)",
    costPerM2: 22500,
    rebarKgPerM2: 48,
    concreteM3PerM2: 1.02,
    desc: "C30 hazır beton, radye temel ve nervürlü çelik donatılı standart müstakil/apartman yapısı.",
  },
  celik: {
    label: "Hafif Çelik Villa",
    costPerM2: 20500,
    rebarKgPerM2: 22,
    concreteM3PerM2: 0.45,
    desc: "Galvanizli hafif çelik taşıyıcı sistem, yüksek deprem dayanımı ve hızlı montaj.",
  },
  prefabrik: {
    label: "Prefabrik Konut (Anahtar Teslim)",
    costPerM2: 14800,
    rebarKgPerM2: 14,
    concreteM3PerM2: 0.35,
    desc: "Subasman betonu dahil fabrika üretimi modüler panel duvarlı ekonomik müstakil konut.",
  },
  villa_luks: {
    label: "Lüks Müstakil Villa (IV-A Sınıfı)",
    costPerM2: 31000,
    rebarKgPerM2: 56,
    concreteM3PerM2: 1.15,
    desc: "Yerden ısıtma, ısı pompası, alüminyum doğrama ve birinci sınıf cephe/iç mimari malzeme.",
  },
};

const INSAAT_FAQ = [
  {
    q: "100 m² veya 150 m² müstakil ev inşaat maliyeti ne kadar tutar?",
    a: "Yapı sistemine göre 100 m² betonarme bir evin kaba ve ince işçilik dahil anahtar teslim maliyeti ortalama 2.100.000 TL – 2.500.000 TL, prefabrik konut maliyeti ise subasman ve ruhsat dahil 1.400.000 TL – 1.700.000 TL aralığındadır. Toplam bütçenin yaklaşık %42'si kaba inşaat, %48'i ince işçilik ve %10'u proje/ruhsat/SGK gideridir.",
  },
  {
    q: "Yarısı Bizden kentsel dönüşüm kampanyasında ne kadar hibe ve kredi veriliyor?",
    a: "Kentsel Dönüşüm Başkanlığı tarafından her bir konut için 700.000 TL karşılıksız hibe, 700.000 TL 2 yıl geri ödemesiz ve 10 yıl vadeli kredi ile 100.000 TL tek seferlik tahliye/taşınma desteği olmak üzere toplam 1.500.000 TL finansman sağlanmaktadır.",
  },
  {
    q: "Arsa imar durumunda TAKS ve KAKS (Emsal) nasıl hesaplanır?",
    a: "TAKS (Taban Alanı Katsayısı), arsa alanıyla çarpılarak binanın zeminde oturabileceği maksimum alanı verir. KAKS (Emsal) ise arsa alanıyla çarpılarak tüm katların toplam emsal inşaat alanını verir. Balkon, merdiven ve ortak alanlarla brüt alan emsalin yaklaşık %30 fazlasına ulaşır.",
  },
  {
    q: "100 m² betonarme ev için kaç ton demir ve kaç m³ hazır beton gider?",
    a: "Radye temel ve TBDY deprem yönetmeliğine uygun 100 m² betonarme bir yapıda ortalama 4,5 ila 5,2 ton nervürlü inşaat demiri ve yaklaşık 95 ila 110 m³ (10–11 transmikser) C30 sınıfı hazır beton kullanılır.",
  },
];

const insaatFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: INSAAT_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export function InsaatAIHub() {
  // 1. İnşaat Maliyeti & Demir/Beton Hesaplayıcı State
  const [system, setSystem] = useState<BuildSystem>("betonarme");
  const [areaM2, setAreaM2] = useState<number>(120);

  // 2. Arsa TAKS / KAKS (Emsal) & Kat Karşılığı State
  const [landM2, setLandM2] = useState<number>(500);
  const [taks, setTaks] = useState<number>(0.3);
  const [kaks, setKaks] = useState<number>(1.5);
  const [ownerSharePct, setOwnerSharePct] = useState<number>(45);

  const buildCalc = useMemo(() => {
    const cfg = BUILD_SYSTEMS[system];
    const safeArea = Math.max(20, areaM2);
    const totalCost = Math.round(safeArea * cfg.costPerM2);
    const roughCost = Math.round(totalCost * 0.42);
    const finishCost = Math.round(totalCost * 0.48);
    const permitCost = totalCost - roughCost - finishCost;
    const rebarTons = Number(((safeArea * cfg.rebarKgPerM2) / 1000).toFixed(1));
    const concreteM3 = Math.round(safeArea * cfg.concreteM3PerM2);
    const mixerCount = Math.ceil(concreteM3 / 9);
    return { cfg, totalCost, roughCost, finishCost, permitCost, rebarTons, concreteM3, mixerCount };
  }, [system, areaM2]);

  const imarCalc = useMemo(() => {
    const safeLand = Math.max(50, landM2);
    const groundFootprintM2 = Math.round(safeLand * taks);
    const emsalAreaM2 = Math.round(safeLand * kaks);
    const grossBuildAreaM2 = Math.round(emsalAreaM2 * 1.3);
    const estimatedFloors = Math.max(1, Math.round(emsalAreaM2 / Math.max(1, groundFootprintM2)));
    const totalFlats100m2 = Math.max(1, Math.floor(grossBuildAreaM2 / 110));
    const ownerFlats = Number(((totalFlats100m2 * ownerSharePct) / 100).toFixed(1));
    const contractorFlats = Number((totalFlats100m2 - ownerFlats).toFixed(1));
    return {
      groundFootprintM2,
      emsalAreaM2,
      grossBuildAreaM2,
      estimatedFloors,
      totalFlats100m2,
      ownerFlats,
      contractorFlats,
    };
  }, [landM2, taks, kaks, ownerSharePct]);

  function shareInsaatWhatsApp() {
    const text = `İnşaatAI ile ${areaM2} m² ${buildCalc.cfg.label} anahtar teslim inşaat maliyetini (${buildCalc.totalCost.toLocaleString("tr-TR")} TL · ${buildCalc.rebarTons} ton demir · ${buildCalc.concreteM3} m³ beton) hesapladım: https://www.uretir.com/insaat-ai`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="page-reveal pb-16">
      <JsonLd data={insaatFaqSchema} />

      {/* 1. Hero & Müstakil Ev / Bina İnşaat Maliyeti + Demir/Beton Hesaplayıcı */}
      <section className="section-wrap pt-8 md:pt-12" aria-labelledby="insaat-hero-heading">
        <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-950/90 via-[#101626] to-[#090d16] p-6 text-white shadow-xl md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#c8f560] px-3.5 py-1 text-xs font-extrabold tracking-wider text-[#090d16]">
              <Sparkles size={14} /> 3. GALAKSİ · İNŞAATAI MALİYET, İMAR &amp; KENTSEL DÖNÜŞÜM MERKEZİ
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-300">
              <ShieldCheck size={15} /> Çevre ve Şehircilik Bakanlığı, TOKİ &amp; İmar Yönetmeliği Standartları
            </span>
          </div>

          <h1 id="insaat-hero-heading" className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">
            İnşaat Maliyeti, Arsa TAKS/KAKS İmar Hesabı ve Kentsel Dönüşüm Robotu
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            Yapı sisteminizi ve metrekaresini seçin; <strong>Betonarme, Çelik ve Prefabrik Ev Anahtar Teslim Maliyetini</strong>,
            gereken <strong>İnşaat Demiri (Ton) ve Hazır Beton (m³)</strong> miktarını,{" "}
            <strong>Arsa TAKS/KAKS Kat Karşılığı Daire Paylaşımını</strong> ve{" "}
            <strong>Yarısı Bizden 1,5 Milyon TL Hibe/Kredi Desteğini</strong> anında hesaplayın.
          </p>

          {/* Canlı İnşaat Maliyeti & Metraj Paneli */}
          <div className="mt-7 grid gap-6 rounded-2xl border border-white/15 bg-white/[0.04] p-5 md:grid-cols-12 md:p-6">
            <div className="space-y-4 md:col-span-7">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  1. Yapı Sistemi / İnşaat Türü Seçin
                </span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(Object.keys(BUILD_SYSTEMS) as BuildSystem[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSystem(key)}
                      className={`rounded-xl p-3 text-left text-xs font-extrabold transition ${
                        system === key
                          ? "bg-[#c8f560] text-[#090d16]"
                          : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      <div>{BUILD_SYSTEMS[key].label}</div>
                      <div className={`mt-0.5 text-[11px] font-normal ${system === key ? "text-black/80" : "text-slate-300"}`}>
                        Ortalama {BUILD_SYSTEMS[key].costPerM2.toLocaleString("tr-TR")} TL / m²
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="insaat-area-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Toplam İnşaat Alanı (Brüt m²)
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[80, 100, 120, 150, 200, 300].map((m2) => (
                    <button
                      key={m2}
                      type="button"
                      onClick={() => setAreaM2(m2)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition ${
                        areaM2 === m2
                          ? "bg-[#c8f560] text-[#090d16]"
                          : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {m2} m²
                    </button>
                  ))}
                </div>
                <input
                  id="insaat-area-input"
                  type="number"
                  min={30}
                  max={10000}
                  step={10}
                  value={areaM2}
                  onChange={(e) => setAreaM2(Number(e.target.value) || 100)}
                  className="mt-2.5 w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-lg font-extrabold text-white focus:border-[#c8f560] focus:outline-none"
                />
              </div>
            </div>

            {/* Sağ Sonuç Kartı */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#c8f560]/40 bg-[#c8f560]/10 p-5 md:col-span-5">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#c8f560]">
                  <span className="inline-flex items-center gap-1.5">
                    <HardHat size={15} /> ANAHTAR TESLİM TOPLAM MALİYET
                  </span>
                  <span>{areaM2} m²</span>
                </div>
                <div className="mt-2 font-display text-3xl font-extrabold text-white md:text-4xl">
                  {buildCalc.totalCost.toLocaleString("tr-TR")} TL
                </div>

                <div className="mt-4 space-y-2 border-t border-white/15 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Kaba İnşaat (%42 · Temel/Demir/Beton):</span>
                    <span className="font-bold text-white">{buildCalc.roughCost.toLocaleString("tr-TR")} TL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">İnce İşçilik &amp; Tesisat (%48):</span>
                    <span className="font-bold text-white">{buildCalc.finishCost.toLocaleString("tr-TR")} TL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Proje, Ruhsat, Denetim &amp; SGK (%10):</span>
                    <span className="font-bold text-white">{buildCalc.permitCost.toLocaleString("tr-TR")} TL</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-slate-300">Tahmini Demir &amp; C30 Beton Metrajı:</span>
                    <span className="font-extrabold text-[#c8f560]">
                      {buildCalc.rebarTons} Ton Demir · {buildCalc.concreteM3} m³ Beton ({buildCalc.mixerCount} Mikser)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={shareInsaatWhatsApp}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-400 px-4 py-2.5 text-xs font-extrabold text-black transition hover:bg-orange-300"
                >
                  <Share2 size={14} /> Maliyeti WhatsApp&apos;ta Paylaş
                </button>
                <Link
                  href="/emlak-ai"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:bg-white/20"
                >
                  EmlakAI →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google AdSense Üst Reklam Yuvası */}
      <div className="section-wrap my-6">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INSAAT_TOP || "insaat-top"} />
      </div>

      {/* 2. Arsa İmar Durumu (TAKS / KAKS / Emsal) & Kat Karşılığı Daire Paylaşım Robotu */}
      <section className="section-wrap mt-8" aria-labelledby="insaat-imar-heading">
        <div className="rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm dark:border-white/15 dark:bg-[#0c1222] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-extrabold text-orange-700 dark:text-orange-300">
              <Layers size={14} /> ARSA İMAR &amp; KAT KARŞILIĞI HESAPLAYICI
            </span>
            <Link
              href="/insaat-ai/arsa-taks-kaks-emsal-ve-kat-karsiligi-hesaplama"
              className="text-xs font-extrabold underline"
            >
              Detaylı TAKS / KAKS Rehberi →
            </Link>
          </div>

          <h2 id="insaat-imar-heading" className="mt-3 font-display text-2xl font-bold md:text-3xl">
            Arsaya Kaç m² İnşaat Yapılır ve Kaç Daire Çıkar? (TAKS / KAKS / Emsal Robotu)
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-12">
            <div className="grid gap-4 sm:grid-cols-2 md:col-span-7">
              <div>
                <label htmlFor="imar-land-input" className="block text-xs font-bold uppercase text-muted">
                  Arsa Tapu Alanı (m²)
                </label>
                <input
                  id="imar-land-input"
                  type="number"
                  min={100}
                  step={50}
                  value={landM2}
                  onChange={(e) => setLandM2(Number(e.target.value) || 500)}
                  className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-4 py-2.5 text-base font-extrabold dark:border-white/20"
                />
              </div>

              <div>
                <label htmlFor="imar-taks-input" className="block text-xs font-bold uppercase text-muted">
                  TAKS (Taban Oturum Katsayısı)
                </label>
                <div className="mt-1.5 flex gap-1.5">
                  {[0.25, 0.3, 0.35, 0.4].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTaks(val)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold ${
                        taks === val
                          ? "bg-black text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                          : "border border-black/15 dark:border-white/15"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="imar-kaks-input" className="block text-xs font-bold uppercase text-muted">
                  KAKS / Emsal (Toplam İnşaat Katsayısı)
                </label>
                <div className="mt-1.5 flex gap-1.5">
                  {[0.6, 1.0, 1.5, 2.0, 2.5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setKaks(val)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold ${
                        kaks === val
                          ? "bg-black text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                          : "border border-black/15 dark:border-white/15"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="imar-share-input" className="block text-xs font-bold uppercase text-muted">
                  Arsa Sahibi Kat Karşılığı Oranı (%)
                </label>
                <div className="mt-1.5 flex gap-1.5">
                  {[35, 40, 45, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setOwnerSharePct(pct)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold ${
                        ownerSharePct === pct
                          ? "bg-black text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                          : "border border-black/15 dark:border-white/15"
                      }`}
                    >
                      %{pct}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/[0.06] p-5 md:col-span-5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-orange-700 dark:text-[#c8f560]">
                <Building2 size={15} /> İMAR &amp; DAİRE PAYLAŞIM SONUCU
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-black/10 bg-white/80 p-3 dark:border-white/10 dark:bg-black/30">
                  <span className="text-muted">Zemin Taban Oturumu</span>
                  <div className="mt-1 text-lg font-extrabold">{imarCalc.groundFootprintM2} m²</div>
                </div>
                <div className="rounded-xl border border-black/10 bg-white/80 p-3 dark:border-white/10 dark:bg-black/30">
                  <span className="text-muted">Emsale Dahil Net Alan</span>
                  <div className="mt-1 text-lg font-extrabold">{imarCalc.emsalAreaM2} m²</div>
                </div>
                <div className="rounded-xl border border-black/10 bg-white/80 p-3 dark:border-white/10 dark:bg-black/30">
                  <span className="text-muted">Brüt İnşaat Alanı (+%30)</span>
                  <div className="mt-1 text-lg font-extrabold">{imarCalc.grossBuildAreaM2} m²</div>
                </div>
                <div className="rounded-xl border border-black/10 bg-white/80 p-3 dark:border-white/10 dark:bg-black/30">
                  <span className="text-muted">Tahmini Daire (2+1 / 3+1)</span>
                  <div className="mt-1 text-lg font-extrabold">{imarCalc.totalFlats100m2} Daire</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-black px-4 py-3 text-xs font-extrabold text-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]">
                <span>Arsa Sahibi: {imarCalc.ownerFlats} Daire</span>
                <span>Müteahhit: {imarCalc.contractorFlats} Daire</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. İnşaat, TOKİ & Kentsel Dönüşüm Rehberleri Grid */}
      <section className="section-wrap mt-12" aria-labelledby="insaat-guides-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-muted">İNŞAAT, TOKİ &amp; KENTSEL DÖNÜŞÜM KILAVUZLARI</span>
            <h2 id="insaat-guides-heading" className="mt-1 font-display text-2xl font-bold md:text-3xl">
              Maliyet, Hibe, TOKİ Sosyal Konut ve İmar Rehberleri
            </h2>
          </div>
          <Link href="/emlak-ai" className="inline-flex items-center gap-1.5 text-xs font-extrabold underline">
            EmlakAI Kira Zammı &amp; Tapu Harcı Robotuna Geç <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {INSAAT_GUIDES.map((guide) => (
            <article
              key={guide.id}
              className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm transition hover:border-black/25 dark:border-white/10 dark:bg-[#0c1222]"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-orange-500/15 px-3 py-1 text-[11px] font-extrabold text-orange-700 dark:text-orange-300">
                    {guide.badge}
                  </span>
                  <span className="text-[11px] font-semibold text-muted">{guide.institution}</span>
                </div>

                <h3 className="mt-3 font-display text-xl font-bold leading-snug">
                  <Link href={`/insaat-ai/${guide.slug}`} className="hover:underline">
                    {guide.title}
                  </Link>
                </h3>

                <div className="mt-3 rounded-xl border border-black/10 bg-black/[0.02] p-3 text-xs font-bold dark:border-white/10 dark:bg-white/[0.03]">
                  <Calculator size={14} className="mr-1.5 inline text-orange-500" />
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
                  href={`/insaat-ai/${guide.slug}`}
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
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INSAAT_MID || "insaat-mid"} />
      </div>

      {/* 4. Sıkça Sorulan Sorular */}
      <section className="section-wrap mt-10" aria-labelledby="insaat-faq-heading">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.02] md:p-8">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-muted">
            <HelpCircle size={15} /> SIKÇA SORULAN SORULAR (İNŞAAT MALİYETİ, İMAR &amp; KENTSEL DÖNÜŞÜM)
          </div>
          <h2 id="insaat-faq-heading" className="mt-2 font-display text-2xl font-bold md:text-3xl">
            Müstakil Ev Yapımı, TOKİ ve Yarısı Bizden Hakkında Merak Edilenler
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {INSAAT_FAQ.map((item) => (
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
