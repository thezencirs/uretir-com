import type { Metadata } from "next";
import { Marketplace } from "@/components/marketplace";

export const metadata: Metadata = {
  title: "Türkiye Üretir — Fikir burada. Gelecek burada.",
  description: "Türkiye'den uygulamalar, oyunlar ve AI ürünleri. İhtiyacına göre keşfet, karşılaştır, haritada bul.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <Marketplace hero />;
}
