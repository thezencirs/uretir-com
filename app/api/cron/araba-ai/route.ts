import {NextRequest,NextResponse} from "next/server";
import {collectAutomotiveSources} from "@/lib/araba-ai/collector";
export const runtime="nodejs";export const maxDuration=60;
export async function GET(r:NextRequest){const token=r.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!process.env.CRON_SECRET||token!==process.env.CRON_SECRET)return NextResponse.json({error:"Yetkisiz erişim."},{status:401});try{return NextResponse.json(await collectAutomotiveSources());}catch{return NextResponse.json({error:"ArabaAI taraması tamamlanamadı."},{status:503});}}
