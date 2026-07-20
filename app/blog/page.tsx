import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BlogBrowser } from "@/components/blog-browser";
import { JsonLd } from "@/components/json-ld";
import { categories, posts } from "@/lib/posts";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";

type BlogPageProps = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const query = (await searchParams).q?.trim();
  return { title: query ? `Arama: ${query}` : "Blog", description: "Üretim, teknoloji, yapay zekâ ve daha fazlası üzerine yazılar.", alternates: { canonical: "/blog" }, robots: query ? { index: false, follow: true } : undefined, openGraph: { title: query ? `Arama: ${query}` : "Blog — Üretir", description: "Üretim, teknoloji, yapay zekâ ve daha fazlası üzerine yazılar.", url: "/blog", type: "website" } };
}

export default function BlogPage() {
  return <div className="page-reveal"><JsonLd data={[collectionPageSchema({ name: "Üretir Blog", description: "Üretim, teknoloji, yapay zekâ ve daha fazlası üzerine yazılar.", path: "/blog" }), breadcrumbSchema([{ name: "Ana sayfa", path: "/" }, { name: "Blog", path: "/blog" }])]} /><div className="section-wrap py-10 md:py-16"><Breadcrumbs items={[{ label: "Blog" }]} /><div className="mt-12 grid gap-12 border-b hairline pb-14 md:grid-cols-[1.15fr_.85fr] md:items-end md:pb-20"><div><p className="rule-label">Üretir / Yazılar</p><h1 className="mt-7 display-lg">Merakın<br /><span className="italic text-[#769d32]">arşivi.</span></h1><p className="mt-8 max-w-lg text-base leading-7 text-muted">Nasıl ürettiğimizi, neyin peşinden gittiğimizi ve yarını birlikte nasıl kurabileceğimizi konuşuyoruz.</p></div><div className="grid max-w-sm grid-cols-2 border-t hairline pt-5 text-sm"><div><p className="font-display text-4xl">{String(posts.length).padStart(2, "0")}</p><p className="mt-2 text-xs text-muted">Yayınlanmış yazı</p></div><div><p className="font-display text-4xl">{String(categories.length).padStart(2, "0")}</p><p className="mt-2 text-xs text-muted">Keşif alanı</p></div></div></div><Suspense fallback={<BlogBrowserSkeleton />}><BlogBrowser posts={posts} categories={categories} /></Suspense></div></div>;
}

function BlogBrowserSkeleton() { return <div className="mt-16 animate-pulse"><div className="h-32 border-y hairline bg-surface/50" /><div className="mt-12 grid gap-8 md:grid-cols-2"><div className="h-[460px] bg-surface" /><div className="h-[460px] bg-surface" /></div></div>; }
