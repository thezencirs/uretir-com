import type {Metadata} from "next";
import {ChannelToolNavigation} from "@/components/channel-tool-navigation";
import {MarketplaceHub} from "@/components/marketplace-hub";
import {marketplaceDashboard} from "@/lib/marketplace/store";
import {SeoExplainer} from "@/components/seo-explainer";
export const metadata:Metadata={
  title:"EvAI · Haritalı, kaynaklı ve güvenli ilan",
  description:"Ev, arsa ve kamu taşınmazlarını haritada inceleyin; yerel fiyat referansını görün ve Üretir ID ile güvenli ilan verin.",
  keywords:[
    "konut metrekare fiyatları",
    "kamu ihale satılık daire arsa",
    "icradan satılık taşınmazlar",
    "haritalı satılık ev karşılaştırma",
    "bölgesel emlak fiyat endeksi",
    "EvAI"
  ],
  alternates:{canonical:"/ev-ai"},
  openGraph:{title:"EvAI · Haritalı, kaynaklı ve güvenli ilan",description:"Ev, arsa ve kamu taşınmazlarını haritada inceleyin; yerel fiyat referansını görün ve Üretir ID ile güvenli ilan verin.",url:"/ev-ai",type:"website"}
};
export const dynamic="force-dynamic";
export default async function Page(){const data=await marketplaceDashboard("property");return <><ChannelToolNavigation active="ev-ai"/><MarketplaceHub data={data}/><SeoExplainer slug="ev-ai"/></>;}