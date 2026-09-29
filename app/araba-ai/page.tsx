import type { Metadata } from "next";
import { ChannelToolNavigation } from "@/components/channel-tool-navigation";
import { ToolExplorer } from "@/components/tool-explorer";
import { getAutomotiveSnapshot } from "@/lib/araba-ai/analysis";
import { automotiveExplorer, unavailableExplorer } from "@/lib/tool-explorer-data";
export const metadata: Metadata = { title: "ArabaAI · Araç fiyatlarını ve kampanyaları karşılaştır", description: "Resmî sıfır araç fiyatlarını marka ve bütçeye göre filtreleyin, modelleri yan yana karşılaştırın ve ArabaAI WhatsApp kanalını takip edin.", alternates: { canonical: "/araba-ai" }, openGraph: { title: "ArabaAI — Üretir", description: "Kaynaklı sıfır araç fiyatları ve tarihli kampanyalar.", url: "/araba-ai", type: "website" } };
export const dynamic = "force-dynamic";
export default async function Page() {
  let data = unavailableExplorer;
  try { data = automotiveExplorer(await getAutomotiveSnapshot()); } catch { /* The workspace and retry remain available. */ }
  return <><ChannelToolNavigation active="araba-ai"/><ToolExplorer slug="araba-ai" data={data}/></>;
}
