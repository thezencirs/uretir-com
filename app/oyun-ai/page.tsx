import type {Metadata} from "next";
import {CategoryHub} from "@/components/category-hub";
const data={"path":"/oyun-ai","title":"OyunAI","kicker":"ÇÖZÜMLER / PLANLANIYOR","description":"Oyun üretimi ve etkileşimli deneyimlere yönelik ürün alanı.","pending":true,"items":[{"label":"Tüm çözümler","href":"/cozumler","description":"Kullanılabilir ürünleri ve geliştirme alanlarını inceleyin."},{"label":"Öneri paylaşın","href":"/iletisim","description":"Bu üründen beklentinizi ekibe iletin."}],"note":"Bu ürün henüz kullanıma açık değil. Geliştirme kapsamı netleştikçe bu sayfada paylaşılacak."};
export const metadata:Metadata={title:data.title,description:data.description,alternates:{canonical:data.path},openGraph:{title:data.title+" — Üretir",description:data.description,url:data.path,type:"website"},robots:{index:false,follow:true},};
export default function Page(){return <CategoryHub data={data}/>;}
