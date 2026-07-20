"use client";

import { Check, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  }
  return <button onClick={copyLink} className="focus-ring inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-muted transition hover:text-[color:var(--foreground)]">{copied ? <Check size={14} /> : <LinkIcon size={14} />}{copied ? "Kopyalandı" : "Bağlantıyı kopyala"}</button>;
}
