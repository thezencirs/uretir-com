import { createHash } from "node:crypto";
import { getPrisma } from "./db";
import { checkRobotsPolicy } from "./robots-policy";

// Only publisher-owned, reviewed entry points; detail records remain in review.
export const discoverySources = [
 {name:"Bankkart",url:"https://www.bankkart.com.tr/kampanyalar"},
 {name:"Maximum",url:"https://www.maximum.com.tr/kampanyalar"},
 {name:"Bonus",url:"https://www.bonus.com.tr/kampanyalar"},
];
export async function discoverMonthlyCampaigns(now=new Date()) {
 const month=now.toLocaleDateString("sv-SE",{timeZone:"Europe/Istanbul"}).slice(0,7);
 const source=discoverySources[now.getUTCDate()%discoverySources.length];
 const base=new URL(source.url);
 const policy=await checkRobotsPolicy(base);
 if(!policy.allowed)return {source:source.name,status:"blocked",queued:0};
 const response=await fetch(base,{redirect:"error",signal:AbortSignal.timeout(8000),headers:{"User-Agent":"PuanAI-SourceVerifier/2.0"}});
 if(!response.ok)throw Error("Kampanya dizinine erişilemedi: "+source.name);
 const html=(await response.text()).slice(0,2000000);
 const urls=new Set<string>();
 for(const match of html.matchAll(/href=["']([^"']+)["']/gi)){
  try{const u=new URL(match[1].replace(/&amp;/g,"&"),base);if(u.origin!==base.origin||!u.pathname.startsWith("/kampanyalar/")||u.username||u.password)continue;u.hash="";u.search="";urls.add(u.href);}catch{/* Ignore invalid publisher links. */}
 }
 const prisma=getPrisma();let queued=0;
 for(const url of [...urls].slice(0,80)){
  const providerMessageId="discovery:"+month+":"+createHash("sha256").update(url).digest("hex");
  const result=await prisma.campaignSubmission.createMany({skipDuplicates:true,data:[{providerMessageId,sourceUrl:url,rawText:url,receivedAt:now,status:"RECEIVED",channelId:"official-monthly-discovery"}]});queued+=result.count;
 }
 return {source:source.name,status:"queued_for_verification",month,queued};
}
