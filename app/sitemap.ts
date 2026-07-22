import type { MetadataRoute } from "next";
import { categories, posts } from "@/lib/posts";
import { puanAICampaigns } from "@/lib/puan-ai";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-07-20T00:00:00.000Z");
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: .9 },
    { url: absoluteUrl("/araclar"), lastModified: now, changeFrequency: "weekly", priority: .8 },
    { url: absoluteUrl("/ekosistem"), lastModified: now, changeFrequency: "monthly", priority: .7 },
    { url: absoluteUrl("/ne-uretir"), lastModified: now, changeFrequency: "weekly", priority: .8 },
    { url: absoluteUrl("/puan-ai"), lastModified: now, changeFrequency: "monthly", priority: .6 },
    { url: absoluteUrl("/uretir-id"), lastModified: now, changeFrequency: "monthly", priority: .8 },
    { url: absoluteUrl("/startup"), lastModified: now, changeFrequency: "monthly", priority: .6 },
    { url: absoluteUrl("/yakinda"), lastModified: now, changeFrequency: "monthly", priority: .4 },
    { url: absoluteUrl("/hakkimizda"), lastModified: now, changeFrequency: "monthly", priority: .5 },
    { url: absoluteUrl("/iletisim"), lastModified: now, changeFrequency: "monthly", priority: .5 },
    { url: absoluteUrl("/gizlilik-politikasi"), lastModified: now, changeFrequency: "yearly", priority: .2 },
  ];
  const categoryRoutes = categories.map((category) => ({ url: absoluteUrl(`/kategori/${category.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: .75 }));
  const articleRoutes = posts.map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: new Date(`${post.updatedAt ?? post.publishedAt}T00:00:00.000Z`), changeFrequency: "monthly" as const, priority: post.featured ? .9 : .75 }));
  const campaignRoutes = puanAICampaigns.map((campaign) => ({ url: absoluteUrl(`/puan-ai/kampanya/${campaign.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: campaign.featured ? .8 : .65 }));
  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...campaignRoutes];
}
