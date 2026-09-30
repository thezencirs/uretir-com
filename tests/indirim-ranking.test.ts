import {describe,expect,it} from "vitest";
import {rankPriceDeals,type PriceLowItem,type PriceLowReport} from "@/lib/indirim-ai/analysis";
const item=(key:string,windowDays:number,drop:number,coverageDays=windowDays):PriceLowItem=>({productKey:key,productName:key,merchantName:"Mağaza",sourceUrl:"https://example.com/"+key,imageUrl:null,currentPrice:100,currency:"TRY",windowDays,windowLow:100,windowHigh:100/(1-drop/100),median:110,dropFromHighPct:drop,observedDays:10,coverageDays,fetchedAt:"2026-09-30T06:00:00.000Z"});
describe("IndirimAI ranking",()=>{
  it("puts qualified long-window lows ahead of provisional tracking items",()=>{
    const report:PriceLowReport={checkedAt:"2026-09-30T06:00:00.000Z",lows:{"30":[item("thirty",30,40)],"90":[item("ninety",90,5)],"360":[]},provisional:[{...item("new",30,80,8),eligibleWindowDays:8}],observationCount:20,productCount:3};
    const ranked=rankPriceDeals(report);
    expect(ranked.map(x=>x.item.productKey)).toEqual(["ninety","thirty","new"]);
    expect(ranked.map(x=>x.rank)).toEqual([1,2,3]);
    expect(ranked[2].qualified).toBe(false);
  });
  it("deduplicates the same product across multiple qualified windows",()=>{
    const shared=item("same",90,20);
    const report:PriceLowReport={checkedAt:"2026-09-30T06:00:00.000Z",lows:{"30":[{...shared,windowDays:30}],"90":[shared],"360":[]},provisional:[],observationCount:10,productCount:1};
    expect(rankPriceDeals(report)).toHaveLength(1);
    expect(rankPriceDeals(report)[0].label).toBe("90 gün dibi");
  });
});
