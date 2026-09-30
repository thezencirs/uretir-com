import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {currentMember,db} from "@/lib/members/store";
import {hasSameOrigin} from "@/lib/puan-ai/admin-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(d:unknown,s=200)=>NextResponse.json(d,{status:s,headers:{"Cache-Control":"no-store"}});
const fail=(m:string,s=400)=>json({error:m},s);
export async function GET(){
 try{
  const user=await currentMember();if(!user)return json({user:null,items:[]});
  const r=await db().query("SELECT * FROM marketplace_favorites WHERE user_id=$1 ORDER BY created_at DESC LIMIT 300",[user.id]);
  return json({user,items:r.rows});
 }catch(e){console.error("Favorites GET failed",e);return fail("Favorilere ulaşılamadı.",503);}
}
export async function POST(req:NextRequest){
 try{
  if(!hasSameOrigin(req))return fail("Geçersiz istek kaynağı.",403);
  const user=await currentMember();if(!user)return fail("Üretir ID ile giriş yapın.",401);
  if(!user.marketplace_roles.includes("buyer"))return fail("Favoriler için Alıcı rolünü açın.",403);
  const body=await req.json() as unknown;
  const v=z.object({
    action:z.enum(["add","remove"]),
    itemKey:z.string().min(3).max(300),
    kind:z.enum(["property","vehicle"]).optional(),
    title:z.string().trim().min(3).max(180).optional(),
    price:z.number().nonnegative().nullable().optional(),
    imageUrl:z.string().url().nullable().optional(),
    sourceUrl:z.string().url().nullable().optional(),
    detailUrl:z.string().max(500).nullable().optional(),
    locationLabel:z.string().max(180).optional()
  }).parse(body);
  if(v.action==="remove"){await db().query("DELETE FROM marketplace_favorites WHERE user_id=$1 AND item_key=$2",[user.id,v.itemKey]);return json({ok:true,saved:false});}
  if(!v.kind||!v.title)return fail("İlan bilgisi eksik.",400);
  await db().query(`INSERT INTO marketplace_favorites(user_id,item_key,kind,title,price,image_url,source_url,detail_url,location_label)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT(user_id,item_key) DO UPDATE SET title=EXCLUDED.title,price=EXCLUDED.price,image_url=EXCLUDED.image_url,source_url=EXCLUDED.source_url,detail_url=EXCLUDED.detail_url,location_label=EXCLUDED.location_label`,[user.id,v.itemKey,v.kind,v.title,v.price??null,v.imageUrl??null,v.sourceUrl??null,v.detailUrl??null,v.locationLabel??""]);
  return json({ok:true,saved:true});
 }catch(e){if(e instanceof z.ZodError)return fail("Favori bilgisi geçersiz.");console.error("Favorites POST failed",e);return fail("Favori kaydedilemedi.",503);}
}