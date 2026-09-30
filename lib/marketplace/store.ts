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
 return {id:row.id,kind:row.kind,title:row.title,description:row.description,price:Number(row.price),currency:row.currency,city:row.city,district:row.district,neighborhood:row.neighborhood??"",latitude:publicLat,longitude:publicLng,locationPrecision:"approximate",sellerRole:row.seller_role,sourceType:"member",sourceName:"Üretir İlan",sourceUrl:null,sellerName:row.display_name??null,sellerHandle:row.handle??null,images:strings(row.images),attributes:object(row.attributes),updatedAt:new Date(row.updated_at).toISOString(),publishedAt:row.published_at?new Date(row.published_at).toISOString():null,expiresAt:row.expires_at?new Date(row.expires_at).toISOString():null,trustBadges:trustBadges(row),priceReference:num(row.price_reference),priceAnomalyPct:num(row.price_anomaly_pct),reportCount:Number(row.report_count||0),detailUrl:`/${row.kind==="property"?"ev-ai":"araba-ai"}/ilan/${row.id}`};
}
export async function publicMemberListings(kind:MarketplaceKind){
 const r=await db().query(`SELECT l.*,a.handle,a.display_name,a.created_at account_created_at,(SELECT count(*)::int FROM marketplace_listings p WHERE p.user_id=l.user_id AND p.status='published') seller_published_count,(SELECT count(*)::int FROM marketplace_reports x WHERE x.listing_id=l.id AND x.status='open') report_count FROM marketplace_listings l JOIN member_accounts a ON a.id=l.user_id WHERE l.kind=$1 AND l.status='published' AND (l.expires_at IS NULL OR l.expires_at>now()) ORDER BY l.published_at DESC LIMIT 500`,[kind]);
 return (r.rows as ListingRow[]).map(memberRow);
}
export async function publicMemberListing(id:string){
 const r=await db().query(`SELECT l.*,a.handle,a.display_name,a.created_at account_created_at,(SELECT count(*)::int FROM marketplace_listings p WHERE p.user_id=l.user_id AND p.status='published') seller_published_count,(SELECT count(*)::int FROM marketplace_reports x WHERE x.listing_id=l.id AND x.status='open') report_count FROM marketplace_listings l JOIN member_accounts a ON a.id=l.user_id WHERE l.id=$1 AND l.status='published' AND (l.expires_at IS NULL OR l.expires_at>now())`,[id]);
 const row=(r.rows as ListingRow[])[0];return row?memberRow(row):null;
}
export async function propertyReference(city:string,district:string,grossM2:number){
 const r=await db().query(`SELECT price_per_m2::float8 value FROM property_listing_observations WHERE city=$1 AND ($2='' OR district=$2) AND price_per_m2 IS NOT NULL AND price_per_m2>0 AND fetched_at>now()-interval '30 days' ORDER BY fetched_at DESC LIMIT 500`,[city,district]);
 const m=median(r.rows.map((x:{value:unknown})=>Number(x.value)));
 return {reference:m?m*grossM2:null,perM2:m,sample:r.rows.length};
}
export async function vehicleReference(brand:string,model:string,year?:number){
 const official=await db().query(`SELECT COALESCE(campaign_price,list_price)::float8 price FROM vehicle_price_observations WHERE lower(brand)=lower($1) AND lower(model) LIKE lower($2) ORDER BY fetched_at DESC LIMIT 1`,[brand,"%"+model+"%"]);
 const used=await db().query(`SELECT price::float8 price FROM marketplace_listings WHERE kind='vehicle' AND status='published' AND lower(attributes->>'brand')=lower($1) AND lower(attributes->>'model')=lower($2) AND ($3::int IS NULL OR abs((attributes->>'modelYear')::int-$3)<=2) AND (expires_at IS NULL OR expires_at>now()) ORDER BY published_at DESC LIMIT 250`,[brand,model,year??null]);
 const vals=used.rows.map((x:{price:unknown})=>Number(x.price)).filter(Number.isFinite),avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
 const officialRow=official.rows[0] as {price:unknown}|undefined;
 return {newPrice:officialRow?Number(officialRow.price):null,usedAverage:avg,usedMedian:median(vals),usedSample:vals.length};
}
export async function marketplaceDashboard(kind:MarketplaceKind):Promise<MarketplaceDashboard>{
 const members=await publicMemberListings(kind),now=new Date().toISOString();
 if(kind==="property"){
  const sourced=await getEvAIReport().catch(()=>null);
  const sourceListings=(sourced?.items??[]).map(item=>{const c=item.city?cityCenters[item.city]:undefined;if(!c||!item.price)return null;return {id:"source:"+item.listingKey,kind:"property",title:item.title,description:item.reasons.join(" · "),price:item.price,currency:"TRY",city:item.city??"",district:item.district??"",neighborhood:"",latitude:c[0],longitude:c[1],locationPrecision:"approximate",sellerRole:"agent",sourceType:"source",sourceName:item.sourceName,sourceUrl:item.sourceUrl,sellerName:null,sellerHandle:null,images:item.imageUrl?[item.imageUrl]:[],attributes:{rooms:item.rooms,grossM2:item.grossM2,propertyType:item.propertyType,listingType:item.listingType},updatedAt:item.fetchedAt,publishedAt:item.publishedAt,expiresAt:null,trustBadges:[{label:"Kaynaklı kayıt",tone:"neutral",detail:"Konum şehir merkezinde yaklaşık gösterilir; özgün ilan kaynağını kontrol edin."},{label:`EvAI ${item.score}/100`,tone:item.score>=70?"good":"neutral",detail:"Skor güncellik, kaynak ve fiyat gözlemlerinden hesaplanır."}],priceReference:item.localMedianPerM2&&item.grossM2?item.localMedianPerM2*item.grossM2:null,priceAnomalyPct:item.valueDeltaPct===null?null:-item.valueDeltaPct,reportCount:0,detailUrl:null} as MarketplaceListing}).filter((x):x is MarketplaceListing=>x!==null);
  const listings=[...members,...sourceListings];
  return {kind,checkedAt:sourced?.checkedAt??now,listings,references:[],stats:[{label:"haritadaki ilan",value:listings.length},{label:"Üretir ilanı",value:members.length},{label:"kaynaklı kayıt",value:sourceListings.length}]};
 }
 const auto=await getAutomotiveSnapshot().catch(()=>null);
 const enriched=await Promise.all(members.map(async item=>{const a=item.attributes,ref=await vehicleReference(String(a.brand??""),String(a.model??""),Number(a.modelYear)||undefined);return {...item,newPrice:ref.newPrice,usedAverage:ref.usedAverage,usedMedian:ref.usedMedian,usedSample:ref.usedSample};}));
 const refs=(auto?.prices??[]).slice(0,180).map(p=>({label:p.brand+" "+p.model,value:p.effectivePrice,detail:p.campaignPrice!==null?"Resmî kampanya fiyatı":"Resmî liste fiyatı"}));
 return {kind,checkedAt:auto?.checkedAt??now,listings:enriched,references:refs,stats:[{label:"2. el ilan",value:enriched.length},{label:"sıfır araç referansı",value:refs.length},{label:"şehir",value:new Set(enriched.map(x=>x.city)).size}]};
}
