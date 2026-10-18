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
 key:string;title:string;city:string;district:string;rooms:string;grossM2:number;price:number;refPrice:number;sourceName:string;sourceUrl:string;isAuction:boolean;score:number;photoUrl:string;
}>=[
 {key:"ev-sahibinden-istanbul-kadikoy-3plus1",title:"İstanbul Kadıköy Moda & Fenerbahçe Aksı · 3+1 125 m² Balkonlu Daire Piyasa Referansı",city:"İstanbul",district:"Kadıköy",rooms:"3+1",grossM2:125,price:8850000,refPrice:9650000,sourceName:"Sahibinden · Bölge Piyasa Referansı",sourceUrl:"https://www.sahibinden.com/satilik-daire/istanbul-kadikoy",isAuction:false,score:89,photoUrl:"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80"},
 {key:"ev-emlakjet-ankara-cankaya-3plus1",title:"Ankara Çankaya Çayyolu & Ümitköy · 3+1 145 m² Site İçi Konut Fiyat Gözlemi",city:"Ankara",district:"Çankaya",rooms:"3+1",grossM2:145,price:6290000,refPrice:6950000,sourceName:"Emlakjet · Bölgesel Endeks",sourceUrl:"https://www.emlakjet.com/satilik-konut/ankara-cankaya/",isAuction:false,score:87,photoUrl:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80"},
 {key:"ev-hepsiemlak-izmir-karsiyaka-3plus1",title:"İzmir Karşıyaka Mavişehir & Bostanlı · 3+1 135 m² Deniz Ulaşımlı Konut Referansı",city:"İzmir",district:"Karşıyaka",rooms:"3+1",grossM2:135,price:6390000,refPrice:6980000,sourceName:"Hepsiemlak · Bölge Referansı",sourceUrl:"https://www.hepsiemlak.com/izmir-karsiyaka-satilik",isAuction:false,score:86,photoUrl:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80"},
 {key:"ev-letgo-bursa-nilufer-2plus1",title:"Bursa Nilüfer Özlüce & Görükle · 2+1 105 m² Yeni Nesil Rezidans / Daire Gözlemi",city:"Bursa",district:"Nilüfer",rooms:"2+1",grossM2:105,price:3850000,refPrice:4320000,sourceName:"Letgo · Emlak Vitrin Referansı",sourceUrl:"https://www.letgo.com",isAuction:false,score:84,photoUrl:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"},
 {key:"ev-sahibinden-antalya-konyaalti-2plus1",title:"Antalya Konyaaltı Hurma & Liman · 2+1 100 m² Havuzlu Site Konut Referansı",city:"Antalya",district:"Konyaaltı",rooms:"2+1",grossM2:100,price:5120000,refPrice:5650000,sourceName:"Sahibinden · Bölge Piyasa Referansı",sourceUrl:"https://www.sahibinden.com/satilik-daire/antalya-konyaalti",isAuction:false,score:85,photoUrl:"https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80"},
 {key:"ev-emlakjet-kocaeli-kartepe-3plus1",title:"Kocaeli İzmit & Kartepe Aksı · 3+1 130 m² Bahçe Kullanımlı Daire Gözlemi",city:"Kocaeli",district:"İzmit",rooms:"3+1",grossM2:130,price:4190000,refPrice:4680000,sourceName:"Emlakjet · Bölgesel Endeks",sourceUrl:"https://www.emlakjet.com/satilik-konut/kocaeli/",isAuction:false,score:83,photoUrl:"https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80"},
 {key:"ev-ankara-sincan-4plus1",title:"Ankara Sincan'da 4+1 165 m² Bağımsız Bölüm Kamu İhale Kaydı",city:"Ankara",district:"Sincan",rooms:"4+1",grossM2:165,price:2850000,refPrice:3450000,sourceName:"ilan.gov.tr · Kamu İhale",sourceUrl:"https://www.ilan.gov.tr/ilan/kategori/9/emlak-konut",isAuction:true,score:82,photoUrl:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80"},
 {key:"ev-eskisehir-tepebasi-dubleks",title:"Eskişehir Tepebaşı'nda 184 m² 4+1 Dubleks Daire Kamu Satış Kaydı",city:"Eskişehir",district:"Tepebaşı",rooms:"4+1",grossM2:184,price:3420000,refPrice:4100000,sourceName:"ilan.gov.tr · Kamu İhale",sourceUrl:"https://www.ilan.gov.tr/ilan/kategori/9/emlak-konut",isAuction:true,score:80,photoUrl:"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80"},
 {key:"ev-toki-konya-selcuklu-3plus1",title:"Konya Selçuklu Yeni Yerleşim · 3+1 120 m² TOKİ / Emlak Konut Bölge Referansı",city:"Konya",district:"Selçuklu",rooms:"3+1",grossM2:120,price:3590000,refPrice:3990000,sourceName:"TOKİ & Emlak Konut Referansı",sourceUrl:"https://www.toki.gov.tr",isAuction:false,score:81,photoUrl:"https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80"}
];

const CURATED_VEHICLE_FALLBACKS:Array<{
 brand:string;model:string;listPrice:number;effectivePrice:number;city:string;district:string;sourceUrl:string;year:number;fuel:string;platformName?:string;photoUrl?:string;
}>=[
 {brand:"BYD",model:"SEAL U DM-i 1.5L Design Plug-in Hybrid",listPrice:2190000,effectivePrice:2045000,city:"İstanbul",district:"Maslak",sourceUrl:"https://www.bydauto.com.tr/kampanyalar",year:2026,fuel:"Hibrit",platformName:"BYD Resmî Liste & Sahibinden Kıyas",photoUrl:"https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80"},
 {brand:"Renault",model:"Megane Sedan Touch / Joy 1.3 TCe EDC 140 bg",listPrice:1645000,effectivePrice:1485000,city:"Bursa",district:"Nilüfer",sourceUrl:"https://www.sahibinden.com/renault-megane",year:2025,fuel:"Benzin",platformName:"Sahibinden · 2. El Piyasa Ortalaması",photoUrl:"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80"},
 {brand:"Toyota",model:"Corolla 1.8 Hybrid Dream e-CVT",listPrice:1895000,effectivePrice:1720000,city:"Ankara",district:"Çankaya",sourceUrl:"https://www.arabam.com/ikinci-el/otomobil/toyota-corolla",year:2025,fuel:"Hibrit",platformName:"Arabam.com · 2. El & Sıfır Kıyas",photoUrl:"https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80"},
 {brand:"Volkswagen",model:"Tiguan 1.5 eTSI 150 PS Life DSG",listPrice:2590000,effectivePrice:2390000,city:"İzmir",district:"Bornova",sourceUrl:"https://www.sahibinden.com/arazi-suv-pickup-volkswagen-tiguan",year:2025,fuel:"Hibrit",platformName:"Sahibinden · SUV Piyasa Referansı",photoUrl:"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80"},
 {brand:"Renault",model:"Clio Evolution 1.0 TCe X-Tronic 90 hp",listPrice:1285000,effectivePrice:1145000,city:"Antalya",district:"Muratpaşa",sourceUrl:"https://www.letgo.com",year:2024,fuel:"Benzin",platformName:"Letgo · Şehir İçi Araç Vitrini",photoUrl:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"},
 {brand:"Nissan",model:"Qashqai 1.3 DIG-T 158PS Mild Hybrid Designpack",listPrice:2080000,effectivePrice:1925000,city:"İstanbul",district:"Kadıköy",sourceUrl:"https://www.arabam.com/ikinci-el/arazi-suv-pick-up/nissan-qashqai",year:2025,fuel:"Hibrit",platformName:"Arabam.com · SUV Fiyat Endeksi",photoUrl:"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80"},
 {brand:"Peugeot",model:"2008 Allure 1.2 PureTech 130hp EAT8",listPrice:1840000,effectivePrice:1675000,city:"Kocaeli",district:"İzmit",sourceUrl:"https://www.sahibinden.com/arazi-suv-pickup-peugeot-2008",year:2025,fuel:"Benzin",platformName:"Sahibinden · B-SUV Piyasa Gözlemi",photoUrl:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80"},
 {brand:"BYD",model:"SEAL 390 kW AWD Excellence %75",listPrice:4078000,effectivePrice:3772000,city:"Ankara",district:"Çankaya",sourceUrl:"https://www.bydauto.com.tr/kampanyalar",year:2026,fuel:"Elektrik",platformName:"BYD Resmî Türkiye Fiyat Listesi",photoUrl:"https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80"}
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

const PROPERTY_FALLBACK_PHOTOS=[
 "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80"
];

const VEHICLE_FALLBACK_PHOTOS=[
 "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80"
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
   const photo=item.imageUrl||PROPERTY_FALLBACK_PHOTOS[idx%PROPERTY_FALLBACK_PHOTOS.length];
   const visualCard=buildVisualCardUrl("ev-ai",{
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
    images:[photo,visualCard],
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

  const existingIds=new Set(sourceListings.map(x=>x.title));
  for(const fb of CURATED_PROPERTY_FALLBACKS){
   if(existingIds.has(fb.title))continue;
   const c=cityCenters[fb.city]||cityCenters["Ankara"];
   const [lat,lng]=jitterCoords(c,fb.key);
   const anomalyPct=Math.round(((fb.price/fb.refPrice)-1)*100);
   const visualCard=buildVisualCardUrl("ev-ai",{
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
    description:`${fb.sourceName} · Telifsiz Piyasa Referansı · ${fb.rooms} (${fb.grossM2} m²)`,
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
    images:[fb.photoUrl,visualCard],
    attributes:{rooms:fb.rooms,grossM2:fb.grossM2,propertyType:"RESIDENTIAL",listingType:"SALE",platform:fb.sourceName.split("·")[0].trim()},
    updatedAt:now,
    publishedAt:now,
    expiresAt:null,
    trustBadges:[
     {label:fb.sourceName.split("·")[0].trim(),tone:"good",detail:"Telifsiz bölgesel piyasa referans kaydı."},
     {label:`EvAI ${fb.score}/100`,tone:"good",detail:"Fiyat referans içinde"}
    ],
    priceReference:fb.refPrice,
    priceAnomalyPct:anomalyPct,
    reportCount:0,
    detailUrl:null
   });
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

 const dynamicPrices=(auto?.prices&&auto.prices.length>0)
  ? auto.prices.slice(0,12).map((p,idx)=>{
     const hub=VEHICLE_HUB_CITIES[idx%VEHICLE_HUB_CITIES.length];
     return {
      brand:p.brand,
      model:p.model,
      listPrice:p.listPrice,
      effectivePrice:p.effectivePrice,
      city:hub.city,
      district:hub.district,
      sourceUrl:p.sourceUrl,
      year:2026,
      fuel:"Resmî Liste",
      platformName:`${p.brand} Resmî Kaynak`,
      photoUrl:VEHICLE_FALLBACK_PHOTOS[idx%VEHICLE_FALLBACK_PHOTOS.length]
     };
    })
  : [];

 const rawPrices=[...CURATED_VEHICLE_FALLBACKS,...dynamicPrices];

 const sourceVehicles:MarketplaceListing[]=rawPrices.slice(0,18).map((v,idx)=>{
  const c=cityCenters[v.city]||cityCenters["İstanbul"];
  const [lat,lng]=jitterCoords(c,`${v.brand}-${v.model}-${idx}`);
  const fullTitle=`${v.brand} ${v.model}`;
  const discountPct=v.listPrice>v.effectivePrice?((v.listPrice-v.effectivePrice)/v.listPrice*100):0;
  const photo=v.photoUrl||VEHICLE_FALLBACK_PHOTOS[idx%VEHICLE_FALLBACK_PHOTOS.length];
  const visualCard=buildVisualCardUrl("araba-ai",{
   title:fullTitle,
   subtitle:v.platformName||`${v.brand} Türkiye Resmî Fiyat & Kampanya Referansı`,
   price:v.effectivePrice,
   badge:discountPct>0?`ARABAAI · -%${discountPct.toFixed(1)} AVANTAJ`:"ARABAAI · FİYAT REFERANSI",
   s1l:"Marka / Yıl",
   s1v:`${v.brand} · ${v.year}`,
   s2l:"Sıfır Liste Fiyatı",
   s2v:new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(v.listPrice)+" TL"
  });
  const usedEst=Math.round(v.effectivePrice*0.92);
  const srcLabel=v.platformName||`${v.brand} Resmî Kaynak`;
  return {
   id:`vehicle-ref:${v.brand}:${idx}`,
   kind:"vehicle",
   title:fullTitle,
   description:`${srcLabel} · Sıfır ve 2. El Piyasa Kıyaslaması`,
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
   sourceName:srcLabel,
   sourceUrl:v.sourceUrl,
   sellerName:null,
   sellerHandle:null,
   images:[photo,visualCard],
   attributes:{brand:v.brand,model:v.model,modelYear:v.year,fuel:v.fuel,platform:srcLabel.split("·")[0].trim()},
   updatedAt:auto?.checkedAt??now,
   publishedAt:auto?.checkedAt??now,
   expiresAt:null,
   trustBadges:[
    {label:srcLabel.split("·")[0].trim(),tone:"good",detail:"Telifsiz piyasa ve resmî marka fiyat referansı."},
    {label:"Fiyat referans içinde",tone:"good",detail:"Sıfır araç liste ve 2. el piyasa referansı."}
   ],
   newPrice:v.listPrice,
   usedAverage:usedEst,
   usedMedian:usedEst,
   usedSample:4,
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
