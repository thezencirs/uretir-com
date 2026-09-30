import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {z} from "zod";
import {currentMember,db,rateLimit} from "@/lib/members/store";
import {hasSameOrigin} from "@/lib/puan-ai/admin-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(d:unknown,s=200)=>NextResponse.json(d,{status:s,headers:{"Cache-Control":"no-store"}});
const fail=(m:string,s=400)=>json({error:m},s);

export async function GET(){
 try{
  const user=await currentMember();if(!user)return json({user:null,conversations:[]});
  const c=await db().query(`
    SELECT c.*,l.title,l.kind,l.price,l.status listing_status,
      b.handle buyer_handle,b.display_name buyer_name,
      s.handle seller_handle,s.display_name seller_name,
      (SELECT count(*)::int FROM marketplace_messages m WHERE m.conversation_id=c.id AND m.sender_user_id<>$1 AND m.read_at IS NULL) unread
    FROM marketplace_conversations c
    JOIN marketplace_listings l ON l.id=c.listing_id
    JOIN member_accounts b ON b.id=c.buyer_user_id
    JOIN member_accounts s ON s.id=c.seller_user_id
    WHERE c.buyer_user_id=$1 OR c.seller_user_id=$1
    ORDER BY c.updated_at DESC LIMIT 100
  `,[user.id]);
  const ids=c.rows.map((x:{id:string})=>x.id);
  const messages=ids.length?await db().query("SELECT * FROM marketplace_messages WHERE conversation_id=ANY($1::uuid[]) ORDER BY created_at ASC",[ids]):{rows:[]};
  const by=new Map<string,unknown[]>();
  for(const m of messages.rows){const list=by.get(m.conversation_id)??[];list.push(m);by.set(m.conversation_id,list);}
  return json({user,conversations:c.rows.map((x:{id:string})=>({...x,messages:by.get(x.id)??[]}))});
 }catch(e){console.error("Marketplace messages GET failed",e);return fail("Mesajlara ulaşılamadı.",503);}
}

export async function POST(req:NextRequest){
 try{
  if(!hasSameOrigin(req))return fail("Geçersiz istek kaynağı.",403);
  const user=await currentMember();if(!user)return fail("Üretir ID ile giriş yapın.",401);
  if(!await rateLimit("market-msg:"+user.id,80,60))return fail("Çok hızlı mesaj gönderiyorsunuz.",429);
  const body=await req.json() as unknown;
  const base=z.object({action:z.enum(["send","read"])}).passthrough().parse(body);
  if(base.action==="read"){
    const v=z.object({conversationId:z.string().uuid()}).parse(body);
    const r=await db().query("UPDATE marketplace_messages m SET read_at=now() FROM marketplace_conversations c WHERE m.conversation_id=c.id AND c.id=$1 AND (c.buyer_user_id=$2 OR c.seller_user_id=$2) AND m.sender_user_id<>$2 AND m.read_at IS NULL RETURNING m.id",[v.conversationId,user.id]);
    return json({ok:true,read:r.rowCount??0});
  }
  const v=z.object({conversationId:z.string().uuid().optional(),listingId:z.string().uuid().optional(),message:z.string().trim().min(1).max(1200)}).refine(x=>Boolean(x.conversationId||x.listingId)).parse(body);
  let conversationId=v.conversationId;
  if(conversationId){
    const exists=await db().query("SELECT id FROM marketplace_conversations WHERE id=$1 AND (buyer_user_id=$2 OR seller_user_id=$2)",[conversationId,user.id]);
    if(!exists.rows.length)return fail("Konuşma bulunamadı.",404);
  }else{
    if(!user.marketplace_roles.includes("buyer"))return fail("Mesaj göndermek için Üretir ID hesabında Alıcı rolünü açın.",403);
    const listing=(await db().query("SELECT id,user_id FROM marketplace_listings WHERE id=$1 AND status='published' AND (expires_at IS NULL OR expires_at>now())",[v.listingId])).rows[0] as {id:string;user_id:string}|undefined;
    if(!listing)return fail("İlan bulunamadı.",404);if(listing.user_id===user.id)return fail("Kendi ilanınıza mesaj gönderemezsiniz.",400);
    const existing=await db().query("SELECT id FROM marketplace_conversations WHERE listing_id=$1 AND buyer_user_id=$2",[listing.id,user.id]);
    conversationId=existing.rows[0]?.id??randomUUID();
    if(!existing.rows.length)await db().query("INSERT INTO marketplace_conversations(id,listing_id,buyer_user_id,seller_user_id) VALUES($1,$2,$3,$4)",[conversationId,listing.id,user.id,listing.user_id]);
  }
  await db().query("INSERT INTO marketplace_messages(id,conversation_id,sender_user_id,body) VALUES($1,$2,$3,$4)",[randomUUID(),conversationId,user.id,v.message]);
  await db().query("UPDATE marketplace_conversations SET updated_at=now() WHERE id=$1",[conversationId]);
  return json({ok:true,conversationId});
 }catch(e){if(e instanceof z.ZodError)return fail("Mesaj alanlarını kontrol edin.");console.error("Marketplace messages POST failed",e);return fail("Mesaj gönderilemedi.",503);}
}
