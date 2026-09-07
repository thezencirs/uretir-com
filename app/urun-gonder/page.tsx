import type { Metadata } from "next";
import { ProductSubmit } from "@/components/product-submit";
export const metadata: Metadata = { title: "Ürününü ekle — Türkiye Üretir", description: "Türkiye'de geliştirdiğin ürününü kaynaklarıyla Üretir dizinine öner.", alternates: { canonical: "/urun-gonder" } };
export default function Page() {
  return <main className="section-wrap py-16"><p className="eyebrow">Türkiye Üretir / Üretici başvurusu</p><h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">Sen ne üretiyorsun?</h1><p className="mt-6 max-w-xl text-sm leading-7 text-muted">Uygulamanı, oyununu veya AI ürününü paylaş. Resmî ürün bağlantısını ve Türkiye&apos;deki ekibini doğrulayıp dizine ekleyelim. Bu form e-posta taslağı hazırlar; otomatik yayın yapmaz.</p><ProductSubmit /></main>;
}
