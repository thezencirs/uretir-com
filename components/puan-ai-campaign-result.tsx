import Link from "next/link";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, CreditCard, ExternalLink, Landmark, ReceiptText, ShieldCheck } from "lucide-react";
import { getRuleValue } from "@/lib/puan-ai/rule-engine";
import type { CampaignMatch, CampaignView } from "@/lib/puan-ai/types";
import { analyticsAttributes } from "@/lib/analytics";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

type CampaignResultProps = {
  campaign: CampaignView | CampaignMatch;
  compact?: boolean;
};

export function PuanAICampaignResult({ campaign, compact = false }: CampaignResultProps) {
  const reward = getRuleValue(campaign, ["MAX_REWARD", "REWARD_AMOUNT"]);
  const minSpend = getRuleValue(campaign, ["MIN_SPEND"]);
  const verification = campaign.verification;
  const source = campaign.sources.find((item) => item.id === verification?.officialSourceId);

  return <article className={`pa-campaign-card ${compact ? "pa-campaign-card--compact" : ""}`}>
    <div className="pa-campaign-card__top">
      <div className="pa-bank">
        <span className="pa-bank__mark" style={{ "--pa-bank": campaign.bank.color } as React.CSSProperties}>{campaign.bank.shortName}</span>
        <span><small>Resmî banka</small><strong>{campaign.bank.name}</strong></span>
      </div>
      <span className="pa-verified-badge"><ShieldCheck size={13} /> Doğrulandı</span>
    </div>

    <div className="pa-campaign-card__body">
      <p className="pa-kicker">{campaign.merchant?.name ?? campaign.category.name} / {campaign.category.name}</p>
      <h3>{campaign.title}</h3>
      <p className="pa-campaign-card__summary">{campaign.benefitSummary}</p>

      <dl className="pa-campaign-facts">
        <div><dt><CalendarDays size={14} /> Kampanya tarihleri</dt><dd>{dateFormatter.format(new Date(campaign.startDate))} – {dateFormatter.format(new Date(campaign.endDate))}</dd></div>
        <div><dt><ReceiptText size={14} /> Ödül</dt><dd>{reward !== null ? `${reward.toLocaleString("tr-TR")} ${campaign.rewardType?.unit ?? "TL"}` : campaign.benefitSummary}</dd></div>
        <div><dt><CreditCard size={14} /> Taksit</dt><dd>{campaign.installments.length > 0 ? campaign.installments.map((item) => item.count).join(", ") + " taksit" : "Bu kampanyada taksit avantajı yok"}</dd></div>
        {minSpend !== null && <div><dt><Landmark size={14} /> Asgari işlem</dt><dd>{minSpend.toLocaleString("tr-TR")} TL</dd></div>}
      </dl>

      {!compact && <div className="pa-conditions">
        <p><CheckCircle2 size={14} /> Koşullar</p>
        <ul>{campaign.rules.map((rule) => <li key={rule.id}>{rule.description}</li>)}</ul>
      </div>}
    </div>

    <footer className="pa-campaign-card__footer">
      <div><Clock3 size={13} /><span>Son doğrulama<br /><strong>{verification ? dateFormatter.format(new Date(verification.checkedAt)) : "—"}</strong></span></div>
      <div className="pa-campaign-card__links">
        <Link href={`/puan-ai/kampanya/${campaign.slug}`} {...analyticsAttributes({ event: "ai_recommendation_open", surface: "puan_ai_browser", target: campaign.slug })}>Ayrıntılar <ArrowUpRight size={13} /></Link>
        {source && <a href={source.url} target="_blank" rel="noopener noreferrer" {...analyticsAttributes({ event: "discovery_select", surface: "puan_ai_browser", target: "official-source" })}>Resmî kaynak <ExternalLink size={13} /></a>}
      </div>
    </footer>
  </article>;
}
