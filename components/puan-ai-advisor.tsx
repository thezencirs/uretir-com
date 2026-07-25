"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, Bot, Check, CircleAlert, CreditCard, MessageCircle, RefreshCcw, Send, ShieldCheck, Sparkles } from "lucide-react";
import { analyticsAttributes } from "@/lib/analytics";
import { getPuanAIBank, getPuanAICampaignProvenance, type CampaignCategory, type PuanAICampaign } from "@/lib/puan-ai";

type Priority = "reward" | "installment" | "discount";
type Intent = { label: string; category: CampaignCategory };

const intents: Intent[] = [
  { label: "Market alışverişi", category: "Market" },
  { label: "Teknoloji ürünü", category: "Teknoloji" },
  { label: "Online alışveriş", category: "E-ticaret" },
  { label: "Seyahat planı", category: "Seyahat" },
];

const priorities: Array<{ label: string; value: Priority }> = [
  { label: "En çok puan", value: "reward" },
  { label: "Taksit", value: "installment" },
  { label: "Anlık indirim", value: "discount" },
];

function inferIntent(value: string): Intent {
  const normalized = value.toLocaleLowerCase("tr-TR");
  if (normalized.includes("market") || normalized.includes("gıda")) return intents[0];
  if (normalized.includes("teknoloji") || normalized.includes("telefon") || normalized.includes("bilgisayar")) return intents[1];
  if (normalized.includes("uçak") || normalized.includes("seyahat") || normalized.includes("otel")) return intents[3];
  return intents[2];
}

function recommendationFor(campaigns: PuanAICampaign[], intent: Intent, priority: Priority) {
  const matching = campaigns.filter((campaign) => campaign.active && campaign.category === intent.category);
  const preferredType = priority === "reward" ? "Puan" : priority === "installment" ? "Taksit" : "İndirim";
  return matching.find((campaign) => campaign.benefitType === preferredType) ?? matching[0] ?? campaigns.find((campaign) => campaign.active);
}

export function PuanAIAdvisor({ campaigns }: { campaigns: PuanAICampaign[] }) {
  const [intent, setIntent] = useState<Intent | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [message, setMessage] = useState("");
  const recommendation = useMemo(() => intent && priority ? recommendationFor(campaigns, intent, priority) : undefined, [campaigns, intent, priority]);

  function chooseIntent(nextIntent: Intent) {
    setIntent(nextIntent);
    setPriority(null);
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    chooseIntent(inferIntent(message));
    setMessage("");
  }

  function reset() {
    setIntent(null);
    setPriority(null);
    setMessage("");
  }

  const bank = recommendation ? getPuanAIBank(recommendation.bankId) : undefined;
  const provenance = recommendation ? getPuanAICampaignProvenance(recommendation) : undefined;

  return <section className="puan-advisor" aria-labelledby="puan-advisor-title">
    <div className="puan-advisor__heading"><div><p className="eyebrow">PuanAI danışman</p><h2 id="puan-advisor-title">Alışverişini anlat,<br /><em>birlikte bakalım.</em></h2></div><div className="puan-advisor__status"><span><i /> Örnek veri modu</span><small>Canlı kampanya doğrulaması yapılmaz</small></div></div>
    <div className="puan-advisor__grid">
      <div className="puan-conversation" aria-live="polite">
        <div className="puan-message puan-message--assistant"><span className="puan-message__avatar"><Bot size={16} /></span><div><strong>PuanAI</strong><p>Bugün ne için alışveriş yapmayı düşünüyorsun? Sana uygun seçenekleri şeffaf biçimde birlikte daraltalım.</p></div></div>
        {intent && <div className="puan-message puan-message--user"><div><strong>Sen</strong><p>{intent.label}</p></div></div>}
        {intent && !priority && <div className="puan-message puan-message--assistant"><span className="puan-message__avatar"><Sparkles size={16} /></span><div><strong>PuanAI</strong><p>Bu alışverişte senin için en önemli avantaj hangisi?</p><div className="puan-advisor__choices">{priorities.map((item) => <button key={item.value} type="button" onClick={() => setPriority(item.value)} {...analyticsAttributes({ event: "ai_priority_select", surface: "puan_ai_advisor", target: item.value })}>{item.label}</button>)}</div></div></div>}
        {recommendation && <div className="puan-message puan-message--assistant"><span className="puan-message__avatar"><Check size={16} /></span><div><strong>PuanAI önerisi</strong><p>{bank?.name ?? "Banka"} tarafındaki <b>{recommendation.title}</b>, {intent?.label.toLocaleLowerCase("tr-TR")} için seçtiğin önceliğe en yakın örnek seçenek.</p></div></div>}
        {!intent && <div className="puan-advisor__choices">{intents.map((item, index) => <button key={item.category} type="button" onClick={() => chooseIntent(item)} {...analyticsAttributes({ event: "ai_intent_select", surface: "puan_ai_advisor", target: `intent-${index + 1}` })}>{item.label}</button>)}</div>}
        <form className="puan-advisor__input" onSubmit={submitMessage} {...analyticsAttributes({ event: "ai_prompt_submit", surface: "puan_ai_advisor", target: "local-intent" })}><MessageCircle size={16} /><label className="sr-only" htmlFor="puan-advisor-input">Alışverişini anlat</label><input id="puan-advisor-input" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Örn. Bir telefon almayı düşünüyorum" autoComplete="off" /><button type="submit" aria-label="PuanAI'ya gönder"><Send size={15} /></button></form>
      </div>
      <aside className="puan-advisor__result" aria-label="PuanAI öneri özeti">
        {recommendation && provenance ? <>
          <div className="puan-advisor__result-top"><p className="eyebrow">Öneri özeti</p><button type="button" onClick={reset} {...analyticsAttributes({ event: "ai_reset", surface: "puan_ai_advisor", target: "advisor" })}><RefreshCcw size={13} /> Yeniden başla</button></div>
          <div className="puan-advisor__recommendation"><div className="puan-advisor__merchant"><span className="puan-bank-mark" style={{ "--bank-color": bank?.color ?? "#6e766d" } as React.CSSProperties}>{bank?.shortName ?? "PA"}</span><span>{recommendation.merchant}</span></div><h3>{recommendation.benefit}<small>{recommendation.benefitType}</small></h3><p>{recommendation.installment} · Minimum harcama {recommendation.minSpend}</p><Link href={`/puan-ai/kampanya/${recommendation.slug}`} {...analyticsAttributes({ event: "ai_recommendation_open", surface: "puan_ai_advisor", target: recommendation.slug })}>Kampanya ayrıntısını incele <ArrowUpRight size={14} /></Link></div>
          <div className="puan-advisor__reason"><p className="eyebrow">Neden bu seçenek?</p><p>{priority === "reward" ? "Puan önceliğine göre eşleşen örnek kampanya bulundu." : priority === "installment" ? "Taksit önceliğine göre eşleşen örnek kampanya bulundu." : "İndirim önceliğine göre eşleşen örnek kampanya bulundu."}</p></div>
          <div className="puan-advisor__transparency"><ShieldCheck size={16} /><div><strong>{provenance.label}</strong><p>{provenance.disclaimer ?? "Bu sonuç canlı veya doğrulanmış kampanya teklifi değildir."} Gerçek bir karar için sağlayıcının resmî kanalındaki koşulları kontrol et.</p></div></div>
          <div className="puan-advisor__paths"><p className="eyebrow">Keşfe devam et</p><Link href={`/puan-ai?category=${encodeURIComponent(recommendation.category)}#kampanyalar`} {...analyticsAttributes({ event: "discovery_select", surface: "puan_ai_advisor", target: "related-campaigns" })}><span>Aynı kategorideki kampanyalar</span><ArrowUpRight size={14} /></Link><Link href="/puan-ai#kartlar" {...analyticsAttributes({ event: "discovery_select", surface: "puan_ai_advisor", target: "cards" })}><span>Kartları karşılaştır</span><CreditCard size={14} /></Link><Link href="/blog" {...analyticsAttributes({ event: "discovery_select", surface: "puan_ai_advisor", target: "guides" })}><span>Uretir rehberlerini keşfet</span><ArrowUpRight size={14} /></Link></div>
        </> : <div className="puan-advisor__empty"><span className="puan-message__avatar"><Bot size={18} /></span><h3>Kararını birlikte daraltalım.</h3><p>Bir alışveriş alanı seç veya ne alacağını yaz. PuanAI, örnek veri üzerinde nasıl açıklamalı bir öneri sunduğunu gösterecek.</p><div><CircleAlert size={14} /> Kişisel veri veya kart bilgisi istemez.</div></div>}
      </aside>
    </div>
  </section>;
}
