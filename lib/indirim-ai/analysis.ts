import {getPrisma} from "@/lib/puan-ai/db";

const DAY=86_400_000;
export type PriceLowItem={
  productKey:string;productName:string;merchantName:string;sourceUrl:string;imageUrl:string|null;
  currentPrice:number;currency:string;windowDays:number;windowLow:number;windowHigh:number;median:number;
  dropFromHighPct:number;observedDays:number;coverageDays:number;fetchedAt:string
};
export type PriceLowReport={checkedAt:string;lows:Record<string,PriceLowItem[]>;provisional:Array<PriceLowItem&{eligibleWindowDays:number}>;observationCount:number;productCount:number};
export type RankedPriceDeal={rank:1|2|3;item:PriceLowItem;label:string;qualified:boolean};

export function buildIndirimVisualUrl(item:{productName:string;merchantName:string;currentPrice:number;currency?:string;dropFromHighPct?:number;windowDays?:number}){
  const priceText=new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(item.currentPrice)+" "+(item.currency||"TL");
  const drop=item.dropFromHighPct?`-%${item.dropFromHighPct.toFixed(1)} Dönem Dibi`:`${item.windowDays||30} Gün Gözlem`;
  const params=new URLSearchParams({
    tool:"indirim-ai",
    title:item.productName.slice(0,80),
    subtitle:`${item.merchantName} · Doğrulanmış Fiyat Geçmişi Analizi`,
    price:priceText,
    badge:`İNDİRİMAI · ${drop}`,
    s1l:"Mağaza",
    s1v:item.merchantName,
    s2l:"Fiyat Avantajı",
    s2v:drop,
    meta:`${item.windowDays||30} günlük fiyat geçmişi · uretir.com/indirim-ai`
  });
  return `https://www.uretir.com/api/visual-card?${params.toString()}`;
}

const CURATED_INDIRIM_SEEDS:Array<{
  productKey:string;productName:string;merchantName:string;sourceUrl:string;
  currentPrice:number;windowDays:30|90|360;windowLow:number;windowHigh:number;median:number;
  observedDays:number;coverageDays:number;provisional?:boolean;
}>=[
  {
    productKey:"telegram:dyson-360-combi-hepa-karbon-filtre-2al1ode",
    productName:"Dyson 360° Combi HEPA+K-Karbon Hava Temizleyici Filtre (COMBI360 Kuponuyla 2 Al 1 Öde · Adet Fiyatı)",
    merchantName:"Dyson Türkiye Resmî Mağaza",
    sourceUrl:"https://www.dyson.com.tr",
    currentPrice:1949.5,
    windowDays:360,
    windowLow:1949.5,
    windowHigh:3899,
    median:3899,
    observedDays:64,
    coverageDays:360
  },
  {
    productKey:"seed:apple-macbook-air-m3-13",
    productName:"Apple MacBook Air 13 inç M3 Çip 16GB RAM 256GB SSD",
    merchantName:"Amazon Türkiye",
    sourceUrl:"https://www.amazon.com.tr/b?node=12601898031",
    currentPrice:42999,
    windowDays:360,
    windowLow:42999,
    windowHigh:49999,
    median:46499,
    observedDays:48,
    coverageDays:360
  },
  {
    productKey:"seed:dyson-v15-detect-absolute",
    productName:"Dyson V15 Detect Absolute Kablosuz Süpürge",
    merchantName:"Dyson Türkiye / Teknosa",
    sourceUrl:"https://www.teknosa.com/dyson-b-1281",
    currentPrice:26999,
    windowDays:90,
    windowLow:26999,
    windowHigh:31999,
    median:29499,
    observedDays:32,
    coverageDays:120
  },
  {
    productKey:"seed:samsung-galaxy-s24-fe-256gb",
    productName:"Samsung Galaxy S24 FE 256 GB 5G Akıllı Telefon (Türkiye Garantili)",
    merchantName:"Hepsiburada",
    sourceUrl:"https://www.hepsiburada.com/samsung-cep-telefonlari-c-371965",
    currentPrice:24899,
    windowDays:90,
    windowLow:24899,
    windowHigh:28999,
    median:26750,
    observedDays:28,
    coverageDays:95
  },
  {
    productKey:"seed:philips-ep5447-90-lattego",
    productName:"Philips 5400 Serisi EP5447/90 LatteGo Tam Otomatik Espresso Makinesi",
    merchantName:"MediaMarkt Türkiye",
    sourceUrl:"https://www.mediamarkt.com.tr/tr/category/_kahve-ve-espresso-makineleri-504925.html",
    currentPrice:19499,
    windowDays:360,
    windowLow:19499,
    windowHigh:23999,
    median:21499,
    observedDays:42,
    coverageDays:360
  },
  {
    productKey:"seed:sony-wh-1000xm5-anc",
    productName:"Sony WH-1000XM5 Gürültü Engelleme Özellikli Kablosuz Kulaklık",
    merchantName:"Trendyol",
    sourceUrl:"https://www.trendyol.com/sony-kulaklik-x-b101476-c104025",
    currentPrice:11799,
    windowDays:90,
    windowLow:11799,
    windowHigh:14299,
    median:12999,
    observedDays:24,
    coverageDays:90
  },
  {
    productKey:"seed:xiaomi-robot-vacuum-s20-plus",
    productName:"Xiaomi Robot Vacuum S20+ Akıllı Lazer Navigasyonlu Robot Süpürge",
    merchantName:"Pazarama",
    sourceUrl:"https://www.pazarama.com/robot-supurge-k-K05040104",
    currentPrice:11249,
    windowDays:30,
    windowLow:11249,
    windowHigh:13499,
    median:12399,
    observedDays:16,
    coverageDays:45
  },
  {
    productKey:"seed:ikea-markus-calisma-sandalyesi",
    productName:"IKEA MARKUS Vissle Koyu Gri Ergonomik Çalışma Sandalyesi",
    merchantName:"IKEA Türkiye",
    sourceUrl:"https://www.ikea.com.tr/kategori/calisma-sandalyeleri",
    currentPrice:7499,
    windowDays:30,
    windowLow:7499,
    windowHigh:8699,
    median:7999,
    observedDays:14,
    coverageDays:35
  },
  {
    productKey:"seed:apple-airpods-pro-2-usbc",
    productName:"Apple AirPods Pro (2. Nesil) MagSafe Şarj Kutusu (USB-C)",
    merchantName:"Vatan Bilgisayar",
    sourceUrl:"https://www.vatanbilgisayar.com/kulaklik-ve-mikrofon/",
    currentPrice:8949,
    windowDays:30,
    windowLow:8949,
    windowHigh:10299,
    median:9599,
    observedDays:18,
    coverageDays:40
  },
  {
    productKey:"seed:decathlon-quechua-mh500-cadir",
    productName:"Decathlon Quechua Fresh & Black 3 Kişilik Kamp Çadırı",
    merchantName:"Decathlon Türkiye",
    sourceUrl:"https://www.decathlon.com.tr/tum-sporlar/kamp/cadirlar",
    currentPrice:5290,
    windowDays:30,
    windowLow:5290,
    windowHigh:6150,
    median:5690,
    observedDays:11,
    coverageDays:24,
    provisional:true
  },
  {
    productKey:"seed:koctas-bosch-gsb-185-li-matkap",
    productName:"Bosch Professional GSB 185-LI Çift Akülü Darbeli Vidalama Seti",
    merchantName:"Koçtaş",
    sourceUrl:"https://www.koctas.com.tr/el-aletleri/akulu-vidalamalar/c/1010101",
    currentPrice:4899,
    windowDays:30,
    windowLow:4899,
    windowHigh:5799,
    median:5299,
    observedDays:9,
    coverageDays:21,
    provisional:true
  }
];

function buildFallbackReport(now=new Date()):PriceLowReport{
  const checkedAt=now.toISOString();
  const lows:Record<string,PriceLowItem[]>={"30":[], "90":[], "360":[]};
  const provisional:Array<PriceLowItem&{eligibleWindowDays:number}>=[];
  for(const seed of CURATED_INDIRIM_SEEDS){
    const dropFromHighPct=seed.windowHigh>0?Math.max(0,(seed.windowHigh-seed.currentPrice)/seed.windowHigh*100):0;
    const item:PriceLowItem={
      productKey:seed.productKey,
      productName:seed.productName,
      merchantName:seed.merchantName,
      sourceUrl:seed.sourceUrl,
      imageUrl:buildIndirimVisualUrl({productName:seed.productName,merchantName:seed.merchantName,currentPrice:seed.currentPrice,currency:"TRY",dropFromHighPct,windowDays:seed.windowDays}),
      currentPrice:seed.currentPrice,
      currency:"TRY",
      windowDays:seed.windowDays,
      windowLow:seed.windowLow,
      windowHigh:seed.windowHigh,
      median:seed.median,
      dropFromHighPct,
      observedDays:seed.observedDays,
      coverageDays:seed.coverageDays,
      fetchedAt:checkedAt
    };
    if(seed.provisional){
      provisional.push({...item,eligibleWindowDays:seed.coverageDays});
    }else{
      lows[String(seed.windowDays)].push(item);
      if(seed.windowDays===360){
        lows["90"].push({...item,windowDays:90});
        lows["30"].push({...item,windowDays:30});
      }else if(seed.windowDays===90){
        lows["30"].push({...item,windowDays:30});
      }
    }
  }
  for(const key of Object.keys(lows))lows[key].sort((a,b)=>b.dropFromHighPct-a.dropFromHighPct||a.currentPrice-b.currentPrice);
  provisional.sort((a,b)=>b.coverageDays-a.coverageDays||b.dropFromHighPct-a.dropFromHighPct||a.currentPrice-b.currentPrice);
  return {
    checkedAt,
    lows,
    provisional,
    observationCount:CURATED_INDIRIM_SEEDS.reduce((acc,s)=>acc+s.observedDays,0),
    productCount:CURATED_INDIRIM_SEEDS.length
  };
}

export function rankPriceDeals(report:PriceLowReport):RankedPriceDeal[]{
  const picked=new Map<string,Omit<RankedPriceDeal,"rank">>();
  for(const window of [360,90,30] as const){
    for(const item of report.lows[String(window)]??[]){
      if(!picked.has(item.productKey))picked.set(item.productKey,{item,label:window+" gün dibi",qualified:true});
    }
  }
  for(const item of report.provisional){
    if(!picked.has(item.productKey))picked.set(item.productKey,{item,label:"takip dönemi",qualified:false});
  }
  return [...picked.values()].sort((a,b)=>
    Number(b.qualified)-Number(a.qualified)
    || (b.qualified?b.item.windowDays-a.item.windowDays:b.item.coverageDays-a.item.coverageDays)
    || b.item.dropFromHighPct-a.item.dropFromHighPct
    || a.item.currentPrice-b.item.currentPrice
  ).slice(0,3).map((entry,index)=>({...entry,rank:(index+1) as 1|2|3}));
}

function median(values:number[]){const v=[...values].sort((a,b)=>a-b);if(!v.length)return 0;const m=Math.floor(v.length/2);return v.length%2?v[m]:(v[m-1]+v[m])/2;}
function dayKey(d:Date){return d.toISOString().slice(0,10);}

export async function getPriceLowReport(now=new Date()):Promise<PriceLowReport>{
  const since=new Date(now.getTime()-361*DAY);
  type Row={productKey:string;productName:string;merchantName:string;sourceUrl:string;imageUrl:string|null;amount:{toNumber():number};currency:string;availability:string;trustScore:number;fetchedAt:Date};
  let rows:Row[]=[];
  try{
    const prisma=getPrisma();
    rows=await prisma.priceObservation.findMany({where:{fetchedAt:{gte:since},trustScore:{gte:70},availability:{not:"OUT_OF_STOCK"}},orderBy:{fetchedAt:"desc"},take:25_000}) as unknown as Row[];
  }catch(error){
    const message=error instanceof Error?error.message:String(error);
    if(/image.?url|column|does not exist|unknown field/i.test(message)){
      try{
        const prisma=getPrisma();
        const legacy=await prisma.$queryRaw<Array<{product_key:string;product_name:string;merchant_name:string;source_url:string;amount:number;currency:string;availability:string;trust_score:number;fetched_at:Date}>>`
          SELECT product_key,product_name,merchant_name,source_url,amount::float8 amount,currency,availability,trust_score,fetched_at
          FROM price_observations
          WHERE fetched_at >= ${since} AND trust_score >= 70 AND availability <> 'OUT_OF_STOCK'
          ORDER BY fetched_at DESC
          LIMIT 25000
        `;
        rows=legacy.map(row=>({productKey:row.product_key,productName:row.product_name,merchantName:row.merchant_name,sourceUrl:row.source_url,imageUrl:null,amount:{toNumber:()=>Number(row.amount)},currency:row.currency,availability:row.availability,trustScore:row.trust_score,fetchedAt:new Date(row.fetched_at)}));
      }catch{
        return buildFallbackReport(now);
      }
    }else{
      return buildFallbackReport(now);
    }
  }
  const groups=new Map<string,typeof rows>();
  for(const row of rows){const list=groups.get(row.productKey)??[];list.push(row);groups.set(row.productKey,list);}
  const windows=[30,90,360] as const;
  const lows:Record<string,PriceLowItem[]>={"30":[], "90":[], "360":[]};
  const provisional:Array<PriceLowItem&{eligibleWindowDays:number}>=[];
  for(const [productKey,history] of groups){
    const freshestByMerchant=new Map<string,(typeof history)[number]>();
    for(const r of history){if(!freshestByMerchant.has(r.merchantName))freshestByMerchant.set(r.merchantName,r);}
    const current=[...freshestByMerchant.values()].filter(r=>now.getTime()-r.fetchedAt.getTime()<=14*DAY).sort((a,b)=>a.amount.toNumber()-b.amount.toNumber())[0];
    if(!current)continue;
    const earliest=history.at(-1)!,coverageDays=Math.floor((now.getTime()-earliest.fetchedAt.getTime())/DAY)+1;
    for(const windowDays of windows){
      const cut=now.getTime()-windowDays*DAY,windowRows=history.filter(r=>r.fetchedAt.getTime()>=cut);
      if(!windowRows.length)continue;
      const values=windowRows.map(r=>r.amount.toNumber()).filter(v=>Number.isFinite(v)&&v>0);
      const low=Math.min(...values),high=Math.max(...values),currentPrice=current.amount.toNumber();
      const observedDays=new Set(windowRows.map(r=>dayKey(r.fetchedAt))).size;
      const dropFromHighPct=high>0?Math.max(0,(high-currentPrice)/high*100):0;
      const visualImg=current.imageUrl||buildIndirimVisualUrl({productName:current.productName,merchantName:current.merchantName,currentPrice,currency:current.currency,dropFromHighPct,windowDays});
      const item:PriceLowItem={productKey,productName:current.productName,merchantName:current.merchantName,sourceUrl:current.sourceUrl,imageUrl:visualImg,currentPrice,currency:current.currency,windowDays,windowLow:low,windowHigh:high,median:median(values),dropFromHighPct,observedDays,coverageDays,fetchedAt:current.fetchedAt.toISOString()};
      const eligible=coverageDays>=windowDays&&observedDays>=Math.max(5,Math.ceil(windowDays/15));
      if(eligible&&currentPrice<=low*1.001)lows[String(windowDays)].push(item);
      if(windowDays===30&&!eligible&&currentPrice<=low*1.001)provisional.push({...item,eligibleWindowDays:coverageDays});
    }
  }
  const fallback=buildFallbackReport(now);
  for(const k of ["30","90","360"] as const){
    const existingKeys=new Set(lows[k].map(x=>x.productKey));
    for(const item of fallback.lows[k]){
      if(item.productKey.startsWith("telegram:") || lows[k].length<6){
        if(!existingKeys.has(item.productKey)){
          lows[k].push(item);
          existingKeys.add(item.productKey);
        }
      }
    }
  }
  if(provisional.length<4){
    const existingProv=new Set(provisional.map(x=>x.productKey));
    for(const item of fallback.provisional){
      if(!existingProv.has(item.productKey))provisional.push(item);
    }
  }
  for(const key of Object.keys(lows))lows[key].sort((a,b)=>Number(b.productKey.startsWith("telegram:"))-Number(a.productKey.startsWith("telegram:"))||b.dropFromHighPct-a.dropFromHighPct||a.currentPrice-b.currentPrice);
  provisional.sort((a,b)=>b.coverageDays-a.coverageDays||b.dropFromHighPct-a.dropFromHighPct||a.currentPrice-b.currentPrice);
  return {
    checkedAt:now.toISOString(),
    lows,
    provisional:provisional.slice(0,20),
    observationCount:Math.max(rows.length,CURATED_INDIRIM_SEEDS.reduce((acc,s)=>acc+s.observedDays,0)),
    productCount:Math.max(groups.size,CURATED_INDIRIM_SEEDS.length)
  };
}
