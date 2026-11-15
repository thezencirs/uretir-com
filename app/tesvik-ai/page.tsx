import type { Metadata } from "next";
import { TesvikAIHub } from "@/components/tesvik-ai-hub";

export const metadata: Metadata = {
  title: "TeşvikAI — Aile Yardımları, e-Devlet Sosyal Destekler ve Devlet Teşvikleri Hesaplama",
  description:
    "Aile destek ödemesi, yeni doğum ve çocuk yardımı (5.000 TL), SED maaşı, 150 bin TL faizsiz evlilik kredisi, evde bakım maaşı ve KOSGEB/İŞKUR hibeleri için gelir kriteri robotu.",
  alternates: { canonical: "/tesvik-ai" },
  openGraph: {
    title: "TeşvikAI — Aile Yardımları ve Devlet Teşvikleri Hesaplama Robotu",
    description:
      "Hane gelirinizi ve kişi sayısını girin; e-Devlet doğum yardımı, SED, faizsiz evlilik kredisi, evde bakım ve kira/fatura desteklerinden size uygun olanları görün.",
    url: "/tesvik-ai",
    type: "website",
  },
};

export default function TesvikAIPage() {
  return <TesvikAIHub />;
}
