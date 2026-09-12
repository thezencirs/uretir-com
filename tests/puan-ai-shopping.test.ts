import {describe,it,expect} from "vitest";
import {campaignFixture} from "./support/puan-ai-fixture";
import {calculateCampaignBenefit,evaluateCampaigns} from "@/lib/puan-ai/rule-engine";
const now=new Date("2026-07-25T09:00:00Z");
describe("Shopping comparison boundaries",()=>{
 it("does not return a market offer for fuel when fuel coverage is absent",()=>{expect(evaluateCampaigns([campaignFixture()],"Worldcard 1500 TL akaryakıt",now)).toHaveLength(0);});
 it("does not extend credit offers to debit cards",()=>{expect(evaluateCampaigns([campaignFixture()],"World banka kartı market 1500 TL",now)).toHaveLength(0);});
 it("does not award a multi-purchase reward for one purchase",()=>{const c=campaignFixture();c.rules.push({id:"count",kind:"REQUIRED_PURCHASE_COUNT",operator:"GTE",numericValue:4,textValue:null,unit:null,description:"Dört farklı gün",priority:0});expect(calculateCampaignBenefit(c,6000).amount).toBe(0);});
 it("ranks actual reward at the given amount above a larger ceiling",()=>{const a=campaignFixture({slug:"a",tiers:[{id:"a1",minimumSpend:1000,maximumSpend:9999,rewardAmount:100,description:"",priority:0},{id:"a2",minimumSpend:10000,maximumSpend:null,rewardAmount:1000,description:"",priority:1}]});const b=campaignFixture({slug:"b",tiers:[{id:"b1",minimumSpend:1000,maximumSpend:null,rewardAmount:150,description:"",priority:0}]});expect(evaluateCampaigns([a,b],"market 1500 TL",now)[0].slug).toBe("b");});
});
