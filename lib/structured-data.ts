import type { Post } from "@/lib/posts";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })) };
}

export function articleSchema(post: Post, options: { authorName?: string; authorUrl?: string; wordCount?: number; articleBody?: string; sources?: Array<{ title: string; href: string }> } = {}) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return { "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`, mainEntityOfPage: { "@type": "WebPage", "@id": url }, headline: post.title, description: post.excerpt, image: [absoluteUrl("/opengraph-image")], datePublished: `${post.publishedAt}T09:00:00+03:00`, dateModified: `${post.updatedAt ?? post.publishedAt}T09:00:00+03:00`, inLanguage: "tr-TR", isAccessibleForFree: true, author: { "@type": "Person", name: options.authorName ?? post.author, ...(options.authorUrl ? { url: absoluteUrl(options.authorUrl) } : {}) }, publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } }, articleSection: post.category, keywords: post.tags?.join(", "), ...(options.wordCount ? { wordCount: options.wordCount } : {}), ...(options.articleBody ? { articleBody: options.articleBody } : {}), ...(options.sources?.length ? { citation: options.sources.map((source) => ({ "@type": "CreativeWork", name: source.title, url: absoluteUrl(source.href) })) } : {}) };
}

export function faqPageSchema(items: Array<{ question: string; answer: string }>) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
}

export function collectionPageSchema({ name, description, path }: { name: string; description: string; path: string }) {
  const url = absoluteUrl(path);
  return { "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url}#collection`, url, name, description, inLanguage: "tr-TR", isPartOf: { "@id": `${SITE_URL}/#website` } };
}
