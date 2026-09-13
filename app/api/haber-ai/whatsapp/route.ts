import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { newsPool } from "@/lib/haber-ai/store";
import { buildBulletin, whatsappChannel } from "@/lib/haber-ai/bulletin";
import { newsDay } from "@/lib/haber-ai/dates";
import type { Article } from "@/lib/haber-ai/model";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
function authorized(r: NextRequest) { return Boolean(process.env.CRON_SECRET && r.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`); }
const selection = `SELECT a.id,a.payload FROM haber_articles a WHERE a.published_at <= NOW() AND (a.published_at AT TIME ZONE 'Europe/Istanbul')::date = (NOW() AT TIME ZONE 'Europe/Istanbul')::date AND COALESCE(a.payload->>'hidden','false') <> 'true' AND jsonb_array_length(a.payload->'provinceCodes') > 0 AND NOT EXISTS (SELECT 1 FROM haber_deliveries d WHERE d.article_id=a.id) ORDER BY a.published_at DESC LIMIT 5`;
export async function GET(request: NextRequest) {
 if (!authorized(request)) return json({error:"Yetkisiz erişim."},401);
 const p=newsPool();
 try { const r=await p.query<{id:string;payload:Article}>(selection); return json({channel:whatsappChannel,body:buildBulletin(r.rows.map(a=>a.payload),newsDay()),count:r.rowCount}); }
 catch { return json({error:"Bülten okunamadı."},503); } finally { await p.end(); }
}
export async function POST(request: NextRequest) {
 if (!authorized(request)) return json({error:"Yetkisiz erişim."},401);
 let input;
 try { const text=await request.text(); if(text.length>2000)return json({error:"İstek çok büyük."},413); input=JSON.parse(text); } catch {return json({error:"Geçersiz istek."},400);}
 if(!input || !["claim","ack"].includes(input.action))return json({error:"Geçersiz işlem."},400);
 const p=newsPool(); const c=await p.connect();
 try {
  if(input.action==="ack") {
   if(!/^[a-f0-9-]{36}$/.test(input.claimId??"")||typeof input.messageId!=="string"||!input.messageId||input.messageId.length>500)return json({error:"Gönderim kimliği gerekli."},400);
   const r=await c.query("UPDATE haber_deliveries SET status='sent',message_id=$2,sent_at=NOW() WHERE claim_id=$1 AND status='sending' RETURNING article_id",[input.claimId,input.messageId]);
   return json({sent:r.rowCount});
  }
  await c.query("BEGIN");
  await c.query("SELECT pg_advisory_xact_lock(81071002)");
  const pending=await c.query("SELECT 1 FROM haber_deliveries WHERE status='sending' LIMIT 1");
  if(pending.rowCount){await c.query("ROLLBACK");return json({error:"Önceki gönderimin sonucu doğrulanmalı."},409);}
  const r=await c.query<{id:string;payload:Article}>(selection);
  if(!r.rowCount){await c.query("COMMIT");return json({bulletin:null});}
  const claimId=randomUUID();
  await c.query("INSERT INTO haber_deliveries(article_id,claim_id) SELECT unnest($1::text[]),$2::uuid",[r.rows.map(a=>a.id),claimId]);
  const body=buildBulletin(r.rows.map(a=>a.payload),newsDay());
  await c.query("COMMIT");
  return json({bulletin:{claimId,body,channel_url:whatsappChannel}});
 } catch {await c.query("ROLLBACK").catch(()=>undefined);return json({error:"Bülten işlemi başarısız."},503);} finally {c.release();await p.end();}
}
