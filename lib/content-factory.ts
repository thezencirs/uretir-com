import type { Company } from "@/lib/companies";
import { getCompanyEditorial, getArticleEditorial } from "@/lib/editorial";
import type { Post } from "@/lib/posts";
import { routes } from "@/lib/routes";
import type { ContentBlock, ContentDocument } from "@/lib/content-model";

function articleBlocks(post: Post, editorial: ReturnType<typeof getArticleEditorial>): ContentBlock[] {
  const blocks: ContentBlock[] = [
    { type: "paragraph", text: post.excerpt, lead: true },
    { type: "internal-links", links: editorial.internalLinks.slice(0, 2) },
    { type: "author", author: editorial.author },
    { type: "sources", sources: editorial.sources },
    { type: "faq", id: "sss", items: editorial.faq },
  ];
  editorial.sections.forEach((section, index) => {
    if (index === 1) blocks.splice(blocks.length - 4, 0, { type: "ad", format: "infeed" });
    blocks.splice(blocks.length - 4, 0, { type: "heading", id: section.id, level: 2, eyebrow: section.eyebrow, text: section.title }, ...section.paragraphs.map((text): ContentBlock => ({ type: "paragraph", text })));
  });
  return blocks;
}

export function createArticleDocument(post: Post): ContentDocument {
  const editorial = getArticleEditorial(post);
  return {
    id: `article:${post.slug}`, kind: "article", slug: post.slug, locale: "tr-TR", status: "published",
    title: post.title, excerpt: post.excerpt, category: post.category, tags: post.tags ?? [],
    author: editorial.author, publishedAt: post.publishedAt, updatedAt: editorial.updatedAt,
    readTime: post.readTime, blocks: articleBlocks(post, editorial), faq: editorial.faq,
    sources: editorial.sources, internalLinks: editorial.internalLinks, relatedSlugs: [],
    seo: { title: post.title, description: post.excerpt, canonicalPath: routes.article(post.slug), keywords: post.tags },
  };
}

function companyBlocks(company: Company, editorial: ReturnType<typeof getCompanyEditorial>): ContentBlock[] {
  return [
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
  return {
    id: `company:${company.slug}`, kind: "ne-uretir", slug: company.slug, locale: "tr-TR", status: "published",
    title: `${company.name} ne üretir?`, excerpt: company.description, tags: [company.sector, ...company.mainProducts],
    author: editorial.author, publishedAt: editorial.updatedAt, updatedAt: editorial.updatedAt,
    blocks: companyBlocks(company, editorial), faq: company.faqs, sources: editorial.sources,
    internalLinks: editorial.internalLinks, relatedSlugs: [],
    seo: { title: `${company.name} Ne Üretir?`, description: company.description, canonicalPath: routes.company(company.slug), keywords: [company.name, company.sector, ...company.mainProducts] },
  };
}
