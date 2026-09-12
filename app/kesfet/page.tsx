import type { Metadata } from "next";
import { Marketplace } from "@/components/marketplace";
export const metadata: Metadata = { title: "Keşfet — Türkiye Üretir", description: "Türkiye'den uygulamaları, AI araçlarını ve oyunları ihtiyacına göre keşfet.", alternates: { canonical: "/kesfet" }, openGraph: { url: "/kesfet" } };
export default function Page() { return <Marketplace />; }
