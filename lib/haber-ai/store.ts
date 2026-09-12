import { Pool } from "pg";
import type { Article, Run } from "./model";
export function newsPool() { return new Pool({connectionString:process.env.DATABASE_URL,max:2,connectionTimeoutMillis:5000}); }
export async function getNewsSnapshot(editor=false) {
 const p=newsPool();
 try {
 const [a,r]=await Promise.all([p.query<{payload:Article}>("SELECT payload FROM haber_articles WHERE ($1 OR (COALESCE(payload->>'hidden','false') <> 'true' AND published_at <= NOW())) ORDER BY published_at DESC",[editor]),p.query<{payload:Run}>("SELECT payload FROM haber_runs ORDER BY started_at DESC LIMIT 1")]);
 return {articles:a.rows.map(x=>editor?x.payload:{...x.payload,imageUrl:x.payload.rights?.imageAllowed?x.payload.imageUrl:null,summary:x.payload.editedAt?x.payload.summary:""}),run:r.rows[0]?.payload??null,available:true};
 }catch{return {articles:[] as Article[],run:null,available:false};}finally{await p.end();}
}
