import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BlogBrowser } from "@/components/blog-browser";
import { JsonLd } from "@/components/json-ld";
import { EditorialReviewNotice } from "@/components/editorial-review-notice";
import { categories, posts } from "@/lib/posts";
import { createArticleDocument } from "@/lib/content-factory";
import { isIndexableReference, isVisibleReference } from "@/lib/publication";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";

type BlogPageProps = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const query = (await searchParams).q?.trim();
  const hasIndexableArticles = posts.some((post) => isIndexableReference(createArticleDocument(post)));
  return { title: query ? `Arama: ${query}` : "Blog", description: "Üretim, teknoloji, yapay zekâ ve daha fazlası üzerine yazılar.", alternates: { canonical: "/blog" }, robots: query || !hasIndexableArticles ? { index: false, follow: true } : undefined, openGraph: { title: query ? `Arama: ${query}` : "Blog — Üretir", description: "Üretim, teknoloji, yapay zekâ ve daha fazlası üzerine yazılar.", url: "/blog", type: "website" } };
}

export default function BlogPage() {
  const visiblePosts = posts.filter((post) => isVisibleReference(createArticleDocument(post)));
  const visibleCategories = categories.filter((category) => visiblePosts.some((post) => post.category === category.name));
  const hasIndexableArticles = visiblePosts.some((post) => isIndexableReference(createArticleDocument(post)));
  const reviewSlugs = visiblePosts.filter((post) => !isIndexableReference(createArticleDocument(post))).map((post) => post.slug);
  return <div className="page-reveal">{hasIndexableArticles && <JsonLd data={[collectionPageSchema({ name: "Üretir Blog", description: "Üretim, teknoloji, yapay zekâ ve daha fazlası üzerine yazılar.", path: "/blog" }), breadcrumbSchema([{ name: "Ana sayfa", path: "/" }, { name: "Blog", path: "/blog" }])]} />}<div className="section-wrap py-10 md:py-16"><Breadcrumbs items={[{ label: "Blog" }]} />{!hasIndexableArticles && <EditorialReviewNotice />}<div className="mt-12 grid gap-12 border-b hairline pb-14 md:grid-cols-[1.15fr_.85fr] md:items-end md:pb-20"><div><p className="rule-label">Üretir / Yazılar</p><h1 className="mt-7 display-lg">Merakın<br /><span className="italic text-[#769d32]">arşivi.</span></h1><p className="mt-8 max-w-lg text-base leading-7 text-muted">Nasıl ürettiğimizi, neyin peşinden gittiğimizi ve yarını birlikte nasıl kurabileceğimizi konuşuyoruz.</p></div><div className="grid max-w-sm grid-cols-2 border-t hairline pt-5 text-sm"><div><p className="font-display text-4xl">{String(visiblePosts.length).padStart(2, "0")}</p><p className="mt-2 text-xs text-muted">{hasIndexableArticles ? "Yayınlanmış içerik" : "Editoryal önizleme"}</p></div><div><p className="font-display text-4xl">{String(visibleCategories.length).padStart(2, "0")}</p><p className="mt-2 text-xs text-muted">Keşif alanı</p></div></div></div>{visiblePosts.length > 0 ? <Suspense fallback={<BlogBrowserSkeleton />}><BlogBrowser posts={visiblePosts} categories={visibleCategories} reviewSlugs={reviewSlugs} /></Suspense> : <div className="mt-12 border hairline bg-surface p-10 text-center md:p-16"><p className="font-display text-4xl">İlk kaynaklı dosyalar hazırlanıyor.</p><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">İçerikler resmî kaynak, alan uzmanı ve güncelleme planı tamamlanmadan gerçek kullanıcılara açılmaz. Bu nedenle kütüphane şu anda bilinçli olarak boş gösteriliyor.</p></div>}</div></div>;
}

function BlogBrowserSkeleton() { return <div className="mt-16 animate-pulse"><div className="h-32 border-y hairline bg-surface/50" /><div className="mt-12 grid gap-8 md:grid-cols-2"><div className="h-[460px] bg-surface" /><div className="h-[460px] bg-surface" /></div></div>; }
