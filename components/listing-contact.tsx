"use client";
import {useState} from "react";
import Link from "next/link";
async function post(body:unknown){const r=await fetch("/api/marketplace",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Object.assign(new Error(d.error||"İşlem tamamlanamadı."),{status:r.status});return d;}
export function ListingContact({listingId}:{listingId:string}){
 const[msg,setMsg]=useState("Merhaba, ilanla ilgileniyorum. Uygunsa detayları konuşmak isterim."),[status,setStatus]=useState(""),[busy,setBusy]=useState(false),[needsLogin,setNeedsLogin]=useState(false);
 async function send(){setBusy(true);setStatus("");setNeedsLogin(false);try{await post({action:"contact",listingId,message:msg});setStatus("İletişim isteği satıcıya iletildi.");}catch(e){const x=e as Error&{status?:number};if(x.status===401)setNeedsLogin(true);setStatus(x.message);}finally{setBusy(false);}}
 async function report(){const reason=window.prompt("Neden raporlamak istiyorsun? wrong_info, suspicious_price, duplicate, sold, fraud_risk, other","fraud_risk");if(!reason)return;try{await post({action:"report",listingId,reason,note:"İlan detay sayfasından raporlandı."});setStatus("Rapor alındı. İnceleme kuyruğuna eklendi.");}catch(e){const x=e as Error&{status?:number};if(x.status===401)setNeedsLogin(true);setStatus(x.message);}}
 return <section className="market-safe-contact"><strong>Güvenli iletişim</strong><p>Telefon numarası herkese açık değildir. Mesaj önce Üretir ID üzerinden satıcıya gider.</p><textarea rows={3} maxLength={700} value={msg} onChange={e=>setMsg(e.target.value)}/><div><button className="market-primary" disabled={busy||msg.trim().length<5} onClick={()=>void send()}>{busy?"Gönderiliyor…":"İletişim isteği gönder →"}</button><button onClick={()=>void report()}>İlanı raporla</button></div>{status&&<p role="status">{status}</p>}{needsLogin&&<Link href="/uretir-id">Üretir ID ile giriş yap →</Link>}</section>;
}
