import type { MetadataRoute } from "next";
import { categories, posts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-07-20T00:00:00.000Z");
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: .9 },
    { url: absoluteUrl("/hakkimizda"), lastModified: now, changeFrequency: "monthly", priority: .5 },
    { url: absoluteUrl("/iletisim"), lastModified: now, changeFrequency: "monthly", priority: .5 },
    { url: absoluteUrl("/gizlilik-politikasi"), lastModified: now, changeFrequency: "yearly", priority: .2 },
  ];
  const categoryRoutes = categories.map((category) => ({ url: absoluteUrl(`/kategori/${category.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: .75 }));
  const articleRoutes = posts.map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: new Date(`${post.updatedAt ?? post.publishedAt}T00:00:00.000Z`), changeFrequency: "monthly" as const, priority: post.featured ? .9 : .75 }));
  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
