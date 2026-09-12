import type {Metadata} from "next";
import {CategoryHub} from "@/components/category-hub";
const data={"path":"/girisimler/app","title":"APP","kicker":"GİRİŞİMLER / UYGULAMALAR","description":"Üretir deneyimlerini uygulamalara taşıma alanı. Henüz yayımlanmış bir mağaza uygulaması bulunmuyor.","pending":true,"items":[{"label":"Web deneyimlerini kullanın","href":"/girisimler/web","description":"Şimdilik mevcut ürünlere tarayıcınızdan erişebilirsiniz."}]};
export const metadata:Metadata={title:data.title,description:data.description,alternates:{canonical:data.path},openGraph:{title:data.title+" — Üretir",description:data.description,url:data.path,type:"website"},robots:{index:false,follow:true},};
export default function Page(){return <CategoryHub data={data}/>;}
