import { createHash } from "node:crypto";
import { getPrisma } from "./db";
import { checkRobotsPolicy } from "./robots-policy";

type DiscoverySource = {
  name: string;
  url: string;
  detailPathPrefixes: string[];
};

// Publisher-owned entry points only. Detail URLs stay in the normal verification/review pipeline.
export const discoverySources: DiscoverySource[] = [
  {name:"Bankkart",url:"https://www.bankkart.com.tr/kampanyalar",detailPathPrefixes:["/kampanyalar/"]},
  {name:"Maximum",url:"https://www.maximum.com.tr/kampanyalar",detailPathPrefixes:["/kampanyalar/"]},
  {name:"Bonus",url:"https://www.bonus.com.tr/kampanyalar",detailPathPrefixes:["/kampanyalar/"]},
  {name:"Worldcard",url:"https://www.worldcard.com.tr/kampanyalar",detailPathPrefixes:["/kampanyalar/"]},
  {name:"Axess",url:"https://www.axess.com.tr/axess/kampanyalar",detailPathPrefixes:["/axess/kampanyalar/"]},
  {name:"Paraf",url:"https://www.paraf.com.tr/tr/kampanyalar.html",detailPathPrefixes:["/tr/kampanyalar/","/content/parafcard/tr/kampanyalar/"]},
  {name:"QNB",url:"https://www.qnb.com.tr/kampanyalar",detailPathPrefixes:["/kampanyalar/"]},
  {name:"HSBC",url:"https://www.hsbc.com.tr/kartlar-ve-krediler/kampanyalar/guncel-kampanyalar",detailPathPrefixes:["/kartlar-ve-krediler/kampanyalar/"]},
];

export function isCampaignDetailUrl(source: DiscoverySource, candidate: string) {
  try {
    const base = new URL(source.url);
    const url = new URL(candidate, base);
    return url.protocol === "https:"
      && url.origin === base.origin
      && !url.username
      && !url.password
      && source.detailPathPrefixes.some((prefix) => url.pathname.startsWith(prefix));
  } catch {
    return false;
  }
}

export async function discoverMonthlyCampaigns(now=new Date()) {
  const month=now.toLocaleDateString("sv-SE",{timeZone:"Europe/Istanbul"}).slice(0,7);
  const sixHourSlot=Math.floor(now.getTime()/(6*3_600_000));
  const source=discoverySources[sixHourSlot%discoverySources.length];
  const base=new URL(source.url);
  const policy=await checkRobotsPolicy(base);
  if(!policy.allowed)return {source:source.name,status:"blocked",queued:0};
  const response=await fetch(base,{redirect:"error",signal:AbortSignal.timeout(8000),headers:{"User-Agent":"PuanAI-SourceVerifier/2.0"}});
  if(!response.ok)throw Error("Kampanya dizinine erişilemedi: "+source.name);
  const html=(await response.text()).slice(0,2000000);
  const urls=new Set<string>();
  for(const match of html.matchAll(/href=["']([^"']+)["']/gi)){
    try{
      const raw=match[1].replace(/&amp;/g,"&");
      if(!isCampaignDetailUrl(source,raw))continue;
      const u=new URL(raw,base);
      u.hash="";
      u.search="";
      urls.add(u.href);
    }catch{/* Ignore invalid publisher links. */}
  }
  const prisma=getPrisma();let queued=0;
  for(const url of [...urls].slice(0,80)){
    const providerMessageId="discovery:"+month+":"+createHash("sha256").update(url).digest("hex");
    const result=await prisma.campaignSubmission.createMany({skipDuplicates:true,data:[{providerMessageId,sourceUrl:url,rawText:url,receivedAt:now,status:"RECEIVED",channelId:"official-monthly-discovery"}]});
    queued+=result.count;
  }
  return {source:source.name,status:"queued_for_verification",month,queued,discovered:urls.size};
}
