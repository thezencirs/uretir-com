import type { MetadataRoute } from "next";
import {publicContent} from "@/lib/members/store";
export const revalidate=300;
import { categories, posts } from "@/lib/posts";
import { companies } from "@/lib/companies";
import { createArticleDocument, createCompanyDocument } from "@/lib/content-factory";
import { isIndexableReference } from "@/lib/publication";
import { absoluteUrl } from "@/lib/seo";
import { hubGuides } from "@/lib/content-hubs";
import { createHubGuideDocument } from "@/lib/hub-guide-document";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date("2026-07-25T00:00:00.000Z");
  const indexablePosts = posts.filter((post) => isIndexableReference(createArticleDocument(post)));
  const indexableCompanies = companies.filter((company) => isIndexableReference(createCompanyDocument(company)));
  const indexableGuides = hubGuides.map(createHubGuideDocument).filter(isIndexableReference);
  const staticRoutes: MetadataRoute.Sitemap = [
    {url:absoluteUrl("/haber-ai"),lastModified:new Date("2026-09-12T00:00:00Z"),changeFrequency:"daily",priority:.8},
    {url:absoluteUrl("/cozumler"),lastModified:new Date("2026-09-12T00:00:00Z"),changeFrequency:"weekly",priority:.7},
    {url:absoluteUrl("/girisimler"),lastModified:new Date("2026-09-12T00:00:00Z"),changeFrequency:"weekly",priority:.7},
    {url:absoluteUrl("/girisimler/web"),lastModified:new Date("2026-09-12T00:00:00Z"),changeFrequency:"weekly",priority:.7},
    {url:absoluteUrl("/kaynaklar"),lastModified:new Date("2026-09-12T00:00:00Z"),changeFrequency:"weekly",priority:.7},
    {url:absoluteUrl("/kaynaklar/destek"),lastModified:new Date("2026-09-12T00:00:00Z"),changeFrequency:"weekly",priority:.7},
    { url: absoluteUrl("/finans-ai"), lastModified: new Date("2026-09-12T00:00:00.000Z"), changeFrequency: "daily", priority: .8 },
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/gelismeler"), lastModified: new Date("2026-09-11T00:00:00.000Z"), changeFrequency: "daily", priority: .85 },
    { url: absoluteUrl("/araclar"), lastModified: now, changeFrequency: "weekly", priority: .8 },
    { url: absoluteUrl("/uygulamalar"), lastModified: now, changeFrequency: "weekly", priority: .85 },
    { url: absoluteUrl("/en"), lastModified: now, changeFrequency: "monthly", priority: .6, alternates: { languages: { tr: absoluteUrl("/"), en: absoluteUrl("/en") } } },
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
  let memberRoutes: MetadataRoute.Sitemap=[];
  try{const rows=(await publicContent()).filter(r=>r.kind==="startup"||r.kind==="post");memberRoutes=rows.map(r=>({url:absoluteUrl((r.kind==="startup"?"/ekosistem/girisim/":"/topluluk/")+r.id),lastModified:new Date(r.published_at!),changeFrequency:"weekly" as const,priority:.6}));for(const handle of new Set(rows.map(r=>r.handle)))memberRoutes.push({url:absoluteUrl("/uye/"+handle),changeFrequency:"weekly",priority:.5});}catch{console.warn("Member sitemap unavailable");}
  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...companyRoutes, ...guideRoutes,...memberRoutes,{url:absoluteUrl("/kaynaklar/topluluk"),changeFrequency:"daily",priority:.8},{url:absoluteUrl("/ekosistem/harita"),changeFrequency:"daily",priority:.8},{url:absoluteUrl("/ekosistem/marketplace"),changeFrequency:"daily",priority:.7}];
}
