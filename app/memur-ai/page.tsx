import type { Metadata } from "next";
import { MemurAIHub } from "@/components/memur-ai-hub";

export const metadata: Metadata = {
  title: "MemurAI — Memur Alımı İlanları, KPSS Puan Robotu ve Maaş / Promosyon Hesaplama",
  description:
    "KPSS şartsız kamu işçisi alımı, 50-60 KPSS puanıyla memur alan kurumlar, belediye zabıta/itfaiye ilanları, memur maaş zammı ve emekli banka promosyonu karşılaştırma.",
  alternates: { canonical: "/memur-ai" },
  openGraph: {
    title: "MemurAI — Kamu Personeli Alımı, KPSS Robotu ve Maaş / Promosyon Merkezi",
    description:
      "Eğitim ve KPSS puanınıza göre güncel bakanlık, belediye ve İŞKUR kamu ilanlarını filtreleyin; memur maaş zammını ve emekli banka promosyonlarını karşılaştırın.",
    url: "/memur-ai",
    type: "website",
  },
};

export default function MemurAIPage() {
  return <MemurAIHub />;
}
