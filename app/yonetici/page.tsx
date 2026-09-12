import type { Metadata } from "next";
import { SiteEditor } from "@/components/site-editor";
export const metadata: Metadata = { title: "Site editörü", robots: { index: false, follow: false }, alternates: { canonical: "/yonetici" } };
export default function EditorPage() { return <SiteEditor />; }
