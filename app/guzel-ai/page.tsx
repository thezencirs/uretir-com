import type {Metadata} from "next";
import {CategoryHub} from "@/components/category-hub";
const data={"path":"/guzel-ai","title":"GüzelAI","kicker":"ÇÖZÜMLER / PLANLANIYOR","description":"Güzellik ve kişisel bakım alanında geliştirilecek ürünler için başlangıç noktası.","pending":true,"items":[{"label":"Tüm çözümler","href":"/cozumler","description":"Kullanılabilir ürünleri ve geliştirme alanlarını inceleyin."},{"label":"Öneri paylaşın","href":"/iletisim","description":"Bu üründen beklentinizi ekibe iletin."}],"note":"Bu ürün henüz kullanıma açık değil. Geliştirme kapsamı netleştikçe bu sayfada paylaşılacak."};
export const metadata:Metadata={title:data.title,description:data.description,alternates:{canonical:data.path},openGraph:{title:data.title+" — Üretir",description:data.description,url:data.path,type:"website"},robots:{index:false,follow:true},};
export default function Page(){return <CategoryHub data={data}/>;}
