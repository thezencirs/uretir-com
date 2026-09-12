import {Pool} from "pg";
import {cookies} from "next/headers";
import {createHash,randomBytes,scrypt as nodeScrypt,timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";
import type {Member,MemberContent} from "./types";
const scrypt=promisify(nodeScrypt);
const globalDb=globalThis as unknown as {memberPool?:Pool};
export function db(){return globalDb.memberPool??=new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:5000,idleTimeoutMillis:10000});}
export const digest=(s:string)=>createHash("sha256").update(s).digest("hex");
export async function hashPassword(s:string){const salt=randomBytes(16).toString("hex");const key=await scrypt(s,salt,64) as Buffer;return salt+":"+key.toString("hex");}
export async function verifyPassword(password:string,hash:string){const[salt,key]=hash.split(":");if(!salt||!key)return false;const value=await scrypt(password,salt,64) as Buffer;const expected=Buffer.from(key,"hex");return expected.length===value.length&&timingSafeEqual(expected,value);}
export async function currentMember():Promise<Member|null>{const token=(await cookies()).get("uretir_member")?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return null;const r=await db().query("SELECT a.id,a.handle,a.display_name FROM member_sessions s JOIN member_accounts a ON a.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()",[digest(token)]);return r.rows[0]??null;}
export async function publicContent(kind?:string,parent?:string):Promise<MemberContent[]>{const r=await db().query(`SELECT c.*,a.handle,a.display_name,(SELECT count(*)::int FROM member_content x WHERE x.parent_id=c.id AND x.status='published' AND x.kind='comment') AS replies FROM member_content c JOIN member_accounts a ON a.id=c.user_id WHERE c.status='published' AND ($1::text IS NULL OR c.kind=$1) AND ($2::uuid IS NULL OR c.parent_id=$2) AND (c.kind!='comment' OR EXISTS(SELECT 1 FROM member_content p WHERE p.id=c.parent_id AND p.status='published')) ORDER BY c.published_at DESC LIMIT 500`,[kind??null,parent??null]);return r.rows;}
export async function publicItem(id:string):Promise<MemberContent|null>{if(!/^[a-f0-9-]{36}$/.test(id))return null;const r=await db().query("SELECT c.*,a.handle,a.display_name FROM member_content c JOIN member_accounts a ON a.id=c.user_id WHERE c.id=$1 AND c.status='published'",[id]);return r.rows[0]??null;}
export async function rateLimit(key:string,max:number,seconds:number){const r=await db().query(`INSERT INTO member_rate_limits(key,attempts,reset_at) VALUES($1,1,now()+($2 * interval '1 second')) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN member_rate_limits.reset_at<now() THEN 1 ELSE member_rate_limits.attempts+1 END,reset_at=CASE WHEN member_rate_limits.reset_at<now() THEN now()+($2 * interval '1 second') ELSE member_rate_limits.reset_at END RETURNING attempts`,[key,seconds]);return r.rows[0].attempts<=max;}
