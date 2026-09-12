import {NextRequest,NextResponse} from "next/server";
import {randomBytes,randomUUID} from "node:crypto";
import {z} from "zod";
import {db,currentMember,digest,hashPassword,verifyPassword,rateLimit} from "@/lib/members/store";
import {credentials,registration,startupSchema,postSchema,commentSchema} from "@/lib/members/validation";
import {isAdminRequest} from "@/lib/puan-ai/admin-auth";
export const runtime="nodejs";export const dynamic="force-dynamic";
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
const failure=(message:string,status=400)=>json({error:message},status);
async function session(userId:string){const token=randomBytes(32).toString("hex");await db().query("DELETE FROM member_sessions WHERE expires_at<now()");await db().query("INSERT INTO member_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')",[digest(token),userId]);return token;}
function cookie(r:NextResponse,token:string){r.cookies.set("uretir_member",token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:token?604800:0});return r;}
export async function GET(req:NextRequest){try{
 if(req.nextUrl.searchParams.get("view")==="review"){
 if(!isAdminRequest(req))return failure("Yönetici girişi gerekli.",401);
 const r=await db().query("SELECT c.*,a.handle,a.display_name FROM member_content c JOIN member_accounts a ON a.id=c.user_id WHERE c.status IN ('pending','published') ORDER BY CASE WHEN c.status='pending' THEN 0 ELSE 1 END,c.updated_at DESC LIMIT 300");
 return json({items:r.rows});}
 const user=await currentMember();if(!user)return json({user:null,items:[]});
 const r=await db().query("SELECT * FROM member_content WHERE user_id=$1 ORDER BY updated_at DESC",[user.id]);return json({user,items:r.rows});
 }catch{return failure("Üye veritabanına ulaşılamadı. Tekrar deneyin.",503);}}
export async function POST(req:NextRequest){try{
 const allowed=process.env.APP_ORIGIN||(process.env.NODE_ENV!=="production"?req.nextUrl.origin:"");
 if(!allowed||req.headers.get("origin")!==allowed)return failure("Geçersiz istek kaynağı.",403);
 const text=await req.text();if(text.length>18000)return failure("İçerik çok uzun.",413);
 let body;try{body=JSON.parse(text);}catch{return failure("Geçersiz istek.");}
 const action=body.action;
 if(["register","login","recover"].includes(action)){
 if(!await rateLimit("auth:global",120,60))return failure("Çok fazla deneme. Bir dakika sonra tekrar deneyin.",429);
 const handle=typeof body.handle==="string"?body.handle.trim().toLowerCase():"";
 if(!await rateLimit("auth:"+digest(handle),10,600))return failure("Çok fazla deneme. 10 dakika sonra tekrar deneyin.",429);
 if(action==="register"){
 const input=registration.parse(body);
 const code=randomBytes(24).toString("hex");const userId=randomUUID();
 try{await db().query("INSERT INTO member_accounts(id,handle,display_name,password_hash,recovery_hash) VALUES($1,$2,$3,$4,$5)",[userId,input.handle,input.displayName,await hashPassword(input.password),digest(code)]);}
 catch(e){if((e as {code:string}).code==="23505")return failure("Bu kullanıcı adı kullanılıyor.",409);throw e;}
 return cookie(json({ok:true,recoveryCode:code}),await session(userId));
 }
 if(action==="login"){
 const input=credentials.parse(body);const user=(await db().query("SELECT * FROM member_accounts WHERE handle=$1",[input.handle])).rows[0];
 const valid=await verifyPassword(input.password,user?.password_hash??"00000000000000000000000000000000:"+ "0".repeat(128));
 if(!user||!valid)return failure("Kullanıcı adı veya şifre hatalı.",401);
 return cookie(json({ok:true}),await session(user.id));
 }
 const input=credentials.extend({recoveryCode:z.string().regex(/^[a-f0-9]{48}$/)}).parse(body);
 const nextCode=randomBytes(24).toString("hex");const hash=await hashPassword(input.password);const client=await db().connect();
 try{await client.query("BEGIN");const r=await client.query("UPDATE member_accounts SET password_hash=$3,recovery_hash=$4 WHERE handle=$1 AND recovery_hash=$2 RETURNING id",[input.handle,digest(input.recoveryCode),hash,digest(nextCode)]);if(!r.rows.length){await client.query("ROLLBACK");return failure("Kurtarma bilgileri geçersiz.",401);}await client.query("DELETE FROM member_sessions WHERE user_id=$1",[r.rows[0].id]);await client.query("COMMIT");return cookie(json({ok:true,recoveryCode:nextCode}),"");}catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
 }
 if(action==="logout"){const token=req.cookies.get("uretir_member")?.value;if(token)await db().query("DELETE FROM member_sessions WHERE token_hash=$1",[digest(token)]);return cookie(json({ok:true}),"");}
 if(action==="review"){
 if(!isAdminRequest(req))return failure("Yönetici girişi gerekli.",401);
 const v=z.object({id:z.string().uuid(),version:z.number().int().positive(),decision:z.enum(["published","rejected"]),note:z.string().max(500)}).parse(body);
 const client=await db().connect();try{await client.query("BEGIN");
 const existing=(await client.query("SELECT * FROM member_content WHERE id=$1 FOR UPDATE",[v.id])).rows[0];if(!existing||existing.version!==v.version){await client.query("ROLLBACK");return failure("İçerik değişmiş. Listeyi yenileyin.",409);}
 if(v.decision==="published"&&existing.kind==="comment"){const parent=await client.query("SELECT id FROM member_content WHERE id=$1 AND status='published'",[existing.parent_id]);if(!parent.rows.length){await client.query("ROLLBACK");return failure("Yorumun bağlı olduğu yazı yayında değil.",409);}}
 await client.query("UPDATE member_content SET status=$2,review_note=$3,version=version+1,updated_at=now(),published_at=CASE WHEN $2='published' THEN now() ELSE published_at END WHERE id=$1",[v.id,v.decision,v.note]);
 await client.query("INSERT INTO member_review_log(id,content_id,decision,note) VALUES($1,$2,$3,$4)",[randomUUID(),v.id,v.decision,v.note]);await client.query("COMMIT");return json({ok:true});
 }catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
 }
 const user=await currentMember();if(!user)return failure("Üretir ID ile giriş yapın.",401);
 if(!await rateLimit("write:"+user.id,60,60))return failure("Biraz bekleyip tekrar deneyin.",429);
 if(action==="deleteAccount"){
 const pass=z.string().min(12).max(128).parse(body.password);const u=(await db().query("SELECT password_hash FROM member_accounts WHERE id=$1",[user.id])).rows[0];if(!await verifyPassword(pass,u.password_hash))return failure("Şifre hatalı.",401);
 await db().query("DELETE FROM member_accounts WHERE id=$1",[user.id]);return cookie(json({ok:true}),"");
 }
 if(action==="profile"){const name=z.string().trim().min(2).max(60).parse(body.displayName);await db().query("UPDATE member_accounts SET display_name=$2 WHERE id=$1",[user.id,name]);return json({ok:true});}
 if(action==="delete"){
 const id=z.string().uuid().parse(body.id);const r=await db().query("DELETE FROM member_content WHERE id=$1 AND user_id=$2 RETURNING id",[id,user.id]);return r.rowCount?json({ok:true}):failure("İçerik bulunamadı.",404);}
 if(action==="save"){
 const v=z.object({id:z.string().uuid().optional(),kind:z.enum(["startup","post","comment"]),parentId:z.string().uuid().nullable().optional(),version:z.number().int().positive().optional(),submit:z.boolean()}).parse(body);
 const payload=(v.kind==="startup"?startupSchema:v.kind==="post"?postSchema:commentSchema).parse(body.payload);
 const status=v.submit?"pending":"draft";
 if(v.kind==="comment"){const r=await db().query("SELECT id FROM member_content WHERE id=$1 AND kind='post' AND status='published'",[v.parentId]);if(!r.rows.length)return failure("Tartışma yayında değil.",404);}
 if(v.id){const r=await db().query("UPDATE member_content SET payload=$3,status=$4,review_note='',version=version+1,updated_at=now() WHERE id=$1 AND user_id=$2 AND kind=$5 AND version=$6 RETURNING id",[v.id,user.id,payload,status,v.kind,v.version]);return r.rowCount?json({ok:true,id:v.id}):failure("İçerik değişmiş veya size ait değil. Yenileyin.",409);}
 if(v.kind==="post"&&v.parentId){const r=await db().query("SELECT id FROM member_content WHERE id=$1 AND user_id=$2 AND kind='startup'",[v.parentId,user.id]);if(!r.rows.length)return failure("Kendi girişiminizi seçin.",400);}
 const count=await db().query("SELECT count(*)::int AS total FROM member_content WHERE user_id=$1 AND created_at>now()-interval '1 day'",[user.id]);if(count.rows[0].total>=30)return failure("Günlük içerik sınırına ulaştınız.",429);
 const id=randomUUID();try{await db().query("INSERT INTO member_content(id,user_id,kind,parent_id,payload,status) VALUES($1,$2,$3,$4,$5,$6)",[id,user.id,v.kind,v.kind==="startup"?null:v.parentId??null,payload,status]);}catch(e){if((e as {code:string}).code==="23505")return failure("Girişim profiliniz zaten var. Mevcut kaydı düzenleyin.",409);throw e;}
 return json({ok:true,id});}
 return failure("İşlem bulunamadı.",400);
 }catch(e){if(e instanceof z.ZodError)return failure("Alanları kontrol edin: "+e.issues.map(i=>i.path.join(".")).join(", "));console.error("Member action failed",{code:(e as {code?:string}).code??"unknown"});return failure("İşlem tamamlanamadı. Tekrar deneyin.",503);}}
