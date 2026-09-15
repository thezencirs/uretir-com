import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { OyunAIMemoryGame } from "@/components/oyun-ai-memory-game";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "OyunAI — Memo kelime hafıza oyunu",
  description: "İngilizce kelimeleri görselleri ve Türkçe anlamlarıyla eşleştirin. OyunAI Memo, tarayıcıda ücretsiz oynanabilen bir hafıza oyunudur.",
  alternates: { canonical: "/oyun-ai" },
  openGraph: { title: "OyunAI — Memo kelime hafıza oyunu", description: "Kartları ezberleyin, İngilizce kelimeleri görselleriyle eşleştirin ve en yüksek puanı yapın.", url: "/oyun-ai", type: "website" },
  robots: { index: true, follow: true },
};

const gameSchema = {
  "@context": "https://schema.org", "@type": "Game", name: "OyunAI Memo",
  url: absoluteUrl("/oyun-ai"), description: "İngilizce kelimeleri görselleri ve Türkçe anlamlarıyla eşleştiren tarayıcı tabanlı hafıza oyunu.",
  applicationCategory: "EducationalGame", operatingSystem: "Web", inLanguage: "tr-TR", isAccessibleForFree: true,
};

export default function OyunAIPage() {
  return <><JsonLd data={gameSchema} /><OyunAIMemoryGame /></>;
}
