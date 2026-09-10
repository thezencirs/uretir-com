import type { Metadata } from "next";
import { Marketplace } from "@/components/marketplace";
export const metadata: Metadata = { title: "Harita — Türkiye’nin ürün haritası", description: "Türkiye'deki uygulama ve oyun üreticilerini kaynaklı, aranabilir haritada keşfet.", alternates: { canonical: "/harita", languages: { tr: "/harita", en: "/en/harita" } }, openGraph: { title: "Harita — Türkiye Üretir", url: "/harita" } };
export default function Page() { return <Marketplace mapFirst />; }
