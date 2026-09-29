import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MessageCircle } from "lucide-react";
import { channelTools, getChannelTool, type ChannelToolSlug } from "@/lib/channel-tools";
import { analyticsAttributes } from "@/lib/analytics";

export function ChannelToolNavigation({active}: {active: ChannelToolSlug}) {
  const tool = getChannelTool(active);
  return <div className="channel-workspace-nav section-wrap">
    <div className="channel-workspace-top"><Link href="/#araclar"><ArrowLeft size={15} aria-hidden="true"/> Tüm araçlar</Link><a href={tool.channelUrl} target="_blank" rel="noopener noreferrer" aria-label={`${tool.name} WhatsApp kanalı (yeni sekme)`} {...analyticsAttributes({event:"navigation_select",surface:"content_discovery",target:`${active}-whatsapp`})}><MessageCircle size={17} aria-hidden="true"/> {tool.name} WhatsApp kanalı <ArrowUpRight size={15} aria-hidden="true"/></a></div>
    <nav aria-label="AI araçları">{channelTools.map(item=><Link key={item.slug} href={`/${item.slug}`} aria-current={item.slug===active?"page":undefined}>{item.name}</Link>)}</nav>
  </div>;
}
