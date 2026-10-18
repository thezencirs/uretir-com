import type { Metadata } from "next";
import { AgentCommandCenter } from "@/components/agent-command-center";

export const metadata: Metadata = {
  title: "Otonom Ajan Komuta Merkezi — Üretir",
  description:
    "Üretir 12 otonom ajan sistemi: Sosyal Medya Uzmanı, İhlal & Tekrar Denetçisi, Instagram Viral Uzmanı, Keşfet Uzmanı, WhatsApp Büyüme Ajanı ve 6 Veri Ajanı izleme paneli.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/ajanlar" },
  openGraph: {
    title: "Otonom Ajan Komuta Merkezi — Üretir",
    description: "Üretir 12 otonom ajan sistemi ve bağımsız kategori yayın kontrol paneli.",
    url: "/ajanlar",
    type: "website",
  },
};

export default function AjanlarPage() {
  return <AgentCommandCenter />;
}
