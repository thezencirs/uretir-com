import type { MetadataRoute } from "next";
import { categories, posts } from "@/lib/posts";
import { companies } from "@/lib/companies";
import { createArticleDocument, createCompanyDocument } from "@/lib/content-factory";
import { isIndexableReference } from "@/lib/publication";
import { absoluteUrl } from "@/lib/seo";
import { hubGuides } from "@/lib/content-hubs";
import { createHubGuideDocument } from "@/lib/hub-guide-document";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-07-25T00:00:00.000Z");
  const indexablePosts = posts.filter((post) => isIndexableReference(createArticleDocument(post)));
  const indexableCompanies = companies.filter((company) => isIndexableReference(createCompanyDocument(company)));
  const indexableGuides = hubGuides.map(createHubGuideDocument).filter(isIndexableReference);
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/araclar"), lastModified: now, changeFrequency: "weekly", priority: .8 },
    { url: absoluteUrl("/ekosistem"), lastModified: now, changeFrequency: "monthly", priority: .7 },
    { url: absoluteUrl("/puan-ai"), lastModified: now, changeFrequency: "monthly", priority: .6 },
    { url: absoluteUrl("/hakkimizda"), lastModified: now, changeFrequency: "monthly", priority: .5 },
    { url: absoluteUrl("/iletisim"), lastModified: now, changeFrequency: "monthly", priority: .5 },
    { url: absoluteUrl("/gizlilik-politikasi"), lastModified: now, changeFrequency: "yearly", priority: .2 },
    ...(indexablePosts.length ? [{ url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly" as const, priority: .85 }] : []),
    ...(indexableCompanies.length ? [{ url: absoluteUrl("/ne-uretir"), lastModified: now, changeFrequency: "weekly" as const, priority: .85 }] : []),
  ];
  const categoryRoutes = categories.filter((category) => indexablePosts.some((post) => post.category === category.name)).map((category) => ({ url: absoluteUrl(`/kategori/${category.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: .75 }));
  const articleRoutes = indexablePosts.map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: new Date(`${post.updatedAt ?? post.publishedAt}T00:00:00.000Z`), changeFrequency: "monthly" as const, priority: post.featured ? .9 : .75 }));
  const companyRoutes = indexableCompanies.map((company) => ({ url: absoluteUrl(`/ne-uretir/${company.slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: .75 }));
  const guideRoutes = indexableGuides.map((guide) => ({ url: absoluteUrl(guide.seo.canonicalPath), lastModified: new Date(`${guide.updatedAt}T00:00:00.000Z`), changeFrequency: "monthly" as const, priority: .75 }));
  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...companyRoutes, ...guideRoutes];
}
