import type { EditorialAuthor, EditorialFaq, EditorialLink, EditorialSource } from "@/lib/editorial";
import type { EditorialEntityReference, EditorialImage, EditorialPublishingRecord, OfficialDocumentReference } from "@/lib/editorial-engine";

export type ContentStatus = "draft" | "published" | "archived";
export type ContentKind = "article" | "ne-uretir";

export type ContentBlock =
  | { type: "paragraph"; text: string; lead?: boolean }
  | { type: "heading"; id: string; level: 2 | 3; eyebrow?: string; text: string }
  | { type: "quote"; text: string; cite?: string }
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
  /** Future-ready publishing contract. Legacy documents may omit this until migrated. */
  editorial?: EditorialPublishingRecord;
  /** Explicit graph links used by internal linking, search, and future AI retrieval. */
  entityRelations?: EditorialEntityReference[];
  seo: ContentSeo;
};

export function getTextBlocks(document: ContentDocument) {
  return document.blocks.flatMap((block) => {
    if (block.type === "paragraph" || block.type === "quote") return [block.text];
    if (block.type === "heading") return [block.text];
    if (block.type === "company-text") return [block.text];
    if (block.type === "company-products" || block.type === "company-list") return block.items;
    return [];
  });
}

export function getTocItems(document: ContentDocument) {
  return document.blocks.flatMap((block) => {
    if (block.type === "heading" && block.level === 2) return [{ id: block.id, label: block.text }];
    if (block.type === "company-text") return [{ id: block.id, label: block.eyebrow }];
    if (block.type === "company-products" || block.type === "company-list") return [{ id: block.id, label: block.title }];
    return [];
  });
}
