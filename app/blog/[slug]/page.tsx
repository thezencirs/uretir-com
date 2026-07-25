import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ad-slot";
import { ContentBlockRenderer } from "@/components/content-block-renderer";
import { ContentDiscoverySection } from "@/components/content-discovery-section";
import { EditorialReviewNotice } from "@/components/editorial-review-notice";
import { AuthorityReadinessNotice } from "@/components/authority-readiness-notice";
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
import { isIndexableReference, isVisibleReference } from "@/lib/publication";
import { getDocumentDiscovery, mergeDiscoveryItems, type DiscoveryItem } from "@/lib/content-discovery";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts
    .filter((post) => isVisibleReference(createArticleDocument(post)))
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return { title: "Yazı bulunamadı", robots: { index: false, follow: false } };
  const document = createArticleDocument(post);
  if (!isVisibleReference(document)) return { title: "Yazı bulunamadı", robots: { index: false, follow: false } };
  const indexable = isIndexableReference(document);
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    title: post.title,
    description: post.excerpt,
    robots: indexable ? undefined : { index: false, follow: true },
    alternates: { canonical: url },
    authors: indexable ? [{ name: post.author }] : [{ name: "Üretir Editoryal" }],
    openGraph: indexable
      ? { title: post.title, description: post.excerpt, url, type: "article", publishedTime: `${post.publishedAt}T09:00:00+03:00`, modifiedTime: `${post.updatedAt ?? post.publishedAt}T09:00:00+03:00`, authors: [post.author], section: post.category, tags: post.tags, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: post.title }] }
      : { title: post.title, description: post.excerpt, url, type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: post.title }] },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: ["/opengraph-image"] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const document = createArticleDocument(post);
  if (!isVisibleReference(document)) notFound();
  const indexable = isIndexableReference(document);
  const index = buildContentIndex(posts, []);
  const relatedPosts = getRelatedArticleSlugs(index, post.slug).map((slug) => posts.find((item) => item.slug === slug)).filter((item): item is (typeof posts)[number] => Boolean(item));
  const discoveryItems = mergeDiscoveryItems(
    relatedPosts.map((related): DiscoveryItem => ({ label: related.title, description: related.excerpt, href: `/blog/${related.slug}`, kind: related.category, trustState: "editorial_review" })),
    getDocumentDiscovery(document, { includeReview: !indexable, limit: 9 }),
  ).slice(0, 9);
  const categorySlug = categories.find((category) => category.name === post.category)?.slug ?? "blog";
  const tocItems = [...getTocItems(document), { id: "sss", label: "Sıkça sorulan sorular" }];
  const articleBody = getTextBlocks(document).join(" ");
  const schemas = [articleSchema(post, { authorName: document.author.name, authorUrl: "/hakkimizda", wordCount: articleBody.split(/\s+/).length, articleBody, sources: document.sources, about: document.entityRelations }), breadcrumbSchema([{ name: "Ana sayfa", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]), faqPageSchema(document.faq)];

  return <article className="page-reveal editorial-page">
    {indexable && <JsonLd data={schemas} />}
    <header className="section-wrap editorial-header">
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.category, href: `/kategori/${categorySlug}` }, { label: post.title }]} />
      {!indexable && <><EditorialReviewNotice /><AuthorityReadinessNotice document={document} /></>}
      <div className="editorial-header__content"><p className="eyebrow flex items-center gap-2"><span className={`category-dot category-${post.accent}`} /> {post.category}</p><h1>{post.title}</h1><p className="editorial-header__excerpt">{post.excerpt}</p><div className="editorial-meta">{indexable ? <><span className="editorial-meta__author">{post.author}</span><span><CalendarDays size={13} /> {post.date}</span><span><Clock3 size={13} /> {document.readTime}</span><span>Son güncelleme: {formatDate(document.updatedAt)}</span></> : <><span className="editorial-meta__author">Üretir Editoryal</span><span><CalendarDays size={13} /> Yayınlanmadı</span><span><Clock3 size={13} /> Tahmini {document.readTime}</span><span>Son düzenleme: {formatDate(document.updatedAt)}</span></>}</div></div>
    </header>
    <div className="section-wrap editorial-ad-top"><AdSlot format="leaderboard" /></div>
    <div className={`section-wrap article-hero noise art-${post.accent} editorial-hero`}><div className="relative z-10 flex h-full min-h-[410px] flex-col justify-between"><div className="flex items-start justify-between text-[10px] font-bold uppercase tracking-[.18em] opacity-70"><span>Üretir / Dosya {post.number}</span><span>{post.category}</span></div><div className="flex items-end justify-between gap-8"><div><div className="article-hero__number">{post.number}</div><p className="article-hero__caption mt-5">Geleceği anlamak için bugün ne üretiyoruz?</p></div><span className="hidden text-[10px] uppercase tracking-[.16em] opacity-60 md:block">Kavram<br />Uygulama<br />Gelecek</span></div></div></div>
    <div className="section-wrap article-layout editorial-layout"><aside className="article-sidebar editorial-sidebar"><TableOfContents items={tocItems} /><div className="editorial-sidebar__share"><ShareButton /></div><AdSlot format="sidebar" /></aside><div className="article-copy editorial-copy"><ContentBlockRenderer blocks={document.blocks} /></div></div>
    <ContentDiscoverySection items={discoveryItems} eyebrow="Sıradaki okumalar ve araçlar" title="Bu sorudan nereye gidilir?" />
    <div className="section-wrap editorial-footer-link"><Link href="/blog" className="link-arrow inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]">Tüm yazılara dön <ArrowUpRight size={14} /></Link></div>
  </article>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
