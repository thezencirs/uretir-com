"use client";

import { Check, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export function ShareButton() {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2400);
    }
  }
  const label = status === "copied" ? "Kopyalandı" : status === "error" ? "Kopyalanamadı" : "Bağlantıyı kopyala";
  return <button type="button" onClick={copyLink} aria-live="polite" className="focus-ring inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-muted transition hover:text-[color:var(--foreground)]">{status === "copied" ? <Check size={14} aria-hidden="true" /> : <LinkIcon size={14} aria-hidden="true" />}{label}</button>;
}
