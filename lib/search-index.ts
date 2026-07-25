import { companies } from "@/lib/companies";
import { createArticleDocument, createCompanyDocument } from "@/lib/content-factory";
import { contentHubs, hubGuides } from "@/lib/content-hubs";
import { createHubGuideDocument } from "@/lib/hub-guide-document";
import { posts } from "@/lib/posts";
import { isIndexableReference, isVisibleReference } from "@/lib/publication";

export type SearchRecordKind = "ai_product" | "guide" | "article" | "company" | "discovery";
export type SearchRecordTrust = "public_foundation" | "sample_only" | "future_integration" | "authority_ready" | "editorial_review";

export type SearchRecord = {
  id: string;
  kind: SearchRecordKind;
  title: string;
  summary: string;
  path: string;
  trust: SearchRecordTrust;
  keywords: string[];
  updatedAt?: string;
};

export type SearchResult = SearchRecord & { score: number; matchedTerms: string[] };

export type SearchIndexAdapter = {
  name: string;
  listPublicRecords(): SearchRecord[];
};

const discoveryRecords: SearchRecord[] = [
  { id: "discovery:ecosystem", kind: "discovery", title: "Üretir Ekosistemi", summary: "Üretim bilgisi, AI merkezleri ve keşif yollarının ortak haritası.", path: "/ekosistem", trust: "public_foundation", keywords: ["ekosistem", "üretim", "bilgi grafiği"] },
  { id: "discovery:tools", kind: "discovery", title: "AI bilgi merkezleri", summary: "UretirAI, PuanAI, TeşvikAI, FiyatAI ve İhracatAI merkezlerini keşfedin.", path: "/araclar", trust: "public_foundation", keywords: ["araçlar", "yapay zekâ", "AI"] },
  { id: "discovery:trends", kind: "discovery", title: "Trend Merkezi", summary: "Doğrulanmış sinyallerden editoryal araştırma adayları üretmek için hazırlanan merkez.", path: "/trendler", trust: "public_foundation", keywords: ["trend", "araştırma", "içerik keşfi"] },
  { id: "discovery:companies", kind: "discovery", title: "Ne Üretir?", summary: "Kaynak incelemesinden geçen üretici ve üretim ilişkileri için keşif merkezi.", path: "/ne-uretir", trust: "public_foundation", keywords: ["şirket", "üretici", "fabrika", "ürün"] },
  { id: "discovery:blog", kind: "discovery", title: "Makaleler", summary: "Üretim, teknoloji, yatırım ve yapay zekâ rehberleri.", path: "/blog", trust: "public_foundation", keywords: ["makale", "rehber", "üretim"] },
];

function hubTrust(availability: (typeof contentHubs)[number]["availability"]): SearchRecordTrust {
  if (availability === "sample") return "sample_only";
  if (availability === "future_integration") return "future_integration";
  return "public_foundation";
}

export const repositorySearchAdapter: SearchIndexAdapter = {
  name: "repository-publication-aware",
  listPublicRecords() {
    const hubs: SearchRecord[] = contentHubs.map((hub) => ({
      id: `ai-product:${hub.id}`, kind: "ai_product", title: hub.name, summary: hub.description, path: hub.path,
      trust: hubTrust(hub.availability), keywords: [...hub.intents, ...hub.capabilities.map((item) => item.title)],
    }));
    const guides: SearchRecord[] = hubGuides
      .map((guide) => ({ guide, document: createHubGuideDocument(guide) }))
      .filter(({ document }) => isVisibleReference(document))
      .map(({ guide, document }) => ({
        id: document.id, kind: "guide", title: guide.title, summary: guide.description, path: `/rehber/${guide.slug}`,
        trust: isIndexableReference(document) ? "authority_ready" : "editorial_review",
        keywords: [guide.question, ...guide.relatedTopics], updatedAt: guide.updatedAt,
      }));
    const articles: SearchRecord[] = posts
      .map((post) => ({ post, document: createArticleDocument(post) }))
      .filter(({ document }) => isVisibleReference(document))
      .map(({ post, document }) => ({
        id: document.id, kind: "article", title: post.title, summary: post.excerpt, path: `/blog/${post.slug}`,
        trust: isIndexableReference(document) ? "authority_ready" : "editorial_review",
        keywords: [post.category, ...(post.tags ?? [])], updatedAt: document.updatedAt,
      }));
    const companyRecords: SearchRecord[] = companies
      .map((company) => ({ company, document: createCompanyDocument(company) }))
      .filter(({ document }) => isVisibleReference(document))
      .map(({ company, document }) => ({
        id: document.id, kind: "company", title: `${company.name} ne üretir?`, summary: company.description, path: `/ne-uretir/${company.slug}`,
        trust: isIndexableReference(document) ? "authority_ready" : "editorial_review",
        keywords: [company.name, company.sector, ...company.mainProducts], updatedAt: document.updatedAt,
      }));
    return [...hubs, ...discoveryRecords, ...guides, ...articles, ...companyRecords];
  },
};

export function normalizeSearchText(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i").replaceAll("ğ", "g").replaceAll("ü", "u").replaceAll("ş", "s").replaceAll("ö", "o").replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenise(value: string) {
  return [...new Set(normalizeSearchText(value).split(/\s+/).filter((term) => term.length > 1))];
}

export function searchPublicKnowledge(query: string, options: { kind?: SearchRecordKind; limit?: number; adapter?: SearchIndexAdapter } = {}) {
  const terms = tokenise(query.slice(0, 120));
  if (!terms.length) return [];
  const adapter = options.adapter ?? repositorySearchAdapter;
  const results: SearchResult[] = [];
  for (const record of adapter.listPublicRecords()) {
    if (options.kind && record.kind !== options.kind) continue;
    const title = normalizeSearchText(record.title);
    const summary = normalizeSearchText(record.summary);
    const keywords = normalizeSearchText(record.keywords.join(" "));
    const matchedTerms = terms.filter((term) => title.includes(term) || keywords.includes(term) || summary.includes(term));
    if (!matchedTerms.length) continue;
    const fullQuery = normalizeSearchText(query);
    const score = matchedTerms.length * 10 + (title === fullQuery ? 40 : 0) + (title.includes(fullQuery) ? 20 : 0)
      + matchedTerms.reduce((total, term) => total + (title.includes(term) ? 8 : keywords.includes(term) ? 4 : 1), 0)
      + (record.trust === "authority_ready" ? 3 : 0);
    results.push({ ...record, score, matchedTerms });
  }
  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "tr")).slice(0, options.limit ?? 40);
}

export function validateSearchIndex() {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const record of repositorySearchAdapter.listPublicRecords()) {
    if (ids.has(record.id)) errors.push(`Duplicate search record: ${record.id}`);
    if (!record.path.startsWith("/")) errors.push(`Search path is not internal: ${record.id}`);
    if (process.env.NODE_ENV === "production" && record.trust === "editorial_review") errors.push(`Review record leaked into production search: ${record.id}`);
    ids.add(record.id);
  }
  return errors;
}
