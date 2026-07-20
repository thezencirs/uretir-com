import type { Post } from "@/lib/posts";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })) };
}

export function articleSchema(post: Post) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return { "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`, mainEntityOfPage: { "@type": "WebPage", "@id": url }, headline: post.title, description: post.excerpt, image: [absoluteUrl("/opengraph-image")], datePublished: `${post.publishedAt}T09:00:00+03:00`, dateModified: `${post.updatedAt ?? post.publishedAt}T09:00:00+03:00`, inLanguage: "tr-TR", author: { "@type": "Person", name: post.author }, publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } }, articleSection: post.category, keywords: post.tags?.join(", ") };
}

export function collectionPageSchema({ name, description, path }: { name: string; description: string; path: string }) {
  const url = absoluteUrl(path);
  return { "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url}#collection`, url, name, description, inLanguage: "tr-TR", isPartOf: { "@id": `${SITE_URL}/#website` } };
}
