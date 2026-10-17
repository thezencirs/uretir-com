import type { getAutomotiveSnapshot } from "@/lib/araba-ai/analysis";
import type { getEvAIReport } from "@/lib/ev-ai/analysis";
import { buildIndirimVisualUrl, rankPriceDeals, type getPriceLowReport } from "@/lib/indirim-ai/analysis";
import { type ExplorerData, type ExplorerItem, formatToolDate, formatToolPrice } from "@/lib/tool-explorer";

export const unavailableExplorer: ExplorerData = { available: false, checkedAt: null, stats: [], items: [] };
const safeSource = (url: string) => { try { return new URL(url).protocol === "https:"; } catch { return false; } };
const percent = (value: number | null) => value===null?"Geçmiş gözlem yok":`${value>0?"+":""}${value.toLocaleString("tr-TR",{maximumFractionDigits:1})}%`;

function buildExplorerVisual(tool: "araba-ai" | "ev-ai", opts: { title: string; subtitle: string; price?: number | null; badge?: string; s1l?: string; s1v?: string; s2l?: string; s2v?: string }) {
  const priceText = opts.price ? formatToolPrice(opts.price) : "Detaylar Kaynakta";
  const params = new URLSearchParams({
    tool,
    title: opts.title.slice(0, 80),
    subtitle: opts.subtitle.slice(0, 100),
    price: priceText,
    badge: opts.badge || (tool === "araba-ai" ? "ARABAAI FİYAT ANALİZİ" : "EVAI TAŞINMAZ ANALİZİ"),
    s1l: opts.s1l || "Kategori",
    s1v: opts.s1v || "Doğrulandı",
    s2l: opts.s2l || "Kaynak",
    s2v: opts.s2v || "uretir.com"
  });
  return `/api/visual-card?${params.toString()}`;
}

export function automotiveExplorer(data: Awaited<ReturnType<typeof getAutomotiveSnapshot>>, now = new Date()): ExplorerData {
  const campaigns = data.campaigns.filter(item=>item.validUntil && Date.parse(item.validUntil)>=now.getTime() && (!item.validFrom || Date.parse(item.validFrom)<=now.getTime()));
  const prices: ExplorerItem[] = data.prices.map(item=>({
    id:`price:${item.brand}:${item.model}:${item.sourceUrl}`,
    title:item.model,
    group:item.brand,
    category:"Fiyatlar",
    price:item.effectivePrice,
    priceLabel:item.campaignPrice!==null?"Gözlenen kampanya fiyatı":"Gözlenen liste fiyatı",
    source:"Resmî marka kaynağı",
    url:item.sourceUrl,
    checkedAt:item.fetchedAt,
    imageUrl:buildExplorerVisual("araba-ai",{
      title:`${item.brand} ${item.model}`,
      subtitle:"Resmî Türkiye Sıfır Araç Liste & Kampanya Fiyatı",
      price:item.effectivePrice,
      badge:item.campaignPrice!==null?"ARABAAI · KAMPANYALI FİYAT":"ARABAAI · LİSTE FİYATI",
      s1l:"Marka",
      s1v:item.brand,
      s2l:"Değişim",
      s2v:percent(item.changePct)
    }),
    facts:[
      {label:"Liste fiyatı",value:formatToolPrice(item.listPrice)},
      {label:"Önceki gözlem",value:formatToolPrice(item.previousPrice)},
      {label:"Fiyat değişimi",value:percent(item.changePct)}
    ]
  }));
  const offers: ExplorerItem[] = campaigns.map(item=>({
    id:`campaign:${item.brand}:${item.title}:${item.sourceUrl}`,
    title:item.title,
    group:item.brand,
    category:"Kampanyalar",
    price:null,
    priceLabel:"Tutar ve koşullar",
    source:"Kampanya kaynağı",
    url:item.sourceUrl,
    checkedAt:item.fetchedAt,
    description:item.summary,
    imageUrl:buildExplorerVisual("araba-ai",{
      title:`${item.brand} · ${item.title}`,
      subtitle:item.summary||"Resmî Marka Satış & Finansman Kampanyası",
      price:null,
      badge:"ARABAAI · AKTİF KAMPANYA",
      s1l:"Marka",
      s1v:item.brand,
      s2l:"Son Tarih",
      s2v:formatToolDate(item.validUntil!)
    }),
    facts:[
      {label:"Başlangıç",value:item.validFrom?formatToolDate(item.validFrom):"Kaynakta belirtilmemiş"},
      {label:"Son tarih",value:formatToolDate(item.validUntil!)}
    ]
  }));
  const items=[...prices,...offers].filter(item=>safeSource(item.url));
  return {available:true,checkedAt:data.checkedAt,items,stats:[{label:"fiyat kaydı",value:items.filter(i=>i.category==="Fiyatlar").length},{label:"tarihli kampanya",value:items.filter(i=>i.category==="Kampanyalar").length},{label:"marka",value:new Set(items.map(i=>i.group)).size}]};
}

export function discountExplorer(data: Awaited<ReturnType<typeof getPriceLowReport>>): ExplorerData {
  const ranking=new Map(rankPriceDeals(data).map(x=>[x.item.productKey,x]));
  const entries = [...Object.entries(data.lows).flatMap(([days,items])=>items.map(item=>({item,category:`${days} gün`,provisional:false}))),...data.provisional.map(item=>({item,category:"Takip dönemi",provisional:true}))];
  const items: ExplorerItem[] = entries.filter(({item})=>safeSource(item.sourceUrl)).map(({item,category,provisional})=>{
    const ranked=ranking.get(item.productKey);
    const visualUrl=item.imageUrl||buildIndirimVisualUrl({
      productName:item.productName,
      merchantName:item.merchantName,
      currentPrice:item.currentPrice,
      currency:item.currency,
      dropFromHighPct:item.dropFromHighPct,
      windowDays:item.windowDays
    });
    return {
      id:`${category}:${item.productKey}:${item.sourceUrl}`,
      title:item.productName,
      group:item.merchantName,
      category,
      price:item.currentPrice,
      currency:item.currency,
      priceLabel:"Son gözlenen fiyat",
      source:"Mağazaya git",
      url:item.sourceUrl,
      checkedAt:item.fetchedAt,
      imageUrl:visualUrl,
      rank:ranked?.rank,
      rankLabel:ranked?.label,
      notice:provisional?"Henüz 30 günlük dip fiyat etiketi için yeterli geçmiş yok.":undefined,
      facts:[
        {label:"Gözlenen en düşük",value:formatToolPrice(item.windowLow,item.currency)},
        {label:"Gözlenen en yüksek",value:formatToolPrice(item.windowHigh,item.currency)},
        {label:"Gözlenen medyan",value:formatToolPrice(item.median,item.currency)},
        {label:"Gözlem sıklığı",value:`${item.observedDays} ayrı gün`},
        {label:"Geçmiş kapsamı",value:`${item.coverageDays} gün`}
      ]
    };
  });
  return {available:true,checkedAt:data.checkedAt,items,stats:[{label:"takip edilen ürün",value:data.productCount},{label:"fiyat gözlemi",value:data.observationCount},{label:"dönem dibi bulunan ürün",value:new Set(items.filter(i=>i.category!=="Takip dönemi").map(i=>i.title+":"+i.group)).size}]};
}

export function propertyExplorer(data: Awaited<ReturnType<typeof getEvAIReport>>): ExplorerData {
  const items: ExplorerItem[]=data.items.filter(item=>safeSource(item.sourceUrl)).map(item=>({
    id:item.listingKey,
    title:item.title,
    group:item.city??"Türkiye Geneli",
    category:item.isPublicAuction?"Kamu / ihale":"Konut ilanları",
    price:item.price,
    priceLabel:item.isPublicAuction?"Muhammen / başlangıç bedeli":"Kaynakta gözlenen ilan bedeli",
    source:item.sourceName,
    url:item.sourceUrl,
    checkedAt:item.fetchedAt,
    imageUrl:item.imageUrl||buildExplorerVisual("ev-ai",{
      title:item.title,
      subtitle:`${[item.city,item.district].filter(Boolean).join(" / ")||"Türkiye"} · ${item.sourceName}`,
      price:item.price,
      badge:item.isPublicAuction?"EVAI · KAMU / İHALE":`EVAI SKORU ${item.score}/100`,
      s1l:"Oda / Alan",
      s1v:`${item.rooms??"—"} · ${item.grossM2?item.grossM2+" m²":"—"}`,
      s2l:"EvAI Skoru",
      s2v:`${item.score}/100`
    }),
    description:(item.isPublicAuction?item.reasons.filter(reason=>!reason.includes("medyan")):item.reasons).join(" · "),
    notice:item.isPublicAuction?"Bu tutar piyasa değeri değildir. İhale şartnamesini kaynakta inceleyin.":"İlan fiyatı gerçekleşmiş satış bedeli veya ekspertiz değeri değildir.",
    facts:[
      {label:"Konum",value:[item.city,item.district].filter(Boolean).join(" / ")||"Belirtilmemiş"},
      {label:"Oda",value:item.rooms??"Belirtilmemiş"},
      {label:"Brüt alan",value:item.grossM2?`${item.grossM2} m²`:"Belirtilmemiş"},
      {label:"Birim bedel",value:item.pricePerM2?`${formatToolPrice(item.pricePerM2)} / m²`:"Hesaplanamıyor"},
      {label:"Yerel m² medyanı",value:item.isPublicAuction?"İhalelere uygulanmaz":item.localMedianPerM2?`${formatToolPrice(item.localMedianPerM2)} / m²`:"Yeterli örnek yok"},
      {label:"Fiyat düşüşü",value:item.priceDropPct===null?"Gözlenmedi":percent(-item.priceDropPct)}
    ]
  }));
  return {available:true,checkedAt:data.checkedAt,items,stats:[{label:"kaynaklı kayıt",value:items.length},{label:"tarihçeli gözlem",value:data.observations},{label:"şehir",value:new Set(items.map(i=>i.group).filter(city=>city!=="Türkiye Geneli")).size}]};
}
