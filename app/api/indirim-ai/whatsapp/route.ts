import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {getPriceLowReport,type PriceLowItem} from "@/lib/indirim-ai/analysis";
import {getChannelTool} from "@/lib/channel-tools";
import {withReadRetry} from "@/lib/read-retry";
export const runtime="nodejs";export const dynamic="force-dynamic";
const tl=(n:number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(n)+" TL";
const whatsappChannel=getChannelTool("indirim-ai").channelUrl;
type Ranked={item:PriceLowItem;label:string;qualified:boolean};
function ranked(report:Awaited<ReturnType<typeof getPriceLowReport>>){
 const picked=new Map<string,Ranked>();
 for(const window of [360,90,30] as const){
  for(const item of report.lows[String(window)]){
   if(!picked.has(item.productKey))picked.set(item.productKey,{item,label:window+" gün dibi",qualified:true});
  }
 }
 for(const item of report.provisional){
  if(!picked.has(item.productKey))picked.set(item.productKey,{item,label:"takip dönemi",qualified:false});
 }
 return [...picked.values()].sort((a,b)=>
   Number(b.qualified)-Number(a.qualified)
   || (b.qualified?b.item.windowDays-a.item.windowDays:b.item.coverageDays-a.item.coverageDays)
   || b.item.dropFromHighPct-a.item.dropFromHighPct
   || a.item.currentPrice-b.item.currentPrice
 ).slice(0,3);
}
const medals=["🥇","🥈","🥉"];
function row(entry:Ranked,index:number){
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
  const report=await withReadRetry(()=>getPriceLowReport()),top=ranked(report);
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
 }catch{return NextResponse.json({error:"İndirimAI kanal içeriği hazırlanamadı."},{status:503});}
}
