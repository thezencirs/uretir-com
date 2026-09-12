import type { Article } from "./model";
import provinces from "./provinces.json";
import { newsDay } from "./dates";
export const whatsappChannel = "https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y";
export function buildBulletin(articles:Article[], day=newsDay()) {
 const seen=new Set<string>();
 const selected=articles.filter(a=>!a.hidden&&newsDay(a.publishedAt)===day&&a.provinceCodes.length).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).filter(a=>{if(seen.has(a.url))return false;seen.add(a.url);return true;}).slice(0,10);
 if(!selected.length)return "";
 return ["Türkiye Üretir · HaberAI | "+day,"Şehirlerden gündem · Kaynak bağlantıları",...selected.map(a=>a.provinceCodes.map(code=>"#"+(provinces.find(p=>p.code===code)?.name??"Türkiye")).join(" ")+"\n"+a.title+"\nKaynak: "+a.source+"\n"+a.url),"Harita ve tarihli arşiv: https://www.uretir.com/haber-ai?day="+day,"Türkiye Üretir, Gençler Yetişir"].join("\n\n");
}
