import type { Metadata } from "next";
import { ContentHubPage } from "@/components/content-hub-page";

export const metadata: Metadata = {
  title: "IhracatAI — Üreticiler için ihracat rehberleri",
  description: "Hedef pazar, hazırlık, resmî destek kaynakları, belge ve süreç araştırması için ihracat bilgi merkezi.",
  alternates: { canonical: "/ihracat-ai" },
  robots: { index: false, follow: true },
  openGraph: { title: "IhracatAI — Üretir", description: "Üreticiler için kaynak odaklı ihracat bilgi merkezi.", url: "/ihracat-ai", type: "website" },
};

export default function IhracatAIPage() {
  return <ContentHubPage hubId="ihracat-ai" />;
}
