import {z} from "zod";
import provinces from "@/lib/haber-ai/provinces.json";
const website=z.string().max(300).refine(s=>s===""||(/^https:\/\//.test(s)&&(()=>{try{const u=new URL(s);return !u.username&&!u.password&&!["localhost","127.0.0.1"].includes(u.hostname);}catch{return false;}})()),"Web adresi https:// ile başlamalı.");
export const credentials=z.object({handle:z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/),password:z.string().min(12).max(128)});
export const registration=credentials.extend({displayName:z.string().trim().min(2).max(60),consent:z.literal(true)});
export const startupSchema=z.object({name:z.string().trim().min(2).max(100),cityCode:z.string().refine(c=>provinces.some(p=>p.code===c)),product:z.string().trim().min(5).max(160),description:z.string().trim().min(30).max(2000),website,stage:z.enum(["Fikir","Prototip","Kullanımda"])});
export const postSchema=z.object({title:z.string().trim().min(5).max(140),body:z.string().trim().min(60).max(12000),topic:z.enum(["Ürün fikri","Geliştirme günlüğü","Geri bildirim","Girişimcilik"])});
export const commentSchema=z.object({body:z.string().trim().min(5).max(2000)});
