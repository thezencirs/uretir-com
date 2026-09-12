import {describe,it,expect} from "vitest";
import {startupSchema,postSchema,registration,commentSchema} from "../lib/members/validation";
describe("Üretir ID publication input boundaries",()=>{
 const startup={name:"Atölye",cityCode:"06",product:"Küçük atölyeler için üretim takibi",description:"Atölyelerin günlük üretim kayıtlarını anlaşılır biçimde takip eden bir ürün.",website:"https://example.com",stage:"Prototip"};
 it("rejects executable URLs and non-province codes",()=>{expect(startupSchema.safeParse({...startup,website:"javascript:alert(1)"}).success).toBe(false);expect(startupSchema.safeParse({...startup,cityCode:"82"}).success).toBe(false);});
 it("does not accept self-assigned financial values or verification",()=>{const parsed=startupSchema.parse({...startup,publicFinancials:{marketCapTRY:999},verified:true});expect(parsed).not.toHaveProperty("publicFinancials");expect(parsed).not.toHaveProperty("verified");});
 it("requires explicit publication terms and a long password",()=>{expect(registration.safeParse({handle:"kurucu",password:"short",displayName:"Kurucu",consent:true}).success).toBe(false);expect(registration.safeParse({handle:"kurucu",password:"long-password-123",displayName:"Kurucu",consent:false}).success).toBe(false);});
 it("bounds published text and requires a meaningful post body",()=>{expect(postSchema.safeParse({title:"Yeni fikrim",body:"kısa",topic:"Ürün fikri"}).success).toBe(false);expect(commentSchema.safeParse({body:"a".repeat(2001)}).success).toBe(false);});
});
