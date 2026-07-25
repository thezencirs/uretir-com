import { contentHubs } from "@/lib/content-hubs";
import type { ContentDocument, ContentTrustState } from "@/lib/content-model";
import { getKnowledgeRecommendations, uretirKnowledgeGraph } from "@/lib/knowledge-graph";

export type DiscoveryItem = {
  label: string;
  description?: string;
  href: string;
  kind: string;
  trustState: ContentTrustState | "contextual";
};

function trustStateForPath(path: string): DiscoveryItem["trustState"] {
  const hub = contentHubs.find((item) => path === item.path || path.startsWith(`${item.path}#`));
  if (!hub) return "contextual";
  if (hub.availability === "sample") return "sample";
  if (hub.availability === "future_integration") return "future_integration";
  return "coming_soon";
}

export function getDocumentDiscovery(document: ContentDocument, options: { includeReview?: boolean; limit?: number } = {}) {
  const limit = options.limit ?? 10;
  const entityByPath = new Map(
    [...uretirKnowledgeGraph.entities.values()]
      .filter((entity) => entity.canonicalPath)
      .map((entity) => [entity.canonicalPath as string, entity]),
  );
  const items: DiscoveryItem[] = [
    ...document.internalLinks.flatMap((link): DiscoveryItem[] => {
      const entity = entityByPath.get(link.href.split("#")[0]);
      const isReviewRecord = entity?.status === "in_review" && ["guide", "article", "company"].includes(entity.kind);
      if (!options.includeReview && isReviewRecord) return [];
      return [{ ...link, kind: "İleri okuma", trustState: entity?.status === "verified" || entity?.status === "published" ? "verified" : entity?.status === "in_review" ? "editorial_review" : trustStateForPath(link.href) }];
    }),
    ...(document.entityRelations ?? []).flatMap((entity): DiscoveryItem[] => entity.canonicalPath && entity.canonicalPath !== document.seo.canonicalPath
      ? [{ label: entity.label, href: entity.canonicalPath, kind: entity.kind, trustState: "editorial_review" }]
      : []),
    ...getKnowledgeRecommendations(uretirKnowledgeGraph, document.id, { includeReview: options.includeReview, limit }).flatMap(({ entity, relation }): DiscoveryItem[] => entity.canonicalPath && entity.canonicalPath !== document.seo.canonicalPath
      ? [{ label: entity.label, href: entity.canonicalPath, kind: relation, trustState: entity.status === "published" || entity.status === "verified" ? "verified" : "editorial_review" }]
      : []),
  ];

  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.href.split("#")[0];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

export function mergeDiscoveryItems(...groups: DiscoveryItem[][]) {
  const seen = new Set<string>();
  return groups.flat().filter((item) => {
    const key = item.href.split("#")[0];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
