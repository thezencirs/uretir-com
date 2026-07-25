"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CircleAlert, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PuanAICampaignCard } from "@/components/puan-ai-campaign-card";
import { analyticsAttributes } from "@/lib/analytics";
import type { CampaignCategory, PuanAICard, PuanAIBank, PuanAICampaign } from "@/lib/puan-ai";

const categoryFilters: Array<"Tümü" | CampaignCategory> = ["Tümü", "Market", "Akaryakıt", "Restoran", "E-ticaret", "Seyahat", "Teknoloji"];

export function PuanAIBrowser({ campaigns, banks, cards }: { campaigns: PuanAICampaign[]; banks: PuanAIBank[]; cards: PuanAICard[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [bank, setBank] = useState(searchParams.get("bank") ?? "all");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "all");
    setBank(searchParams.get("bank") ?? "all");
  }, [searchParams]);

  const bankMap = useMemo(() => new Map(banks.map((item) => [item.id, item])), [banks]);
  const filteredCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    return campaigns.filter((campaign) => {
      const matchesCategory = category === "all" || campaign.category === category;
      const matchesBank = bank === "all" || campaign.bankId === bank;
      const searchable = [campaign.title, campaign.description, campaign.merchant, campaign.category, bankMap.get(campaign.bankId)?.name].filter(Boolean).join(" ").toLocaleLowerCase("tr-TR");
      return matchesCategory && matchesBank && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [bank, bankMap, campaigns, category, query]);

  function updateFilters(next: { category?: string; bank?: string; query?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.category !== undefined) {
      if (next.category === "all") params.delete("category"); else params.set("category", next.category);
    }
    if (next.bank !== undefined) {
      if (next.bank === "all") params.delete("bank"); else params.set("bank", next.bank);
    }
    if (next.query !== undefined) {
      if (next.query.trim()) params.set("q", next.query.trim()); else params.delete("q");
    }
    router.replace(`${pathname}${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ query });
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setBank("all");
    router.replace(pathname, { scroll: false });
  }

  return <div className="puan-browser">
    <div className="puan-data-notice" role="status"><CircleAlert size={16} aria-hidden="true" /><p><strong>Varsayımsal karar senaryoları.</strong> Kayıtlar gerçek banka, mağaza, kart veya kampanya iddiası içermez ve satın alma kararı için kullanılamaz.</p></div>
    <div className="puan-toolbar">
      <form onSubmit={submitSearch} className="puan-search" role="search" {...analyticsAttributes({ event: "search_submit", surface: "puan_ai_browser", target: "scenarios" })}>
        <Search size={17} aria-hidden="true" />
        <label htmlFor="puan-search-input" className="sr-only">Kampanya ara</label>
        <input id="puan-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Market, banka veya kampanya ara" autoComplete="off" />
        {query && <button type="button" onClick={() => { setQuery(""); updateFilters({ query: "" }); }} aria-label="Aramayı temizle"><X size={15} /></button>}
        <button type="submit" className="puan-search__submit">Ara</button>
      </form>
      <label className="puan-bank-filter"><span>Sağlayıcı modeli</span><select value={bank} onChange={(event) => { setBank(event.target.value); updateFilters({ bank: event.target.value }); }} {...analyticsAttributes({ event: "filter_select", surface: "puan_ai_browser", target: "provider" })}><option value="all">Tüm örnek sağlayıcılar</option>{banks.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </div>

    <div className="puan-filter-bar">
      <div className="puan-filter-list" role="group" aria-label="Kampanya kategorileri">
        {categoryFilters.map((item, index) => { const value = item === "Tümü" ? "all" : item; return <button key={item} type="button" aria-pressed={category === value} onClick={() => { setCategory(value); updateFilters({ category: value }); }} className={category === value ? "is-active" : ""} {...analyticsAttributes({ event: "filter_select", surface: "puan_ai_browser", target: `category-${index + 1}` })}>{item}</button>; })}
      </div>
      <p className="puan-results" aria-live="polite"><SlidersHorizontal size={14} /> {filteredCampaigns.length} örnek senaryo listeleniyor</p>
    </div>

    <div className="puan-content-grid">
      <section aria-labelledby="campaigns-heading">
        <div className="puan-section-heading"><div><p className="eyebrow">Keşif listesi</p><h2 id="campaigns-heading">Sana uygun<br /><em>başlangıç noktaları.</em></h2></div><span className="puan-section-heading__count">{String(filteredCampaigns.length).padStart(2, "0")} / {String(campaigns.length).padStart(2, "0")}</span></div>
        {filteredCampaigns.length > 0 ? <div className="puan-campaign-grid">{filteredCampaigns.map((campaign) => <PuanAICampaignCard key={campaign.slug} campaign={campaign} bank={bankMap.get(campaign.bankId)} />)}</div> : <div className="puan-empty"><p>Eşleşen örnek senaryo yok.</p><span>Filtreleri değiştirerek karar modelini yeniden deneyebilirsin.</span><button type="button" onClick={clearFilters} {...analyticsAttributes({ event: "filter_select", surface: "puan_ai_browser", target: "reset" })}>Filtreleri temizle</button></div>}
      </section>

      <aside className="puan-sidebar" aria-label="Kartlar ve PuanAI bilgileri">
        <section className="puan-panel">
          <div className="puan-panel__heading"><div><p className="eyebrow">Karşılaştırma modeli</p><h2>Örnek<br /><em>kart yapıları.</em></h2></div><span className="puan-panel__live">Gerçek ürün değil</span></div>
          <div className="puan-card-list">{cards.map((card) => { const cardBank = bankMap.get(card.bankId); return <article className={`puan-bank-card puan-bank-card--${card.color}`} key={card.id}><div className="puan-bank-card__top"><span>{cardBank?.name}</span><span>{card.network}</span></div><strong>{card.name}</strong><p>{card.highlight}</p><div><span>{card.reward}</span><span>{card.annualFee === "Canlı veri yok" ? card.annualFee : `${card.annualFee} / yıl`}</span></div></article>; })}</div>
        </section>
        <section className="puan-howto"><p className="eyebrow">PuanAI nasıl çalışır?</p><div><span>01</span><p>Alışveriş yapmak istediğin alanı seç.</p></div><div><span>02</span><p>Kampanya ve kart avantajlarını karşılaştır.</p></div><div><span>03</span><p>Sana uyan fırsatla daha akıllı alışveriş yap.</p></div></section>
      </aside>
    </div>
  </div>;
}
