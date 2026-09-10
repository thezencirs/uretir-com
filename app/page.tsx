import type { Metadata } from "next";
import { Marketplace } from "@/components/marketplace";

export const metadata: Metadata = {
  title: "Türkiye Üretir — Fikir burada. Gelecek burada.",
  description: "Türkiye'den uygulamalar, oyunlar ve yapay zekâ ürünleri. İhtiyacına göre keşfet, karşılaştır, haritada bul.",
  alternates: { canonical: "/", languages: { tr: "/", en: "/en" } },
  openGraph: { url: "/" },
};

export default function HomePage() {
  return <Marketplace hero />;
}
