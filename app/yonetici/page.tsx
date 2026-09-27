import type { Metadata } from "next";
import { SiteEditor } from "@/components/site-editor";
export const metadata: Metadata = { title: "Site editörü", description:"Üretir içerik ve yayın yönetimi.", robots: { index: false, follow: false }, alternates: { canonical: "/yonetici" }, openGraph:{title:"Site editörü — Üretir",description:"Üretir içerik ve yayın yönetimi.",url:"/yonetici",type:"website"} };
export default function EditorPage() { return <SiteEditor />; }
