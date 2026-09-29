import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {getAutomotiveSnapshot} from "@/lib/araba-ai/analysis";
import {getChannelTool} from "@/lib/channel-tools";
import {withReadRetry} from "@/lib/read-retry";
export const runtime="nodejs";export const dynamic="force-dynamic";
const tl=(n:number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(n)+" TL";
const whatsappChannel=getChannelTool("araba-ai").channelUrl;
function auth(r:NextRequest){return [process.env.CRON_SECRET,process.env.WHATSAPP_BOT_SECRET].some(t=>Boolean(t&&r.headers.get("authorization")==="Bearer "+t));}
export async function GET(r:NextRequest){
 if(!auth(r))return NextResponse.json({error:"Yetkisiz erişim."},{status:401});
 try{
  const data=await withReadRetry(()=>getAutomotiveSnapshot()),brands=[...new Set([...data.prices.map(p=>p.brand),...data.campaigns.map(c=>c.brand)])];
  const items=brands.map(brand=>{
    const prices=data.prices.filter(p=>p.brand===brand).slice(0,6),campaigns=data.campaigns.filter(c=>c.brand===brand&&c.validUntil).slice(0,3);
    if(!prices.length&&!campaigns.length)return null;
    const lines=["🚗 *ARABAAI | "+brand.toLocaleUpperCase("tr-TR")+"*"];
    if(prices.length){lines.push("","💰 *Güncel resmi fiyatlar*");for(const p of prices)lines.push("• "+p.model+": *"+tl(p.effectivePrice)+"*"+(p.changePct===null?"":(" · "+(p.changePct>0?"+":"")+p.changePct.toFixed(1)+"%")));}
    if(campaigns.length){lines.push("","🎯 *Aktif kampanyalar*");for(const c of campaigns)lines.push("• "+c.title+" · son "+new Date(c.validUntil!).toLocaleDateString("tr-TR",{timeZone:"Europe/Istanbul"})+"\n  "+c.sourceUrl);}
    lines.push("","Tüm model fiyatları ve kampanyalar:","https://www.uretir.com/araba-ai","","*ArabaAI • uretir.com*");
    const body=lines.join("\n"),fingerprint=createHash("sha256").update(body).digest("hex").slice(0,24);
    return {fingerprint,brand,category:"automotive",body};
  }).filter(Boolean);
  return NextResponse.json({channel_url:whatsappChannel,items,checkedAt:data.checkedAt});
 }catch{return NextResponse.json({error:"ArabaAI kanal içeriği hazırlanamadı."},{status:503});}
}
