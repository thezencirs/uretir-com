import {randomUUID} from "node:crypto";
import {feeds,parseFeed} from "./model";
import {newsPool} from "./store";
import {buildBulletin,whatsappChannel} from "./bulletin";
import {newsDay} from "./dates";
export async function collectNews(){
 if(!process.env.DATABASE_URL)throw Error("HaberAI veritabanı yapılandırılmamış");
 const pool=newsPool();const client=await pool.connect();let locked=false;
 const run={id:randomUUID(),startedAt:new Date().toISOString(),finishedAt:null as string|null,status:"running",count:0,sources:[] as {name:string;count:number;error?:string}[]};
 try{
 locked=(await client.query("SELECT pg_try_advisory_lock(81071001) AS locked")).rows[0].locked;if(!locked)return{busy:true};
 const results=await Promise.allSettled(feeds.map(async feed=>{
 const response=await fetch(feed.url,{redirect:"error",signal:AbortSignal.timeout(20000),headers:{"User-Agent":"Uretir-HaberAI/1.0"}});
 if(!response.ok||!response.body)throw Error("Kaynak HTTP hatası");
 const reader=response.body.getReader();const chunks:Uint8Array[]=[];let size=0;
 for(;;){const{value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>2000000){await reader.cancel();throw Error("RSS boyut sınırı");}chunks.push(value);}
 const articles=parseFeed(Buffer.concat(chunks).toString("utf8"),feed);
 if(!articles.length)throw Error("Kaynakta doğrulanabilir tarihli kayıt bulunamadı");
 return articles;
 }));
 for(const[i,result]of results.entries()){
 if(result.status==="rejected"){run.sources.push({name:feeds[i].name,count:0,error:"Kaynak okunamadı veya RSS doğrulanamadı"});continue;}
 let count=0;await client.query("BEGIN");
 try{const unique=[...new Map(result.value.map(a=>[a.id,a])).values()];const saved=await client.query("INSERT INTO haber_articles(id,published_at,payload) SELECT value->>'id',(value->>'publishedAt')::timestamptz,value FROM jsonb_array_elements($1::jsonb) ON CONFLICT(id) DO UPDATE SET payload=EXCLUDED.payload,published_at=EXCLUDED.published_at WHERE haber_articles.payload->>'editedAt' IS NULL",[JSON.stringify(unique)]);count=saved.rowCount??0;await client.query("COMMIT");run.count+=count;run.sources.push({name:feeds[i].name,count});}
 catch{await client.query("ROLLBACK");run.sources.push({name:feeds[i].name,count:0,error:"Kayıt işlemi başarısız"});}
 }
 run.finishedAt=new Date().toISOString();run.status=run.sources.every(s=>s.error)?"failed":run.sources.some(s=>s.error)?"partial":"success";
 await client.query("INSERT INTO haber_runs(id,started_at,payload) VALUES ($1,$2,$3)",[run.id,run.startedAt,run]);
 const today=newsDay();
 const articles=await client.query("SELECT payload FROM haber_articles WHERE (published_at AT TIME ZONE 'Europe/Istanbul')::date = $1::date AND published_at<=NOW() AND COALESCE(payload->>'hidden','false') <> 'true' ORDER BY published_at DESC",[today]);
 const body=buildBulletin(articles.rows.map(r=>r.payload),today);
 if(body)await client.query("INSERT INTO haber_bulletins(day,body,channel_url) VALUES($1,$2,$3) ON CONFLICT(day) DO UPDATE SET body=EXCLUDED.body,updated_at=NOW() WHERE haber_bulletins.status <> 'sent'",[today,body,whatsappChannel]);
 return run;
 }finally{if(locked)await client.query("SELECT pg_advisory_unlock(81071001)").catch(()=>undefined);client.release();await pool.end();}
}
