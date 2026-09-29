import type {Metadata} from "next"; import {HaberAI} from "@/components/haber-ai"; import {getNewsSnapshot} from "@/lib/haber-ai/store";
import {ChannelToolNavigation} from "@/components/channel-tool-navigation";
export const metadata:Metadata={alternates:{canonical:"/haber-ai"},title:"HaberAI · Türkiye haritası",description:"Türkiye genelinde şehir şehir kaynaklı günlük gelişmeler.",openGraph:{title:"HaberAI · Türkiye haritası",description:"Türkiye genelinde şehir şehir kaynaklı günlük gelişmeler.",url:"/haber-ai",type:"website"}}; export const revalidate=60;
export default async function Page(){return <><ChannelToolNavigation active="haber-ai"/><HaberAI initial={await getNewsSnapshot()}/></>}
