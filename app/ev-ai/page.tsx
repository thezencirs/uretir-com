import type { Metadata } from "next";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { ToolExplorer } from "@/components/tool-explorer";
import { getEvAIReport } from "@/lib/ev-ai/analysis";
import { propertyExplorer, unavailableExplorer } from "@/lib/tool-explorer-data";
export const metadata: Metadata = { title: "EvAI · Kaynaklı konut ve ihale karşılaştırma", description: "Konut ve kamu taşınmazı kayıtlarını şehir, bütçe ve metrekare bilgisiyle ayrı görünümlerde karşılaştırın. EvAI WhatsApp kanalını takip edin.", alternates: { canonical: "/ev-ai" }, openGraph: { title: "EvAI — Üretir", description: "Kaynaklı konut ve kamu taşınmazı araştırma ekranı.", url: "/ev-ai", type: "website" } };
export const dynamic = "force-dynamic";
export default async function Page() {
  let data = unavailableExplorer;
  try { data = propertyExplorer(await getEvAIReport()); } catch { /* The workspace and retry remain available. */ }
  return <><ChannelToolNavigation active="ev-ai"/><ToolExplorer slug="ev-ai" data={data}/></>;
}
