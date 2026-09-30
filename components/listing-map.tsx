"use client";
import {useEffect,useRef} from "react";
import type {Map as LeafletMap,Marker,LeafletMouseEvent,LatLngTuple} from "leaflet";
import type {MarketplaceListing} from "@/lib/marketplace/types";
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const money=(n:number)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(n)+" TL";
export function ListingMap({items}:{items:MarketplaceListing[]}){
 const el=useRef<HTMLDivElement>(null);
 useEffect(()=>{let map:LeafletMap|undefined,alive=true;(async()=>{if(!el.current)return;const L=await import("leaflet");if(!alive||!el.current)return;map=L.map(el.current,{scrollWheelZoom:false,zoomControl:true}).setView([39,35],6);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors",maxZoom:18}).addTo(map);const bounds:LatLngTuple[]=[];for(const item of items){if(!Number.isFinite(item.latitude)||!Number.isFinite(item.longitude))continue;const label=item.price?money(item.price):item.city;const icon=L.divIcon({className:"market-pin-wrap",html:`<span class="market-pin">${esc(label)}</span>`,iconSize:[90,32],iconAnchor:[45,16]});const marker=L.marker([item.latitude,item.longitude],{icon}).addTo(map);bounds.push([item.latitude,item.longitude]);const detail=item.detailUrl?`<a href="${esc(item.detailUrl)}">İlanı aç →</a>`:item.sourceUrl?`<a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener">Kaynağı aç ↗</a>`:"";marker.bindPopup(`<strong>${esc(item.title)}</strong><br><small>${esc(item.city+" / "+item.district)} · ${item.locationPrecision==="approximate"?"yaklaşık konum":"konum"}</small><br><b>${esc(label)}</b><br>${detail}`);}if(bounds.length>1)map.fitBounds(bounds,{padding:[40,40],maxZoom:11});else if(bounds.length===1)map.setView(bounds[0],11);})();return()=>{alive=false;map?.remove();};},[items]);
 return <div className="market-map" ref={el} aria-label="İlan haritası"/>;
}
export function LocationPicker({value,onChange}:{value:{lat:number;lng:number}|null;onChange:(v:{lat:number;lng:number})=>void}){
 const el=useRef<HTMLDivElement>(null),callback=useRef(onChange),initial=useRef(value);
 callback.current=onChange;
 useEffect(()=>{let map:LeafletMap|undefined,marker:Marker|undefined,alive=true;(async()=>{if(!el.current)return;const L=await import("leaflet");if(!alive||!el.current)return;const start=initial.current;map=L.map(el.current,{scrollWheelZoom:false}).setView(start?[start.lat,start.lng]:[39,35],start?13:6);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors"}).addTo(map);if(start)marker=L.marker([start.lat,start.lng]).addTo(map);map.on("click",(e:LeafletMouseEvent)=>{if(marker)marker.setLatLng(e.latlng);else if(map)marker=L.marker(e.latlng).addTo(map);callback.current({lat:Number(e.latlng.lat.toFixed(6)),lng:Number(e.latlng.lng.toFixed(6))});});})();return()=>{alive=false;map?.remove();};},[]);
 return <div className="market-map market-map-picker" ref={el} aria-label="İlan konumunu haritada seç"/>;
}
