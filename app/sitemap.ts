import type { MetadataRoute } from "next";
import { publicContent } from "@/lib/members/store";
export const revalidate = 300;
import { categories, posts } from "@/lib/posts";
import { companies } from "@/lib/companies";
import { createArticleDocument, createCompanyDocument } from "@/lib/content-factory";
import { isIndexableReference } from "@/lib/publication";
import { absoluteUrl } from "@/lib/seo";
import { hubGuides } from "@/lib/content-hubs";
import { createHubGuideDocument } from "@/lib/hub-guide-document";
import provinces from "@/lib/haber-ai/provinces.json";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const indexablePosts = posts.filter((post) => isIndexableReference(createArticleDocument(post)));
  const indexableCompanies = companies.filter((company) => isIndexableReference(createCompanyDocument(company)));
  const indexableGuides = hubGuides.map(createHubGuideDocument).filter(isIndexableReference);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: absoluteUrl("/haber-ai"), lastModified: now, changeFrequency: "hourly", priority: 0.98 },
    { url: absoluteUrl("/indirim-ai"), lastModified: now, changeFrequency: "hourly", priority: 0.96 },
    { url: absoluteUrl("/finans-ai"), lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: absoluteUrl("/puan-ai"), lastModified: now, changeFrequency: "daily", priority: 0.94 },
    { url: absoluteUrl("/araba-ai"), lastModified: now, changeFrequency: "daily", priority: 0.94 },
    { url: absoluteUrl("/ev-ai"), lastModified: now, changeFrequency: "daily", priority: 0.94 },
    { url: absoluteUrl("/spor-ai"), lastModified: now, changeFrequency: "daily", priority: 0.93 },
    { url: absoluteUrl("/oyun-ai"), lastModified: now, changeFrequency: "daily", priority: 0.92 },
    { url: absoluteUrl("/harita"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/kesfet"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/gelismeler"), lastModified: now, changeFrequency: "daily", priority: 0.88 },
    { url: absoluteUrl("/araclar"), lastModified: now, changeFrequency: "daily", priority: 0.88 },
    { url: absoluteUrl("/uygulamalar"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: absoluteUrl("/cozumler"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/girisimler"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/girisimler/web"), lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: absoluteUrl("/kaynaklar"), lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: absoluteUrl("/kaynaklar/destek"), lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: absoluteUrl("/ekosistem"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/ekosistem/harita"), lastModified: now, changeFrequency: "daily", priority: 0.82 },
    { url: absoluteUrl("/ekosistem/marketplace"), lastModified: now, changeFrequency: "daily", priority: 0.82 },
    { url: absoluteUrl("/kaynaklar/topluluk"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/urun-gonder"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/hakkimizda"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/iletisim"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/gizlilik-politikasi"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    {
      url: absoluteUrl("/en"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: { tr: absoluteUrl("/"), en: absoluteUrl("/en") } },
    },
    { url: absoluteUrl("/en/araclar"), lastModified: now, changeFrequency: "weekly", priority: 0.65 },
    { url: absoluteUrl("/en/gelismeler"), lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: absoluteUrl("/en/harita"), lastModified: now, changeFrequency: "weekly", priority: 0.65 },
    { url: absoluteUrl("/en/uygulamalar"), lastModified: now, changeFrequency: "weekly", priority: 0.65 },
    ...(indexablePosts.length ? [{ url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily" as const, priority: 0.88 }] : []),
    ...(indexableCompanies.length ? [{ url: absoluteUrl("/ne-uretir"), lastModified: now, changeFrequency: "weekly" as const, priority: 0.85 }] : []),
  ];

  // 81 Province News Map SEO URLs
  const provinceNewsRoutes: MetadataRoute.Sitemap = provinces.map((p) => ({
    url: absoluteUrl(`/haber-ai?city=${p.code}`),
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.82,
  }));

  const categoryRoutes = categories
    .filter((category) => indexablePosts.some((post) => post.category === category.name))
    .map((category) => ({
      url: absoluteUrl(`/kategori/${category.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.78,
    }));

  const articleRoutes = indexablePosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(`${post.updatedAt ?? post.publishedAt}T00:00:00.000Z`),
    changeFrequency: "monthly" as const,
    priority: post.featured ? 0.92 : 0.8,
  }));

  const companyRoutes = indexableCompanies.map((company) => ({
    url: absoluteUrl(`/ne-uretir/${company.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.78,
  }));

  const guideRoutes = indexableGuides.map((guide) => ({
    url: absoluteUrl(guide.seo.canonicalPath),
    lastModified: new Date(`${guide.updatedAt}T00:00:00.000Z`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  let memberRoutes: MetadataRoute.Sitemap = [];
  try {
    const rows = (await publicContent()).filter((r) => r.kind === "startup" || r.kind === "post");
    memberRoutes = rows.map((r) => ({
      url: absoluteUrl((r.kind === "startup" ? "/ekosistem/girisim/" : "/topluluk/") + r.id),
      lastModified: new Date(r.published_at!),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    }));
    for (const handle of new Set(rows.map((r) => r.handle))) {
      memberRoutes.push({ url: absoluteUrl("/uye/" + handle), lastModified: now, changeFrequency: "weekly", priority: 0.55 });
    }
  } catch {
    console.warn("Member sitemap unavailable");
  }

  const allRoutes: MetadataRoute.Sitemap = [
    ...staticRoutes,
    ...provinceNewsRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...companyRoutes,
    ...guideRoutes,
    ...memberRoutes,
  ];
  return [...new Map(allRoutes.map((route) => [route.url, route])).values()];
}
