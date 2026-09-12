import type { Metadata } from "next";
import { PuanAIAutomationMonitor } from "@/components/puan-ai-automation-monitor";

export const metadata: Metadata = {
  title: "PuanAI otomasyon merkezi",
  description: "Kampanya alımı, kaynak sağlığı ve otomasyon çalışmalarını izleyin.",
  alternates: { canonical: "/puan-ai/admin/otomasyon" },
  openGraph: { url: "/puan-ai/admin/otomasyon" },
  robots: { index: false, follow: false },
};

export default function Page() { return <PuanAIAutomationMonitor />; }
