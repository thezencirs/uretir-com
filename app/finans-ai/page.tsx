import type {Metadata} from "next";
import {FinanceDashboard} from "@/components/finance-dashboard";
import {ChannelToolNavigation} from "@/components/channel-tool-navigation";
import {SeoExplainer} from "@/components/seo-explainer";
export const metadata:Metadata={alternates:{canonical:"/finans-ai"},title:"FinansAI · Piyasaların gündemi",description:"Borsa İstanbul, döviz, metaller, kripto ve emtia fiyatlarını kaynak ve veri zamanıyla takip edin.",openGraph:{title:"FinansAI · Piyasaların gündemi",description:"Borsa İstanbul, döviz, metaller, kripto ve emtia fiyatlarını kaynak ve veri zamanıyla takip edin.",url:"/finans-ai",type:"website"}};
export default function Page(){return <><ChannelToolNavigation active="finans-ai"/><FinanceDashboard/><SeoExplainer slug="finans-ai"/></>;}
