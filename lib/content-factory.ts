import type { Company } from "@/lib/companies";
import { getCompanyEditorial, getArticleEditorial } from "@/lib/editorial";
import type { Post } from "@/lib/posts";
import { routes } from "@/lib/routes";
import type { ContentBlock, ContentDocument } from "@/lib/content-model";
import { createSearchIntentProfile } from "@/lib/search-intent";

function estimateReadingTime(blocks: ContentBlock[]) {
  const words = blocks.flatMap((block) => {
    if (block.type === "paragraph") return block.text.split(/\s+/);
    if (block.type === "heading") return block.text.split(/\s+/);
    if (block.type === "summary" || block.type === "key-takeaways") return block.items.flatMap((item) => item.split(/\s+/));
    return [];
  }).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} dk okuma`;
}

function articleBlocks(post: Post, editorial: ReturnType<typeof getArticleEditorial>): ContentBlock[] {
  const mainSections: ContentBlock[] = [];
  editorial.sections.forEach((section, index) => {
    mainSections.push(
      { type: "heading", id: section.id, level: 2, eyebrow: section.eyebrow, text: section.title },
      ...section.paragraphs.map((text): ContentBlock => ({ type: "paragraph", text })),
    );
    if (index === 1) mainSections.push({ type: "ad", format: "infeed" });
  });

  return [
    { type: "summary", id: "ozet", title: "Kısa özet", items: [post.excerpt] },
    { type: "paragraph", text: post.excerpt, lead: true },
    ...mainSections,
    { type: "editor-note", id: "editor-incelemesi", text: "Bu eski içerik kaydı kaynak, özgün örnek, entity ilişkisi ve alan uzmanı incelemesi tamamlanana kadar yayımlanmaz." },
    { type: "internal-links", links: editorial.internalLinks },
    ...(editorial.sources.length ? [{ type: "sources", sources: editorial.sources } satisfies ContentBlock] : []),
    { type: "author", author: editorial.author },
    { type: "faq", id: "sss", items: editorial.faq },
  ];
}

export function createArticleDocument(post: Post): ContentDocument {
  const editorial = getArticleEditorial(post);
  const blocks = articleBlocks(post, editorial);
  return {
    id: `article:${post.slug}`, kind: "article", slug: post.slug, locale: "tr-TR", status: "in_review", trustState: "editorial_review",
    title: post.title, excerpt: post.excerpt, category: post.category, tags: post.tags ?? [],
    author: editorial.author, publishedAt: post.publishedAt, updatedAt: editorial.updatedAt,
    readTime: estimateReadingTime(blocks), blocks, faq: editorial.faq,
    sources: editorial.sources, internalLinks: editorial.internalLinks, relatedSlugs: [],
    searchIntent: createSearchIntentProfile({ primary: "öğrenme", secondary: ["rehber"], userQuestion: post.title, decisionStage: "discovery" }),
    entityRelations: [
      { entityId: `article:${post.slug}`, kind: "article", relationship: "primary_subject", label: post.title, canonicalPath: routes.article(post.slug) },
      { entityId: `category:${post.category.toLocaleLowerCase("tr-TR")}`, kind: "category", relationship: "belongs_to", label: post.category },
      { entityId: "ai-product:uretir-ai", kind: "ai_product", relationship: "related_to", label: "UretirAI", canonicalPath: "/uretir-ai" },
      { entityId: "guide:uretim-sorusu-nasil-arastirilir", kind: "guide", relationship: "related_to", label: "Üretim sorusu araştırma rehberi", canonicalPath: "/rehber/uretim-sorusu-nasil-arastirilir" },
    ],
    seo: { title: post.title, description: post.excerpt, canonicalPath: routes.article(post.slug), keywords: post.tags },
  };
}

function companyBlocks(company: Company, editorial: ReturnType<typeof getCompanyEditorial>): ContentBlock[] {
  return [
    { type: "summary", id: "ozet", title: "Hızlı profil", items: [company.description] },
    { type: "paragraph", text: company.description, lead: true },
    { type: "company-text", id: "faaliyet-alani", eyebrow: "Faaliyet Alanı", text: company.activityArea },
    { type: "company-products", id: "ana-urunler", title: "Ana Ürünler", items: company.mainProducts },
    { type: "company-products", id: "yan-urunler", title: "Alt Ürünler ve Yan Ürünler", items: company.subProducts, muted: true },
    { type: "company-list", id: "tesisler", title: "Üretim Tesisleri", items: company.facilities, numbered: true },
    { type: "company-products", id: "ihracat", title: "İhracat Yaptığı Ülkeler", items: company.exportCountries },
    { type: "company-text", id: "surdurulebilirlik", eyebrow: "Sürdürülebilirlik", text: company.sustainability },
    { type: "author", author: editorial.author },
    { type: "sources", sources: editorial.sources },
    { type: "internal-links", links: editorial.internalLinks },
    { type: "faq", id: "sss", title: `${company.name} hakkında`, items: company.faqs },
  ];
}

export function createCompanyDocument(company: Company): ContentDocument {
  const editorial = getCompanyEditorial(company);
  const blocks = companyBlocks(company, editorial);
  return {
    id: `company:${company.slug}`, kind: "ne-uretir", slug: company.slug, locale: "tr-TR", status: "in_review", trustState: "editorial_review",
    title: `${company.name} ne üretir?`, excerpt: company.description, tags: [company.sector, ...company.mainProducts],
    author: editorial.author, publishedAt: editorial.updatedAt, updatedAt: editorial.updatedAt,
    readTime: estimateReadingTime(blocks), blocks, faq: company.faqs, sources: editorial.sources,
    internalLinks: editorial.internalLinks, relatedSlugs: [],
    searchIntent: createSearchIntentProfile({ primary: "şirket profili", secondary: ["öğrenme", "sektör rehberi"], userQuestion: `${company.name} ne üretir?`, decisionStage: "discovery" }),
    entityRelations: [
      { entityId: `company:${company.slug}`, kind: "company", relationship: "primary_subject", label: company.name, canonicalPath: routes.company(company.slug) },
      { entityId: `industry:${company.sector.toLocaleLowerCase("tr-TR")}`, kind: "industry", relationship: "operates_in", label: company.sector },
      { entityId: "ai-product:uretir-ai", kind: "ai_product", relationship: "related_to", label: "UretirAI", canonicalPath: "/uretir-ai" },
      { entityId: "guide:uretim-sorusu-nasil-arastirilir", kind: "guide", relationship: "related_to", label: "Üretim sorusu araştırma rehberi", canonicalPath: "/rehber/uretim-sorusu-nasil-arastirilir" },
    ],
    seo: { title: `${company.name} Ne Üretir?`, description: company.description, canonicalPath: routes.company(company.slug), keywords: [company.name, company.sector, ...company.mainProducts] },
  };
}
