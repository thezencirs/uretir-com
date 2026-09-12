"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import type {Quote} from "@/lib/haber-ai/markets";
export function FinanceStrip(){
 const [quotes,setQuotes]=useState<Quote[]>([]),[failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;const refresh=()=>fetch("/api/haber-ai?view=finance").then(r=>r.ok?r.json():Promise.reject(new Error())).then(d=>{if(active&&d){setQuotes(d.quotes);setFailed(false);}}).catch(()=>{if(active)setFailed(true);});void refresh();const timer=setInterval(()=>{if(!document.hidden)void refresh();},300000);return()=>{active=false;clearInterval(timer);};},[]);
 return <section className="haber-ai-finance" aria-label="FinansAI piyasa göstergeleri">{quotes.length?quotes.map(q=><div key={q.label}><span>{q.label}</span><strong>{q.value===null?"Veri yok":q.value.toLocaleString("tr-TR",{maximumFractionDigits:2})} <small>{q.value!==null?q.unit:""}</small></strong><p>{q.asOf?(q.asOf.includes("T")?new Date(q.asOf).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul"}):q.asOf):"Kaynak zamanı yok"}</p><a href={q.url} target="_blank" rel="noreferrer">{q.source} ↗</a><p>{q.note}</p></div>):<p role="status">{failed?"Piyasa kaynaklarına ulaşılamadı. Yeniden denenecek.":"Piyasa göstergeleri yükleniyor…"}</p>}<Link className="haber-finance-link" href="/finans-ai"><strong>Devamı için FinansAI ↗</strong><span>Borsa İstanbul · Döviz · Metaller · Kripto · Emtia</span></Link></section>;
}
