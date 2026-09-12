import type {Metadata} from "next";
import {CategoryHub} from "@/components/category-hub";
const data={"path":"/kaynaklar/e-kitaplar","title":"E-kitaplar","kicker":"KAYNAKLAR / DİJİTAL YAYINLAR","description":"Üretim, teknoloji ve girişimcilik için hazırlanacak dijital yayınların kütüphanesi.","pending":true,"items":[{"label":"Blogu inceleyin","href":"/blog","description":"E-kitaplar yayımlanana kadar mevcut içeriklere göz atın."}],"note":"Henüz indirilebilir bir e-kitap yayımlanmadı."};
export const metadata:Metadata={title:data.title,description:data.description,alternates:{canonical:data.path},openGraph:{title:data.title+" — Üretir",description:data.description,url:data.path,type:"website"},robots:{index:false,follow:true},};
export default function Page(){return <CategoryHub data={data}/>;}
