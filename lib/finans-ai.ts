import {XMLParser} from "fast-xml-parser";
import {getMarketQuotes} from "./haber-ai/markets";
export const whatsappChannel = "https://whatsapp.com/channel/0029VbDIS6B4inoiXI8jeE05";
export const categories=["Tümü","Borsa İstanbul","Dövizler","Metaller","Kripto paralar","Emtialar"] as const;
export type Market={id:string;name:string;category:string;price:number|null;unit:string;change:number|null;asOf:string;source:string;url:string;note:string;history:number[]};
export type FinanceSnapshot={items:Market[];checkedAt:string};
const assets=[
["XU100.IS","BIST 100","Borsa İstanbul","puan"],["XU030.IS","BIST 30","Borsa İstanbul","puan"],
["THYAO.IS","Türk Hava Yolları","Borsa İstanbul","TL"],["ASELS.IS","Aselsan","Borsa İstanbul","TL"],["TUPRS.IS","Tüpraş","Borsa İstanbul","TL"],["GARAN.IS","Garanti BBVA","Borsa İstanbul","TL"],["KCHOL.IS","Koç Holding","Borsa İstanbul","TL"],
["BTC-USD","Bitcoin","Kripto paralar","USD"],["ETH-USD","Ethereum","Kripto paralar","USD"],["SOL-USD","Solana","Kripto paralar","USD"],["XRP-USD","XRP","Kripto paralar","USD"],
["SI=F","Gümüş vadeli","Metaller","USD / troy ons"],["PL=F","Platin vadeli","Metaller","USD / troy ons"],["HG=F","Bakır vadeli","Metaller","USD / libre"],
["CL=F","WTI petrol vadeli","Emtialar","USD / varil"],["NG=F","Doğal gaz vadeli","Emtialar","USD / MMBtu"],["ZW=F","Buğday vadeli","Emtialar","ABD senti / bushel"],["ZC=F","Mısır vadeli","Emtialar","ABD senti / bushel"]
];
const positive=(n:unknown):n is number=>typeof n==="number"&&Number.isFinite(n)&&n>0;
async function yahoo([id,name,category,unit]:string[]):Promise<Market>{
 const item:Market={id,name,category,unit,price:null,change:null,asOf:"",source:"Yahoo Finance",url:"https://finance.yahoo.com/quote/"+encodeURIComponent(id)+"/",note:category==="Kripto paralar"?"USD referans fiyatı · günlük değişim":"Gecikmeli olabilir · son işlem / kapanış",history:[]};
 try{
 const r=await fetch("https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(id)+"?range=1mo&interval=1d",{signal:AbortSignal.timeout(8000),next:{revalidate:300}});
 if(!r.ok)throw Error();const d=(await r.json()).chart?.result?.[0],m=d?.meta;
 if(!positive(m?.regularMarketPrice)||!positive(m?.regularMarketTime))return item;
 item.price=m.regularMarketPrice;item.asOf=new Date(m.regularMarketTime*1000).toISOString();
 const closes=d.indicators?.quote?.[0]?.close??[];
 item.history=closes.filter(positive);
 const prev=item.history.at(-2);if(prev&&item.price!==null)item.change=(item.price/prev-1)*100;
 if(id.endsWith("=F"))item.note+=" · vadeli kontrat";
 }catch{/* Each failed provider leaves only this instrument unavailable. */}
 return item;
}
export async function getFinanceSnapshot():Promise<FinanceSnapshot>{
 const items:Market[]=[];
 const [base,fx]=await Promise.allSettled([getMarketQuotes(),fetch("https://www.tcmb.gov.tr/kurlar/today.xml",{signal:AbortSignal.timeout(8000),next:{revalidate:300}}).then(async r=>{if(!r.ok)throw Error();return new XMLParser({ignoreAttributes:false}).parse(await r.text()).Tarih_Date;})]);
 if(base.status==="fulfilled")base.value.quotes.forEach((q,i)=>items.push({id:["USD","EUR","GRAM","BRENT"][i],name:q.label,category:i<2?"Dövizler":i===2?"Metaller":"Emtialar",price:q.value,unit:q.unit,change:null,asOf:q.asOf,source:q.source,url:q.url,note:q.note??"",history:[]}));
 else ["USD / TRY","EUR / TRY","Gram altın","Brent vadeli"].forEach((name,i)=>items.push({id:["USD","EUR","GRAM","BRENT"][i],name,category:i<2?"Dövizler":i===2?"Metaller":"Emtialar",price:null,unit:"",change:null,asOf:"",source:"Kaynak",url:"https://www.tcmb.gov.tr",note:"Kaynağa ulaşılamadı",history:[]}));
 for(const [id,name]of [["GBP","İngiliz sterlini"],["CHF","İsviçre frangı"],["JPY","Japon yeni"],["CAD","Kanada doları"],["AUD","Avustralya doları"],["SAR","Suudi Arabistan riyali"]]){
 const d=fx.status==="fulfilled"?fx.value:null;const c=Array.isArray(d?.Currency)?d.Currency.find((v:Record<string,unknown>)=>v["@_Kod"]===id):null;const rate=Number(c?.ForexSelling)/Number(c?.Unit);
 items.push({id,name:name+" / TRY",category:"Dövizler",price:positive(rate)?rate:null,unit:"TL",change:null,asOf:String(d?.["@_Tarih"]??""),source:"TCMB",url:"https://www.tcmb.gov.tr/kurlar/today.xml",note:"1 birim için gösterge döviz satış kuru",history:[]});
 }
 for(let i=0;i<assets.length;i+=6)items.push(...await Promise.all(assets.slice(i,i+6).map(yahoo)));
 return {items,checkedAt:new Date().toISOString()};
}
