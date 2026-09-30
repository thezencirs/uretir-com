import {createHash} from "node:crypto";
import {getPrisma} from "@/lib/puan-ai/db";
import {discoverPublicUrls,fetchPublicText,jsonLdObjects,parseMoney} from "@/lib/public-source-crawler";
import {commerceSources,type CommerceSource} from "./sources";

const AGENT="Uretir-IndirimAI/1.0 (+https://www.uretir.com/indirim-ai)";
const dayMs=86_400_000;

function text(v:unknown){return typeof v==="string"?v.trim():"";}
function normalizeName(v:string){return v.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[^a-z0-9çğıöşü]+/gi," ").replace(/\s+/g," ").trim();}
function hash(v:string){return createHash("sha256").update(v).digest("hex");}
function brandName(v:unknown){if(typeof v==="string")return v;if(v&&typeof v==="object")return text((v as Record<string,unknown>).name);return "";}
function imageUrl(v:unknown,base:string){
  const raw=typeof v==="string"?v:Array.isArray(v)?v.find(x=>typeof x==="string"):v&&typeof v==="object"?((v as Record<string,unknown>).url??(v as Record<string,unknown>).contentUrl):null;
  if(typeof raw!=="string"||!raw.trim())return null;
  try{const u=new URL(raw,base);return u.protocol==="https:"&&!u.username&&!u.password?u.toString():null;}catch{return null;}
}

function productNodes(html:string){
  return jsonLdObjects(html).filter(o=>{
    const type=o["@type"]; return type==="Product"||(Array.isArray(type)&&type.includes("Product"));
  });
}

function offerFrom(node:Record<string,unknown>){
  const raw=node.offers;
  const offers=(Array.isArray(raw)?raw:[raw]).filter((v):v is Record<string,unknown>=>Boolean(v&&typeof v==="object"));
  const candidates=offers.map(o=>({price:parseMoney(o.price??o.lowPrice),currency:text(o.priceCurrency)||"TRY",availability:text(o.availability)})).filter(o=>o.price!==null);
  return candidates.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity))[0]??null;
}

export function parseProductPage(html:string,url:string,source:CommerceSource){
  for(const node of productNodes(html)){
    const offer=offerFrom(node); if(!offer?.price)continue;
    const name=text(node.name); if(name.length<3)continue;
    const brand=brandName(node.brand),gtin=text(node.gtin13??node.gtin14??node.gtin12??node.gtin);
    const key=gtin?"gtin:"+gtin.replace(/\D/g,""):"name:"+hash(normalizeName((brand?brand+" ":"")+name)).slice(0,32);
    const availability:"IN_STOCK"|"OUT_OF_STOCK"|"UNKNOWN"=/outofstock|soldout/i.test(offer.availability)?"OUT_OF_STOCK":/instock|limitedavailability/i.test(offer.availability)?"IN_STOCK":"UNKNOWN";
    return {productKey:key,productName:name,amount:offer.price,currency:/TRY|TRL/i.test(offer.currency)?"TRY":offer.currency||"TRY",availability,sourceUrl:url,imageUrl:imageUrl(node.image,url),sourceName:source.name,trustScore:source.trustScore};
  }
  const title=html.match(/<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1]?.trim();
  const amount=parseMoney(html.match(/<meta[^>]+(?:property|itemprop)=["'](?:product:price:amount|price)["'][^>]+content=["']([^"']+)/i)?.[1]);
  const fallbackImage=imageUrl(html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1],url);
  if(title&&amount){
    return {productKey:"name:"+hash(normalizeName(title)).slice(0,32),productName:title,amount,currency:"TRY",availability:"UNKNOWN" as const,sourceUrl:url,imageUrl:fallbackImage,sourceName:source.name,trustScore:source.trustScore};
  }
  return null;
}

function productLinksFromHtml(html:string,baseUrl:string,source:CommerceSource){
  const base=new URL(baseUrl),urls=new Set<string>();
  const rawLinks=[
    ...[...html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["']/gi)].map(match=>match[1]),
    ...[...html.matchAll(/["']url["']\s*:\s*["'](https?:\/\/[^"']+)["']/gi)].map(match=>match[1]),
  ];
  for(const raw of rawLinks){
    try{
      const u=new URL(raw.replaceAll("\\/","/").replace(/&amp;/g,"&"),base);
      u.hash="";
      if(u.protocol!=="https:"||u.origin!==base.origin||u.username||u.password)continue;
      if(source.productPatterns.some(pattern=>pattern.test(u.pathname+u.search)))urls.add(u.toString());
    }catch{/* Ignore invalid links. */}
  }
  return [...urls];
}

async function discoverSourceProducts(source:CommerceSource){
  const sitemapUrls=await discoverPublicUrls(source.origin,source.productPatterns,{agent:AGENT,maxUrls:40,sitemapCandidates:source.sitemapCandidates});
  if(sitemapUrls.length)return sitemapUrls;
  const discovered=new Set<string>();
  for(const seed of [source.origin,...(source.seedUrls??[])]){
    try{
      const page=await fetchPublicText(seed,{agent:AGENT,maxBytes:2_000_000});
      for(const url of productLinksFromHtml(page.text,page.url,source)){
        discovered.add(url);
        if(discovered.size>=40)return [...discovered];
      }
    }catch{/* Try the next official seed. */}
  }
  return [...discovered];
}

async function collectSource(source:CommerceSource,pagesPerSource:number){
  const prisma=getPrisma();
  const urls=await discoverSourceProducts(source);
  if(!urls.length)return {source:source.id,discovered:0,stored:0,skipped:0};
  const dayIndex=Math.floor(Date.now()/dayMs),start=(dayIndex*pagesPerSource)%urls.length;
  const chosen=Array.from({length:Math.min(pagesPerSource,urls.length)},(_,i)=>urls[(start+i)%urls.length]);
  let stored=0,skipped=0;
  for(const url of chosen){
    try{
      const page=await fetchPublicText(url,{agent:AGENT});
      const item=parseProductPage(page.text,page.url,source); if(!item){skipped++;continue;}
      const latest=await prisma.priceObservation.findFirst({where:{productKey:item.productKey,sourceUrl:item.sourceUrl},orderBy:{fetchedAt:"desc"}});
      if(latest&&latest.amount.toNumber()===item.amount&&Date.now()-latest.fetchedAt.getTime()<12*3600_000){skipped++;continue;}
      const fingerprint=hash(JSON.stringify([item.productKey,item.amount,item.currency,item.sourceUrl]));
      await prisma.priceObservation.create({data:{
        productKey:item.productKey,productName:item.productName,merchantName:item.sourceName,amount:item.amount,currency:item.currency,
        shippingAmount:null,availability:item.availability,sourceUrl:item.sourceUrl,imageUrl:item.imageUrl,sourceName:item.sourceName,sourceKind:"TRUSTED_MARKETPLACE",
        trustScore:item.trustScore,fetchedAt:new Date(),lastVerifiedAt:new Date(),fingerprint
      }});
      stored++;
    }catch{skipped++;}
  }
  return {source:source.id,discovered:urls.length,stored,skipped};
}

export async function collectTrustedCommercePrices(sourceBatch=4,pagesPerSource=4){
  const slot=Math.floor(Date.now()/(6*3600_000)),offset=(slot*sourceBatch)%commerceSources.length;
  const selected=Array.from({length:Math.min(sourceBatch,commerceSources.length)},(_,i)=>commerceSources[(offset+i)%commerceSources.length]);
  const results=await Promise.all(selected.map(s=>collectSource(s,pagesPerSource).catch(()=>({source:s.id,discovered:0,stored:0,skipped:pagesPerSource}))));
  return {checkedAt:new Date().toISOString(),sources:results,stored:results.reduce((n,r)=>n+r.stored,0)};
}
