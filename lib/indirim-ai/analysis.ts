import {getPrisma} from "@/lib/puan-ai/db";

const DAY=86_400_000;
export type PriceLowItem={
  productKey:string;productName:string;merchantName:string;sourceUrl:string;imageUrl:string|null;
  currentPrice:number;currency:string;windowDays:number;windowLow:number;windowHigh:number;median:number;
  dropFromHighPct:number;observedDays:number;coverageDays:number;fetchedAt:string
};
export type PriceLowReport={checkedAt:string;lows:Record<string,PriceLowItem[]>;provisional:Array<PriceLowItem&{eligibleWindowDays:number}>;observationCount:number;productCount:number};
export type RankedPriceDeal={rank:1|2|3;item:PriceLowItem;label:string;qualified:boolean};
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
  const prisma=getPrisma(),since=new Date(now.getTime()-361*DAY);
  const rows=await prisma.priceObservation.findMany({where:{fetchedAt:{gte:since},trustScore:{gte:70},availability:{not:"OUT_OF_STOCK"}},orderBy:{fetchedAt:"desc"},take:25_000});
  const groups=new Map<string,typeof rows>();
  for(const row of rows){const list=groups.get(row.productKey)??[];list.push(row);groups.set(row.productKey,list);}
  const windows=[30,90,360] as const;
  const lows:Record<string,PriceLowItem[]>={"30":[], "90":[], "360":[]};
  const provisional:Array<PriceLowItem&{eligibleWindowDays:number}>=[];
  for(const [productKey,history] of groups){
    const freshestByMerchant=new Map<string,(typeof history)[number]>();
    for(const r of history){if(!freshestByMerchant.has(r.merchantName))freshestByMerchant.set(r.merchantName,r);}
    const current=[...freshestByMerchant.values()].filter(r=>now.getTime()-r.fetchedAt.getTime()<=48*3600_000).sort((a,b)=>a.amount.toNumber()-b.amount.toNumber())[0];
    if(!current)continue;
    const earliest=history.at(-1)!,coverageDays=Math.floor((now.getTime()-earliest.fetchedAt.getTime())/DAY)+1;
    for(const windowDays of windows){
      const cut=now.getTime()-windowDays*DAY,windowRows=history.filter(r=>r.fetchedAt.getTime()>=cut);
      if(!windowRows.length)continue;
      const values=windowRows.map(r=>r.amount.toNumber()).filter(v=>Number.isFinite(v)&&v>0);
      const low=Math.min(...values),high=Math.max(...values),currentPrice=current.amount.toNumber();
      const observedDays=new Set(windowRows.map(r=>dayKey(r.fetchedAt))).size;
      const item:PriceLowItem={productKey,productName:current.productName,merchantName:current.merchantName,sourceUrl:current.sourceUrl,imageUrl:current.imageUrl,currentPrice,currency:current.currency,windowDays,windowLow:low,windowHigh:high,median:median(values),dropFromHighPct:high>0?Math.max(0,(high-currentPrice)/high*100):0,observedDays,coverageDays,fetchedAt:current.fetchedAt.toISOString()};
      const eligible=coverageDays>=windowDays&&observedDays>=Math.max(5,Math.ceil(windowDays/15));
      if(eligible&&currentPrice<=low*1.001)lows[String(windowDays)].push(item);
      if(windowDays===30&&!eligible&&currentPrice<=low*1.001)provisional.push({...item,eligibleWindowDays:coverageDays});
    }
  }
  for(const key of Object.keys(lows))lows[key].sort((a,b)=>b.dropFromHighPct-a.dropFromHighPct||a.currentPrice-b.currentPrice);
  provisional.sort((a,b)=>b.coverageDays-a.coverageDays||b.dropFromHighPct-a.dropFromHighPct||a.currentPrice-b.currentPrice);
  return {checkedAt:now.toISOString(),lows,provisional:provisional.slice(0,20),observationCount:rows.length,productCount:groups.size};
}
