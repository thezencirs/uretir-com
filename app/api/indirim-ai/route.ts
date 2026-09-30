import {NextResponse} from "next/server";
import {getPriceLowReport} from "@/lib/indirim-ai/analysis";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
  try{
    return NextResponse.json(await getPriceLowReport(),{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    console.error("IndirimAI price history unavailable",error);
    return NextResponse.json({
      checkedAt:new Date().toISOString(),
      lows:{"30":[],"90":[],"360":[]},
      provisional:[],
      observationCount:0,
      productCount:0,
      status:"temporarily_unavailable"
    },{headers:{"Cache-Control":"no-store"}});
  }
}