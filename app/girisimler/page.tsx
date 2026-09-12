import type {Metadata} from "next";
import {CategoryHub} from "@/components/category-hub";
const data={"path":"/girisimler","title":"Girişimler","kicker":"ÜRETİR / WEB & APP","description":"Bir fikrin kullanılan bir ürüne dönüşme yolculuğu. Web deneyimleri ve uygulama çalışmalarını burada bir araya getiriyoruz.","items":[{"label":"WEB","href":"/girisimler/web","description":"Tarayıcıdan erişilebilen Üretir deneyimleri."},{"label":"APP","href":"/girisimler/app","description":"Uygulama çalışmalarının geliştirme durumu."}]};
export const metadata:Metadata={title:data.title,description:data.description,alternates:{canonical:data.path},openGraph:{title:data.title+" — Üretir",description:data.description,url:data.path,type:"website"},};
export default function Page(){return <CategoryHub data={data}/>;}
