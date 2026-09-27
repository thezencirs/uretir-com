import {NextResponse} from "next/server";
import {getAutomotiveSnapshot} from "@/lib/araba-ai/analysis";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){try{return NextResponse.json(await getAutomotiveSnapshot(),{headers:{"Cache-Control":"no-store"}});}catch{return NextResponse.json({error:"ArabaAI verisine ulaşılamadı."},{status:503});}}
