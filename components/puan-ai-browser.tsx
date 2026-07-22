"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PuanAICampaignCard } from "@/components/puan-ai-campaign-card";
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
    <div className="puan-toolbar">
      <form onSubmit={submitSearch} className="puan-search" role="search">
        <Search size={17} aria-hidden="true" />
        <label htmlFor="puan-search-input" className="sr-only">Kampanya ara</label>
        <input id="puan-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Market, banka veya kampanya ara" autoComplete="off" />
        {query && <button type="button" onClick={() => { setQuery(""); updateFilters({ query: "" }); }} aria-label="Aramayı temizle"><X size={15} /></button>}
        <button type="submit" className="puan-search__submit">Ara</button>
      </form>
      <label className="puan-bank-filter"><span>Banka</span><select value={bank} onChange={(event) => { setBank(event.target.value); updateFilters({ bank: event.target.value }); }}><option value="all">Tüm bankalar</option>{banks.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </div>

    <div className="puan-filter-bar">
      <div className="puan-filter-list" role="group" aria-label="Kampanya kategorileri">
        {categoryFilters.map((item) => { const value = item === "Tümü" ? "all" : item; return <button key={item} type="button" aria-pressed={category === value} onClick={() => { setCategory(value); updateFilters({ category: value }); }} className={category === value ? "is-active" : ""}>{item}</button>; })}
      </div>
      <p className="puan-results" aria-live="polite"><SlidersHorizontal size={14} /> {filteredCampaigns.length} kampanya listeleniyor</p>
    </div>

    <div className="puan-content-grid">
      <section aria-labelledby="campaigns-heading">
        <div className="puan-section-heading"><div><p className="eyebrow">Canlı fırsatlar</p><h2 id="campaigns-heading">Bugün sana<br /><em>kazandıranlar.</em></h2></div><span className="puan-section-heading__count">{String(filteredCampaigns.length).padStart(2, "0")} / {String(campaigns.length).padStart(2, "0")}</span></div>
        {filteredCampaigns.length > 0 ? <div className="puan-campaign-grid">{filteredCampaigns.map((campaign) => <PuanAICampaignCard key={campaign.slug} campaign={campaign} bank={bankMap.get(campaign.bankId)} />)}</div> : <div className="puan-empty"><p>Aradığın fırsatı bulamadık.</p><span>Filtreleri değiştirerek tekrar deneyebilirsin.</span><button type="button" onClick={clearFilters}>Filtreleri temizle</button></div>}
      </section>

      <aside className="puan-sidebar" aria-label="Kartlar ve PuanAI bilgileri">
        <section id="kartlar" className="puan-panel">
          <div className="puan-panel__heading"><div><p className="eyebrow">Kart cüzdanı</p><h2>Öne çıkan<br /><em>kartlar.</em></h2></div><span className="puan-panel__live"><i /> Güncel</span></div>
          <div className="puan-card-list">{cards.map((card) => { const cardBank = bankMap.get(card.bankId); return <article className={`puan-bank-card puan-bank-card--${card.color}`} key={card.id}><div className="puan-bank-card__top"><span>{cardBank?.name}</span><span>{card.network}</span></div><strong>{card.name}</strong><p>{card.highlight}</p><div><span>{card.reward}</span><span>{card.annualFee} / yıl</span></div></article>; })}</div>
        </section>
        <section className="puan-howto"><p className="eyebrow">PuanAI nasıl çalışır?</p><div><span>01</span><p>Alışveriş yapmak istediğin alanı seç.</p></div><div><span>02</span><p>Kampanya ve kart avantajlarını karşılaştır.</p></div><div><span>03</span><p>Sana uyan fırsatla daha akıllı alışveriş yap.</p></div></section>
      </aside>
    </div>
  </div>;
}
