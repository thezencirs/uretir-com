import {NextResponse} from "next/server";
import {getPriceLowReport} from "@/lib/indirim-ai/analysis";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(){try{return NextResponse.json(await getPriceLowReport(),{headers:{"Cache-Control":"no-store"}});}catch{return NextResponse.json({error:"İndirimAI fiyat geçmişine ulaşılamadı."},{status:503});}}
