import type { Company } from "@/lib/companies";
import type { Post } from "@/lib/posts";
import { routes } from "@/lib/routes";

type ArticleIndexItem = Pick<Post, "slug" | "title" | "category" | "tags" | "publishedAt">;
type CompanyIndexItem = Pick<Company, "slug" | "name" | "sector" | "mainProducts" | "description">;

export type ContentIndex = {
  articles: Map<string, ArticleIndexItem>;
  companies: Map<string, CompanyIndexItem>;
  articleByCategory: Map<string, string[]>;
  articleByTag: Map<string, string[]>;
  companyBySector: Map<string, string[]>;
  companyByToken: Map<string, string[]>;
};

const key = (value: string) => value.trim().toLocaleLowerCase("tr-TR");
const tokens = (value: string) => value.split(/[^\p{L}\p{N}]+/u).map(key).filter((token) => token.length > 2);
const add = (map: Map<string, string[]>, value: string, slug: string) => map.set(value, [...(map.get(value) ?? []), slug]);

export function buildContentIndex(posts: ArticleIndexItem[], companies: CompanyIndexItem[]): ContentIndex {
  const index: ContentIndex = { articles: new Map(), companies: new Map(), articleByCategory: new Map(), articleByTag: new Map(), companyBySector: new Map(), companyByToken: new Map() };
  for (const post of posts) {
    index.articles.set(post.slug, post);
    add(index.articleByCategory, key(post.category), post.slug);
    for (const tag of post.tags ?? []) add(index.articleByTag, key(tag), post.slug);
  }
  for (const company of companies) {
    index.companies.set(company.slug, company);
    add(index.companyBySector, key(company.sector), company.slug);
    for (const token of tokens(`${company.name} ${company.sector} ${company.mainProducts.join(" ")} ${company.description}`)) add(index.companyByToken, token, company.slug);
  }
  return index;
}

export function getRelatedArticleSlugs(index: ContentIndex, slug: string, limit = 3) {
  const current = index.articles.get(slug);
  if (!current) return [];
  const scores = new Map<string, number>();
  for (const related of index.articleByCategory.get(key(current.category)) ?? []) if (related !== slug) scores.set(related, (scores.get(related) ?? 0) + 4);
  for (const tag of current.tags ?? []) for (const related of index.articleByTag.get(key(tag)) ?? []) if (related !== slug) scores.set(related, (scores.get(related) ?? 0) + 2);
  return [...scores.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([related]) => related);
}

export function getRelatedCompanySlugs(index: ContentIndex, slug: string, limit = 3) {
  const current = index.companies.get(slug);
  if (!current) return [];
  const scores = new Map<string, number>();
  for (const related of index.companyBySector.get(key(current.sector)) ?? []) if (related !== slug) scores.set(related, (scores.get(related) ?? 0) + 4);
  for (const token of tokens(`${current.sector} ${current.mainProducts.join(" ")}`)) for (const related of index.companyByToken.get(token) ?? []) if (related !== slug) scores.set(related, (scores.get(related) ?? 0) + 1);
  return [...scores.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([related]) => related);
}

export function contentHref(kind: "article" | "company" | "category", slug: string) {
  return kind === "article" ? routes.article(slug) : kind === "company" ? routes.company(slug) : routes.category(slug);
}

