import { describe, expect, it } from "vitest";
import { channelTools } from "@/lib/channel-tools";
import { automotiveExplorer, discountExplorer, propertyExplorer } from "@/lib/tool-explorer-data";
import type { EvCandidate } from "@/lib/ev-ai/analysis";

const checkedAt = "2026-09-29T09:00:00.000Z";
describe("public tool explorers", () => {
  it("keeps the six public channel destinations unique and excludes unrelated tools", () => {
    expect(channelTools.map(item => item.slug)).toEqual(["haber-ai","finans-ai","puan-ai","indirim-ai","araba-ai","ev-ai"]);
    expect(new Set(channelTools.map(item => item.channelUrl)).size).toBe(6);
    expect(channelTools.every(item => /^https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9]+$/.test(item.channelUrl))).toBe(true);
  });
  it("excludes expired, future, undated and unsafe automotive campaigns", () => {
    const campaign = { brand:"Test", title:"Current", summary:"Conditions", sourceUrl:"https://example.com/offer", fetchedAt:checkedAt, validFrom:"2026-09-01T00:00:00Z", validUntil:"2026-09-30T20:59:59Z" };
    const data = automotiveExplorer({checkedAt,prices:[],campaigns:[
      campaign,
      {...campaign,title:"Expired",validUntil:"2026-09-28T20:59:59Z"},
      {...campaign,title:"Future",validFrom:"2026-10-01T00:00:00Z"},
      {...campaign,title:"Undated",validUntil:null},
      {...campaign,title:"Unsafe",sourceUrl:"javascript:alert(1)"},
    ]},new Date(checkedAt));
    expect(data.items.map(item => item.title)).toEqual(["Current"]);
    expect(data.items[0].price).toBeNull();
    expect(data.stats[1].value).toBe(1);
  });
  it("keeps insufficient history separate from period lows", () => {
    const product = {productKey:"p1",productName:"Product",merchantName:"Store",sourceUrl:"https://example.com/product",currentPrice:100,currency:"TRY",windowDays:30,windowLow:100,windowHigh:120,median:110,dropFromHighPct:16.7,observedDays:3,coverageDays:3,fetchedAt:checkedAt,eligibleWindowDays:3};
    const data = discountExplorer({checkedAt,lows:{"30":[],"90":[],"360":[]},provisional:[product],productCount:1,observationCount:3});
    expect(data.items[0].category).toBe("Takip dönemi");
    expect(data.items[0].notice).toContain("yeterli geçmiş yok");
    expect(data.stats[2].value).toBe(0);
  });
  it("does not display auction estimates or comparison reasons as market valuations", () => {
    const auction: EvCandidate = {listingKey:"auction",sourceId:"public",sourceName:"Public source",sourceKind:"PUBLIC",listingType:"SALE",propertyType:"HOUSE",title:"Auction",city:"Ankara",district:"Çankaya",rooms:"2+1",grossM2:100,price:1000000,pricePerM2:10000,isPublicAuction:true,sourceUrl:"https://example.com/auction",imageUrl:null,publishedAt:checkedAt,fetchedAt:checkedAt,score:80,localMedianPerM2:20000,valueDeltaPct:50,priceDropPct:null,reasons:["Yerel m² medyanının %50 altında","Kamu/icra kaynağında güncel taşınmaz ilanı"]};
    const data = propertyExplorer({checkedAt,candidateCount:1,observations:1,items:[auction]});
    expect(data.items[0].category).toBe("Kamu / ihale");
    expect(data.items[0].priceLabel).toBe("Muhammen / başlangıç bedeli");
    expect(data.items[0].notice).toContain("piyasa değeri değildir");
    expect(data.items[0].description).not.toContain("medyan");
    expect(data.items[0].facts.find(f => f.label==="Yerel m² medyanı")?.value).toBe("İhalelere uygulanmaz");
  });
});
