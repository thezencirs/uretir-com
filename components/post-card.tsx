import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { Post } from "@/lib/posts";

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const initials = post.author.split(" ").map((part) => part[0]).join("").slice(0, 2);
  return <article className={`article-card group ${featured ? "grid overflow-hidden md:grid-cols-[1.03fr_1fr]" : ""}`}>
    <Link href={`/blog/${post.slug}`} aria-label={post.title} className={`${featured ? "min-h-[340px]" : "h-[230px]"} article-card-media article-art noise art-${post.accent} block p-5 md:p-6`}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between"><span className="rounded-full border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em]">{post.category}</span><span className="font-display text-2xl italic opacity-70">{post.number}</span></div>
        <div className="flex items-end justify-between"><div><span className={`${featured ? "text-7xl md:text-8xl" : "text-6xl"} font-display leading-none opacity-90`}>{post.number}</span><p className="mt-3 text-[10px] uppercase tracking-[.18em] opacity-70">Kavram / Uygulama / Gelecek</p></div><span className="rounded-full border border-white/25 bg-white/10 p-3 backdrop-blur-sm transition group-hover:-rotate-45"><ArrowUpRight size={17} /></span></div>
      </div>
    </Link>
    <div className={featured ? "flex flex-col justify-between bg-surface p-6 md:p-8" : "pt-5"}>
      <div><div className="flex items-center gap-2 text-[11px] text-muted"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--foreground)] text-[9px] font-bold text-[color:var(--background)]">{initials}</span><span>{post.author}</span><span className="h-1 w-1 rounded-full bg-current opacity-50" /><span>{post.date}</span><span className="hidden items-center gap-1 sm:inline-flex"><Clock3 size={12} />{post.readTime}</span></div><h3 className={`${featured ? "mt-6 text-3xl md:text-4xl" : "mt-4 text-2xl"} font-display leading-[1.04] transition duration-300 group-hover:text-[#6e9630]`}>{post.title}</h3><p className={`${featured ? "mt-4 max-w-md" : "mt-3"} text-sm leading-6 text-muted`}>{post.excerpt}</p></div>
      <div className="mt-6 flex items-center justify-between gap-4"><div className="flex flex-wrap gap-1.5">{(post.tags ?? []).slice(0, 2).map((tag) => <span key={tag} className="rounded-full border hairline px-2 py-1 text-[10px] text-muted">{tag}</span>)}</div><Link href={`/blog/${post.slug}`} className="link-arrow inline-flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[.12em]">Oku <ArrowUpRight size={15} /></Link></div>
    </div>
  </article>;
}
