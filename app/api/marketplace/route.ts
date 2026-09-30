import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {z} from "zod";
import {currentMember,db,rateLimit} from "@/lib/members/store";
import {isAdminRequest,hasSameOrigin} from "@/lib/puan-ai/admin-auth";
import {contactSchema,listingSchema,reportSchema} from "@/lib/marketplace/validation";
import {listingFingerprint,propertyReference,publicMemberListing,vehicleReference} from "@/lib/marketplace/store";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(d:unknown,s=200)=>NextResponse.json(d,{status:s,headers:{"Cache-Control":"no-store"}});
const fail=(m:string,s=400)=>json({error:m},s);
function record(value:unknown){return value!==null&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:null;}
export async function GET(req:NextRequest){try{
 const view=req.nextUrl.searchParams.get("view");
 if(view==="review"){if(!isAdminRequest(req))return fail("Yönetici girişi gerekli.",401);const r=await db().query(`SELECT l.*,a.handle,a.display_name,(SELECT count(*)::int FROM marketplace_reports x WHERE x.listing_id=l.id AND x.status='open') report_count FROM marketplace_listings l JOIN member_accounts a ON a.id=l.user_id WHERE l.status IN ('pending','published','rejected') ORDER BY CASE WHEN l.status='pending' THEN 0 ELSE 1 END,l.updated_at DESC LIMIT 400`);return json({items:r.rows});}
 const id=req.nextUrl.searchParams.get("id");if(id){const item=await publicMemberListing(id);return item?json({item}):fail("İlan bulunamadı.",404);}
 const user=await currentMember();if(!user)return json({user:null,items:[],contacts:[]});
 const [mine,contacts,deals]=await Promise.all([
   db().query("SELECT * FROM marketplace_listings WHERE user_id=$1 ORDER BY updated_at DESC",[user.id]),
   db().query(`SELECT r.*,l.title,l.kind,b.handle buyer_handle,b.display_name buyer_name,s.handle seller_handle FROM marketplace_contact_requests r JOIN marketplace_listings l ON l.id=r.listing_id JOIN member_accounts b ON b.id=r.buyer_user_id JOIN member_accounts s ON s.id=r.seller_user_id WHERE r.buyer_user_id=$1 OR r.seller_user_id=$1 ORDER BY r.updated_at DESC LIMIT 200`,[user.id]),
   db().query(`SELECT d.*,l.title,l.kind,l.price,b.handle buyer_handle,s.handle seller_handle FROM marketplace_deal_requests d JOIN marketplace_listings l ON l.id=d.listing_id JOIN member_accounts b ON b.id=d.buyer_user_id JOIN member_accounts s ON s.id=d.seller_user_id WHERE d.buyer_user_id=$1 OR d.seller_user_id=$1 ORDER BY d.updated_at DESC LIMIT 200`,[user.id])
 ]);
 return json({user,items:mine.rows,contacts:contacts.rows,deals:deals.rows});
}catch(e){console.error("Marketplace GET failed",e);return fail("İlan servisine ulaşılamadı.",503);}}
export async function POST(req:NextRequest){try{
 if(!hasSameOrigin(req))return fail("Geçersiz istek kaynağı.",403);
 const text=await req.text();if(text.length>2_300_000)return fail("Görseller çok büyük. Daha küçük fotoğraflar deneyin.",413);
 let parsed:unknown;try{parsed=JSON.parse(text);}catch{return fail("Geçersiz istek.");}
 const body=record(parsed);if(!body)return fail("Geçersiz istek.");
 if(body.action==="review"){if(!isAdminRequest(req))return fail("Yönetici girişi gerekli.",401);const v=z.object({id:z.string().uuid(),version:z.number().int().positive(),decision:z.enum(["published","rejected"]),note:z.string().trim().max(500)}).parse(body);const client=await db().connect();try{await client.query("BEGIN");const row=(await client.query("SELECT * FROM marketplace_listings WHERE id=$1 FOR UPDATE",[v.id])).rows[0] as {version:number;images:unknown};if(!row||row.version!==v.version){await client.query("ROLLBACK");return fail("İlan değişmiş. Listeyi yenileyin.",409);}if(v.decision==="published"&&(!Array.isArray(row.images)||row.images.length<2)){await client.query("ROLLBACK");return fail("Yayın için en az iki fotoğraf gerekli.",409);}await client.query(`UPDATE marketplace_listings SET status=$2,review_note=$3,version=version+1,updated_at=now(),published_at=CASE WHEN $2='published' THEN COALESCE(published_at,now()) ELSE published_at END,last_verified_at=CASE WHEN $2='published' THEN now() ELSE last_verified_at END,expires_at=CASE WHEN $2='published' THEN now()+interval '30 days' ELSE expires_at END WHERE id=$1`,[v.id,v.decision,v.note]);await client.query("COMMIT");return json({ok:true});}catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}}
 const user=await currentMember();if(!user)return fail("İlan işlemleri için Üretir ID ile giriş yapın.",401);
 if(!await rateLimit("market:"+user.id,40,60))return fail("Çok hızlı işlem yapıyorsunuz. Biraz bekleyin.",429);
 if(body.action==="report"){const v=reportSchema.parse(body);const row=(await db().query("SELECT user_id FROM marketplace_listings WHERE id=$1 AND status='published'",[v.listingId])).rows[0] as {user_id:string}|undefined;if(!row)return fail("İlan bulunamadı.",404);if(row.user_id===user.id)return fail("Kendi ilanınızı raporlayamazsınız.",400);try{await db().query("INSERT INTO marketplace_reports(id,listing_id,reporter_user_id,reason,note) VALUES($1,$2,$3,$4,$5)",[randomUUID(),v.listingId,user.id,v.reason,v.note]);}catch(e){if((e as {code?:string}).code==="23505")return fail("Bu nedenle daha önce rapor gönderdiniz.",409);throw e;}
 const risk=await db().query("SELECT count(DISTINCT reporter_user_id)::int total FROM marketplace_reports WHERE listing_id=$1 AND status='open' AND reason IN ('fraud_risk','suspicious_price','wrong_info')",[v.listingId]);
 if(Number(risk.rows[0]?.total??0)>=3)await db().query("UPDATE marketplace_listings SET status='pending',review_note='Otomatik güvenlik incelemesi: birden fazla bağımsız risk raporu.',updated_at=now(),version=version+1 WHERE id=$1 AND status='published'",[v.listingId]);
 return json({ok:true,pausedForReview:Number(risk.rows[0]?.total??0)>=3});}
 if(body.action==="contact"){const v=contactSchema.parse(body);const l=(await db().query("SELECT user_id FROM marketplace_listings WHERE id=$1 AND status='published' AND (expires_at IS NULL OR expires_at>now())",[v.listingId])).rows[0] as {user_id:string}|undefined;if(!l)return fail("İlan bulunamadı.",404);if(l.user_id===user.id)return fail("Kendi ilanınıza iletişim isteği gönderemezsiniz.",400);await db().query(`INSERT INTO marketplace_contact_requests(id,listing_id,buyer_user_id,seller_user_id,message) VALUES($1,$2,$3,$4,$5) ON CONFLICT(listing_id,buyer_user_id) DO UPDATE SET message=EXCLUDED.message,status='pending',updated_at=now()`,[randomUUID(),v.listingId,user.id,l.user_id,v.message]);return json({ok:true});}
 if(body.action==="contactDecision"){const v=z.object({id:z.string().uuid(),decision:z.enum(["accepted","declined"]),reply:z.string().trim().max(700).default("")}).parse(body);const r=await db().query("UPDATE marketplace_contact_requests SET status=$3,seller_reply=$4,updated_at=now() WHERE id=$1 AND seller_user_id=$2 RETURNING id",[v.id,user.id,v.decision,v.reply]);return r.rowCount?json({ok:true}):fail("İletişim isteği bulunamadı.",404);}
 if(body.action==="dealRequest"){
  const v=z.object({listingId:z.string().uuid(),kind:z.enum(["offer","visit","inspection"]),amount:z.number().positive().max(1_000_000_000).nullable().optional(),preferredAt:z.string().datetime().nullable().optional(),message:z.string().trim().max(700).default("")}).parse(body);
  if(v.kind==="offer"&&!v.amount)return fail("Teklif tutarı gerekli.",400);
  if(v.kind!=="offer"&&!v.preferredAt)return fail("Tarih ve saat gerekli.",400);
  const l=(await db().query("SELECT user_id,kind,price FROM marketplace_listings WHERE id=$1 AND status='published' AND (expires_at IS NULL OR expires_at>now())",[v.listingId])).rows[0] as {user_id:string;kind:"property"|"vehicle";price:number|string}|undefined;
  if(!l)return fail("İlan bulunamadı.",404);if(l.user_id===user.id)return fail("Kendi ilanınıza işlem isteği gönderemezsiniz.",400);
  if(v.kind==="inspection"&&l.kind!=="vehicle")return fail("Ekspertiz isteği yalnız araç ilanlarında kullanılabilir.",400);
  const id=randomUUID();
  try{await db().query(`INSERT INTO marketplace_deal_requests(id,listing_id,buyer_user_id,seller_user_id,kind,amount,preferred_at,message) VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,[id,v.listingId,user.id,l.user_id,v.kind,v.amount??null,v.preferredAt?new Date(v.preferredAt):null,v.message]);}
  catch(e){if((e as {code?:string}).code==="23505")return fail("Bu ilan için aynı türde açık bir isteğiniz zaten var.",409);throw e;}
  return json({ok:true,id});
 }
 if(body.action==="dealDecision"){
  const v=z.object({id:z.string().uuid(),decision:z.enum(["accepted","declined","countered"]),counterAmount:z.number().positive().max(1_000_000_000).nullable().optional(),reply:z.string().trim().max(700).default("")}).parse(body);
  if(v.decision==="countered"&&!v.counterAmount)return fail("Karşı teklif tutarı gerekli.",400);
  const r=await db().query(`UPDATE marketplace_deal_requests SET status=$3,counter_amount=$4,seller_reply=$5,updated_at=now() WHERE id=$1 AND seller_user_id=$2 AND status IN ('pending','countered') AND expires_at>now() RETURNING id`,[v.id,user.id,v.decision,v.counterAmount??null,v.reply]);
  return r.rowCount?json({ok:true}):fail("İşlem isteği bulunamadı veya süresi dolmuş.",404);
 }
 if(body.action==="delete"){const id=z.string().uuid().parse(body.id);const r=await db().query("DELETE FROM marketplace_listings WHERE id=$1 AND user_id=$2 RETURNING id",[id,user.id]);return r.rowCount?json({ok:true}):fail("İlan bulunamadı.",404);}
 if(body.action==="renew"){if(!user.marketplace_roles.includes("seller"))return fail("Satıcı rolü gerekli.",403);const id=z.string().uuid().parse(body.id);const r=await db().query(`UPDATE marketplace_listings SET last_verified_at=now(),expires_at=now()+interval '30 days',updated_at=now(),version=version+1 WHERE id=$1 AND user_id=$2 AND status='published' AND jsonb_array_length(moderation_flags)=0 RETURNING id`,[id,user.id]);return r.rowCount?json({ok:true}):fail("İlan yeniden doğrulanamadı; düzenleyip incelemeye gönderin.",409);}
 if(body.action==="save"){
  if(!user.marketplace_roles.includes("seller"))return fail("İlan vermek için Üretir ID hesabında Satıcı rolünü açın.",403);
  const v=listingSchema.parse(body);if(v.submit&&v.images.length<2)return fail("Yayın incelemesi için en az iki fotoğraf ekleyin.",400);
  const fp=listingFingerprint(v);let reference:number|null=null,anomaly:number|null=null;const flags:string[]=[];
  if(v.kind==="property"){const ref=await propertyReference(v.city,v.district,v.attributes.grossM2);reference=ref.reference;if(reference)anomaly=(v.price/reference-1)*100;}
  else{const ref=await vehicleReference(v.attributes.brand,v.attributes.model,v.attributes.modelYear);reference=ref.usedMedian??ref.usedAverage??ref.newPrice;if(reference)anomaly=(v.price/reference-1)*100;}
  if(anomaly!==null&&Math.abs(anomaly)>=35)flags.push("price_outlier");
  if(/kapora|ön ödeme|havale yap|elden para/i.test(v.description))flags.push("payment_language");
  const dup=await db().query("SELECT id FROM marketplace_listings WHERE content_fingerprint=$1 AND status IN ('pending','published') AND ($2::uuid IS NULL OR id<>$2) LIMIT 1",[fp,v.id??null]);if(dup.rows.length)flags.push("possible_duplicate");
  const status=v.submit?"pending":"draft",id=v.id??randomUUID();
  if(v.id){const r=await db().query(`UPDATE marketplace_listings SET title=$3,description=$4,price=$5,city=$6,district=$7,neighborhood=$8,latitude=$9,longitude=$10,seller_role=$11,contact_mode=$12,images=$13,verification_image=$14,attributes=$15,content_fingerprint=$16,price_reference=$17,price_anomaly_pct=$18,moderation_flags=$19,status=$20,review_note='',submitted_at=CASE WHEN $20='pending' THEN now() ELSE submitted_at END,updated_at=now(),version=version+1 WHERE id=$1 AND user_id=$2 AND version=$21 RETURNING id`,[id,user.id,v.title,v.description,v.price,v.city,v.district,v.neighborhood,v.latitude,v.longitude,v.sellerRole,v.contactMode,JSON.stringify(v.images),v.verificationImage??null,JSON.stringify(v.attributes),fp,reference,anomaly,JSON.stringify(flags),status,v.version]);return r.rowCount?json({ok:true,id,flags,reference,anomaly}):fail("İlan değişmiş veya size ait değil. Yenileyin.",409);}
  const count=await db().query("SELECT count(*)::int total FROM marketplace_listings WHERE user_id=$1 AND created_at>now()-interval '1 day'",[user.id]);if(Number(count.rows[0]?.total??0)>=12)return fail("Günlük ilan oluşturma sınırına ulaştınız.",429);
  await db().query(`INSERT INTO marketplace_listings(id,user_id,kind,status,title,description,price,city,district,neighborhood,latitude,longitude,seller_role,contact_mode,images,verification_image,attributes,content_fingerprint,price_reference,price_anomaly_pct,moderation_flags,submitted_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,CASE WHEN $4='pending' THEN now() END)`,[id,user.id,v.kind,status,v.title,v.description,v.price,v.city,v.district,v.neighborhood,v.latitude,v.longitude,v.sellerRole,v.contactMode,JSON.stringify(v.images),v.verificationImage??null,JSON.stringify(v.attributes),fp,reference,anomaly,JSON.stringify(flags)]);
  return json({ok:true,id,flags,reference,anomaly});
 }
 return fail("İşlem bulunamadı.",400);
}catch(e){if(e instanceof z.ZodError)return fail("Alanları kontrol edin: "+e.issues.map(i=>i.path.join(".")).join(", "));console.error("Marketplace action failed",e);return fail("İşlem tamamlanamadı. Tekrar deneyin.",503);}}
