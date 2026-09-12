import type { Metadata } from "next";
import { Developments } from "@/components/developments";
import { getPublishedContent } from "@/lib/site-content-store";
export const revalidate = 60;
export const metadata: Metadata = { title: "Gelişmeler", description: "Türkiye, teknoloji, fuarlar, startuplar ve yeni haberler. Tarihli ve kaynaklı Üretir gündemi.", alternates: { canonical: "/gelismeler" } };
export default async function DevelopmentsPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const content = await getPublishedContent();
  return <Developments content={content} category={kategori} />;
}
