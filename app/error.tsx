"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Uretir route error", error);
  }, [error]);

  return <section className="section-wrap flex min-h-[70vh] items-center py-16">
    <div className="w-full border-y hairline py-14 md:py-20">
      <p className="eyebrow">Geçici bir sorun oluştu</p>
      <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[.9] md:text-7xl">Bilgi akışı<br /><em className="text-[#b26959]">kesintiye uğradı.</em></h1>
      <p className="mt-7 max-w-xl text-sm leading-7 text-muted">İçerik kaybolmadı. Sayfayı yeniden deneyebilir veya güvenli bir başlangıç noktasına dönebilirsiniz.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 text-xs font-bold text-[color:var(--background)]"><RotateCcw size={15} aria-hidden="true" /> Yeniden dene</button>
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full border hairline px-5 text-xs font-bold">Ana sayfa <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}
