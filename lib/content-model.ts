import type { EditorialAuthor, EditorialFaq, EditorialLink, EditorialSource } from "@/lib/editorial";
import type { EditorialEntityReference, EditorialImage, EditorialPublishingRecord, OfficialDocumentReference } from "@/lib/editorial-engine";
import type { SearchIntentProfile } from "@/lib/search-intent";
import type { ContentClusterMembership } from "@/lib/topic-clusters";

export type ContentStatus = "draft" | "in_review" | "published" | "archived";
export type ContentKind = "article" | "guide" | "ne-uretir";
export type ContentTrustState = "verified" | "estimated" | "sample" | "coming_soon" | "future_integration" | "editorial_review";

export type ContentBlock =
  | { type: "paragraph"; text: string; lead?: boolean }
  | { type: "summary"; id: string; title?: string; items: string[] }
  | { type: "key-takeaways"; id: string; title?: string; items: string[] }
  | { type: "heading"; id: string; level: 2 | 3; eyebrow?: string; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "example"; id: string; title: string; context?: string; text: string }
  | { type: "pros-cons"; id: string; title?: string; advantages: string[]; disadvantages: string[] }
  | { type: "editor-note"; id: string; title?: string; text: string; updatedAt?: string }
  | { type: "entity-links"; id: string; title: string; items: Array<{ label: string; href: string; kind: string; description?: string }> }
  | { type: "ad"; format: "leaderboard" | "infeed" | "sidebar" }
  | { type: "company-products"; id: string; title: string; items: string[]; muted?: boolean }
  | { type: "company-list"; id: string; title: string; items: string[]; numbered?: boolean }
  | { type: "company-text"; id: string; eyebrow: string; text: string }
  | { type: "faq"; id: string; title?: string; items: EditorialFaq[] }
  | { type: "image-gallery"; id: string; images: EditorialImage[] }
  | { type: "official-documents"; id: string; documents: OfficialDocumentReference[] }
  | { type: "author"; author: EditorialAuthor }
  | { type: "sources"; sources: EditorialSource[] }
  | { type: "internal-links"; links: EditorialLink[] };

export type ContentSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
};

export type ContentDocument = {
  id: string;
  kind: ContentKind;
  slug: string;
  locale: "tr-TR";
  status: ContentStatus;
  trustState: ContentTrustState;
  title: string;
  excerpt: string;
  category?: string;
  tags: string[];
  author: EditorialAuthor;
  publishedAt: string;
  updatedAt: string;
  readTime?: string;
  blocks: ContentBlock[];
  faq: EditorialFaq[];
  sources: EditorialSource[];
  internalLinks: EditorialLink[];
  relatedSlugs: string[];
  searchIntent: SearchIntentProfile;
  /** Future-ready publishing contract. Legacy documents may omit this until migrated. */
  editorial?: EditorialPublishingRecord;
  /** Explicit graph links used by internal linking, search, and future AI retrieval. */
  entityRelations?: EditorialEntityReference[];
  /** Topic-cluster placement required before a reference can become indexable. */
  topicCluster?: ContentClusterMembership;
  seo: ContentSeo;
};

export function getTextBlocks(document: ContentDocument) {
  return document.blocks.flatMap((block) => {
    if (block.type === "paragraph" || block.type === "quote") return [block.text];
    if (block.type === "heading") return [block.text];
    if (block.type === "summary") return block.items;
    if (block.type === "key-takeaways") return block.items;
    if (block.type === "example") return [block.title, block.context ?? "", block.text].filter(Boolean);
    if (block.type === "pros-cons") return [...block.advantages, ...block.disadvantages];
    if (block.type === "editor-note") return [block.text];
    if (block.type === "entity-links") return block.items.flatMap((item) => [item.label, item.description ?? ""]).filter(Boolean);
    if (block.type === "company-text") return [block.text];
    if (block.type === "company-products" || block.type === "company-list") return block.items;
    return [];
  });
}

export function getTocItems(document: ContentDocument) {
  return document.blocks.flatMap((block) => {
    if (block.type === "heading" && block.level === 2) return [{ id: block.id, label: block.text }];
    if (block.type === "summary") return [{ id: block.id, label: block.title ?? "Özet" }];
    if (block.type === "key-takeaways") return [{ id: block.id, label: block.title ?? "Önemli çıkarımlar" }];
    if (block.type === "example") return [{ id: block.id, label: block.title }];
    if (block.type === "pros-cons") return [{ id: block.id, label: block.title ?? "Avantajlar ve riskler" }];
    if (block.type === "editor-note") return [{ id: block.id, label: block.title ?? "Editör notu" }];
    if (block.type === "entity-links") return [{ id: block.id, label: block.title }];
    if (block.type === "company-text") return [{ id: block.id, label: block.eyebrow }];
    if (block.type === "company-products" || block.type === "company-list") return [{ id: block.id, label: block.title }];
    return [];
  });
}
