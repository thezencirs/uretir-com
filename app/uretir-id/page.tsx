import type { Metadata } from "next";
import { UretirIdShell } from "@/components/uretir-id-shell";

export const metadata: Metadata = {
  title: "Üretir ID — Girişim çalışma alanı",
  description: "Girişimini tanıt, haritada yerini al ve fikirlerini toplulukta geliştir.",
  alternates: { canonical: "/uretir-id" },
  robots: { index: false, follow: true },
  openGraph: { title: "Üretir ID — Üretir", description: "Girişim profili, yazılar ve topluluk geri bildirimleri.", url: "/uretir-id", type: "website" },
};

export default function UretirIdPage() {
  return <UretirIdShell />;
}
