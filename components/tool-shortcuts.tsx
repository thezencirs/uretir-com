import Link from "next/link";
import { MapPinned, WalletCards, ArrowUpRight } from "lucide-react";

export function ToolShortcuts() {
  return <nav className="tool-shortcuts section-wrap" aria-label="Üretir araçlarına doğrudan erişim">
    <Link href="/haber-ai"><MapPinned size={25} aria-hidden="true"/><span><strong>HaberAI</strong><small>Şehrini seç, haberleri haritada gör</small></span><ArrowUpRight size={20} aria-hidden="true"/></Link>
    <Link href="/puan-ai"><WalletCards size={25} aria-hidden="true"/><span><strong>PuanAI</strong><small>Alışverişini yaz, kampanyaları karşılaştır</small></span><ArrowUpRight size={20} aria-hidden="true"/></Link>
  </nav>;
}
