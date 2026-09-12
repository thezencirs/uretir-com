"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ArrowUpRight, Bookmark, Check, Compass, Grid2X2, Map, Search, SlidersHorizontal, X } from "lucide-react";
import { cities, filterProducts, makers, mergeManagedMarketplace, products, type MakerRegistry, type ManagedMarketplaceProduct, type Product } from "@/lib/marketplace";
import { catalogText } from "@/lib/catalog-language";
import styles from "./marketplace.module.css";

const ProductMap = dynamic(() => import("./product-map").then((m) => m.ProductMap), { ssr: false, loading: () => <div className={styles.mapLoading}>Türkiye haritası hazırlanıyor…</div> });
const categories = ["Tümü", "Yapay zekâ", "Oyun", "Mobil uygulama", "İş araçları"];

export function Marketplace({ mapFirst = false, hero = false }: { mapFirst?: boolean; hero?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [city, setCity] = useState("Tümü");
  const [task, setTask] = useState("Tümü");
  const [view, setView] = useState(mapFirst ? "map" : "grid");
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [sort, setSort] = useState("selection");
  const [catalog, setCatalog] = useState<{ products: Product[]; makers: MakerRegistry }>({ products, makers });
  const catalogTasks = useMemo(() => [...new Set(catalog.products.map((product) => product.task))], [catalog.products]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
    if (categories.includes(params.get("kategori") ?? "")) setCategory(params.get("kategori")!);
    if (Object.keys(cities).includes(params.get("sehir") ?? "")) setCity(params.get("sehir")!);
    if (params.get("ihtiyac")) setTask(params.get("ihtiyac")!);
    try { const value: unknown = JSON.parse(localStorage.getItem("uretir-saved-products") ?? "[]"); if (Array.isArray(value)) setSaved(value.filter((v) => typeof v === "string" && products.some((p) => p.slug === v))); } catch { setStorageError(true); }
    void fetch("/api/urunler").then((response) => response.json()).then((body: { data?: ManagedMarketplaceProduct[] }) => { if (body.data?.length) setCatalog(mergeManagedMarketplace(body.data)); }).catch(() => undefined);
  }, []);
  const updateUrl = (key: string, value: string) => {
    const url = new URL(window.location.href);
    if (!value || value === "Tümü") url.searchParams.delete(key); else url.searchParams.set(key, value);
    window.history.replaceState(null, "", url);
  };
  const changeCity = useCallback((value: string) => { setCity(value); updateUrl("sehir", value); }, []);
  const toggleSaved = (slug: string) => {
    const next = saved.includes(slug) ? saved.filter((s) => s !== slug) : [...saved, slug];
    setSaved(next);
    try { localStorage.setItem("uretir-saved-products", JSON.stringify(next)); } catch { setStorageError(true); }
  };
  const mapProducts = useMemo(() => filterProducts(query, category, "Tümü", task, catalog.products, catalog.makers).filter((p) => !savedOnly || saved.includes(p.slug)), [query, category, task, savedOnly, saved, catalog]);
  const results = useMemo(() => {
    const result = mapProducts.filter((p) => city === "Tümü" || catalog.makers[p.maker].city === city);
    return sort === "name" ? [...result].sort((a, b) => a.name.localeCompare(b.name, "tr")) : result;
  }, [mapProducts, city, sort, catalog.makers]);
  const reset = () => { setQuery(""); setCategory("Tümü"); setTask("Tümü"); setCity("Tümü"); setSavedOnly(false); window.history.replaceState(null, "", window.location.pathname); };
  return <div className={styles.market}>
    {hero && <section className={styles.hero}>
      <Image src="/editorial/startup-team.png" alt="" fill priority sizes="100vw" />
      <div className={styles.heroContent}><p className={styles.eyebrow}>Fikir burada. Gelecek burada.</p><h1>TÜRKİYE<br /><em>ÜRETİR.</em></h1><p>Bir ihtiyacın var.<br />Türkiye&apos;de onu üreten biri var.</p><a href="#kesfet" className={styles.primary}>Üretenleri keşfet <ArrowUpRight size={19} /></a></div>
      <div className={styles.heroBottom}><span>Uygulamalar · Oyunlar · Yapay zekâ · Girişimler</span><span>Görsel: Yapay zekâyla oluşturulmuş illüstrasyon</span></div>
    </section>}
    <div className={styles.container} id="kesfet">
      <div className={styles.intro}><div><p className={styles.eyebrow}>Türkiye Üretir / Ürün keşif platformu</p>{hero ? <h2>Ne yapmak <em>istiyorsun?</em></h2> : <h1>{mapFirst ? "Türkiye’nin üretim haritası." : "Bir ihtiyacın mı var?"}</h1>}<p>İhtiyacını bul. Ürünü keşfet. Üretene ulaş.</p></div><Link className={styles.submit} href="/urun-gonder">+ Ürününü ekle</Link></div>
      <form className={styles.search} action="/ara" method="get"><Search size={23} /><label className="sr-only" htmlFor="product-search">Ürün, üretici veya ihtiyaç ara</label><input id="product-search" name="q" value={query} onChange={(e) => { setQuery(e.target.value); updateUrl("q", e.target.value); }} placeholder="Fotoğraf, İngilizce, oyun, yapay zekâ, Codeway…" maxLength={120} />{query && <button type="button" aria-label="Aramayı temizle" onClick={() => { setQuery(""); updateUrl("q", ""); }}><X size={18} /></button>}<span>{catalog.products.length} ürün</span></form>
      <div className={styles.taskRail} aria-label="İhtiyaca göre keşfet">{catalogTasks.map((t) => <button key={t} aria-pressed={task === t} onClick={() => { const next = task === t ? "Tümü" : t; setTask(next); updateUrl("ihtiyac", next); }}>{catalogText(t, false)}<ArrowUpRight size={13} /></button>)}</div>
      <div className={styles.layout}><section className={styles.results} aria-label="Ürün sonuçları">
        <div className={styles.tabs}><div>{categories.map((c) => <button key={c} aria-pressed={category === c && !savedOnly} onClick={() => { setCategory(c); setSavedOnly(false); updateUrl("kategori", c); }}>{c}</button>)}</div><button aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}><Bookmark size={15} /> Kaydettiklerim ({saved.length})</button></div>
        <div className={styles.toolbar}><p aria-live="polite"><strong>{results.length}</strong> ürün {city !== "Tümü" && "· " + city}</p><div><label className="sr-only" htmlFor="city-filter">Şehir</label><select id="city-filter" value={city} onChange={(e) => changeCity(e.target.value)}><option value="Tümü">Bütün şehirler</option>{Object.keys(cities).map((c) => <option key={c}>{c}</option>)}</select><label className="sr-only" htmlFor="sort-products">Sıralama</label><select id="sort-products" value={sort} onChange={(e) => setSort(e.target.value)}><option value="selection">Editoryal sıra</option><option value="name">A → Z</option></select><button aria-label="Kart görünümü" aria-pressed={view === "grid"} onClick={() => setView("grid")}><Grid2X2 size={17} /></button><button aria-label="Harita görünümü" aria-pressed={view === "map"} onClick={() => setView("map")}><Map size={17} /></button></div></div>
        {view === "map" && <><ProductMap products={mapProducts} makers={catalog.makers} city={city} onCity={changeCity} /><div className={styles.cityRail}>{Object.keys(cities).map((c) => <button key={c} aria-pressed={city === c} onClick={() => changeCity(city === c ? "Tümü" : c)}>{c} <span>{mapProducts.filter((p) => catalog.makers[p.maker].city === c).length}</span></button>)}</div></>}
        {(query || category !== "Tümü" || city !== "Tümü" || task !== "Tümü" || savedOnly) && <button className={styles.clear} onClick={reset}><X size={13} /> Filtreleri temizle {task !== "Tümü" && "· " + task}</button>}
        {storageError && <p role="status">Tarayıcı kaydetmeye izin vermiyor. Seçimlerin bu oturumda tutuluyor.</p>}
        {savedOnly && <p className={styles.note}>Koleksiyonun bu tarayıcıda saklanır.</p>}
        <div className={styles.cards}>{results.map((p) => { const m = catalog.makers[p.maker]; return <article key={p.slug} className={styles.card}>
          <div className={styles.cardTop}><Link href={"/urun/" + p.slug} className={styles.monogram} style={{ background: m.color }} aria-label={p.name + " ayrıntıları"}>{p.name.slice(0, 2).toLocaleUpperCase("tr")}</Link><span>{p.category}</span><button onClick={() => toggleSaved(p.slug)} aria-label={p.name + (saved.includes(p.slug) ? " kaydını kaldır" : " kaydet")} aria-pressed={saved.includes(p.slug)}><Bookmark size={18} fill={saved.includes(p.slug) ? "currentColor" : "none"} /></button></div>
          <Link href={"/urun/" + p.slug} className={styles.productTitle}><h3>{p.name}</h3><ArrowUpRight size={17} /></Link><p>{catalogText(p.description, false)}</p><div className={styles.maker}>{m.name}<span>↗ {m.city}</span></div>
          <div className={styles.cardBottom}><button onClick={() => { const next = task === p.task ? "Tümü" : p.task; setTask(next); updateUrl("ihtiyac", next); }}>{catalogText(p.task, false)}</button><button disabled={!compare.includes(p.slug) && compare.length >= 3} aria-pressed={compare.includes(p.slug)} aria-label={p.name + " karşılaştır"} onClick={() => setCompare(compare.includes(p.slug) ? compare.filter((s) => s !== p.slug) : [...compare, p.slug])}>{compare.includes(p.slug) ? <Check size={15} /> : <SlidersHorizontal size={15} />}</button></div>
        </article>; })}</div>
        {!results.length && <div className={styles.empty}><Compass size={35} /><h3>Bu keşif henüz boş.</h3><p>Başka bir ihtiyaç veya şehir deneyebilirsin.</p><button onClick={reset}>Bütün ürünleri göster</button></div>}
        <p className={styles.note}>Kaynakları düzenli kontrol edilen büyüyen dizin · {new Set(Object.values(catalog.makers).map((maker) => maker.name)).size} üretici, {catalog.products.length} ürün, {Object.keys(cities).length} şehir. Sektörün tamamı veya canlı sıralama değildir. Ürün sayfalarında kaynaklar yer alır.</p>
      </section><aside className={styles.sidebar}>
        <div className={styles.sideTitle}><span className={styles.dot} /> EKOSİSTEM NOTU</div>
        <a className={styles.investment} href="https://hubx.co/news/hubx-point72" target="_blank" rel="noreferrer"><span>28 AĞUSTOS 2026 · İZMİR</span><h3>Türkiye&apos;den<br />dünyaya.</h3><strong>75 milyon dolara kadar</strong><p>HubX, Point72 yatırımını duyurdu: 50 milyon dolar başlangıç yatırımı ve 25 milyon dolar ek yatırım seçeneği.</p><span>Şirket duyurusunu oku ↗</span></a>
        <div className={styles.sideCard}><Map size={25} /><h3>Bir şehir seç.<br />Üretenleri tanı.</h3><p>Ürünlerin arkasındaki ekipleri Türkiye haritasında keşfet.</p><Link href="/harita">Haritayı aç <ArrowUpRight size={17} /></Link></div>
        <div className={styles.sideCard}><span className={styles.eyebrow}>ÜRETİR EKOSİSTEMİ</span><Link href="/araclar">Yapay zekâ araçları <ArrowUpRight size={16} /></Link><Link href="/uygulamalar">Telefon uygulamaları <ArrowUpRight size={16} /></Link><Link href="/blog">Yazılar ve makaleler <ArrowUpRight size={16} /></Link><Link href="/ekosistem">Bütün özellikler <ArrowUpRight size={16} /></Link></div>
        <div className={styles.makerList}><h3>Üreten ekipler</h3>{Object.entries(catalog.makers).map(([id, m]) => <button key={id} onClick={() => { reset(); setQuery(m.name); updateUrl("q", m.name); }}><span style={{ background: m.color }}>{m.name.slice(0, 1)}</span><strong>{m.name}<small>{m.city}</small></strong><span>{catalog.products.filter((p) => p.maker === id).length} ↗</span></button>)}</div>
      </aside></div>
      {compare.length > 0 && <section className={styles.comparison} aria-label="Ürün karşılaştırma"><div><h2>Yan yana keşfet <small>{compare.length}/3</small></h2><button aria-label="Karşılaştırmayı temizle" onClick={() => setCompare([])}><X /></button></div><p>En fazla 3 ürün seç. Fiyat ve mağaza bilgileri resmî sayfalarda.</p><div className={styles.compareGrid}>{compare.map((slug) => { const p = catalog.products.find((item) => item.slug === slug); if (!p) return null; return <article key={slug}><h3>{p.name}</h3><p>{catalog.makers[p.maker].name} · {catalog.makers[p.maker].city}</p><p>{p.category} / {p.task}</p><p>{p.description}</p><Link href={"/urun/" + slug}>Ayrıntılar ↗</Link><button aria-label={p.name + " karşılaştırmadan kaldır"} onClick={() => setCompare(compare.filter((s) => s !== slug))}>Kaldır</button></article>; })}</div></section>}
      <section className={styles.footerCta}><p className={styles.eyebrow}>Sıradaki ürün neden seninki olmasın?</p><h2>Üretenleri keşfet.<br /><em>Ürettiklerini göster.</em></h2><Link href="/urun-gonder" className={styles.primary}>Ürününü ekle <ArrowUpRight size={18} /></Link></section>
    </div>
  </div>;
}
