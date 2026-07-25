import { createArticleDocument } from "@/lib/content-factory";
import { posts } from "@/lib/posts";
import { isIndexableReference } from "@/lib/publication";
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
export function GET() {
  const publishedPosts = posts
    .filter((post) => isIndexableReference(createArticleDocument(post)))
    .sort((a, b) => (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt));
  const lastBuildDate = publishedPosts[0]?.updatedAt ?? publishedPosts[0]?.publishedAt ?? "2026-07-25";
  const items = publishedPosts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${absoluteUrl(`/blog/${post.slug}`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/blog/${post.slug}`)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${new Date(`${post.publishedAt}T09:00:00+03:00`).toUTCString()}</pubDate>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(DEFAULT_DESCRIPTION)}</description>
    <language>tr-TR</language>
    <lastBuildDate>${new Date(`${lastBuildDate}T09:00:00+03:00`).toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
