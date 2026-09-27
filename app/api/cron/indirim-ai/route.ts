import {NextRequest,NextResponse} from "next/server";
import {collectTrustedCommercePrices} from "@/lib/indirim-ai/collector";
export const runtime="nodejs"; export const maxDuration=60;
export async function GET(request:NextRequest){
 const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 if(!process.env.CRON_SECRET||token!==process.env.CRON_SECRET)return NextResponse.json({error:"Yetkisiz erişim."},{status:401});
 try{return NextResponse.json(await collectTrustedCommercePrices());}catch{return NextResponse.json({error:"İndirimAI taraması tamamlanamadı."},{status:503});}
}
