import type { Metadata } from "next";
import { InsaatAIHub } from "@/components/insaat-ai-hub";

export const metadata: Metadata = {
  title: "İnşaatAI — Müstakil Ev İnşaat Maliyeti, Arsa TAKS/KAKS ve Yarısı Bizden Hesaplama",
  description:
    "Betonarme, hafif çelik ve prefabrik ev m² inşaat maliyeti, demir/beton metraj hesabı, arsa TAKS/KAKS kat karşılığı daire paylaşımı ve Yarısı Bizden kentsel dönüşüm hibesi.",
  alternates: { canonical: "/insaat-ai" },
  openGraph: {
    title: "İnşaatAI — İnşaat Maliyeti, Arsa İmar (TAKS/KAKS) ve Kentsel Dönüşüm Robotu",
    description:
      "100 m² - 200 m² müstakil ev yapım maliyetini, demir/beton tonajını, arsa emsal hesabını ve 1,5 milyon TL kentsel dönüşüm desteğini saniyeler içinde hesaplayın.",
    url: "/insaat-ai",
    type: "website",
  },
};

export default function InsaatAIPage() {
  return <InsaatAIHub />;
}
