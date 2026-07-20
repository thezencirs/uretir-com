"use client";

import { Check, Send } from "lucide-react";
import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSent(true); }
  if (sent) return <div className="surface-panel flex min-h-[360px] flex-col items-center justify-center p-8 text-center"><div className="mb-5 rounded-full bg-[#c8f560] p-3 text-[#1e2b14]"><Check size={22} /></div><h2 className="font-display text-4xl">Mesajınız ulaştı.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-muted">En kısa sürede size geri dönmeye çalışacağız. İlginiz için teşekkür ederiz.</p></div>;
  return <form onSubmit={submit} className="surface-panel grid gap-6 p-6 sm:p-9"><div className="grid gap-6 sm:grid-cols-2"><Field label="Adınız" placeholder="Ad Soyad" required /><Field label="E-posta" placeholder="ornek@mail.com" type="email" required /></div><Field label="Konu" placeholder="Nasıl yardımcı olabiliriz?" required /><label className="grid gap-2 text-[10px] font-bold uppercase tracking-[.14em]">Mesajınız<textarea required rows={6} placeholder="Bize birkaç satır bırakın..." className="resize-none border-b hairline bg-transparent px-0 py-3 text-sm font-normal normal-case tracking-normal outline-none placeholder:text-muted focus:border-[color:var(--foreground)]" /></label><button className="focus-ring inline-flex w-fit items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 py-3 text-xs font-bold text-[color:var(--background)] transition hover:opacity-80">Gönder <Send size={14} /></button></form>;
}

function Field({ label, placeholder, type = "text", required = false }: { label: string; placeholder: string; type?: string; required?: boolean }) { return <label className="grid gap-2 text-[10px] font-bold uppercase tracking-[.14em]">{label}<input required={required} type={type} placeholder={placeholder} className="border-b hairline bg-transparent px-0 py-3 text-sm font-normal normal-case tracking-normal outline-none placeholder:text-muted focus:border-[color:var(--foreground)]" /></label>; }
