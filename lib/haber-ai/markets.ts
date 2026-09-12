import {XMLParser} from "fast-xml-parser";
export type Quote={label:string;value:number|null;unit:string;source:string;url:string;asOf:string;note?:string};
const valid=(n:unknown)=>typeof n==="number"&&Number.isFinite(n)&&n>0?n:null;
async function fetchData(url:string){const r=await fetch(url,{signal:AbortSignal.timeout(8000),next:{revalidate:300}});if(!r.ok)throw Error("Kaynak yanıt vermedi");return r;}
export async function getMarketQuotes(){
 const quotes:Quote[]=[
 {label:"USD / TRY",value:null,unit:"TL",source:"TCMB",url:"https://www.tcmb.gov.tr/kurlar/today.xml",asOf:"",note:"Gösterge döviz satış kuru"},
 {label:"EUR / TRY",value:null,unit:"TL",source:"TCMB",url:"https://www.tcmb.gov.tr/kurlar/today.xml",asOf:"",note:"Gösterge döviz satış kuru"},
 {label:"Gram altın",value:null,unit:"TL / gram",source:"Gold API + TCMB",url:"https://gold-api.com",asOf:"",note:"24 ayar teorik değer; perakende alış/satış fiyatı değildir"},
 {label:"Brent vadeli",value:null,unit:"USD / varil",source:"Yahoo Finance",url:"https://finance.yahoo.com/quote/BZ=F/",asOf:"",note:"Vadeli kontrat referansı; gecikmeli olabilir"}];
 const results=await Promise.allSettled([fetchData(quotes[0].url).then(r=>r.text()).then(xml=>new XMLParser({ignoreAttributes:false}).parse(xml).Tarih_Date),fetchData("https://api.gold-api.com/price/XAU").then(r=>r.json()),fetchData("https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?range=1d&interval=1m").then(r=>r.json())]);
 if(results[0].status==="fulfilled"){
 const d=results[0].value;
 const entries=Array.isArray(d?.Currency)?d.Currency:[];for(const [i,code]of ["USD","EUR"].entries()){quotes[i].value=valid(Number(entries.find((c:Record<string,unknown>)=>c["@_Kod"]===code)?.ForexSelling));quotes[i].asOf=String(d?.["@_Tarih"]??"");}
 }
 if(results[1].status==="fulfilled"){const d=results[1].value;const price=valid(d?.price);if(price&&quotes[0].value){quotes[2].value=price*quotes[0].value/31.1034768;quotes[2].asOf=String(d?.updatedAt??"");quotes[2].note+=" · kur tarihi "+quotes[0].asOf;}}
 if(results[2].status==="fulfilled"){const d=results[2].value?.chart?.result?.[0]?.meta;quotes[3].value=valid(d?.regularMarketPrice);if(d?.regularMarketTime)quotes[3].asOf=new Date(d.regularMarketTime*1000).toISOString();}
 return {quotes};
}
