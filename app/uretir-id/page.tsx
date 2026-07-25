import type { Metadata } from "next";
import { UretirIdShell } from "@/components/uretir-id-shell";

export const metadata: Metadata = {
  title: "Uretir ID — Deneyim prototipi",
  description: "Hesap oluşturmayan ve kişisel veri kaydetmeyen Uretir ID deneyim prototipi.",
  alternates: { canonical: "/uretir-id" },
  robots: { index: false, follow: true },
  openGraph: { title: "Uretir ID deneyim prototipi — Üretir", description: "Hesap oluşturmayan ve kişisel veri kaydetmeyen kimlik deneyimi önizlemesi.", url: "/uretir-id", type: "website" },
};

export default function UretirIdPage() {
  return <UretirIdShell />;
}
