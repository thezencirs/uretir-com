"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
type Message={id:string;conversation_id:string;sender_user_id:string;body:string;read_at:string|null;created_at:string};
type Conversation={id:string;listing_id:string;buyer_user_id:string;seller_user_id:string;title:string;kind:"property"|"vehicle";price:string|number;listing_status:string;buyer_handle:string;buyer_name:string;seller_handle:string;seller_name:string;unread:number;messages:Message[]};
type Payload={user:{id:string}|null;conversations?:Conversation[];error?:string};
const money=(n:string|number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(Number(n))+" TL";
async function send(body:unknown){const r=await fetch("/api/marketplace/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error||"Mesaj gönderilemedi.");return d;}
export function MarketplaceMessages(){
 const[user,setUser]=useState<Payload["user"]|undefined>(undefined),[items,setItems]=useState<Conversation[]>([]),[active,setActive]=useState<string|null>(null),[draft,setDraft]=useState(""),[error,setError]=useState("");
 const load=useCallback(async()=>{const r=await fetch("/api/marketplace/messages",{cache:"no-store"}),d=await r.json() as Payload;if(!r.ok)throw Error(d.error||"Mesajlar yüklenemedi.");setUser(d.user);setItems(d.conversations??[]);setActive(x=>x??d.conversations?.[0]?.id??null);},[]);
 useEffect(()=>{void load().catch(e=>setError((e as Error).message));},[load]);
 const conversation=useMemo(()=>items.find(x=>x.id===active)??null,[items,active]);
 useEffect(()=>{if(!conversation||!user||conversation.unread<1)return;void send({action:"read",conversationId:conversation.id}).then(load).catch(()=>{});},[conversation?.id]);
 async function reply(){if(!conversation||!draft.trim())return;try{await send({action:"send",conversationId:conversation.id,message:draft.trim()});setDraft("");await load();}catch(e){setError((e as Error).message);}}
 if(user===undefined)return <div className="member-next"><p>Mesajlar yükleniyor…</p></div>;
 if(!user)return null;
 if(!items.length)return <div className="member-next"><h2>Mesajların</h2><p>Henüz bir ilan konuşman yok. EvAI veya ArabaAI’de bir ilana mesaj gönderdiğinde burada görünecek.</p></div>;
 return <div className="market-messages"><aside>{items.map(c=><button key={c.id} aria-pressed={active===c.id} onClick={()=>setActive(c.id)}><strong>{c.title}</strong><span>{c.kind==="vehicle"?"ArabaAI":"EvAI"} · {money(c.price)}</span><small>@{c.buyer_user_id===user.id?c.seller_handle:c.buyer_handle}{c.unread>0?" · "+c.unread+" yeni":""}</small></button>)}</aside><section>{conversation&&<><header><div><span className="rule-label">{conversation.kind==="vehicle"?"ARABAAI":"EVAI"} / MESAJ</span><h2>{conversation.title}</h2><p>{money(conversation.price)} · @{conversation.buyer_user_id===user.id?conversation.seller_handle:conversation.buyer_handle}</p></div><a href={"/"+(conversation.kind==="vehicle"?"araba-ai":"ev-ai")+"/ilan/"+conversation.listing_id}>İlana dön ↗</a></header><div className="market-thread">{conversation.messages.map(m=><article key={m.id} data-mine={m.sender_user_id===user.id}><p>{m.body}</p><time>{new Date(m.created_at).toLocaleString("tr-TR")}</time></article>)}</div><footer><textarea rows={3} maxLength={1200} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Mesaj yaz…"/><button className="member-primary" disabled={!draft.trim()} onClick={()=>void reply()}>Gönder →</button></footer></>}{error&&<p role="alert">{error}</p>}</section></div>;
}
