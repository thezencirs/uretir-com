"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, ListFilter, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { getChannelTool, type ChannelToolSlug } from "@/lib/channel-tools";
import { type ExplorerData, formatToolDate, formatToolPrice } from "@/lib/tool-explorer";

type ExplorerSlug = Extract<ChannelToolSlug, "araba-ai" | "ev-ai" | "indirim-ai">;
const settings = {
  "araba-ai": { title: "Bir sonraki aracını,\nbilgiyi karşılaştırarak seç.", intro: "Markaların resmî fiyatlarını bütçene göre incele. Model fiyatları ve tarihli kampanyalar ayrı görünümlerde.", group: "Marka", search: "Marka veya model ara", categories: ["Fiyatlar", "Kampanyalar"], empty: "Henüz gösterilebilecek araç fiyatı veya kampanya yok.", note: "Bunlar markaların resmî liste ve kampanya fiyatlarıdır. Bayi stoku, teslimat ve son satış bedeli kaynakta ayrıca doğrulanmalıdır." },
  "indirim-ai": { title: "Fiyatın bugününü,\ngeçmişiyle birlikte gör.", intro: "30, 90 ve 360 günlük gözlemler. Yeterli geçmiş oluşmadan bir ürüne dönem dibi etiketi verilmez.", group: "Mağaza", search: "Ürün veya mağaza ara", categories: ["30 gün", "90 gün", "360 gün", "Takip dönemi"], empty: "Bu dönemde yeterli fiyat geçmişi olan bir dip fiyat kaydı yok.", note: "Takip dönemi kayıtları henüz 30 günlük dip fiyat değildir. Fiyatlar son kaynak gözlemini gösterir; stok ve son ödeme tutarını mağazada kontrol edin." },
  "ev-ai": { title: "Evi seçmeden önce,\nverileri yan yana koy.", intro: "Şehir, bütçe ve metrekare bilgisiyle araştır. Konut ilanları ile kamu ve ihale kayıtlarını ayrı değerlendir.", group: "Şehir", search: "İlçe, oda veya ilan ara", categories: ["Konut ilanları", "Kamu / ihale"], empty: "Bu grupta güncel ve kaynaklı bir taşınmaz kaydı bulunmuyor.", note: "Kamu ve ihale kayıtlarındaki muhammen veya başlangıç bedeli piyasa değeri değildir. İlan durumu, koşullar ve son bedel özgün kaynakta kontrol edilmelidir." },
} as const;

export function ToolExplorer({slug, data}: {slug: ExplorerSlug; data: ExplorerData}) {
  const config = settings[slug], tool = getChannelTool(slug), router = useRouter();
  const [busy, startTransition] = useTransition();
  const [category, setCategory] = useState<string>(config.categories[0]);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [budget, setBudget] = useState("");
  const [sort, setSort] = useState("recent");
  const [selected, setSelected] = useState<string[]>([]);
  const [limit, setLimit] = useState(24);
  const categoryItems = data.items.filter(item => item.category === category);
  const groups = [...new Set(categoryItems.map(item=>item.group))].sort((a,b)=>a.localeCompare(b,"tr"));
  const visible = useMemo(()=>{
    const query = search.trim().toLocaleLowerCase("tr-TR");
    const amount = budget === "" ? null : Number(budget);
    return data.items.filter(item=>item.category===category && (!group || item.group===group) && (!query || `${item.title} ${item.group} ${item.description??""} ${item.facts.map(f=>f.value).join(" ")}`.toLocaleLowerCase("tr-TR").includes(query)) && (amount===null || (Number.isFinite(amount) && item.price!==null && item.price<=amount && (item.currency??"TRY")==="TRY"))).sort((a,b)=>{
      if(sort==="price-asc" || sort==="price-desc") {
        if(a.price===null) return b.price===null?0:1;
        if(b.price===null) return -1;
        const currency=(a.currency??"TRY").localeCompare(b.currency??"TRY");
        return currency || (sort==="price-asc"?a.price-b.price:b.price-a.price);
      }
      return Date.parse(b.checkedAt)-Date.parse(a.checkedAt);
    });
  },[data.items,category,group,search,budget,sort]);
  const compared = data.items.filter(item=>selected.includes(item.id));
  const rankedDeals = slug==="indirim-ai"
    ? [...new Map(data.items.filter(item=>item.rank).map(item=>[item.rank!,item])).values()].sort((a,b)=>(a.rank??9)-(b.rank??9))
    : [];
  const comparisonLabels = [...new Set(compared.flatMap(item=>item.facts.map(f=>f.label)))];
  function reset() { setSearch(""); setGroup(""); setBudget(""); setSort("recent"); setLimit(24); }
  return <div className="tool-explorer section-wrap" style={{"--tool-color":tool.color} as React.CSSProperties}>
    <header className="tool-explorer-hero"><div><p className="rule-label">{tool.name} / {tool.category}</p><h1>{config.title}</h1><p>{config.intro}</p></div><aside><span className="tool-data-status"><span aria-hidden="true"/>{!data.available?"Veriye ulaşılamadı":data.items.length?"Kaynak gözlemleri":"Yeni kayıt bekleniyor"}</span><p>{data.checkedAt?`Son analiz · ${formatToolDate(data.checkedAt)} TSİ`:"Bağlantı yeniden denenebilir."}</p><button onClick={()=>startTransition(()=>router.refresh())} disabled={busy}><RefreshCw size={15} className={busy?"animate-spin":""} aria-hidden="true"/>{busy?"Yenileniyor…":"Verileri yenile"}</button></aside></header>
    <div className="tool-explorer-stats">{data.stats.map(stat=><div key={stat.label}><strong>{data.available?stat.value.toLocaleString("tr-TR"):"—"}</strong><span>{stat.label}</span></div>)}</div>
    {rankedDeals.length>0&&<section className="discount-podium" aria-labelledby="discount-podium-title"><div className="discount-podium-heading"><div><p className="rule-label">İNDİRİMAI / İLK 3</p><h2 id="discount-podium-title">Bugünün fırsat sıralaması.</h2></div><p>Yeterli geçmişi olan gerçek dönem dipleri önce gelir. Geçmişi yeni oluşan ürünler açıkça “takip dönemi” olarak etiketlenir.</p></div><div className="discount-podium-grid">{rankedDeals.map(item=><article key={item.rank} data-rank={item.rank}><div className="discount-rank">{item.rank===1?"🥇":item.rank===2?"🥈":"🥉"}<span>{item.rank}. SIRA</span></div>{item.imageUrl?<div className="discount-podium-image"><img src={item.imageUrl} alt={item.title}/></div>:<div className="discount-podium-image discount-podium-placeholder">Görsel kaynakta yok</div>}<div className="discount-podium-copy"><span>{item.group}</span><h3>{item.title}</h3><strong>{formatToolPrice(item.price,item.currency)}</strong><small>{item.rankLabel}</small><a href={item.url} target="_blank" rel="noopener noreferrer">Kaynağı aç <ArrowUpRight size={14}/></a></div></article>)}</div></section>}
    <section className="tool-explorer-results" aria-labelledby="tool-results-title" aria-busy={busy}>
      <div className="tool-results-heading"><div><p className="rule-label">ARAŞTIRMA MASASI</p><h2 id="tool-results-title">Seç, filtrele, karşılaştır.</h2></div><SlidersHorizontal size={22} aria-hidden="true"/></div>
      <div className="tool-category-tabs" aria-label="Görünüm seç">{config.categories.map(value=><button key={value} aria-pressed={category===value} onClick={()=>{setCategory(value);reset();setSelected([]);}}>{value}<span>{data.items.filter(item=>item.category===value).length}</span></button>)}</div>
      <div className="tool-filter-bar">
        <label className="tool-search"><span>{config.search}</span><div><Search size={16} aria-hidden="true"/><input type="search" value={search} onChange={e=>{setSearch(e.target.value);setLimit(24);}} placeholder={config.search}/></div></label>
        <label><span>{config.group}</span><select value={group} onChange={e=>{setGroup(e.target.value);setLimit(24);}}><option value="">Tümü</option>{groups.map(value=><option key={value}>{value}</option>)}</select></label>
        <label><span>En yüksek tutar (TL)</span><input type="number" min="0" step="any" inputMode="decimal" value={budget} placeholder="Sınır yok" onChange={e=>{setBudget(e.target.value);setLimit(24);}}/></label>
        <label><span>Sıralama</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Son gözlem</option><option value="price-asc">Fiyat: düşükten yükseğe</option><option value="price-desc">Fiyat: yüksekten düşüğe</option></select></label>
      </div>
      <div className="tool-results-summary"><p role="status">{visible.length} sonuç · {compared.length}/3 karşılaştırma</p><button onClick={reset}>Filtreleri temizle</button></div>
      {!data.available && <div className="tool-state-panel" role="alert"><RefreshCw size={26} aria-hidden="true"/><h3>Kaynak verilerine şu anda ulaşılamıyor.</h3><p>Yenile düğmesiyle tekrar deneyebilirsin. Bu sırada üstteki bağlantıdan {tool.name} WhatsApp kanalına ulaşabilirsin.</p></div>}
      {data.available && visible.length===0 && <div className="tool-state-panel"><ListFilter size={30} aria-hidden="true"/><h3>{categoryItems.length?"Bu filtrelerle eşleşen kayıt yok.":config.empty}</h3><p>{categoryItems.length?"Aramanı genişlet veya bütçe ve kaynak filtrelerini temizle.":"Kaynaklardan uygun kayıt geldiğinde burada görünecek. Diğer görünümleri inceleyebilir, kanal paylaşımlarını WhatsApp’tan takip edebilirsin."}</p>{categoryItems.length>0&&<button onClick={reset}>Tüm sonuçları göster</button>}</div>}
      {compared.length>0 && <section className="tool-comparison" aria-labelledby="tool-compare-title"><div><h3 id="tool-compare-title">Yan yana karşılaştır</h3><button onClick={()=>setSelected([])} aria-label="Karşılaştırmayı temizle"><X size={18}/></button></div><p>En fazla üç kayıt seçebilirsin. Tutarlar kendi para birimi ve bedel türüyle gösterilir.</p><div className="tool-comparison-scroll"><table><caption className="sr-only">Seçilen kayıtların fiyat, kaynak ve özellik karşılaştırması</caption><thead><tr><th scope="col">Özellik</th>{compared.map(item=><th scope="col" key={item.id}>{item.title}<button onClick={()=>setSelected(selected.filter(id=>id!==item.id))} aria-label={`${item.title} karşılaştırmadan çıkar`}><X size={14}/></button></th>)}</tr></thead><tbody><tr><th scope="row">Tutar / bedel türü</th>{compared.map(item=><td key={item.id}><strong>{formatToolPrice(item.price,item.currency)}</strong><small>{item.priceLabel}</small></td>)}</tr>{comparisonLabels.map(label=><tr key={label}><th scope="row">{label}</th>{compared.map(item=><td key={item.id}>{item.facts.find(f=>f.label===label)?.value??"—"}</td>)}</tr>)}<tr><th scope="row">Kaynak</th>{compared.map(item=><td key={item.id}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.source} ↗</a><small>{formatToolDate(item.checkedAt)} TSİ</small></td>)}</tr></tbody></table></div></section>}
      <div className="tool-result-grid">{visible.slice(0,limit).map(item=>{
        const isSelected=selected.includes(item.id);
        return <article key={item.id} className="tool-result-card">{item.imageUrl&&<div className="tool-result-image"><img src={item.imageUrl} alt={item.title}/></div>}<div className="tool-result-meta"><span>{item.group}</span><span>{item.category}</span></div><h3>{item.title}</h3><div className="tool-result-price"><span>{item.priceLabel}</span><strong>{formatToolPrice(item.price,item.currency)}</strong></div>{item.description&&<p className="tool-result-description">{item.description}</p>}<dl>{item.facts.map(fact=><div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>{item.notice&&<p className="tool-result-notice">{item.notice}</p>}<time dateTime={item.checkedAt}>Gözlem · {formatToolDate(item.checkedAt)} TSİ</time><div className="tool-result-actions"><a href={item.url} target="_blank" rel="noopener noreferrer">{item.source} <ArrowUpRight size={15} aria-hidden="true"/></a><button aria-pressed={isSelected} disabled={!isSelected && compared.length>=3} onClick={()=>setSelected(isSelected?selected.filter(id=>id!==item.id):[...selected,item.id])} aria-label={`${item.title}: ${isSelected?"karşılaştırmadan çıkar":"karşılaştırmaya ekle"}`}>{isSelected&&<Check size={14} aria-hidden="true"/>}{isSelected?"Seçildi":"Karşılaştır"}</button></div></article>;
      })}</div>
      {visible.length>limit&&<button className="tool-load-more" onClick={()=>setLimit(limit+24)}>24 kayıt daha göster · {visible.length-limit} kayıt kaldı</button>}
    </section>
    <aside className="tool-explorer-note"><strong>Karar vermeden önce</strong><p>{config.note}</p></aside>
  </div>;
}
