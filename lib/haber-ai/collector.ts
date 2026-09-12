import {randomUUID} from "node:crypto";
import {feeds,parseFeed} from "./model";
import {newsPool} from "./store";
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
 return parseFeed(Buffer.concat(chunks).toString("utf8"),feed);
 }));
 for(const[i,result]of results.entries()){
 if(result.status==="rejected"){run.sources.push({name:feeds[i].name,count:0,error:"Kaynak okunamadı veya RSS doğrulanamadı"});continue;}
 let count=0;await client.query("BEGIN");
 try{for(const article of result.value){const saved=await client.query("INSERT INTO haber_articles(id,published_at,payload) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET payload=EXCLUDED.payload WHERE haber_articles.payload->>'editedAt' IS NULL",[article.id,article.publishedAt,article]);count+=saved.rowCount??0;}await client.query("COMMIT");run.count+=count;run.sources.push({name:feeds[i].name,count});}
 catch{await client.query("ROLLBACK");run.sources.push({name:feeds[i].name,count:0,error:"Kayıt işlemi başarısız"});}
 }
 run.finishedAt=new Date().toISOString();run.status=run.sources.every(s=>s.error)?"failed":run.sources.some(s=>s.error)?"partial":"success";
 await client.query("INSERT INTO haber_runs(id,started_at,payload) VALUES ($1,$2,$3)",[run.id,run.startedAt,run]);return run;
 }finally{if(locked)await client.query("SELECT pg_advisory_unlock(81071001)").catch(()=>undefined);client.release();await pool.end();}
}
