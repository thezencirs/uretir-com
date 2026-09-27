import {describe,expect,it} from "vitest";
import {parseVehicleCampaignPage,parseVehiclePricePage} from "@/lib/araba-ai/collector";
import type {AutomotiveSource} from "@/lib/araba-ai/sources";
const source:AutomotiveSource={id:"test",brand:"TestAuto",origins:["https://auto.example.com"],pricePatterns:[/fiyat/],campaignPatterns:[/kampanya/]};
describe("ArabaAI parsing",()=>{
 it("reads model prices from official price tables",()=>{
  const html="<table><tr><td>Model X Premium 1.5 Hybrid</td><td>2.325.000 TL</td></tr></table>";
  const rows=parseVehiclePricePage(html,"https://auto.example.com/fiyat",source);
  expect(rows[0]?.model).toContain("Model X");expect(rows[0]?.listPrice).toBe(2325000);
 });
 it("extracts dated finance campaigns",()=>{
  const html="<h2>Model X Eylül Kampanyası</h2><p>500.000 TL kredi 12 ay %0 faiz. 01.09.2026 - 30.09.2026 tarihleri arasında geçerlidir.</p>";
  const rows=parseVehicleCampaignPage(html,"https://auto.example.com/kampanya",source);
  expect(rows[0]?.validUntil?.toISOString()).toContain("2026-09-30");
 });
});
