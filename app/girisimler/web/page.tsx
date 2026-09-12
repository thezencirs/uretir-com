import type {Metadata} from "next";
import {CategoryHub} from "@/components/category-hub";
const data={"path":"/girisimler/web","title":"WEB","kicker":"GİRİŞİMLER / WEB","description":"Kurulum gerektirmeden erişilen, Türkiye için geliştirilen web deneyimleri.","items":[{"label":"HaberAI","href":"/haber-ai","description":"Şehirlerin gündemini kaynaklı haberlerle haritadan izleyin."},{"label":"FinansAI","href":"/finans-ai","description":"Piyasaları veri zamanı ve kaynak bilgisiyle takip edin."},{"label":"PuanAI","href":"/puan-ai","description":"Kart kampanyalarını koşullarıyla inceleyin."}]};
export const metadata:Metadata={title:data.title,description:data.description,alternates:{canonical:data.path},openGraph:{title:data.title+" — Üretir",description:data.description,url:data.path,type:"website"},};
export default function Page(){return <CategoryHub data={data}/>;}
