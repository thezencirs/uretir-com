"use client";

import { ArrowDownAZ, Search, SlidersHorizontal, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PostCard } from "@/components/post-card";
import type { Post } from "@/lib/posts";

type Category = { name: string; slug: string; count: string; color: string; description: string; symbol: string };

export function BlogBrowser({ posts, categories }: { posts: Post[]; categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "all";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "all");
  }, [searchParams]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const visible = posts.filter((post) => {
      const matchesCategory = category === "all" || post.category === categories.find((item) => item.slug === category)?.name;
      const searchable = [post.title, post.excerpt, post.category, post.author, ...(post.tags ?? [])].join(" ").toLocaleLowerCase("tr-TR");
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
    return [...visible].sort((a, b) => sort === "alphabetical" ? a.title.localeCompare(b.title, "tr") : posts.indexOf(a) - posts.indexOf(b));
  }, [category, categories, posts, query, sort]);

  function updateCategory(nextCategory: string) {
    setCategory(nextCategory);
    const params = new URLSearchParams(searchParams.toString());
    if (nextCategory === "all") params.delete("category"); else params.set("category", nextCategory);
    router.replace(`/blog${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("q", query.trim()); else params.delete("q");
    router.replace(`/blog${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  function clearSearch() {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.replace(`/blog${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }

  return <>
    <div className="mt-16 border-y hairline py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => updateCategory("all")} className={`rounded-full border px-3 py-2 text-[11px] font-bold transition ${category === "all" ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]" : "hairline text-muted hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)]"}`}>Tümü</button>
          {categories.map((item) => <button key={item.slug} onClick={() => updateCategory(item.slug)} className={`rounded-full border px-3 py-2 text-[11px] font-bold transition ${category === item.slug ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]" : "hairline text-muted hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)]"}`}>{item.name}</button>)}
        </div>
        <form onSubmit={submitSearch} className="flex items-center gap-3 border-b hairline py-2 text-sm text-muted lg:min-w-[260px]"><Search size={15} /><label className="sr-only" htmlFor="blog-search">Yazılarda ara</label><input id="blog-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Yazılarda ara" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted" />{query && <button type="button" onClick={clearSearch} aria-label="Aramayı temizle"><X size={14} /></button>}<button type="submit" className="font-bold text-[color:var(--foreground)]">Ara</button></form>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted"><p className="inline-flex items-center gap-2"><SlidersHorizontal size={14} /> {filteredPosts.length} içerik listeleniyor{query && <span>· “{query}”</span>}</p><label className="inline-flex items-center gap-2"><ArrowDownAZ size={14} /><span className="sr-only">Sıralama</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent font-bold text-[color:var(--foreground)] outline-none"><option value="newest">En yeni</option><option value="alphabetical">A — Z</option></select></label></div>
    </div>
    {filteredPosts.length > 0 ? <div className="mt-12 grid gap-x-7 gap-y-14 md:grid-cols-2">{filteredPosts.map((post, index) => <div key={post.slug} className="animate-rise" style={{ animationDelay: `${index * 55}ms` }}><PostCard post={post} /></div>)}</div> : <div className="mt-12 border hairline bg-surface p-10 text-center md:p-20"><p className="font-display text-4xl">Aradığını bulamadık.</p><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">Farklı bir kelime deneyebilir ya da tüm içeriklere geri dönebilirsin.</p><button onClick={() => { setQuery(""); updateCategory("all"); }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--foreground)] px-4 py-3 text-xs font-bold text-[color:var(--background)]">Filtreleri temizle <X size={14} /></button></div>}
  </>;
}
