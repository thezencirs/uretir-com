import type { Metadata } from "next";
import { ContentHubPage } from "@/components/content-hub-page";

export const metadata: Metadata = {
  title: "UretirAI — Kaynaklı üretim araştırması",
  description: "Üretim sorularını şirket, ürün, teknoloji ve resmî kaynak ilişkileriyle araştırmak için hazırlanan UretirAI bilgi merkezi.",
  alternates: { canonical: "/uretir-ai" },
  robots: { index: false, follow: true },
  openGraph: { title: "UretirAI — Üretir", description: "Kaynaklı üretim araştırması ve bağlantılı bilgi keşfi.", url: "/uretir-ai", type: "website" },
};

export default function UretirAIPage() {
  return <ContentHubPage hubId="uretir-ai" />;
}
