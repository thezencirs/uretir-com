import Link from "next/link";
import { ArrowUpRight, CalendarDays, CreditCard, MapPin } from "lucide-react";
import type { PuanAIBank, PuanAICampaign } from "@/lib/puan-ai";

export function PuanAICampaignCard({ campaign, bank, compact = false }: { campaign: PuanAICampaign; bank?: PuanAIBank; compact?: boolean }) {
  return <article className={`puan-campaign-card${compact ? " puan-campaign-card--compact" : ""}`}>
    <div className="puan-campaign-card__topline">
      <span className="puan-badge puan-badge--category">{campaign.category}</span>
      <span className="puan-campaign-card__updated">{campaign.updatedAt}</span>
    </div>
    <div className="puan-campaign-card__merchant"><span className="puan-bank-mark" style={{ "--bank-color": bank?.color ?? "#6e766d" } as React.CSSProperties}>{bank?.shortName ?? "PA"}</span><span>{campaign.merchant}</span><span className="puan-campaign-card__separator">/</span><span>{bank?.name ?? "Banka"}</span></div>
    <h3><Link href={`/puan-ai/kampanya/${campaign.slug}`}>{campaign.title}</Link></h3>
    <p className="puan-campaign-card__description">{campaign.description}</p>
    <div className="puan-campaign-card__benefit"><strong>{campaign.benefit}</strong><span>{campaign.benefitType}</span></div>
    <div className="puan-campaign-card__details">
      <span><CreditCard size={13} /> {campaign.minSpend}</span>
      <span><CalendarDays size={13} /> {campaign.expiresAt}</span>
    </div>
    {!compact && <div className="puan-campaign-card__footer"><span><MapPin size={13} /> {campaign.installment}</span><Link href={`/puan-ai/kampanya/${campaign.slug}`} className="link-arrow">Detay <ArrowUpRight size={15} /></Link></div>}
  </article>;
}

