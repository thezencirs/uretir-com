"use client";
import {useState} from "react";
import Link from "next/link";
async function post(body:unknown){const r=await fetch("/api/marketplace/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Object.assign(new Error(d.error||"Mesaj gönderilemedi."),{status:r.status});return d;}
export function ListingContact({listingId}:{listingId:string}){
 const[msg,setMsg]=useState("Merhaba, ilanla ilgileniyorum. İlan hâlâ güncel mi?"),[status,setStatus]=useState(""),[busy,setBusy]=useState(false),[needsLogin,setNeedsLogin]=useState(false);
 async function send(){setBusy(true);setStatus("");setNeedsLogin(false);try{await post({action:"send",listingId,message:msg});setStatus("Mesaj satıcıya iletildi. Üretir ID > Mesajlar bölümünden konuşmaya devam edebilirsin.");}catch(e){const x=e as Error&{status?:number};if(x.status===401)setNeedsLogin(true);setStatus(x.message);}finally{setBusy(false);}}
 return <section className="market-safe-contact"><strong>Satıcıya mesaj gönder</strong><p>Telefon veya e-posta paylaşmak zorunda değilsin. Konuşma Üretir ID içinde kalır.</p><textarea rows={3} maxLength={1200} value={msg} onChange={e=>setMsg(e.target.value)}/><div><button className="market-primary" disabled={busy||msg.trim().length<1} onClick={()=>void send()}>{busy?"Gönderiliyor…":"Mesaj gönder →"}</button></div>{status&&<p role="status">{status}</p>}{needsLogin&&<Link href="/uretir-id">Üretir ID ile giriş yap →</Link>}</section>;
}
