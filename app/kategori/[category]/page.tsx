import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { PostCard } from "@/components/post-card";
import { categories, getCategory, getPostsByCategory } from "@/lib/posts";
import { breadcrumbSchema } from "@/lib/structured-data";
import { absoluteUrl } from "@/lib/seo";

export function generateStaticParams() { return categories.map((category) => ({ category: category.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const category = getCategory((await params).category);
  if (!category) return { title: "Kategori bulunamadı", robots: { index: false, follow: false } };
  return { title: category.name, description: category.description, alternates: { canonical: absoluteUrl(`/kategori/${category.slug}`) }, openGraph: { title: `${category.name} — Üretir`, description: category.description, url: `/kategori/${category.slug}`, type: "website" } };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const category = getCategory((await params).category);
  if (!category) notFound();
  const categoryPosts = getPostsByCategory(category.slug);
  return <div className="page-reveal"><JsonLd data={breadcrumbSchema([{ name: "Ana sayfa", path: "/" }, { name: "Blog", path: "/blog" }, { name: category.name, path: `/kategori/${category.slug}` }])} /><div className="section-wrap py-10 md:py-16"><Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: category.name }]} /><section className="mt-14 grid gap-10 border-b hairline pb-16 md:grid-cols-[1.1fr_.9fr] md:items-end md:pb-24"><div><p className="eyebrow flex items-center gap-2"><span className={`category-dot category-${category.color}`} /> Kategori / {category.symbol}</p><h1 className="mt-6 display-lg">{category.name}<span className="text-[#769d32]">.</span></h1><p className="mt-8 max-w-lg text-base leading-7 text-muted">{category.description}</p></div><div className={`article-hero noise art-${category.color} min-h-[300px] p-7 md:min-h-[370px]`}><div className="relative z-10 flex h-full min-h-[245px] flex-col justify-between"><div className="flex items-start justify-between text-[10px] font-bold uppercase tracking-[.18em] opacity-70"><span>Üretir / Arşiv</span><span>{category.symbol}</span></div><div><span className="article-hero__number">{category.symbol}</span><p className="article-hero__caption mt-4">Bu alandaki fikirleri, araçları ve insanları keşfet.</p></div></div></div></section><section className="py-16 md:py-24"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="eyebrow">{category.count}</p><h2 className="mt-3 font-display text-4xl md:text-5xl">Bu alandan seçtiklerimiz</h2></div><Link href="/blog" className="link-arrow hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] sm:inline-flex">Tümünü gör <ArrowUpRight size={14} /></Link></div>{categoryPosts.length > 0 ? <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">{categoryPosts.map((post, index) => <div key={post.slug} className="animate-rise" style={{ animationDelay: `${index * 80}ms` }}><PostCard post={post} /></div>)}</div> : <div className="surface-panel p-10 text-center"><p className="font-display text-3xl">Bu arşiv yakında büyüyecek.</p></div>}</section></div></div>;
}
