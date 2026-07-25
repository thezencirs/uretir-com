import type { Metadata } from "next";
import { ContentHubPage } from "@/components/content-hub-page";

export const metadata: Metadata = {
  title: "TesvikAI — Üretim teşvikleri bilgi merkezi",
  description: "KOSGEB, TÜBİTAK ve ihracat destekleri için başvuru hazırlığı, uygunluk ve resmî kaynak rehberleri.",
  alternates: { canonical: "/tesvik-ai" },
  robots: { index: false, follow: true },
  openGraph: { title: "TesvikAI — Üretir", description: "Üretim teşvikleri için kaynak odaklı hazırlık merkezi.", url: "/tesvik-ai", type: "website" },
};

export default function TesvikAIPage() {
  return <ContentHubPage hubId="tesvik-ai" />;
}
