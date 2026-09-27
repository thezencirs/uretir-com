import {createHash} from "node:crypto";
import {getPrisma} from "@/lib/puan-ai/db";
import {discoverPublicUrls,fetchPublicText,jsonLdObjects,parseMoney,stripHtml} from "@/lib/public-source-crawler";
import {automotiveSources,type AutomotiveSource} from "./sources";

const AGENT="Uretir-ArabaAI/1.0 (+https://www.uretir.com/araba-ai)";
const hash=(v:string)=>createHash("sha256").update(v).digest("hex");
const clean=(v:string)=>v.replace(/\s+/g," ").replace(/^[-|:–—\s]+|[-|:–—\s]+$/g," ").trim();

function priceValues(text:string){
 return [...text.matchAll(/((?:\d{1,3}\.)+\d{3})(?:,\d{1,2})?\s*(?:₺|TL)/gi)]
  .map(m=>parseMoney(m[1])).filter((v):v is number=>Boolean(v&&v>=200_000&&v<=100_000_000));
}

export function parseVehiclePricePage(html:string,url:string,source:AutomotiveSource){
 const out:Array<{brand:string;model:string;trim:string|null;listPrice:number;campaignPrice:number|null;sourceUrl:string;sourceName:string}>=[];
 for(const match of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){
   const row=clean(stripHtml(match[1])),prices=priceValues(row); if(!prices.length)continue;
   const firstPrice=row.search(/(?:\d{1,3}\.)+\d{3}(?:,\d{1,2})?\s*(?:₺|TL)/i);
   const name=clean(firstPrice>0?row.slice(0,firstPrice):row); if(name.length<2||name.length>180)continue;
   const unique=[...new Set(prices)].sort((a,b)=>b-a),listPrice=unique[0],campaignPrice=unique.length>1?unique.at(-1)!:null;
   out.push({brand:source.brand,model:name,trim:null,listPrice,campaignPrice:campaignPrice&&campaignPrice<listPrice?campaignPrice:null,sourceUrl:url,sourceName:source.brand+" Türkiye"});
 }
 for(const node of jsonLdObjects(html)){
   const type=node["@type"]; if(!(type==="Product"||(Array.isArray(type)&&type.includes("Product"))))continue;
   const name=typeof node.name==="string"?clean(node.name):""; if(name.length<2)continue;
   const raw=node.offers,offers=(Array.isArray(raw)?raw:[raw]).filter(v=>Boolean(v&&typeof v==="object")) as Array<Record<string,unknown>>;
   const prices=offers.map(o=>parseMoney(o.price??o.lowPrice)).filter((v):v is number=>Boolean(v&&v>=200_000&&v<=100_000_000));
   if(!prices.length)continue;
   out.push({brand:source.brand,model:name,trim:null,listPrice:Math.max(...prices),campaignPrice:prices.length>1?Math.min(...prices):null,sourceUrl:url,sourceName:source.brand+" Türkiye"});
 }
 const seen=new Set<string>();
 return out.filter(item=>{const k=item.brand+"|"+item.model.toLocaleLowerCase("tr-TR")+"|"+item.listPrice;if(seen.has(k))return false;seen.add(k);return true;}).slice(0,120);
}

const months:Record<string,number>={ocak:0,şubat:1,subat:1,mart:2,nisan:3,mayıs:4,mayis:4,haziran:5,temmuz:6,ağustos:7,agustos:7,eylül:8,eylul:8,ekim:9,kasım:10,kasim:10,aralık:11,aralik:11};
function parseDates(text:string){
 const dates:Date[]=[];
 for(const m of text.matchAll(/\b(\d{1,2})[.\/-](\d{1,2})[.\/-](20\d{2})\b/g)){const d=new Date(Date.UTC(Number(m[3]),Number(m[2])-1,Number(m[1]),20,59,59));if(Number.isFinite(d.getTime()))dates.push(d);}
 for(const m of text.toLocaleLowerCase("tr-TR").matchAll(/\b(\d{1,2})\s+(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)\s+(20\d{2})\b/g)){const d=new Date(Date.UTC(Number(m[3]),months[m[2]],Number(m[1]),20,59,59));if(Number.isFinite(d.getTime()))dates.push(d);}
 return dates.sort((a,b)=>a.getTime()-b.getTime());
}

export function parseVehicleCampaignPage(html:string,url:string,source:AutomotiveSource){
 const sections=[...html.matchAll(/<h([123])[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[123][^>]*>|$)/gi)];
 const out:Array<{brand:string;title:string;summary:string;validFrom:Date|null;validUntil:Date|null;sourceUrl:string;sourceName:string}>=[];
 for(const s of sections){
   const title=clean(stripHtml(s[2])),body=clean(stripHtml(s[3])).slice(0,1600),combined=title+" "+body;
   if(title.length<3||!/kampanya|faiz|kredi|indirim|fırsat|firsat|başlayan fiyat|baslayan fiyat|takas/i.test(combined))continue;
   const dates=parseDates(combined);
   out.push({brand:source.brand,title,summary:body.slice(0,900),validFrom:dates.length>1?dates[0]:null,validUntil:dates.length?dates.at(-1)!:null,sourceUrl:url,sourceName:source.brand+" Türkiye"});
 }
 if(!out.length){
   const title=clean(stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]??source.brand+" kampanyaları"));
   const body=clean(stripHtml(html)).slice(0,1400),dates=parseDates(body);
   if(/kampanya|faiz|kredi|indirim|fırsat|firsat/i.test(body))out.push({brand:source.brand,title,summary:body.slice(0,900),validFrom:dates.length>1?dates[0]:null,validUntil:dates.length?dates.at(-1)!:null,sourceUrl:url,sourceName:source.brand+" Türkiye"});
 }
 return out.slice(0,20);
}

async function urlsFor(source:AutomotiveSource,kind:"price"|"campaign"){
 const explicit=kind==="price"?(source.priceUrls??[]):(source.campaignUrls??[]);
 const patterns=kind==="price"?source.pricePatterns:source.campaignPatterns;
 const discovered:string[]=[];
 for(const origin of source.origins.slice(0,2)){
   try{discovered.push(...await discoverPublicUrls(origin,patterns,{agent:AGENT,maxUrls:18}));}catch{}
   if(discovered.length>=12)break;
 }
 return [...new Set([...explicit,...discovered])].slice(0,3);
}

async function collectSource(source:AutomotiveSource){
 const prisma=getPrisma(),now=new Date();let priceStored=0,campaignStored=0;
 const [priceUrls,campaignUrls]=await Promise.all([urlsFor(source,"price"),urlsFor(source,"campaign")]);
 for(const url of priceUrls.slice(0,2)){
   try{
     const page=await fetchPublicText(url,{agent:AGENT,maxBytes:2_000_000});
     for(const item of parseVehiclePricePage(page.text,page.url,source)){
       const fingerprint=hash(JSON.stringify([item.brand,item.model,item.listPrice,item.campaignPrice,item.sourceUrl]));
       const recent=await prisma.vehiclePriceObservation.findFirst({where:{brand:item.brand,model:item.model,sourceUrl:item.sourceUrl},orderBy:{fetchedAt:"desc"}});
       if(recent&&recent.fingerprint===fingerprint&&now.getTime()-recent.fetchedAt.getTime()<12*3600_000)continue;
       await prisma.vehiclePriceObservation.create({data:{...item,currency:"TRY",fetchedAt:now,fingerprint}});priceStored++;
     }
   }catch{}
 }
 for(const url of campaignUrls.slice(0,2)){
   try{
     const page=await fetchPublicText(url,{agent:AGENT,maxBytes:2_000_000});
     for(const item of parseVehicleCampaignPage(page.text,page.url,source)){
       const fingerprint=hash(JSON.stringify([item.brand,item.title,item.summary,item.validFrom?.toISOString(),item.validUntil?.toISOString(),item.sourceUrl]));
       const recent=await prisma.vehicleCampaignObservation.findFirst({where:{brand:item.brand,title:item.title,sourceUrl:item.sourceUrl},orderBy:{fetchedAt:"desc"}});
       if(recent&&recent.fingerprint===fingerprint&&now.getTime()-recent.fetchedAt.getTime()<24*3600_000)continue;
       await prisma.vehicleCampaignObservation.create({data:{...item,fetchedAt:now,fingerprint,active:!item.validUntil||item.validUntil>=now}});campaignStored++;
     }
   }catch{}
 }
 return {source:source.id,brand:source.brand,priceStored,campaignStored,priceUrls:priceUrls.length,campaignUrls:campaignUrls.length};
}

export async function collectAutomotiveSources(batchSize=4){
 const slot=Math.floor(Date.now()/(4*3600_000)),offset=(slot*batchSize)%automotiveSources.length;
 const selected=Array.from({length:Math.min(batchSize,automotiveSources.length)},(_,i)=>automotiveSources[(offset+i)%automotiveSources.length]);
 const results=await Promise.all(selected.map(s=>collectSource(s).catch(()=>({source:s.id,brand:s.brand,priceStored:0,campaignStored:0,priceUrls:0,campaignUrls:0}))));
 return {checkedAt:new Date().toISOString(),results,priceStored:results.reduce((n,r)=>n+r.priceStored,0),campaignStored:results.reduce((n,r)=>n+r.campaignStored,0)};
}
