import type { Metadata } from "next";
import { Marketplace } from "@/components/marketplace";
export const metadata: Metadata = { title: "Map — Türkiye’nin ürün haritası", description: "Türkiye'deki uygulama ve oyun üreticilerini kaynaklı, aranabilir haritada keşfet.", alternates: { canonical: "/map" } };
export default function Page() { return <Marketplace mapFirst />; }
