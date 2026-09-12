"use client";
import { useState, type FormEvent } from "react";
import { PuanAICampaignResult } from "./puan-ai-campaign-result";
import type { CampaignMatch } from "@/lib/puan-ai/types";

export function PuanAIQuickCompare() {
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const [result,setResult]=useState<{results:{card:string;campaigns:CampaignMatch[]}[];coverage:string}|null>(null);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");setResult(null);const values=new FormData(e.currentTarget);const query=new URLSearchParams();values.forEach((v,k)=>{if(String(v).trim())query.set(k,String(v));});try{const r=await fetch("/api/puan-ai/compare?"+query,{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setResult(d);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <section className="section-wrap pa-quick" aria-label="Kartlarını karşılaştır">
    <h1>Kartlarınla ne kazanabilirsin?</h1><p>Kart adlarını yaz, alışveriş kategorini seç. Tutarı eklersen hesaplanabilen ödülleri görürsün. Kart numarası ve hesap bilgisi gerekmez.</p>
    <form className="pa-filter-grid" onSubmit={submit}>
      <label><span>Kart adların · virgülle ayır</span><input required name="cards" maxLength={200} placeholder="Bankkart, Worldcard, Bonus" autoComplete="off"/></label>
      <label><span>Alışveriş kategorisi</span><select name="category">{["Akaryakıt","Market","Eğitim","Elektronik","Giyim","Seyahat","Sağlık","Restoran","Sigorta"].map(c=><option key={c}>{c}</option>)}</select></label>
      <label><span>Tutar · TL (isteğe bağlı)</span><input name="amount" type="number" min="0.01" max="10000000" step="0.01" inputMode="decimal" placeholder="1500"/></label>
      <label><span>Önceliğin</span><select name="preference"><option value="puan">Puan / indirim</option><option value="taksit">Taksit</option></select></label>
      <button disabled={busy}>{busy?"Karşılaştırılıyor…":"Avantajları göster →"}</button>
    </form>
    {error&&<p role="alert">{error}</p>}
    {result&&<div aria-live="polite"><p className="pa-explorer__status">{result.coverage}</p>{result.results.map(r=><section key={r.card}><h2>{r.card}</h2>{r.campaigns.length?<div className="pa-explorer__grid">{r.campaigns.map(c=><div key={c.id}><p>{c.decision.totalVerifiedBenefit>0?`Koşullar sağlanırsa ${c.decision.totalVerifiedBenefit.toLocaleString("tr-TR")} TL değerinde avantaj` : "Kesin kazanç için kampanyanın işlem ve katılım koşullarını kontrol et."}</p><PuanAICampaignResult campaign={c}/></div>)}</div>:<p>Bu kart ve kategori için güncel, doğrulanmış kampanya bulunamadı. Bu sonuç bankada kampanya olmadığı anlamına gelmez.</p>}</section>)}</div>}
  </section>;
}
