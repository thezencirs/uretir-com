import {NextRequest,NextResponse} from "next/server";
import {collectNews} from "@/lib/haber-ai/collector";
import {getNewsSnapshot,newsPool} from "@/lib/haber-ai/store";
import {isAdminRequest,hasSameOrigin} from "@/lib/puan-ai/admin-auth";
import {getMarketQuotes} from "@/lib/haber-ai/markets";
import {z} from "zod";
import provinces from "@/lib/haber-ai/provinces.json";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(request:NextRequest){
 const view=request.nextUrl.searchParams.get("view");
 if(view==="finance")return json(await getMarketQuotes());
 if(view==="editor"&&!isAdminRequest(request))return json({error:"Yönetici girişi gerekli."},401);
 const snapshot=await getNewsSnapshot(view==="editor"); return json(snapshot,snapshot.available?200:503);
}
export async function POST(request:NextRequest){
 if(!isAdminRequest(request))return json({error:"Kaynak taraması için yönetici girişi gerekli."},401);
 if(!hasSameOrigin(request))return json({error:"Geçersiz kaynak."},403);
 try{const run=await collectNews();if("busy" in run)return json({error:"Bir tarama zaten çalışıyor."},409);return json(run,run.status==="failed"?503:200);}catch{return json({error:"Kaynak toplama başarısız."},503);}
}
const edit=z.object({id:z.string().regex(/^[a-f0-9]{64}$/),title:z.string().trim().min(5).max(300),summary:z.string().max(1000),provinceCodes:z.array(z.string().refine(v=>provinces.some(p=>p.code===v))).max(81),hidden:z.boolean(),editedAt:z.string().nullable()});
export async function PUT(request:NextRequest){
 if(!isAdminRequest(request))return json({error:"Yönetici girişi gerekli."},401);
 if(!hasSameOrigin(request))return json({error:"Geçersiz kaynak."},403);
 const body=await request.text();if(body.length>16000)return json({error:"Kayıt çok büyük."},413);
 let input;try{input=edit.parse(JSON.parse(body));}catch{return json({error:"Başlık, özet ve şehir alanlarını kontrol edin."},400);}
 const p=newsPool();
 try{
 const {id,editedAt,...patch}=input;const next={...patch,editedAt:new Date().toISOString()};
 const saved=await p.query("UPDATE haber_articles SET payload=payload || $2::jsonb WHERE id=$1 AND (payload->>'editedAt') IS NOT DISTINCT FROM $3 RETURNING id",[id,JSON.stringify(next),editedAt]);
 if(!saved.rowCount)return json({error:"Kayıt değişmiş. Listeyi yenileyin."},409);
 return json({saved:true,editedAt:next.editedAt});
 }catch{return json({error:"Kaydedilemedi."},503);}finally{await p.end();}
}
