import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {getPriceLowReport,rankPriceDeals,type RankedPriceDeal} from "@/lib/indirim-ai/analysis";
import {getChannelTool} from "@/lib/channel-tools";
import {withReadRetry} from "@/lib/read-retry";
export const runtime="nodejs";export const dynamic="force-dynamic";
const tl=(n:number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(n)+" TL";
const whatsappChannel=getChannelTool("indirim-ai").channelUrl;
const medals=["🥇","🥈","🥉"];
function row(entry:RankedPriceDeal,index:number){
 const i=entry.item;
 const why=entry.qualified
   ? `${i.windowDays} günlük yeterli gözlemde dönem dibinde · dönem tepesine göre %${i.dropFromHighPct.toFixed(1)} aşağı`
   : `Takip geçmişi ${i.coverageDays} gün / ${i.observedDays} ayrı gün · henüz 30 günlük dip etiketi değildir`;
 return [
  `${medals[index]} *${index+1}. SIRA*`,
  `*${i.productName}*`,
  `💰 *${tl(i.currentPrice)}* · ${i.merchantName}`,
  `📊 ${why}`,
  `🔗 ${i.sourceUrl}`
 ].join("\n");
}
export async function GET(r:NextRequest){
 try{
  const report=await withReadRetry(()=>getPriceLowReport()),top=rankPriceDeals(report);
  if(!top.length)return NextResponse.json({channel_url:whatsappChannel,body:null,status:"price_history_accumulating",coverage:{products:report.productCount,observations:report.observationCount}});
  const body=[
   "🏆 *İNDİRİMAI | FIRSAT SIRALAMASI*",
   "Kaynaklı fiyat geçmişine göre bugünün öne çıkan 3 kaydı:",
   ...top.map(row),
   "",
   top.every(x=>x.qualified)?"Bu sıralamadaki dönem dibi etiketleri yeterli gözlem geçmişine dayanır.":"Takip dönemi kayıtları, yeterli süre oluşana kadar dönem dibi olarak adlandırılmaz.",
   "https://www.uretir.com/indirim-ai",
   "",
   "*İndirimAI • uretir.com*"
  ].join("\n\n");
  const fingerprint=createHash("sha256").update(JSON.stringify(top.map(x=>[x.item.productKey,x.item.currentPrice,x.item.fetchedAt,x.label]))).digest("hex").slice(0,24);
  return NextResponse.json({
   channel_url:whatsappChannel,fingerprint,body,
   image_url:top.find(x=>x.item.imageUrl)?.item.imageUrl??null,
   ranked:top.map((x,index)=>({rank:index+1,productKey:x.item.productKey,title:x.item.productName,price:x.item.currentPrice,merchant:x.item.merchantName,image_url:x.item.imageUrl,source_url:x.item.sourceUrl,label:x.label,qualified:x.qualified})),
   status:top.every(x=>x.qualified)?"ranked_price_lows":"ranked_tracking",
   checkedAt:report.checkedAt,coverage:{products:report.productCount,observations:report.observationCount}
  });
 }catch(error){console.error("IndirimAI WhatsApp feed unavailable",error);return NextResponse.json({channel_url:whatsappChannel,body:null,image_url:null,ranked:[],status:"temporarily_unavailable",checkedAt:new Date().toISOString(),coverage:{products:0,observations:0}},{headers:{"Cache-Control":"no-store"}});}
}
