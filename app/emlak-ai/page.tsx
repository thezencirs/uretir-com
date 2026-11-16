import type { Metadata } from "next";
import { EmlakAIHub } from "@/components/emlak-ai-hub";

export const metadata: Metadata = {
  title: "EmlakAI — TÜFE Kira Artış Oranı, Tapu Harcı (%4) ve Konut Kredisi Hesaplama",
  description:
    "TÜİK 12 aylık TÜFE konut ve iş yeri yasal kira zammı hesaplama, %4 tapu harcı ve döner sermaye bedeli, 120 ay konut kredisi taksiti ve Milli Emlak Hazine arsası rehberi.",
  alternates: { canonical: "/emlak-ai" },
  openGraph: {
    title: "EmlakAI — Kira Zammı (TÜFE), Tapu Harcı ve Konut Kredisi Hesaplama Robotu",
    description:
      "Mevcut kiranıza göre yasal TÜFE kira artışını, ev satışında alıcı-satıcı tapu harcını ve konut kredisi ödeme planını saniyeler içinde hesaplayın.",
    url: "/emlak-ai",
    type: "website",
  },
};

export default function EmlakAIPage() {
  return <EmlakAIHub />;
}
