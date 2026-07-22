import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ad-slot";
import { ContentBlockRenderer } from "@/components/content-block-renderer";
import { TableOfContents } from "@/components/editorial-components";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ShareButton } from "@/components/share-button";
import { createArticleDocument } from "@/lib/content-factory";
import { getTextBlocks, getTocItems } from "@/lib/content-model";
import { absoluteUrl } from "@/lib/seo";
import { categories, getPost, posts } from "@/lib/posts";
import { buildContentIndex, getRelatedArticleSlugs } from "@/lib/content-linking";
import { articleSchema, breadcrumbSchema, faqPageSchema } from "@/lib/structured-data";

export function generateStaticParams() { return posts.map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return { title: "Yazı bulunamadı", robots: { index: false, follow: false } };
  const url = absoluteUrl(`/blog/${post.slug}`);
  return { title: post.title, description: post.excerpt, alternates: { canonical: url }, authors: [{ name: post.author }], openGraph: { title: post.title, description: post.excerpt, url, type: "article", publishedTime: `${post.publishedAt}T09:00:00+03:00`, modifiedTime: `${post.updatedAt ?? post.publishedAt}T09:00:00+03:00`, authors: [post.author], section: post.category, tags: post.tags, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: post.title }] }, twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: ["/opengraph-image"] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const document = createArticleDocument(post);
  const index = buildContentIndex(posts, []);
  const relatedPosts = getRelatedArticleSlugs(index, post.slug).map((slug) => posts.find((item) => item.slug === slug)).filter((item): item is (typeof posts)[number] => Boolean(item));
  const categorySlug = categories.find((category) => category.name === post.category)?.slug ?? "blog";
  const tocItems = [...getTocItems(document), { id: "sss", label: "Sıkça sorulan sorular" }];
  const articleBody = getTextBlocks(document).join(" ");
  const schemas = [articleSchema(post, { authorName: document.author.name, authorUrl: "/hakkimizda", wordCount: articleBody.split(/\s+/).length, articleBody, sources: document.sources }), breadcrumbSchema([{ name: "Ana sayfa", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]), faqPageSchema(document.faq)];

  return <article className="page-reveal editorial-page">
    <JsonLd data={schemas} />
    <header className="section-wrap editorial-header">
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.category, href: `/kategori/${categorySlug}` }, { label: post.title }]} />
      <div className="editorial-header__content"><p className="eyebrow flex items-center gap-2"><span className={`category-dot category-${post.accent}`} /> {post.category}</p><h1>{post.title}</h1><p className="editorial-header__excerpt">{post.excerpt}</p><div className="editorial-meta"><span className="editorial-meta__author">{post.author}</span><span><CalendarDays size={13} /> {post.date}</span><span><Clock3 size={13} /> {post.readTime}</span><span>Son güncelleme: {formatDate(document.updatedAt)}</span></div></div>
    </header>
    <div className="section-wrap editorial-ad-top"><AdSlot format="leaderboard" /></div>
    <div className={`section-wrap article-hero noise art-${post.accent} editorial-hero`}><div className="relative z-10 flex h-full min-h-[410px] flex-col justify-between"><div className="flex items-start justify-between text-[10px] font-bold uppercase tracking-[.18em] opacity-70"><span>Üretir / Dosya {post.number}</span><span>{post.category}</span></div><div className="flex items-end justify-between gap-8"><div><div className="article-hero__number">{post.number}</div><p className="article-hero__caption mt-5">Geleceği anlamak için bugün ne üretiyoruz?</p></div><span className="hidden text-[10px] uppercase tracking-[.16em] opacity-60 md:block">Kavram<br />Uygulama<br />Gelecek</span></div></div></div>
    <div className="section-wrap article-layout editorial-layout"><aside className="article-sidebar editorial-sidebar"><TableOfContents items={tocItems} /><div className="editorial-sidebar__share"><ShareButton /></div><AdSlot format="sidebar" /></aside><main className="article-copy editorial-copy"><ContentBlockRenderer blocks={document.blocks} /></main></div>
    <section className="related-articles"><div className="related-articles__heading"><div><p className="eyebrow">Sıradaki okumalar</p><h2>Bunlara da bakın.</h2></div><Link href="/blog" className="link-arrow">Arşive dön <ArrowUpRight size={15} /></Link></div><div className="related-articles__grid">{relatedPosts.map((related) => <Link href={`/blog/${related.slug}`} key={related.slug} className="border hairline p-6"><p className="eyebrow">{related.category}</p><h3 className="mt-4 font-display text-2xl">{related.title}</h3><p className="mt-3 text-sm text-muted">{related.excerpt}</p></Link>)}</div></section>
    <div className="section-wrap editorial-footer-link"><Link href="/blog" className="link-arrow inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]">Tüm yazılara dön <ArrowUpRight size={14} /></Link></div>
  </article>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
