import { NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { createElement as h } from "react";
import { newsPool } from "@/lib/haber-ai/store";
import provinces from "@/lib/haber-ai/provinces.json";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
 const {id}=await params;
 if(!/^[a-f0-9]{64}$/.test(id))return new NextResponse("Geçersiz haber",{status:400});
 const pool=newsPool();
 try {
  const result=await pool.query<{payload:{title:string;source:string;publishedAt:string;provinceCodes?:string[]}}>("SELECT payload FROM haber_articles WHERE id=$1 AND published_at<=NOW() AND COALESCE(payload->>'hidden','false') <> 'true' LIMIT 1",[id]);
  const article=result.rows[0]?.payload;
  if(!article)return new NextResponse("Haber bulunamadı",{status:404});
  const cities=(article.provinceCodes??[]).map(code=>provinces.find(p=>p.code===code)?.name).filter(Boolean).slice(0,3).join(" · ")||"Türkiye";
  const date=new Intl.DateTimeFormat("tr-TR",{dateStyle:"medium",timeZone:"Europe/Istanbul"}).format(new Date(article.publishedAt));
  return new ImageResponse(h("div",{style:{display:"flex",flexDirection:"column",width:"100%",height:"100%",padding:"64px 76px",background:"#14251c",color:"#ffffff",fontFamily:"sans-serif"}},
   h("div",{style:{display:"flex",justifyContent:"space-between",color:"#c0f34f",fontSize:30}},h("span",null,"üretir."),h("span",null,"HaberAI")),
   h("div",{style:{display:"flex",marginTop:44,color:"#c0f34f",fontSize:28}},cities),
   h("div",{style:{display:"flex",marginTop:28,fontSize:article.title.length>140?36:48,lineHeight:1.2,fontWeight:700}},article.title.slice(0,220)),
   h("div",{style:{display:"flex",marginTop:"auto",fontSize:22,color:"#bacdbf"}},`${article.source} · ${date}`),
   h("div",{style:{display:"flex",marginTop:16,fontSize:24,color:"#c0f34f"}},"Türkiye Üretir, Gençler Yetişir")
  ),{width:1200,height:630,headers:{"Cache-Control":"public, max-age=300"}});
 }finally{await pool.end();}
}
