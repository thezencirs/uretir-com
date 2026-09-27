import {describe,expect,it} from "vitest";
import {parseProductPage} from "@/lib/indirim-ai/collector";
import type {CommerceSource} from "@/lib/indirim-ai/sources";
const source:CommerceSource={id:"test",name:"Test Market",origin:"https://shop.example.com",trustScore:90,productPatterns:[/product/]};
describe("IndirimAI product parsing",()=>{
 it("reads Product JSON-LD and normalises TRY",()=>{
  const html='<script type="application/ld+json">{"@type":"Product","name":"Acme Kulaklık X","brand":{"name":"Acme"},"gtin13":"8691234567890","offers":{"@type":"Offer","price":"1499.90","priceCurrency":"TRY","availability":"https://schema.org/InStock"}}</script>';
  const item=parseProductPage(html,"https://shop.example.com/product/1",source);
  expect(item?.productKey).toBe("gtin:8691234567890");expect(item?.amount).toBe(1499.9);expect(item?.availability).toBe("IN_STOCK");
 });
});
