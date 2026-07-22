import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SectionHeading({ eyebrow, title, link, linkLabel = "Tümünü gör" }: { eyebrow: string; title: string; link?: string; linkLabel?: string }) { return <div className="mb-10 flex flex-col justify-between gap-4 border-b hairline pb-8 sm:flex-row sm:items-end"><div><p className="eyebrow">{eyebrow}</p><h2 className="mt-3 font-display text-4xl md:text-5xl">{title}</h2></div>{link && <Link href={link} className="link-arrow flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-muted transition hover:text-[color:var(--foreground)]">{linkLabel} <ArrowUpRight size={15} /></Link>}</div>; }
