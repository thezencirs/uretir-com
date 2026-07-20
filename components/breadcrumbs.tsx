import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-muted"><Link href="/">Üretir</Link>{items.map((item, index) => <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5"><ChevronRight size={12} aria-hidden="true" />{item.href ? <Link href={item.href} className="transition hover:text-[color:var(--foreground)]">{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}
