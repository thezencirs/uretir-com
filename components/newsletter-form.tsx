"use client";

import { ArrowRight, Check } from "lucide-react";
import { FormEvent, useState } from "react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); if (email.trim()) setSent(true); }
  if (sent) return <div className="flex items-center gap-2 text-sm"><span className="rounded-full bg-[#c8f560] p-1 text-[#172013]"><Check size={15} /></span> Bültene katıldınız, teşekkürler.</div>;
  return <form onSubmit={submit} className={compact ? "flex max-w-sm gap-2" : "mt-7 flex max-w-md gap-2"}>
    <label className="sr-only" htmlFor="newsletter-email">E-posta adresiniz</label>
    <input id="newsletter-email" required type="email" placeholder="E-posta adresiniz" value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-0 flex-1 border-b hairline bg-transparent px-0 py-3 text-sm outline-none placeholder:text-muted focus:border-[color:var(--foreground)]" />
    <button aria-label="Bültene kaydol" className="focus-ring flex shrink-0 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-4 py-3 text-xs font-bold text-[color:var(--background)] transition hover:opacity-80"><span className="hidden sm:inline">Katıl</span><ArrowRight size={15} /></button>
  </form>;
}
