import type { Metadata } from "next";
import { SiteAdmin } from "@/components/site-admin";

export const metadata: Metadata = { title: "Üretir Veri Yönetimi", openGraph:{url:"/yonetim"},description: "Üretir uygulama ve ürün kayıtlarını yönetin.", alternates:{canonical:"/yonetim"},robots: { index: false, follow: false } };

export default function YonetimPage() { return <SiteAdmin />; }
