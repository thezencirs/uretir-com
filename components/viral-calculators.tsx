"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2, CreditCard, Home, Car, ShieldCheck, Sparkles, Tag, TrendingDown } from "lucide-react";

export type WalletCardId =
  | "bonus"
  | "world"
  | "maximum"
  | "axess"
  | "bankkart"
  | "paraf"
  | "cardfinans";

interface WalletCardOption {
  id: WalletCardId;
  name: string;
  bank: string;
  app: string;
  rewardName: string;
  rates: Record<string, { minSpend: number; reward: number; maxReward: number; installment: string; title: string; url: string }>;
}

const WALLET_CARDS: WalletCardOption[] = [
  {
    id: "bankkart",
    name: "Ziraat Bankkart",
    bank: "Ziraat Bankası",
    app: "Bankkart Mobil",
    rewardName: "Bankkart Lira",
    rates: {
      market: { minSpend: 1500, reward: 150, maxReward: 1500, installment: "Tek çekim", title: "Market & Gıda 1.500 TL'ye 150 TL (Toplam 1.500 TL) Bankkart Lira", url: "https://www.bankkart.com.tr/kampanyalar" },
      akaryakit: { minSpend: 1500, reward: 120, maxReward: 480, installment: "Tek çekim", title: "Akaryakıt İstasyonlarında 4x1.500 TL'ye 480 TL Bankkart Lira", url: "https://www.bankkart.com.tr/kampanyalar" },
      eticaret: { minSpend: 2000, reward: 200, maxReward: 1000, installment: "Peşin fiyatına 3 taksit", title: "Seçili E-Ticaret Harcamalarına 1.000 TL'ye Varan Bankkart Lira", url: "https://www.bankkart.com.tr/kampanyalar" },
      elektronik: { minSpend: 10000, reward: 500, maxReward: 1500, installment: "Peşin fiyatına 4 taksit", title: "Teknoloji ve Beyaz Eşyada Peşin Fiyatına 4 Taksit + 500 TL Lira", url: "https://www.bankkart.com.tr/kampanyalar" },
    },
  },
  {
    id: "bonus",
    name: "Garanti Bonus",
    bank: "Garanti BBVA",
    app: "BonusFlaş",
    rewardName: "Bonus Puan",
    rates: {
      market: { minSpend: 1250, reward: 125, maxReward: 1000, installment: "Tek çekim", title: "BonusFlaş Market Kampanyası: Her 1.250 TL'ye 125 TL, Toplam 1.000 TL Bonus", url: "https://www.bonus.com.tr/kampanyalar" },
      akaryakit: { minSpend: 1250, reward: 110, maxReward: 440, installment: "Tek çekim", title: "BonusFlaş Akaryakıt: 4. Harcamada 440 TL Bonus", url: "https://www.bonus.com.tr/kampanyalar" },
      eticaret: { minSpend: 2000, reward: 200, maxReward: 800, installment: "Peşin fiyatına 3 taksit", title: "Online Alışverişte 2.000 TL ve Üzerine 800 TL'ye Varan Bonus", url: "https://www.bonus.com.tr/kampanyalar" },
      elektronik: { minSpend: 15000, reward: 750, maxReward: 1500, installment: "Peşin fiyatına 3-6 taksit", title: "Seçili Teknoloji Mağazalarında 750 TL Bonus + Taksit", url: "https://www.bonus.com.tr/kampanyalar" },
    },
  },
  {
    id: "world",
    name: "Yapı Kredi World",
    bank: "Yapı Kredi",
    app: "World Mobil",
    rewardName: "Worldpuan",
    rates: {
      market: { minSpend: 1500, reward: 150, maxReward: 1200, installment: "Tek çekim", title: "World Mobil Market: 1.500 TL'ye 150 TL, Toplam 1.200 TL Worldpuan", url: "https://www.worldcard.com.tr/kampanyalar" },
      akaryakit: { minSpend: 1500, reward: 130, maxReward: 520, installment: "Tek çekim", title: "World Akaryakıt: 4 Farklı Gün 1.500 TL'ye 520 TL Worldpuan", url: "https://www.worldcard.com.tr/kampanyalar" },
      eticaret: { minSpend: 2500, reward: 250, maxReward: 1000, installment: "Peşin fiyatına 3 taksit", title: "World E-Ticaret: Seçili Pazaryerlerinde 1.000 TL Worldpuan", url: "https://www.worldcard.com.tr/kampanyalar" },
      elektronik: { minSpend: 15000, reward: 800, maxReward: 1600, installment: "Peşin fiyatına 6 taksit", title: "Elektronik & Beyaz Eşyada Peşin Fiyatına 6 Taksit + 800 TL Worldpuan", url: "https://www.worldcard.com.tr/kampanyalar" },
    },
  },
  {
    id: "maximum",
    name: "İş Bankası Maximum",
    bank: "Türkiye İş Bankası",
    app: "Maximum Mobil",
    rewardName: "MaxiPuan",
    rates: {
      market: { minSpend: 1500, reward: 150, maxReward: 1200, installment: "Tek çekim", title: "Maximum Mobil Market: Her 1.500 TL'ye 150 TL, Toplam 1.200 TL MaxiPuan", url: "https://www.maximum.com.tr/kampanyalar" },
      akaryakit: { minSpend: 1500, reward: 125, maxReward: 500, installment: "Tek çekim", title: "Petrol Ofisi & Opet Maximum Kampanyası: 500 TL MaxiPuan", url: "https://www.maximum.com.tr/kampanyalar" },
      eticaret: { minSpend: 2000, reward: 200, maxReward: 1000, installment: "Peşin fiyatına 3 taksit", title: "Pazarama ve E-Ticaret Harcamalarına 1.000 TL'ye Varan MaxiPuan", url: "https://www.maximum.com.tr/kampanyalar" },
      elektronik: { minSpend: 12000, reward: 600, maxReward: 1200, installment: "Peşin fiyatına 4 taksit", title: "Elektronik Alışverişlerinde 600 TL MaxiPuan ve 4 Taksit", url: "https://www.maximum.com.tr/kampanyalar" },
    },
  },
  {
    id: "axess",
    name: "Akbank Axess",
    bank: "Akbank",
    app: "Jüzdan",
    rewardName: "Chip-Para",
    rates: {
      market: { minSpend: 1500, reward: 150, maxReward: 1250, installment: "Tek çekim", title: "Jüzdan Market: Her 1.500 TL'ye 150 TL, Toplam 1.250 TL Chip-Para", url: "https://www.axess.com.tr/axess/kampanyalar" },
      akaryakit: { minSpend: 1500, reward: 140, maxReward: 560, installment: "Tek çekim", title: "Jüzdan Akaryakıt: 4x1.500 TL Harcamaya 560 TL Chip-Para", url: "https://www.axess.com.tr/axess/kampanyalar" },
      eticaret: { minSpend: 2500, reward: 250, maxReward: 1000, installment: "Peşin fiyatına 3 taksit", title: "Jüzdan İnternet Alışverişlerine 1.000 TL'ye Varan Chip-Para", url: "https://www.axess.com.tr/axess/kampanyalar" },
      elektronik: { minSpend: 10000, reward: 500, maxReward: 1500, installment: "Peşin fiyatına 6 taksit", title: "Teknoloji Marketlerde Peşin Fiyatına 6 Taksit + 500 TL Chip-Para", url: "https://www.axess.com.tr/axess/kampanyalar" },
    },
  },
  {
    id: "paraf",
    name: "Halkbank Paraf",
    bank: "Halkbank",
    app: "Paraf Mobil",
    rewardName: "ParafPara",
    rates: {
      market: { minSpend: 1250, reward: 125, maxReward: 1000, installment: "Tek çekim", title: "Paraf Mobil Market: 1.250 TL ve Üzerine Toplam 1.000 TL ParafPara", url: "https://www.paraf.com.tr/tr/kampanyalar.html" },
      akaryakit: { minSpend: 1250, reward: 115, maxReward: 460, installment: "Tek çekim", title: "Paraf Akaryakıt İstasyonlarında 460 TL ParafPara", url: "https://www.paraf.com.tr/tr/kampanyalar.html" },
      eticaret: { minSpend: 2000, reward: 200, maxReward: 800, installment: "Peşin fiyatına 3 taksit", title: "E-Ticaret Alışverişlerinde 800 TL ParafPara", url: "https://www.paraf.com.tr/tr/kampanyalar.html" },
      elektronik: { minSpend: 10000, reward: 500, maxReward: 1000, installment: "Peşin fiyatına 4 taksit", title: "Elektronik Harcamalarında 500 TL ParafPara + 4 Taksit", url: "https://www.paraf.com.tr/tr/kampanyalar.html" },
    },
  },
  {
    id: "cardfinans",
    name: "QNB CardFinans",
    bank: "QNB",
    app: "QNB Mobil",
    rewardName: "ParaPuan",
    rates: {
      market: { minSpend: 1500, reward: 150, maxReward: 1050, installment: "Tek çekim", title: "QNB Mobil Market: Her 1.500 TL'ye 150 TL, Toplam 1.050 TL ParaPuan", url: "https://www.qnb.com.tr/kampanyalar" },
      akaryakit: { minSpend: 1500, reward: 125, maxReward: 500, installment: "Tek çekim", title: "CardFinans Akaryakıt: 500 TL ParaPuan Fırsatı", url: "https://www.qnb.com.tr/kampanyalar" },
      eticaret: { minSpend: 2000, reward: 200, maxReward: 800, installment: "Peşin fiyatına 3 taksit", title: "Online Alışverişlerde 800 TL'ye Varan ParaPuan", url: "https://www.qnb.com.tr/kampanyalar" },
      elektronik: { minSpend: 12000, reward: 600, maxReward: 1200, installment: "Peşin fiyatına 4 taksit", title: "Elektronik & Beyaz Eşyada 600 TL ParaPuan", url: "https://www.qnb.com.tr/kampanyalar" },
    },
  },
];

const CATEGORIES = [
  { id: "market", label: "🛒 Market & Gıda", defaultSpend: "2000" },
  { id: "akaryakit", label: "⛽ Akaryakıt & Otogaz", defaultSpend: "1500" },
  { id: "eticaret", label: "📦 E-Ticaret (Trendyol/Amazon/HB)", defaultSpend: "3000" },
  { id: "elektronik", label: "💻 Elektronik & Telefon", defaultSpend: "15000" },
];

export function PuanWalletCalculator({ onAskAi }: { onAskAi?: (prompt: string) => void }) {
  const [selectedCards, setSelectedCards] = useState<WalletCardId[]>(["bankkart", "bonus", "world", "maximum", "axess"]);
  const [sector, setSector] = useState("market");
  const [spend, setSpend] = useState("2000");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("uretir-wallet-cards");
      if (saved) {
        const parsed = JSON.parse(saved) as WalletCardId[];
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedCards(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleCard(id: WalletCardId) {
    setSelectedCards((prev) => {
      const next = prev.includes(id) ? (prev.length > 1 ? prev.filter((item) => item !== id) : prev) : [...prev, id];
      try {
        localStorage.setItem("uretir-wallet-cards", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const numericSpend = Math.max(0, Number(spend) || 0);
  const activeCards = WALLET_CARDS.filter((c) => selectedCards.includes(c.id));

  const ranked = activeCards
    .map((card) => {
      const rule = card.rates[sector] || card.rates.market;
      const qualifies = numericSpend >= rule.minSpend;
      const multiplier = qualifies ? Math.max(1, Math.floor(numericSpend / rule.minSpend)) : 0;
      const instantReward = qualifies ? Math.min(rule.maxReward, rule.reward * multiplier) : 0;
      const netCost = Math.max(0, numericSpend - instantReward);
      return {
        card,
        rule,
        qualifies,
        instantReward,
        netCost,
      };
    })
    .sort((a, b) => b.instantReward - a.instantReward || a.rule.minSpend - b.rule.minSpend);

  const best = ranked[0];

  return (
    <section
      aria-label="Kart Cüzdanım ve Anlık Puan Hesaplayıcı"
      className="section-wrap my-6 rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-white/15 dark:bg-[#0f1523]/90 md:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f560]/25 px-3 py-1 text-xs font-extrabold tracking-wider text-black dark:bg-[#c8f560]/20 dark:text-[#c8f560]">
            <CreditCard size={14} /> KART CÜZDANIM · HAFIZALI HESAPLAYICI
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Cebindeki kartları seç, harcamadan önce net kazancını gör.
          </h2>
          <p className="mt-1 text-sm text-muted">
            Seçtiğin kartlar tarayıcında (<code className="text-xs">Cüzdanım</code>) hatırlanır. Kart numarası asla istenmez.
          </p>
        </div>
        {best && best.instantReward > 0 && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-right">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              En Avantajlı Kartın
            </span>
            <strong className="text-lg font-extrabold text-emerald-800 dark:text-emerald-200">
              {best.card.name} (+{best.instantReward.toLocaleString("tr-TR")} TL)
            </strong>
            <span className="block text-xs text-emerald-700/80 dark:text-emerald-300/80">
              Katılım: {best.card.app} · {best.rule.installment}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5">
        <span className="block text-xs font-bold uppercase tracking-wider text-muted">
          1. Cüzdanındaki Kartları İşaretle ({selectedCards.length} kart seçili)
        </span>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {WALLET_CARDS.map((card) => {
            const active = selectedCards.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => toggleCard(card.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? "border-black bg-black text-[#c8f560] dark:border-[#c8f560] dark:bg-[#c8f560] dark:text-[#090d16]"
                    : "border-black/15 bg-black/[0.03] text-muted hover:border-black/30 dark:border-white/15 dark:bg-white/[0.04]"
                }`}
              >
                <CheckCircle2 size={14} className={active ? "opacity-100" : "opacity-30"} />
                {card.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1.5fr_1fr_auto]">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            2. Alışveriş Kategorisi
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSector(cat.id);
                  setSpend(cat.defaultSpend);
                }}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${
                  sector === cat.id
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-950 dark:text-emerald-200"
                    : "border-black/10 bg-black/[0.02] hover:border-black/25 dark:border-white/10 dark:bg-white/[0.03]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="wallet-spend-input" className="block text-xs font-bold uppercase tracking-wider text-muted">
            3. Harcama Tutarı (TL)
          </label>
          <input
            id="wallet-spend-input"
            type="number"
            min="100"
            step="100"
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/15 bg-transparent px-4 py-2.5 text-base font-extrabold dark:border-white/20"
            placeholder="2000"
          />
        </div>

        <div className="flex items-end">
          {onAskAi ? (
            <button
              type="button"
              onClick={() => {
                const catLabel = CATEGORIES.find((c) => c.id === sector)?.label.replace(/^[^\s]+\s/, "") || sector;
                const cardNames = activeCards.map((c) => c.name).join(", ");
                onAskAi(`${catLabel} kategorisinde ${numericSpend.toLocaleString("tr-TR")} TL harcayacağım. Cüzdanımdaki kartlar: ${cardNames}. Hangi kartla nasıl katılırsam en yüksek puan veya taksiti alırım?`);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-extrabold text-[#c8f560] transition hover:opacity-90 dark:bg-[#c8f560] dark:text-[#090d16]"
            >
              <Sparkles size={15} /> FreeClaude Ajanına Sor
            </button>
          ) : (
            <Link
              href="/puan-ai"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-extrabold text-[#c8f560] transition hover:opacity-90 dark:bg-[#c8f560] dark:text-[#090d16]"
            >
              Tüm Kampanyaları Gör <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.slice(0, 6).map(({ card, rule, qualifies, instantReward, netCost }, idx) => (
          <div
            key={card.id}
            className={`rounded-xl border p-4 transition ${
              idx === 0 && qualifies
                ? "border-emerald-500/40 bg-emerald-500/[0.07]"
                : "border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm font-extrabold">{card.name}</strong>
              <span className="rounded-full bg-black/10 px-2.5 py-0.5 text-[11px] font-bold dark:bg-white/10">
                {card.app}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{rule.title}</p>
            <div className="mt-3 flex items-baseline justify-between border-t border-black/10 pt-2.5 dark:border-white/10">
              <div>
                <span className="block text-[11px] text-muted">Kazanılacak Puan</span>
                <strong className={`text-base font-extrabold ${qualifies ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                  {qualifies ? `+${instantReward.toLocaleString("tr-TR")} TL` : `Alt limit: ${rule.minSpend.toLocaleString("tr-TR")} TL`}
                </strong>
              </div>
              <div className="text-right">
                <span className="block text-[11px] text-muted">Net Maliyet</span>
                <strong className="text-sm font-bold">{netCost.toLocaleString("tr-TR")} TL</strong>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
              <span>{rule.installment}</span>
              <a href={rule.url} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                Resmî Sayfa ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function IndirimDealCalculator() {
  const [oldPrice, setOldPrice] = useState("14999");
  const [currentPrice, setCurrentPrice] = useState("11999");
  const [marketAvg, setMarketAvg] = useState("12800");
  const [cardBonus, setCardBonus] = useState("600");

  const oldVal = Math.max(1, Number(oldPrice) || 0);
  const curVal = Math.max(0, Number(currentPrice) || 0);
  const avgVal = Math.max(1, Number(marketAvg) || curVal);
  const bonusVal = Math.max(0, Number(cardBonus) || 0);

  const claimedDiscountPct = Math.round(((oldVal - curVal) / oldVal) * 100);
  const realDiscountVsAvgPct = Math.round(((avgVal - curVal) / avgVal) * 100);
  const netFinalPrice = Math.max(0, curVal - bonusVal);

  const verdict =
    realDiscountVsAvgPct >= 10
      ? { label: "🔥 GERÇEK DÖNEM DİBİ FIRSAT", color: "text-emerald-600 dark:text-emerald-400", desc: "Ürün piyasa ortalamasının belirgin şekilde altında. Kart puanıyla birleştirerek hemen alınabilir." }
      : realDiscountVsAvgPct >= 2
      ? { label: "✅ MAKUL İNDİRİM", color: "text-blue-600 dark:text-blue-400", desc: "Etiket indirimi biraz şişirilmiş olsa da piyasa ortalamasının altında. Banka puanı ile avantajlı." }
      : { label: "⚠️ ŞİŞİRİLMİŞ ETİKET (SAHTE İNDİRİM RİSKİ)", color: "text-amber-600 dark:text-amber-400", desc: "Önceki fiyat yükseltilip indirim yapılmış görünüyor. Acil değilse 30 günlük dip fiyat alarmı bekleyin." };

  return (
    <section
      aria-label="Sahte İndirim Dedektörü ve Kart Kombosu Hesaplayıcı"
      className="section-wrap my-6 rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm dark:border-white/15 dark:bg-[#0f1523]/90 md:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f560]/25 px-3 py-1 text-xs font-extrabold tracking-wider text-black dark:bg-[#c8f560]/20 dark:text-[#c8f560]">
            <Tag size={14} /> İNDİRİMAI + PUANAI KOMBO HESAPLAYICI
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold">
            Bu İndirim Gerçek mi? (Sahte İndirim &amp; Dip Fiyat Testi)
          </h2>
        </div>
        <Link href="/puan-ai" className="text-xs font-extrabold underline">
          Kart Puanını PuanAI&apos;da Bul →
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-xs font-bold text-muted">Üstü Çizili (Eski) Fiyat (TL)</span>
          <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3.5 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted">Şu Anki Sepet Fiyatı (TL)</span>
          <input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3.5 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted">Diğer Mağazalar Ortalaması (TL)</span>
          <input type="number" value={marketAvg} onChange={(e) => setMarketAvg(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3.5 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted">Banka Kartı Puan Ödülü (TL)</span>
          <input type="number" value={cardBonus} onChange={(e) => setCardBonus(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3.5 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
      </div>

      <div className="mt-5 grid gap-4 rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03] md:grid-cols-4">
        <div>
          <span className="block text-xs text-muted">Mağazanın İddiası</span>
          <strong className="text-lg font-extrabold">%{claimedDiscountPct} İndirim</strong>
        </div>
        <div>
          <span className="block text-xs text-muted">Piyasa Ortalamasına Göre Gerçek Fark</span>
          <strong className="text-lg font-extrabold">
            {realDiscountVsAvgPct >= 0 ? `%${realDiscountVsAvgPct} Daha Ucuz` : `%${Math.abs(realDiscountVsAvgPct)} Daha Pahalı`}
          </strong>
        </div>
        <div>
          <span className="block text-xs text-muted">Kart Puanı Düşülmüş Net Maliyet</span>
          <strong className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {netFinalPrice.toLocaleString("tr-TR")} TL
          </strong>
        </div>
        <div>
          <span className="block text-xs text-muted">İndirimAI Kararı</span>
          <strong className={`block text-xs font-extrabold ${verdict.color}`}>{verdict.label}</strong>
          <p className="mt-1 text-[11px] leading-snug text-muted">{verdict.desc}</p>
        </div>
      </div>
    </section>
  );
}

export function EvRoiCalculator() {
  const [salePrice, setSalePrice] = useState("4500000");
  const [monthlyRent, setMonthlyRent] = useState("22000");
  const [grossM2, setGrossM2] = useState("110");

  const priceVal = Math.max(100000, Number(salePrice) || 0);
  const rentVal = Math.max(1000, Number(monthlyRent) || 1);
  const m2Val = Math.max(10, Number(grossM2) || 1);

  const annualRent = rentVal * 12;
  const amortizationYears = priceVal / annualRent;
  const amortizationMonths = Math.round(amortizationYears * 12);
  const pricePerM2 = Math.round(priceVal / m2Val);
  const grossYieldPct = (annualRent / priceVal) * 100;
  const fairTargetPrice = annualRent * 16.5; // 16.5 years benchmark in TR

  const status =
    amortizationYears <= 14.5
      ? { label: "🟢 YÜKSEK KİRA GETİRİSİ (KELEPİR ÇARPAN)", color: "text-emerald-600 dark:text-emerald-400" }
      : amortizationYears <= 18.5
      ? { label: "🔵 PİYASA DENGESİNDE (MAKUL)", color: "text-blue-600 dark:text-blue-400" }
      : { label: "🟠 YÜKSEK AMORTİSMAN SÜRESİ (PAZARLIK ŞART)", color: "text-amber-600 dark:text-amber-400" };

  return (
    <section
      aria-label="Konut Kira Çarpanı ve Amortisman Hesaplayıcı"
      className="section-wrap my-6 rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm dark:border-white/15 dark:bg-[#0f1523]/90 md:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f560]/25 px-3 py-1 text-xs font-extrabold tracking-wider text-black dark:bg-[#c8f560]/20 dark:text-[#c8f560]">
            <Home size={14} /> EVAI KİRA ÇARPANI &amp; PAZARLIK HESAPLAYICI
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold">
            Bu Ev Kaç Yılda Kendini Amorti Eder? (Alınır mı Testi)
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold text-muted">İlan Satış Fiyatı (TL)</span>
          <input type="number" step="50000" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3.5 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted">Aylık Kira Getirisi / Emsal Kira (TL)</span>
          <input type="number" step="1000" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3.5 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted">Brüt Metrekare (m²)</span>
          <input type="number" step="5" value={grossM2} onChange={(e) => setGrossM2(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3.5 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
      </div>

      <div className="mt-5 grid gap-4 rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="block text-xs text-muted">Kira Amortisman Süresi</span>
          <strong className="text-xl font-extrabold">
            {amortizationYears.toFixed(1)} Yıl ({amortizationMonths} Ay)
          </strong>
          <small className="block text-[11px] text-muted">Yıllık Brüt Getiri: %{grossYieldPct.toFixed(2)}</small>
        </div>
        <div>
          <span className="block text-xs text-muted">Birim m² Maliyeti</span>
          <strong className="text-lg font-extrabold">{pricePerM2.toLocaleString("tr-TR")} TL / m²</strong>
        </div>
        <div>
          <span className="block text-xs text-muted">16.5 Yıl Çarpanına Göre Adil Değer</span>
          <strong className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {Math.round(fairTargetPrice).toLocaleString("tr-TR")} TL
          </strong>
        </div>
        <div>
          <span className="block text-xs text-muted">EvAI Yatırım Notu</span>
          <strong className={`block text-xs font-extrabold ${status.color}`}>{status.label}</strong>
          <small className="mt-1 block text-[11px] text-muted">
            Türkiye konut ortalaması 16–18 yıl bandındadır.
          </small>
        </div>
      </div>
    </section>
  );
}

export function ArabaValuationCalculator() {
  const [zeroPrice, setZeroPrice] = useState("1850000");
  const [ageYears, setAgeYears] = useState("3");
  const [km, setKm] = useState("45000");
  const [paintedParts, setPaintedParts] = useState("1");
  const [replacedParts, setReplacedParts] = useState("0");

  const zeroVal = Math.max(300000, Number(zeroPrice) || 0);
  const ageVal = Math.max(0, Math.min(20, Number(ageYears) || 0));
  const kmVal = Math.max(0, Number(km) || 0);
  const paintVal = Math.max(0, Number(paintedParts) || 0);
  const replaceVal = Math.max(0, Number(replacedParts) || 0);

  // Realistic Turkish 2nd hand depreciation curve
  const ageFactor = Math.pow(0.925, ageVal);
  const expectedKm = Math.max(15000, ageVal * 15000);
  const kmDeltaFactor = Math.max(0.78, Math.min(1.04, 1 - ((kmVal - expectedKm) / 100000) * 0.09));
  const damageFactor = Math.max(0.7, 1 - paintVal * 0.018 - replaceVal * 0.042);

  const estimatedValue = Math.round(zeroVal * ageFactor * kmDeltaFactor * damageFactor);
  const quickSalePrice = Math.round(estimatedValue * 0.955);
  const maxRetailPrice = Math.round(estimatedValue * 1.035);

  return (
    <section
      aria-label="2. El Araç Değerleme ve Pazarlık Payı Hesaplayıcı"
      className="section-wrap my-6 rounded-2xl border border-black/10 bg-white/85 p-5 shadow-sm dark:border-white/15 dark:bg-[#0f1523]/90 md:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f560]/25 px-3 py-1 text-xs font-extrabold tracking-wider text-black dark:bg-[#c8f560]/20 dark:text-[#c8f560]">
            <Car size={14} /> ARABAAI 2. EL DEĞERLEME &amp; EKSPERTİZ FARKI
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold">
            Bu Araba Kaça Alınır? (KM, Yaş ve Boya/Değişen Hesaplayıcı)
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block">
          <span className="text-xs font-bold text-muted">Sıfır Liste / Emsal Fiyatı (TL)</span>
          <input type="number" step="25000" value={zeroPrice} onChange={(e) => setZeroPrice(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted">Araç Yaşı (Yıl)</span>
          <input type="number" min="0" max="25" value={ageYears} onChange={(e) => setAgeYears(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted">Kilometre (KM)</span>
          <input type="number" step="5000" value={km} onChange={(e) => setKm(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted">Boyalı Parça Sayısı</span>
          <input type="number" min="0" max="13" value={paintedParts} onChange={(e) => setPaintedParts(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-muted">Değişen Parça Sayısı</span>
          <input type="number" min="0" max="10" value={replacedParts} onChange={(e) => setReplacedParts(e.target.value)} className="mt-1.5 w-full rounded-xl border border-black/15 bg-transparent px-3 py-2 text-sm font-extrabold dark:border-white/20" />
        </label>
      </div>

      <div className="mt-5 grid gap-4 rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-3">
        <div>
          <span className="block text-xs text-muted">Hızlı Satış (Trink / Galeri) Tabanı</span>
          <strong className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
            {quickSalePrice.toLocaleString("tr-TR")} TL
          </strong>
        </div>
        <div>
          <span className="block text-xs text-muted">Adil 2. El Piyasa Değeri (Hedef)</span>
          <strong className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {estimatedValue.toLocaleString("tr-TR")} TL
          </strong>
        </div>
        <div>
          <span className="block text-xs text-muted">Maksimum Verilebilecek Tavan Fiyat</span>
          <strong className="text-lg font-extrabold">
            {maxRetailPrice.toLocaleString("tr-TR")} TL
          </strong>
        </div>
      </div>
    </section>
  );
}
