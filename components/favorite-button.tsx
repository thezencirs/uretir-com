"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import type {MarketplaceListing} from "@/lib/marketplace/types";
async function call(body:unknown){const r=await fetch("/api/marketplace/favorites",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Object.assign(new Error(d.error||"Favori işlemi başarısız."),{status:r.status});return d;}
export function FavoriteButton({item}:{item:MarketplaceListing}){
 const[saved,setSaved]=useState(false),[login,setLogin]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{fetch("/api/marketplace/favorites",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(d?.items)setSaved(d.items.some((x:{item_key:string})=>x.item_key===item.id));}).catch(()=>{});},[item.id]);
 async function toggle(){setBusy(true);setLogin(false);try{await call(saved?{action:"remove",itemKey:item.id}:{action:"add",itemKey:item.id,kind:item.kind,title:item.title,price:item.price,imageUrl:item.images[0]??null,sourceUrl:item.sourceUrl,detailUrl:item.detailUrl,locationLabel:[item.city,item.district].filter(Boolean).join(" / ")});setSaved(!saved);}catch(e){const x=e as Error&{status?:number};if(x.status===401)setLogin(true);}finally{setBusy(false);}}
 return <span className="favorite-wrap"><button className="favorite-button" disabled={busy} aria-pressed={saved} onClick={()=>void toggle()}>{saved?"♥ Kaydedildi":"♡ Favori"}</button>{login&&<Link href="/uretir-id">Giriş yap</Link>}</span>;
}