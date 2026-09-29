import Link from "next/link";
import { ArrowUpRight, CarFront, ChartNoAxesCombined, House, MapPinned, MessageCircle, Tags, WalletCards } from "lucide-react";
import { channelTools } from "@/lib/channel-tools";
import { analyticsAttributes } from "@/lib/analytics";

const icons = { "haber-ai": MapPinned, "finans-ai": ChartNoAxesCombined, "puan-ai": WalletCards, "indirim-ai": Tags, "araba-ai": CarFront, "ev-ai": House };

export function ToolShortcuts() {
  return <section id="araclar" className="channel-tools section-wrap" aria-labelledby="channel-tools-title">
    <div className="channel-tools-heading">
      <div><p className="rule-label">ÜRETİR / ARAÇLAR VE KANALLAR</p><h2 id="channel-tools-title">Günlük hayatın<br/><em>altı aracı.</em></h2></div>
      <div><p>Detayları burada incele.<br/>Seçtiğin kanalın kısa paylaşımlarını WhatsApp’tan takip et.</p><span><MessageCircle size={15} aria-hidden="true"/> Her aracın kendi WhatsApp kanalı var</span></div>
    </div>
    <div className="channel-tool-grid">
      {channelTools.map((tool, index) => {
        const Icon = icons[tool.slug];
        return <article key={tool.slug} className="channel-tool-card" style={{ "--tool-color": tool.color } as React.CSSProperties}>
          <Link href={`/${tool.slug}`} className="channel-tool-open" {...analyticsAttributes({event:"discovery_select",surface:"content_discovery",target:tool.slug})}>
            <div className="channel-tool-top"><span className="channel-tool-icon"><Icon size={25} aria-hidden="true"/></span><span>{String(index+1).padStart(2,"0")} / {tool.category}</span><ArrowUpRight size={19} aria-hidden="true"/></div>
            <h3>{tool.name}</h3><p>{tool.description}</p>
            <ul>{tool.features.map(feature=><li key={feature}>{feature}</li>)}</ul>
            <span className="channel-tool-action">Aracı aç <ArrowUpRight size={16} aria-hidden="true"/></span>
          </Link>
          <a className="channel-tool-whatsapp" href={tool.channelUrl} target="_blank" rel="noopener noreferrer" aria-label={`${tool.name} WhatsApp kanalını aç (yeni sekme)`} {...analyticsAttributes({event:"navigation_select",surface:"content_discovery",target:`${tool.slug}-whatsapp`})}><MessageCircle size={17} aria-hidden="true"/> WhatsApp kanalını takip et <ArrowUpRight size={15} aria-hidden="true"/></a>
        </article>;
      })}
    </div>
    <p className="channel-tools-note">Kaynak, tarih ve koşullar detay ekranlarında. Yeni kayıt bulunmayan araçlarda veri durumu açıkça gösterilir.</p>
  </section>;
}
