import {describe,expect,it} from "vitest";
import {listingFingerprint} from "@/lib/marketplace/store";
import {listingSchema} from "@/lib/marketplace/validation";

describe("trusted marketplace",()=>{
  it("treats the same listing as duplicate even when only the asking price changes",()=>{
    const base={kind:"vehicle",title:"2024 örnek araç ilanı",city:"Ankara",district:"Çankaya",attributes:{brand:"Test",model:"Model",modelYear:2024},images:["data:image/webp;base64,AAAA"]};
    expect(listingFingerprint({...base,price:1_000_000})).toBe(listingFingerprint({...base,price:900_000}));
  });
  it("rejects listing coordinates outside the supported Turkey map bounds",()=>{
    const parsed=listingSchema.safeParse({kind:"vehicle",submit:false,title:"Örnek güvenli araç ilanı",description:"Bu açıklama test için yeterince uzun ve herhangi bir ödeme talebi içermiyor.",price:1_000_000,city:"Ankara",district:"Çankaya",neighborhood:"",latitude:50,longitude:32.8,sellerRole:"owner",contactMode:"secure_request",images:[],attributes:{brand:"Test",model:"Model",trim:"",modelYear:2024,mileage:10000,fuel:"Benzin",transmission:"Otomatik"}});
    expect(parsed.success).toBe(false);
  });
});
