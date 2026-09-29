import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {getPriceLowReport,type PriceLowItem} from "@/lib/indirim-ai/analysis";
import {getChannelTool} from "@/lib/channel-tools";
export const runtime="nodejs"; export const dynamic="force-dynamic";
const tl=(n:number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(n)+" TL";
const whatsappChannel=getChannelTool("indirim-ai").channelUrl;
function auth(r:NextRequest){return [process.env.CRON_SECRET,process.env.WHATSAPP_BOT_SECRET].some(t=>Boolean(t&&r.headers.get("authorization")==="Bearer "+t));}
function row(i:PriceLowItem){return "• *"+i.productName+"* — "+tl(i.currentPrice)+" · "+i.merchantName+"\n  "+i.windowDays+" gün dibi · tepeye göre %"+i.dropFromHighPct.toFixed(1)+" aşağı\n  "+i.sourceUrl;}
export async function GET(r:NextRequest){
 if(!auth(r))return NextResponse.json({error:"Yetkisiz erişim."},{status:401});
 try{
  const report=await getPriceLowReport(); const sections:[string,PriceLowItem[]][]=[["30 GÜN",report.lows["30"]],["90 GÜN",report.lows["90"]],["360 GÜN",report.lows["360"]]];
  const usable=sections.filter(([,items])=>items.length).map(([label,items])=>"📉 *"+label+" DİP FİYATLARI*\n"+items.slice(0,3).map(row).join("\n"));
  if(!usable.length)return NextResponse.json({channel_url:whatsappChannel,body:null,status:"price_history_accumulating",coverage:{products:report.productCount,observations:report.observationCount}});
  const body=["🔥 *İNDİRİMAI | GERÇEK FİYAT DİPLERİ*",...usable,"","Tüm fiyat geçmişi ve kaynaklar:","https://www.uretir.com/indirim-ai","","*İndirimAI • uretir.com*"].join("\n\n");
  const fingerprint=createHash("sha256").update(body).digest("hex").slice(0,24);
  return NextResponse.json({channel_url:whatsappChannel,fingerprint,body,checkedAt:report.checkedAt});
 }catch{return NextResponse.json({error:"İndirimAI kanal içeriği hazırlanamadı."},{status:503});}
}
