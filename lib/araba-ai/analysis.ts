import {getPrisma} from "@/lib/puan-ai/db";
export type VehiclePriceItem={brand:string;model:string;listPrice:number;campaignPrice:number|null;effectivePrice:number;previousPrice:number|null;changePct:number|null;sourceUrl:string;fetchedAt:string};
export async function getAutomotiveSnapshot(now=new Date()){
 const prisma=getPrisma(),since=new Date(now.getTime()-30*86_400_000);
 const prices=await prisma.vehiclePriceObservation.findMany({where:{fetchedAt:{gte:since}},orderBy:{fetchedAt:"desc"},take:12_000});
 const groups=new Map<string,typeof prices>();
 for(const row of prices){const key=row.brand+"|"+row.model;const list=groups.get(key)??[];list.push(row);groups.set(key,list);}
 const latest:VehiclePriceItem[]=[];
 for(const history of groups.values()){
   const current=history[0],previous=history.find(r=>r.fingerprint!==current.fingerprint);
   const effective=current.campaignPrice?.toNumber()??current.listPrice.toNumber(),prev=previous?(previous.campaignPrice?.toNumber()??previous.listPrice.toNumber()):null;
   latest.push({brand:current.brand,model:current.model,listPrice:current.listPrice.toNumber(),campaignPrice:current.campaignPrice?.toNumber()??null,effectivePrice:effective,previousPrice:prev,changePct:prev&&prev>0?(effective/prev-1)*100:null,sourceUrl:current.sourceUrl,fetchedAt:current.fetchedAt.toISOString()});
 }
 latest.sort((a,b)=>a.brand.localeCompare(b.brand,"tr")||a.effectivePrice-b.effectivePrice);
 const campaigns=await prisma.vehicleCampaignObservation.findMany({where:{active:true,OR:[{validUntil:null},{validUntil:{gte:now}}]},orderBy:[{validUntil:"asc"},{fetchedAt:"desc"}],take:300});
 const dedup=new Map<string,(typeof campaigns)[number]>();
 for(const c of campaigns){const k=c.brand+"|"+c.title;if(!dedup.has(k))dedup.set(k,c);}
 return {checkedAt:now.toISOString(),prices:latest,campaigns:[...dedup.values()].map(c=>({brand:c.brand,title:c.title,summary:c.summary,validFrom:c.validFrom?.toISOString()??null,validUntil:c.validUntil?.toISOString()??null,sourceUrl:c.sourceUrl,fetchedAt:c.fetchedAt.toISOString()}))};
}
