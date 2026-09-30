import type {Metadata} from "next";
import {ChannelToolNavigation} from "@/components/channel-tool-navigation";
import {MarketplaceHub} from "@/components/marketplace-hub";
import {marketplaceDashboard} from "@/lib/marketplace/store";
export const metadata:Metadata={title:"EvAI · Haritalı, kaynaklı ve güvenli ilan",description:"Ev, arsa ve kamu taşınmazlarını haritada inceleyin; yerel fiyat referansını görün ve Üretir ID ile güvenli ilan verin.",alternates:{canonical:"/ev-ai"}};
export const dynamic="force-dynamic";
export default async function Page(){const data=await marketplaceDashboard("property");return <><ChannelToolNavigation active="ev-ai"/><MarketplaceHub data={data}/></>;}