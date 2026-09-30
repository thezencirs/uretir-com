import type { Metadata } from "next";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { ToolExplorer } from "@/components/tool-explorer";
import { getPriceLowReport } from "@/lib/indirim-ai/analysis";
import { discountExplorer, unavailableExplorer } from "@/lib/tool-explorer-data";
import { SeoExplainer } from "@/components/seo-explainer";
export const metadata: Metadata = { title: "İndirimAI · Fiyat geçmişini karşılaştır", description: "30, 90 ve 360 günlük fiyat gözlemlerini mağaza ve bütçeye göre inceleyin. Dönem diplerini karşılaştırın, İndirimAI WhatsApp kanalını takip edin.", alternates: { canonical: "/indirim-ai" }, openGraph: { title: "İndirimAI — Üretir", description: "Fiyat geçmişine dayalı indirim ve dönem dibi analizi.", url: "/indirim-ai", type: "website" } };
export const dynamic = "force-dynamic";
export default async function Page() {
  let data = unavailableExplorer;
  try { data = discountExplorer(await getPriceLowReport()); } catch { /* The workspace and retry remain available. */ }
  return <><ChannelToolNavigation active="indirim-ai"/><ToolExplorer slug="indirim-ai" data={data}/><SeoExplainer slug="indirim-ai"/></>;
}
