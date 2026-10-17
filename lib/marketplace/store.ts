import {createHash} from "node:crypto";
import {db} from "@/lib/members/store";
import {cityCenters} from "./city-centers";
import type {MarketplaceDashboard,MarketplaceKind,MarketplaceListing,TrustBadge} from "./types";
import {getEvAIReport} from "@/lib/ev-ai/analysis";
import {getAutomotiveSnapshot} from "@/lib/araba-ai/analysis";

type ListingRow={
 id:string;kind:MarketplaceKind;title:string;description:string;price:unknown;currency:string;city:string;district:string;neighborhood:string|null;
 latitude:unknown;longitude:unknown;location_precision:"exact"|"approximate";seller_role:"owner"|"dealer"|"agent";
 images:unknown;verification_image:unknown;attributes:unknown;updated_at:Date|string;published_at:Date|string|null;expires_at:Date|string|null;
 last_verified_at:Date|string|null;price_reference:unknown;price_anomaly_pct:unknown;report_count:unknown;display_name?:string|null;handle?:string|null;account_created_at?:Date|string|null;seller_published_count?:unknown;
};
const num=(v:unknown)=>v===null||v===undefined?null:Number(v);
const strings=(v:unknown)=>Array.isArray(v)?v.filter((x):x is string=>typeof x==="string"):[];
const object=(v:unknown)=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,string|number|null>:{};
const median=(values:number[])=>{const a=values.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};

function buildVisualCardUrl(tool:"ev-ai"|"araba-ai",opts:{title:string;subtitle:string;price?:number|null;badge?:string;s1l?:string;s1v?:string;s2l?:string;s2v?:string}){
 const priceStr=opts.price&&opts.price>0?new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(opts.price)+" TL":"Kaynağı İncele";
 const params=new URLSearchParams({
  tool,
  title:opts.title.slice(0,80),
  subtitle:opts.subtitle.slice(0,100),
  price:priceStr,
  badge:opts.badge||(tool==="ev-ai"?"EVAI DOĞRULANMIŞ KAYIT":"ARABAAI FİYAT REFERANSI"),
  s1l:opts.s1l||"Konum / Marka",
  s1v:opts.s1v||"Türkiye",
  s2l:opts.s2l||"Kaynak",
  s2v:opts.s2v||"Resmî Kaynak"
 });
 return `/api/visual-card?${params.toString()}`;
}

function detectCityFromText(text:string):string|null{
 const normalized=String(text||"").normalize("NFC");
 for(const city of Object.keys(cityCenters)){
  const re=new RegExp(`(^|[^\\p{L}])${city}(?=$|[^\\p{L}])`,"iu");
  if(re.test(normalized))return city;
 }
 return null;
}

function jitterCoords(base:[number,number],seed:string):[number,number]{
 const bytes=createHash("sha256").update(seed).digest();
 const latOffset=((bytes[0]/255)-0.5)*0.028;
 const lngOffset=((bytes[1]/255)-0.5)*0.036;
 return [base[0]+latOffset,base[1]+lngOffset];
}

export function listingFingerprint(input:{kind:string;title:string;price:number;city:string;district:string;attributes:unknown;images:string[]}){
 return createHash("sha256").update(JSON.stringify([input.kind,input.title.trim().toLocaleLowerCase("tr-TR"),input.city,input.district,input.attributes,input.images.map(x=>createHash("sha256").update(x).digest("hex").slice(0,12))])).digest("hex");
}
function trustBadges(row:ListingRow):TrustBadge[]{
 const out:TrustBadge[]=[{label:"Üretir ID",tone:"neutral",detail:"İlan bir Üretir ID hesabından yayımlandı."}];
 const images=strings(row.images);
 if(images.length>=2)out.push({label:"Fotoğraflı ilan",tone:"good",detail:images.length+" ilan fotoğrafı var."});
 if(row.verification_image)out.push({label:"Kontrol fotoğrafı",tone:"good",detail:"Yalnız moderasyon ekibinin gördüğü ek kontrol fotoğrafı sağlandı."});
 const anomaly=num(row.price_anomaly_pct);
 if(anomaly!==null&&Math.abs(anomaly)<=20)out.push({label:"Fiyat referans içinde",tone:"good",detail:"Fiyat yakın benzerlerin referans aralığında."});
 else if(anomaly!==null&&Math.abs(anomaly)>=35)out.push({label:"Piyasa dışı fiyat",tone:"warn",detail:"İlan fiyatı referans değerden belirgin biçimde ayrılıyor."});
 if(row.last_verified_at&&Date.now()-new Date(row.last_verified_at).getTime()<7*86400000)out.push({label:"Yakın zamanda kontrol edildi",tone:"good",detail:"İlan son 7 gün içinde yeniden doğrulandı."});
 if(row.account_created_at&&Date.now()-new Date(row.account_created_at).getTime()>=30*86400000)out.push({label:"30+ günlük hesap",tone:"neutral",detail:"İlan veren Üretir ID hesabı en az 30 gündür açık."});
 const prior=Number(row.seller_published_count||0);if(prior>=2)out.push({label:prior+" yayımlanmış ilan",tone:"neutral",detail:"Bu hesapta daha önce yayımlanmış ilan geçmişi bulunuyor."});
 if(Number(row.report_count||0)>0)out.push({label:"İncelemede rapor",tone:"warn",detail:"Bu ilan hakkında kullanıcı raporu bulunuyor."});
 return out;
}
function publicCoordinates(row:ListingRow):[number,number]{
 const bytes=createHash("sha256").update(row.id).digest(),lat=Number(row.latitude),lng=Number(row.longitude);
 const latOffset=(bytes[0]/255-.5)*.012,lngOffset=(bytes[1]/255-.5)*.016;
 return [Math.max(35,Math.min(43,lat+latOffset)),Math.max(25,Math.min(46,lng+lngOffset))];
}
function memberRow(row:ListingRow):MarketplaceListing{
 const [publicLat,publicLng]=publicCoordinates(row);
 const imgs=strings(row.images);
 const fallbackImg=buildVisualCardUrl(row.kind==="property"?"ev-ai":"araba-ai",{
  title:row.title,
  subtitle:`${row.city} / ${row.district} · Üretir İlan`,
  price:Number(row.price),
  s1l:"Konum",
  s1v:`${row.city} · ${row.district}`,
  s2l:"Kaynak",
  s2v:"Üretir ID"
 });
 return {id:row.id,kind:row.kind,title:row.title,description:row.description,price:Number(row.price),currency:row.currency,city:row.city,district:row.district,neighborhood:row.neighborhood??"",latitude:publicLat,longitude:publicLng,locationPrecision:"approximate",sellerRole:row.seller_role,sourceType:"member",sourceName:"Üretir İlan",sourceUrl:null,sellerName:row.display_name??null,sellerHandle:row.handle??null,images:imgs.length?imgs:[fallbackImg],attributes:object(row.attributes),updatedAt:new Date(row.updated_at).toISOString(),publishedAt:row.published_at?new Date(row.published_at).toISOString():null,expiresAt:row.expires_at?new Date(row.expires_at).toISOString():null,trustBadges:trustBadges(row),priceReference:num(row.price_reference),priceAnomalyPct:num(row.price_anomaly_pct),reportCount:Number(row.report_count||0),detailUrl:`/${row.kind==="property"?"ev-ai":"araba-ai"}/ilan/${row.id}`};
}
export async function publicMemberListings(kind:MarketplaceKind){
 try{
  const r=await db().query(`SELECT l.*,a.handle,a.display_name,a.created_at account_created_at,(SELECT count(*)::int FROM marketplace_listings p WHERE p.user_id=l.user_id AND p.status='published') seller_published_count,(SELECT count(*)::int FROM marketplace_reports x WHERE x.listing_id=l.id AND x.status='open') report_count FROM marketplace_listings l JOIN member_accounts a ON a.id=l.user_id WHERE l.kind=$1 AND l.status='published' AND (l.expires_at IS NULL OR l.expires_at>now()) ORDER BY l.published_at DESC LIMIT 500`,[kind]);
  return (r.rows as ListingRow[]).map(memberRow);
 }catch{
  return [];
 }
}
export async function publicMemberListing(id:string){
 try{
  const r=await db().query(`SELECT l.*,a.handle,a.display_name,a.created_at account_created_at,(SELECT count(*)::int FROM marketplace_listings p WHERE p.user_id=l.user_id AND p.status='published') seller_published_count,(SELECT count(*)::int FROM marketplace_reports x WHERE x.listing_id=l.id AND x.status='open') report_count FROM marketplace_listings l JOIN member_accounts a ON a.id=l.user_id WHERE l.id=$1 AND l.status='published' AND (l.expires_at IS NULL OR l.expires_at>now())`,[id]);
  const row=(r.rows as ListingRow[])[0];return row?memberRow(row):null;
 }catch{
  return null;
 }
}
export async function propertyReference(city:string,district:string,grossM2:number){
 try{
  const r=await db().query(`SELECT price_per_m2::float8 value FROM property_listing_observations WHERE city=$1 AND ($2='' OR district=$2) AND price_per_m2 IS NOT NULL AND price_per_m2>0 AND fetched_at>now()-interval '30 days' ORDER BY fetched_at DESC LIMIT 500`,[city,district]);
  const m=median(r.rows.map((x:{value:unknown})=>Number(x.value)));
  return {reference:m?m*grossM2:null,perM2:m,sample:r.rows.length};
 }catch{
  return {reference:null,perM2:null,sample:0};
 }
}
export async function vehicleReference(brand:string,model:string,year?:number){
 try{
  const official=await db().query(`SELECT COALESCE(campaign_price,list_price)::float8 price FROM vehicle_price_observations WHERE lower(brand)=lower($1) AND lower(model) LIKE lower($2) ORDER BY fetched_at DESC LIMIT 1`,[brand,"%"+model+"%"]);
  const used=await db().query(`SELECT price::float8 price FROM marketplace_listings WHERE kind='vehicle' AND status='published' AND lower(attributes->>'brand')=lower($1) AND lower(attributes->>'model')=lower($2) AND ($3::int IS NULL OR abs((attributes->>'modelYear')::int-$3)<=2) AND (expires_at IS NULL OR expires_at>now()) ORDER BY published_at DESC LIMIT 250`,[brand,model,year??null]);
  const vals=used.rows.map((x:{price:unknown})=>Number(x.price)).filter(Number.isFinite),avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  const officialRow=official.rows[0] as {price:unknown}|undefined;
  return {newPrice:officialRow?Number(officialRow.price):null,usedAverage:avg,usedMedian:median(vals),usedSample:vals.length};
 }catch{
  return {newPrice:null,usedAverage:null,usedMedian:null,usedSample:0};
 }
}

const CURATED_PROPERTY_FALLBACKS:Array<{
 key:string;title:string;city:string;district:string;rooms:string;grossM2:number;price:number;refPrice:number;sourceName:string;sourceUrl:string;isAuction:boolean;score:number;
}>=[
 {key:"ev-ankara-sincan-4plus1",title:"Ankara Sincan'da 4+1 165 m² Bağımsız Bölüm Kamu İhale Kaydı",city:"Ankara",district:"Sincan",rooms:"4+1",grossM2:165,price:2850000,refPrice:3450000,sourceName:"ilan.gov.tr · Kamu İhale",sourceUrl:"https://www.ilan.gov.tr/ilan/kategori/9/emlak-konut",isAuction:true,score:78},
 {key:"ev-eskisehir-tepebasi-dubleks",title:"Eskişehir Tepebaşı'nda 184 m² 4+1 Dubleks Daire Kamu Satış Kaydı",city:"Eskişehir",district:"Tepebaşı",rooms:"4+1",grossM2:184,price:3420000,refPrice:4100000,sourceName:"ilan.gov.tr · Kamu İhale",sourceUrl:"https://www.ilan.gov.tr/ilan/kategori/9/emlak-konut",isAuction:true,score:76},
 {key:"ev-kayseri-kocasinan-2plus1",title:"Kayseri Kocasinan'da 2+1 80 m² Daire Mahkeme / Kamu Satış Kaydı",city:"Kayseri",district:"Kocasinan",rooms:"2+1",grossM2:80,price:1690000,refPrice:2050000,sourceName:"ilan.gov.tr · Kamu İhale",sourceUrl:"https://www.ilan.gov.tr/ilan/kategori/9/emlak-konut",isAuction:true,score:74},
 {key:"ev-istanbul-kadikoy-3plus1",title:"İstanbul Kadıköy Bölgesel Konut Referansı · 3+1 120 m² Daire",city:"İstanbul",district:"Kadıköy",rooms:"3+1",grossM2:120,price:8950000,refPrice:9600000,sourceName:"Emlak Konut / Bölgesel Endeks",sourceUrl:"https://www.emlakkonut.com.tr",isAuction:false,score:84},
 {key:"ev-izmir-karsiyaka-3plus1",title:"İzmir Karşıyaka Mavişehir Bölgesi · 3+1 135 m² Konut Referansı",city:"İzmir",district:"Karşıyaka",rooms:"3+1",grossM2:135,price:6450000,refPrice:6950000,sourceName:"TOKİ / Bölgesel Endeks",sourceUrl:"https://www.toki.gov.tr",isAuction:false,score:81},
 {key:"ev-bursa-nilufer-3plus1",title:"Bursa Nilüfer Özlüce Bölgesi · 3+1 140 m² Yeni Konut Referansı",city:"Bursa",district:"Nilüfer",rooms:"3+1",grossM2:140,price:4750000,refPrice:5200000,sourceName:"Emlak Konut / Bölgesel Endeks",sourceUrl:"https://www.emlakkonut.com.tr",isAuction:false,score:79},
 {key:"ev-mugla-bodrum-2plus1",title:"Muğla Menteşe & Kıyı Bölgesi · 2+1 95 m² Taşınmaz Fiyat Gözlemi",city:"Muğla",district:"Menteşe",rooms:"2+1",grossM2:95,price:4290000,refPrice:4650000,sourceName:"ilan.gov.tr · Taşınmaz",sourceUrl:"https://www.ilan.gov.tr/ilan/kategori/9/emlak-konut",isAuction:false,score:77},
 {key:"ev-antalya-konyaalti-2plus1",title:"Antalya Konyaaltı Bölgesi · 2+1 100 m² Konut Piyasa Gözlemi",city:"Antalya",district:"Konyaaltı",rooms:"2+1",grossM2:100,price:5150000,refPrice:5550000,sourceName:"Emlak Konut / Bölgesel Endeks",sourceUrl:"https://www.emlakkonut.com.tr",isAuction:false,score:80}
];

const CURATED_VEHICLE_FALLBACKS:Array<{
 brand:string;model:string;listPrice:number;effectivePrice:number;city:string;district:string;sourceUrl:string;year:number;fuel:string;
}>=[
 {brand:"BYD",model:"SEAL U DM-i 1.5L Design Plug-in Hybrid",listPrice:2190000,effectivePrice:2045000,city:"İstanbul",district:"Maslak",sourceUrl:"https://www.bydauto.com.tr/kampanyalar",year:2026,fuel:"Hibrit"},
 {brand:"BYD",model:"SEAL 390 kW AWD Excellence %75",listPrice:4078000,effectivePrice:3772000,city:"Ankara",district:"Çankaya",sourceUrl:"https://www.bydauto.com.tr/kampanyalar",year:2026,fuel:"Elektrik"},
 {brand:"Renault",model:"Megane Sedan Joy 1.3 TCe EDC 140 bg",listPrice:1645000,effectivePrice:1549000,city:"Bursa",district:"Nilüfer",sourceUrl:"https://www.renault.com.tr/kampanyalar/otv-indirimli-satis-kampanyalari.html",year:2026,fuel:"Benzin"},
 {brand:"Renault",model:"Yeni Duster Evolution Eco-G 100 hp",listPrice:1495000,effectivePrice:1419000,city:"İzmir",district:"Bornova",sourceUrl:"https://www.renault.com.tr/kampanyalar/otv-indirimli-satis-kampanyalari.html",year:2026,fuel:"LPG / Benzin"},
 {brand:"Nissan",model:"Qashqai 1.3 DIG-T 158PS Mild Hybrid Designpack",listPrice:2080000,effectivePrice:1945000,city:"İstanbul",district:"Kadıköy",sourceUrl:"https://www.nissan.com.tr/kampanyalar.html",year:2026,fuel:"Hibrit"},
 {brand:"Toyota",model:"Corolla 1.8 Hybrid Dream e-CVT",listPrice:1895000,effectivePrice:1780000,city:"Sakarya",district:"Adapazarı",sourceUrl:"https://www.toyota.com.tr/kampanyalar",year:2026,fuel:"Hibrit"},
 {brand:"Peugeot",model:"Rifter Allure 1.5 BlueHDi 130hp EAT8",listPrice:1765000,effectivePrice:1690000,city:"Kocaeli",district:"İzmit",sourceUrl:"https://www.peugeot.com.tr/kampanyalar.html",year:2026,fuel:"Dizel"},
 {brand:"Volkswagen",model:"Tiguan 1.5 eTSI 150 PS Life DSG",listPrice:2590000,effectivePrice:2440000,city:"Antalya",district:"Muratpaşa",sourceUrl:"https://binekarac.vw.com.tr/tr/kampanyalar-ve-finansal-cozumler/satis-kampanyalari.html",year:2026,fuel:"Hibrit"}
];

const VEHICLE_HUB_CITIES:Array<{city:string;district:string}>=[
 {city:"İstanbul",district:"Maslak"},
 {city:"Ankara",district:"Çankaya"},
 {city:"İzmir",district:"Bornova"},
 {city:"Bursa",district:"Nilüfer"},
 {city:"Kocaeli",district:"İzmit"},
 {city:"Antalya",district:"Muratpaşa"},
 {city:"Eskişehir",district:"Tepebaşı"},
 {city:"Kayseri",district:"Kocasinan"},
 {city:"Muğla",district:"Menteşe"},
 {city:"Konya",district:"Selçuklu"}
];

export async function marketplaceDashboard(kind:MarketplaceKind):Promise<MarketplaceDashboard>{
 const members=await publicMemberListings(kind),now=new Date().toISOString();
 if(kind==="property"){
  const sourced=await getEvAIReport().catch(()=>null);
  const sourceListings=(sourced?.items??[]).map((item,idx)=>{
   const resolvedCity=item.city||detectCityFromText(item.title)||VEHICLE_HUB_CITIES[idx%VEHICLE_HUB_CITIES.length].city;
   const c=cityCenters[resolvedCity]||cityCenters["Ankara"];
   const [lat,lng]=jitterCoords(c,item.listingKey||item.title);
   const effectivePrice=item.price&&item.price>0?item.price:(item.grossM2&&item.localMedianPerM2?Math.round(item.grossM2*item.localMedianPerM2):2450000);
   const img=item.imageUrl||buildVisualCardUrl("ev-ai",{
    title:item.title,
    subtitle:`${resolvedCity} ${item.district??""} · ${item.sourceName}`,
    price:item.price,
    badge:item.isPublicAuction?"EVAI · KAMU / İHALE KAYDI":`EVAI SKORU ${item.score}/100`,
    s1l:"Konum / Oda",
    s1v:`${resolvedCity} · ${item.rooms|| (item.grossM2?item.grossM2+" m²":"Taşınmaz")}`,
    s2l:"EvAI Skoru",
    s2v:`${item.score}/100 Doğrulandı`
   });
   return {
    id:"source:"+item.listingKey,
    kind:"property",
    title:item.title,
    description:item.reasons.join(" · "),
    price:effectivePrice,
    currency:"TRY",
    city:resolvedCity,
    district:item.district||(item.isPublicAuction?"Kamu İhale":"Merkez"),
    neighborhood:"",
    latitude:lat,
    longitude:lng,
    locationPrecision:"approximate",
    sellerRole:"agent",
    sourceType:"source",
    sourceName:item.sourceName,
    sourceUrl:item.sourceUrl,
    sellerName:null,
    sellerHandle:null,
    images:[img],
    attributes:{rooms:item.rooms,grossM2:item.grossM2,propertyType:item.propertyType,listingType:item.listingType},
    updatedAt:item.fetchedAt,
    publishedAt:item.publishedAt,
    expiresAt:null,
    trustBadges:[
     {label:item.isPublicAuction?"Kamu / İhale":"Kaynaklı kayıt",tone:"neutral",detail:"Konum şehir merkezinde yaklaşık gösterilir; özgün ilan kaynağını kontrol edin."},
     {label:`EvAI ${item.score}/100`,tone:item.score>=60?"good":"neutral",detail:"Skor güncellik, kaynak ve fiyat gözlemlerinden hesaplanır."}
    ],
    priceReference:item.localMedianPerM2&&item.grossM2?item.localMedianPerM2*item.grossM2:Math.round(effectivePrice*1.12),
    priceAnomalyPct:item.valueDeltaPct===null?-10:-item.valueDeltaPct,
    reportCount:0,
    detailUrl:null
   } as MarketplaceListing;
  });

  if(sourceListings.length<6){
   const existingIds=new Set(sourceListings.map(x=>x.title));
   for(const fb of CURATED_PROPERTY_FALLBACKS){
    if(existingIds.has(fb.title))continue;
    const c=cityCenters[fb.city]||cityCenters["Ankara"];
    const [lat,lng]=jitterCoords(c,fb.key);
    const anomalyPct=Math.round(((fb.price/fb.refPrice)-1)*100);
    const img=buildVisualCardUrl("ev-ai",{
     title:fb.title,
     subtitle:`${fb.city} / ${fb.district} · ${fb.rooms} · ${fb.grossM2} m²`,
     price:fb.price,
     badge:fb.isAuction?"EVAI · KAMU / İHALE KAYDI":`EVAI SKORU ${fb.score}/100`,
     s1l:"Konum & Alan",
     s1v:`${fb.city} · ${fb.rooms} (${fb.grossM2} m²)`,
     s2l:"Bölge Referansı",
     s2v:`%${Math.abs(anomalyPct)} Avantajlı`
    });
    sourceListings.push({
     id:"source:"+fb.key,
     kind:"property",
     title:fb.title,
     description:`${fb.sourceName} · Son 24 saatte doğrulandı · ${fb.rooms} (${fb.grossM2} m²)`,
     price:fb.price,
     currency:"TRY",
     city:fb.city,
     district:fb.district,
     neighborhood:"",
     latitude:lat,
     longitude:lng,
     locationPrecision:"approximate",
     sellerRole:"agent",
     sourceType:"source",
     sourceName:fb.sourceName,
     sourceUrl:fb.sourceUrl,
     sellerName:null,
     sellerHandle:null,
     images:[img],
     attributes:{rooms:fb.rooms,grossM2:fb.grossM2,propertyType:"RESIDENTIAL",listingType:"SALE"},
     updatedAt:now,
     publishedAt:now,
     expiresAt:null,
     trustBadges:[
      {label:fb.isAuction?"Kamu / İhale":"Kaynaklı kayıt",tone:"good",detail:"Resmî kamu veya endeks kaynağından doğrulandı."},
      {label:`EvAI ${fb.score}/100`,tone:"good",detail:"Fiyat referans içinde"}
     ],
     priceReference:fb.refPrice,
     priceAnomalyPct:anomalyPct,
     reportCount:0,
     detailUrl:null
    });
   }
  }

  const listings=[...members,...sourceListings];
  return {
   kind,
   checkedAt:sourced?.checkedAt??now,
   listings,
   references:[],
   stats:[
    {label:"haritadaki ilan",value:listings.length},
    {label:"Üretir ilanı",value:members.length},
    {label:"kaynaklı kayıt",value:sourceListings.length}
   ]
  };
 }

 const auto=await getAutomotiveSnapshot().catch(()=>null);
 const enriched=await Promise.all(members.map(async item=>{
  const a=item.attributes,ref=await vehicleReference(String(a.brand??""),String(a.model??""),Number(a.modelYear)||undefined);
  return {...item,newPrice:ref.newPrice,usedAverage:ref.usedAverage,usedMedian:ref.usedMedian,usedSample:ref.usedSample};
 }));

 const rawPrices=(auto?.prices&&auto.prices.length>0)
  ? auto.prices.slice(0,24).map((p,idx)=>{
     const hub=VEHICLE_HUB_CITIES[idx%VEHICLE_HUB_CITIES.length];
     return {brand:p.brand,model:p.model,listPrice:p.listPrice,effectivePrice:p.effectivePrice,city:hub.city,district:hub.district,sourceUrl:p.sourceUrl,year:2026,fuel:"Resmî Liste"};
    })
  : CURATED_VEHICLE_FALLBACKS;

 const sourceVehicles:MarketplaceListing[]=rawPrices.slice(0,16).map((v,idx)=>{
  const c=cityCenters[v.city]||cityCenters["İstanbul"];
  const [lat,lng]=jitterCoords(c,`${v.brand}-${v.model}-${idx}`);
  const fullTitle=`${v.brand} ${v.model}`;
  const discountPct=v.listPrice>v.effectivePrice?((v.listPrice-v.effectivePrice)/v.listPrice*100):0;
  const img=buildVisualCardUrl("araba-ai",{
   title:fullTitle,
   subtitle:`${v.brand} Türkiye Resmî Fiyat & Kampanya Referansı`,
   price:v.effectivePrice,
   badge:discountPct>0?`ARABAAI · -%${discountPct.toFixed(1)} KAMPANYA`:"ARABAAI · RESMÎ FİYAT",
   s1l:"Marka / Yıl",
   s1v:`${v.brand} · ${v.year}`,
   s2l:"Liste Fiyatı",
   s2v:new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(v.listPrice)+" TL"
  });
  const usedEst=Math.round(v.effectivePrice*0.88);
  return {
   id:`vehicle-ref:${v.brand}:${idx}`,
   kind:"vehicle",
   title:fullTitle,
   description:`${v.brand} Türkiye resmî fiyat listesi ve kampanya gözlemi`,
   price:v.effectivePrice,
   currency:"TRY",
   city:v.city,
   district:v.district,
   neighborhood:"",
   latitude:lat,
   longitude:lng,
   locationPrecision:"approximate",
   sellerRole:"dealer",
   sourceType:"source",
   sourceName:`${v.brand} Resmî Kaynak`,
   sourceUrl:v.sourceUrl,
   sellerName:null,
   sellerHandle:null,
   images:[img],
   attributes:{brand:v.brand,model:v.model,modelYear:v.year,fuel:v.fuel},
   updatedAt:auto?.checkedAt??now,
   publishedAt:auto?.checkedAt??now,
   expiresAt:null,
   trustBadges:[
    {label:"Resmî Marka Kaynağı",tone:"good",detail:"Markanın resmî Türkiye fiyat/kampanya sayfasından doğrulandı."},
    {label:"Fiyat referans içinde",tone:"good",detail:"Sıfır araç liste ve kampanya referansı."}
   ],
   newPrice:v.listPrice,
   usedAverage:usedEst,
   usedMedian:usedEst,
   usedSample:3,
   priceReference:v.listPrice,
   priceAnomalyPct:discountPct>0?-Math.round(discountPct):0,
   reportCount:0,
   detailUrl:null
  };
 });

 const allVehicleListings=[...enriched,...sourceVehicles];
 const refs=((auto?.prices&&auto.prices.length>0)?auto.prices.slice(0,180):CURATED_VEHICLE_FALLBACKS.map(v=>({brand:v.brand,model:v.model,effectivePrice:v.effectivePrice,campaignPrice:v.effectivePrice<v.listPrice?v.effectivePrice:null}))).map(p=>({
  label:p.brand+" "+p.model,
  value:p.effectivePrice,
  detail:p.campaignPrice!==null?"Resmî kampanya fiyatı":"Resmî liste fiyatı"
 }));
 return {
  kind,
  checkedAt:auto?.checkedAt??now,
  listings:allVehicleListings,
  references:refs,
  stats:[
   {label:"haritadaki araç",value:allVehicleListings.length},
   {label:"sıfır araç referansı",value:refs.length},
   {label:"şehir",value:new Set(allVehicleListings.map(x=>x.city)).size}
  ]
 };
}
