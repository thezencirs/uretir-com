import type {Metadata} from "next";
import {CategoryHub} from "@/components/category-hub";
const data={"path":"/kaynaklar/destek","title":"Destek","kicker":"KAYNAKLAR / YARDIM","description":"Ürünlerle ilgili sorularınız, veri düzeltme talepleriniz ve iş birliği önerileriniz için Üretir ekibine ulaşın.","items":[{"label":"İletişim","href":"/iletisim","description":"Sorunun oluştuğu sayfayı ve gördüğünüz hatayı paylaşın."},{"label":"Gizlilik politikası","href":"/gizlilik-politikasi","description":"Verilerinizin işlenmesine ilişkin bilgileri inceleyin."},{"label":"Çözümler","href":"/cozumler","description":"Ürünlerin kapsamını ve geliştirme durumunu kontrol edin."}]};
export const metadata:Metadata={title:data.title,description:data.description,alternates:{canonical:data.path},openGraph:{title:data.title+" — Üretir",description:data.description,url:data.path,type:"website"},};
export default function Page(){return <CategoryHub data={data}/>;}
