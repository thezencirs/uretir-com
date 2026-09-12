import type { Metadata } from "next";
import { PuanAIAdmin } from "@/components/puan-ai-admin";

export const metadata: Metadata = {
  title: "PuanAI Veri Yönetimi",
  description: "PuanAI kampanya, kural, kaynak ve doğrulama yönetimi.",
  alternates: { canonical: "/puan-ai/admin" },
  robots: { index: false, follow: false },
  openGraph: { title: "PuanAI Veri Yönetimi", description: "PuanAI kampanya, kural, kaynak ve doğrulama yönetimi.", url: "/puan-ai/admin", type: "website" },
};

export default function PuanAIAdminPage() {
  return <PuanAIAdmin />;
}
