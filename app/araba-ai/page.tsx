import type {Metadata} from "next";
import {ChannelToolNavigation} from "@/components/channel-tool-navigation";
import {MarketplaceHub} from "@/components/marketplace-hub";
import {marketplaceDashboard} from "@/lib/marketplace/store";
import {SeoExplainer} from "@/components/seo-explainer";
export const metadata:Metadata={
  title:"ArabaAI · Haritalı ikinci el ve sıfır fiyat referansı",
  description:"Araç ilanlarını haritada inceleyin; ilan fiyatını resmî sıfır araç fiyatı ve Üretir ikinci el ortalamasıyla karşılaştırın.",
  keywords:[
    "sıfır araç fiyatları 2026",
    "otomobil kampanyaları",
    "ikinci el araba fiyat karşılaştırma",
    "BYD Renault Toyota Volkswagen Peugeot fiyat listesi",
    "elektrikli araç fiyatları Türkiye",
    "ArabaAI"
  ],
  alternates:{canonical:"/araba-ai"},
  openGraph:{title:"ArabaAI · Haritalı ikinci el ve sıfır fiyat referansı",description:"Araç ilanlarını haritada inceleyin; ilan fiyatını resmî sıfır araç fiyatı ve Üretir ikinci el ortalamasıyla karşılaştırın.",url:"/araba-ai",type:"website"}
};
export const dynamic="force-dynamic";
export default async function Page(){const data=await marketplaceDashboard("vehicle");return <><ChannelToolNavigation active="araba-ai"/><MarketplaceHub data={data}/><SeoExplainer slug="araba-ai"/></>;}