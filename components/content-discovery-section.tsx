import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { analyticsAttributes } from "@/lib/analytics";
import type { DiscoveryItem } from "@/lib/content-discovery";

const trustLabels: Record<DiscoveryItem["trustState"], string> = {
  verified: "Doğrulandı",
  estimated: "Tahmini",
  sample: "Örnek veri",
  coming_soon: "Hazırlanıyor",
  future_integration: "Gelecek entegrasyonu",
  editorial_review: "İncelemede",
  contextual: "İlgili kaynak",
};

export function ContentDiscoverySection({
  items,
  eyebrow = "Keşfe devam",
  title = "Sonraki doğru adım.",
  className = "section-wrap py-16 md:py-24",
}: {
  items: DiscoveryItem[];
  eyebrow?: string;
  title?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return <section className={className} aria-labelledby="icerik-kesfi">
    <div className="border-b hairline pb-7">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id="icerik-kesfi" className="mt-4 font-display text-4xl md:text-5xl">{title}</h2>
    </div>
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => <Link key={`${item.href}-${item.label}`} href={item.href} className="group flex min-h-36 flex-col justify-between border hairline bg-[color:var(--background)] p-5" {...analyticsAttributes({ event: "discovery_select", surface: "content_discovery", target: `item-${index + 1}` })}>
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[.1em] text-muted">
            <span>{item.kind.replaceAll("_", " ")}</span><span aria-hidden="true">/</span><span>{trustLabels[item.trustState]}</span>
          </div>
          <h3 className="mt-4 font-display text-2xl leading-tight">{item.label}</h3>
          {item.description && <p className="mt-3 text-xs leading-5 text-muted">{item.description}</p>}
        </div>
        <ArrowUpRight size={15} className="mt-6 transition group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
      </Link>)}
    </div>
  </section>;
}
