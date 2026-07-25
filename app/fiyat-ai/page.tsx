import type { Metadata } from "next";
import { ContentHubPage } from "@/components/content-hub-page";

export const metadata: Metadata = {
  title: "FiyatAI — Hammadde ve maliyet rehberleri",
  description: "Hammadde tekliflerini, fiyat serilerini ve toplam maliyeti kaynak, birim, tarih ve kapsam farklarıyla değerlendirin.",
  alternates: { canonical: "/fiyat-ai" },
  robots: { index: false, follow: true },
  openGraph: { title: "FiyatAI — Üretir", description: "Hammadde ve üretim girdileri için fiyat okuryazarlığı merkezi.", url: "/fiyat-ai", type: "website" },
};

export default function FiyatAIPage() {
  return <ContentHubPage hubId="fiyat-ai" />;
}
