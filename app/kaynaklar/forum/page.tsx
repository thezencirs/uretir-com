import type {Metadata} from "next";
import {redirect} from "next/navigation";
export const metadata:Metadata={title:"Forum",description:"Üretir topluluk alanına yönlendirme.",robots:{index:false,follow:true},alternates:{canonical:"/kaynaklar/forum"},openGraph:{title:"Forum — Üretir",description:"Üretir topluluk alanına yönlendirme.",url:"/kaynaklar/forum",type:"website"}};
export default function Page(){redirect("/kaynaklar/topluluk");}
