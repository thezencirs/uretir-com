"use client";
import {useCallback,useEffect,useState} from "react";
type Favorite={item_key:string;kind:"property"|"vehicle";title:string;price:string|number|null;image_url:string|null;source_url:string|null;detail_url:string|null;location_label:string;created_at:string};
type Payload={user:{id:string}|null;items?:Favorite[];error?:string};
const money=(v:string|number|null)=>v===null?"—":new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(Number(v))+" TL";
export function MarketplaceFavorites(){
 const[user,setUser]=useState<Payload["user"]|undefined>(undefined),[items,setItems]=useState<Favorite[]>([]),[error,setError]=useState("");
 const load=useCallback(async()=>{const r=await fetch("/api/marketplace/favorites",{cache:"no-store"}),d=await r.json() as Payload;if(!r.ok)throw Error(d.error||"Favoriler yüklenemedi.");setUser(d.user);setItems(d.items??[]);},[]);
 useEffect(()=>{void load().catch(e=>setError((e as Error).message));},[load]);
 async function remove(itemKey:string){const r=await fetch("/api/marketplace/favorites",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"remove",itemKey})});if(r.ok)await load();}
 if(user===undefined)return <div className="member-next"><p>Favoriler yükleniyor…</p></div>;
 if(!user)return null;
 if(!items.length)return <div className="member-next"><h2>Favorilerin</h2><p>Henüz kaydettiğin ilan yok. EvAI veya ArabaAI’de kalp simgesine dokun.</p></div>;
 return <div className="favorite-list"><div><span className="rule-label">KAYDETTİKLERİN</span><h2>Favoriler</h2></div>{items.map(item=><article key={item.item_key}>{item.image_url?<img src={item.image_url} alt=""/>:<div className="favorite-placeholder">Görsel yok</div>}<div><span>{item.kind==="vehicle"?"ArabaAI":"EvAI"} · {item.location_label}</span><strong>{item.title}</strong><b>{money(item.price)}</b><div>{item.detail_url&&<a href={item.detail_url}>İlanı aç →</a>}{!item.detail_url&&item.source_url&&<a href={item.source_url} target="_blank" rel="noopener noreferrer">Kaynağı aç ↗</a>}<button onClick={()=>void remove(item.item_key)}>Kaldır</button></div></div></article>)}{error&&<p role="alert">{error}</p>}</div>;
}
