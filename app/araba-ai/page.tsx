import type {Metadata} from "next";
import {ChannelToolNavigation} from "@/components/channel-tool-navigation";
import {MarketplaceHub} from "@/components/marketplace-hub";
import {marketplaceDashboard} from "@/lib/marketplace/store";
export const metadata:Metadata={title:"ArabaAI · Haritalı ikinci el ve sıfır fiyat referansı",description:"Araç ilanlarını haritada inceleyin; ilan fiyatını resmî sıfır araç fiyatı ve Üretir ikinci el ortalamasıyla karşılaştırın.",alternates:{canonical:"/araba-ai"}};
export const dynamic="force-dynamic";
export default async function Page(){const data=await marketplaceDashboard("vehicle");return <><ChannelToolNavigation active="araba-ai"/><MarketplaceHub data={data}/></>;}