import { contentHubs, hubGuides } from "@/lib/content-hubs";
import { companies } from "@/lib/companies";
import { entityKinds, entityRelationshipKinds, type EntityKind, type EntityRelationship } from "@/lib/entity-types";
import { posts } from "@/lib/posts";

export const knowledgeEntityKinds = entityKinds;
export type KnowledgeEntityKind = EntityKind;
export type KnowledgeEntityStatus = "in_review" | "verified" | "published" | "archived";

export type KnowledgeEntity = {
  id: string;
  kind: KnowledgeEntityKind;
  label: string;
  canonicalPath?: string;
  externalUrl?: string;
  aliases: string[];
  status: KnowledgeEntityStatus;
  sourceIds: string[];
  updatedAt: string;
};

export const knowledgeRelationKinds = entityRelationshipKinds;
export type KnowledgeRelationKind = EntityRelationship;

export type KnowledgeRelation = {
  from: string;
  to: string;
  kind: KnowledgeRelationKind;
  evidenceSourceIds: string[];
  status: "in_review" | "verified";
  updatedAt: string;
};

export type KnowledgeGraph = {
  entities: Map<string, KnowledgeEntity>;
  relations: KnowledgeRelation[];
  outgoing: Map<string, KnowledgeRelation[]>;
  incoming: Map<string, KnowledgeRelation[]>;
};

export type KnowledgeGraphCoverage = {
  entityCount: number;
  relationCount: number;
  orphanEntityIds: string[];
  connectedEntityRatio: number;
  entityKindCoverage: Map<KnowledgeEntityKind, number>;
  relationshipKindCoverage: Map<KnowledgeRelationKind, number>;
};

function normalizedId(value: string) {
  return value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function institutionId(publisher: string) {
  return `institution:${normalizedId(publisher)}`;
}

function addRelation(map: Map<string, KnowledgeRelation[]>, key: string, relation: KnowledgeRelation) {
  map.set(key, [...(map.get(key) ?? []), relation]);
}

export function mergeKnowledgeRelations(relations: KnowledgeRelation[]) {
  const merged = new Map<string, KnowledgeRelation>();
  for (const relation of relations) {
    const key = `${relation.from}|${relation.kind}|${relation.to}`;
    const current = merged.get(key);
    if (!current) {
      merged.set(key, { ...relation, evidenceSourceIds: [...new Set(relation.evidenceSourceIds)] });
      continue;
    }
    merged.set(key, {
      ...current,
      evidenceSourceIds: [...new Set([...current.evidenceSourceIds, ...relation.evidenceSourceIds])],
      status: current.status === "verified" && relation.status === "verified" ? "verified" : "in_review",
      updatedAt: current.updatedAt > relation.updatedAt ? current.updatedAt : relation.updatedAt,
    });
  }
  return [...merged.values()];
}

export function buildKnowledgeGraph(entities: KnowledgeEntity[], relations: KnowledgeRelation[]): KnowledgeGraph {
  const entityMap = new Map(entities.map((entity) => [entity.id, entity]));
  const outgoing = new Map<string, KnowledgeRelation[]>();
  const incoming = new Map<string, KnowledgeRelation[]>();
  for (const relation of relations) {
    addRelation(outgoing, relation.from, relation);
    addRelation(incoming, relation.to, relation);
  }
  return { entities: entityMap, relations, outgoing, incoming };
}

export function createUretirKnowledgeGraph() {
  const updatedAt = "2026-07-25";
  const entities: KnowledgeEntity[] = [];
  const relations: KnowledgeRelation[] = [];
  const entityIds = new Set<string>();
  const sourcePublishers = new Map<string, { publisher: string; href: string; sourceIds: Set<string> }>();
  const addEntity = (entity: KnowledgeEntity) => {
    if (entityIds.has(entity.id)) return;
    entityIds.add(entity.id);
    entities.push(entity);
  };

  for (const hub of contentHubs) {
    addEntity({
      id: `ai-product:${hub.id}`,
      kind: "ai_product",
      label: hub.name,
      canonicalPath: hub.path,
      aliases: [],
      status: hub.id === "puan-ai" ? "published" : "in_review",
      sourceIds: [],
      updatedAt,
    });
  }

  for (const guide of hubGuides) {
    const guideId = `guide:${guide.slug}`;
    addEntity({
      id: guideId,
      kind: "guide",
      label: guide.title,
      canonicalPath: `/rehber/${guide.slug}`,
      aliases: [guide.question],
      status: guide.status,
      sourceIds: guide.sources.map((source) => source.id),
      updatedAt: guide.updatedAt,
    });
    relations.push({
      from: guideId,
      to: `ai-product:${guide.hubId}`,
      kind: "belongs_to",
      evidenceSourceIds: [],
      status: "verified",
      updatedAt: guide.updatedAt,
    });
    for (const relatedSlug of guide.relatedGuideSlugs) {
      relations.push({
        from: guideId,
        to: `guide:${relatedSlug}`,
        kind: "related_to",
        evidenceSourceIds: [],
        status: "in_review",
        updatedAt: guide.updatedAt,
      });
    }
    for (const source of guide.sources) {
      const id = institutionId(source.publisher);
      const publisher = sourcePublishers.get(id) ?? { publisher: source.publisher, href: source.href, sourceIds: new Set<string>() };
      publisher.sourceIds.add(source.id);
      sourcePublishers.set(id, publisher);
      relations.push({
        from: guideId,
        to: id,
        kind: "sourced_from",
        evidenceSourceIds: [source.id],
        status: "in_review",
        updatedAt: guide.updatedAt,
      });
    }
    for (const entity of guide.entityRelations ?? []) {
      relations.push({
        from: guideId,
        to: entity.entityId,
        kind: entity.relationship,
        evidenceSourceIds: guide.sources.map((source) => source.id),
        status: "in_review",
        updatedAt: guide.updatedAt,
      });
    }
  }

  for (const [id, publisher] of sourcePublishers) {
    addEntity({
      id,
      kind: "government_institution",
      label: publisher.publisher,
      externalUrl: publisher.href,
      aliases: [],
      status: "verified",
      sourceIds: [...publisher.sourceIds],
      updatedAt,
    });
  }

  for (const post of posts) {
    const articleId = `article:${post.slug}`;
    const categoryId = `category:${normalizedId(post.category)}`;
    addEntity({ id: articleId, kind: "article", label: post.title, canonicalPath: `/blog/${post.slug}`, aliases: [], status: "in_review", sourceIds: [], updatedAt: post.updatedAt ?? post.publishedAt });
    addEntity({ id: categoryId, kind: "category", label: post.category, canonicalPath: `/kategori/${normalizedId(post.category)}`, aliases: [], status: "in_review", sourceIds: [], updatedAt: post.updatedAt ?? post.publishedAt });
    relations.push({ from: articleId, to: categoryId, kind: "belongs_to", evidenceSourceIds: [], status: "in_review", updatedAt: post.updatedAt ?? post.publishedAt });
    relations.push({ from: articleId, to: "ai-product:uretir-ai", kind: "related_to", evidenceSourceIds: [], status: "in_review", updatedAt: post.updatedAt ?? post.publishedAt });
    relations.push({ from: articleId, to: "guide:uretim-sorusu-nasil-arastirilir", kind: "related_to", evidenceSourceIds: [], status: "in_review", updatedAt: post.updatedAt ?? post.publishedAt });
  }

  for (const company of companies) {
    const companyId = `company:${company.slug}`;
    const industryId = `industry:${normalizedId(company.sector)}`;
    addEntity({ id: companyId, kind: "company", label: company.name, canonicalPath: `/ne-uretir/${company.slug}`, externalUrl: company.website, aliases: [], status: "in_review", sourceIds: [], updatedAt });
    addEntity({ id: industryId, kind: "industry", label: company.sector, aliases: [], status: "in_review", sourceIds: [], updatedAt });
    relations.push({ from: companyId, to: industryId, kind: "operates_in", evidenceSourceIds: [], status: "in_review", updatedAt });
    relations.push({ from: companyId, to: "ai-product:uretir-ai", kind: "related_to", evidenceSourceIds: [], status: "in_review", updatedAt });
    relations.push({ from: companyId, to: "guide:uretim-sorusu-nasil-arastirilir", kind: "related_to", evidenceSourceIds: [], status: "in_review", updatedAt });

    for (const product of [...company.mainProducts, ...company.subProducts]) {
      const productId = `product:${normalizedId(product)}`;
      addEntity({ id: productId, kind: "product", label: product, aliases: [], status: "in_review", sourceIds: [], updatedAt });
      relations.push({ from: companyId, to: productId, kind: "produces", evidenceSourceIds: [], status: "in_review", updatedAt });
    }
    for (const facility of company.facilities) {
      const factoryId = `factory:${company.slug}:${normalizedId(facility)}`;
      addEntity({ id: factoryId, kind: "factory", label: facility, aliases: [], status: "in_review", sourceIds: [], updatedAt });
      relations.push({ from: companyId, to: factoryId, kind: "operates", evidenceSourceIds: [], status: "in_review", updatedAt });
    }
    for (const brand of company.brands) {
      const brandId = `brand:${normalizedId(brand)}`;
      addEntity({ id: brandId, kind: "brand", label: brand, aliases: [], status: "in_review", sourceIds: [], updatedAt });
      relations.push({ from: brandId, to: companyId, kind: "belongs_to", evidenceSourceIds: [], status: "in_review", updatedAt });
    }
    for (const certification of company.certifications) {
      const standardId = `standard:${normalizedId(certification)}`;
      addEntity({ id: standardId, kind: "standard", label: certification, aliases: [], status: "in_review", sourceIds: [], updatedAt });
      relations.push({ from: companyId, to: standardId, kind: "complies_with", evidenceSourceIds: [], status: "in_review", updatedAt });
    }
  }

  return buildKnowledgeGraph(entities, mergeKnowledgeRelations(relations));
}

export function getKnowledgeRecommendations(graph: KnowledgeGraph, entityId: string, options: { limit?: number; includeReview?: boolean } = {}) {
  const limit = options.limit ?? 8;
  const relations = [...(graph.outgoing.get(entityId) ?? []), ...(graph.incoming.get(entityId) ?? [])];
  const scored = new Map<string, { entity: KnowledgeEntity; score: number; relation: KnowledgeRelationKind }>();
  for (const relation of relations) {
    const relatedId = relation.from === entityId ? relation.to : relation.from;
    const entity = graph.entities.get(relatedId);
    if (!entity || (!options.includeReview && entity.status === "in_review")) continue;
    const score = relation.status === "verified" ? 3 : 1;
    const current = scored.get(relatedId);
    if (!current || score > current.score) scored.set(relatedId, { entity, score, relation: relation.kind });
  }
  return [...scored.values()].sort((a, b) => b.score - a.score || a.entity.label.localeCompare(b.entity.label, "tr")).slice(0, limit);
}

export function getKnowledgeGraphCoverage(graph: KnowledgeGraph): KnowledgeGraphCoverage {
  const orphanEntityIds = [...graph.entities.keys()].filter((entityId) => {
    return (graph.outgoing.get(entityId)?.length ?? 0) === 0 && (graph.incoming.get(entityId)?.length ?? 0) === 0;
  });
  const entityKindCoverage = new Map<KnowledgeEntityKind, number>();
  const relationshipKindCoverage = new Map<KnowledgeRelationKind, number>();
  for (const entity of graph.entities.values()) entityKindCoverage.set(entity.kind, (entityKindCoverage.get(entity.kind) ?? 0) + 1);
  for (const relation of graph.relations) relationshipKindCoverage.set(relation.kind, (relationshipKindCoverage.get(relation.kind) ?? 0) + 1);
  const connectedEntityCount = graph.entities.size - orphanEntityIds.length;
  return {
    entityCount: graph.entities.size,
    relationCount: graph.relations.length,
    orphanEntityIds,
    connectedEntityRatio: graph.entities.size ? connectedEntityCount / graph.entities.size : 1,
    entityKindCoverage,
    relationshipKindCoverage,
  };
}

export function validateKnowledgeGraph(graph: KnowledgeGraph) {
  const issues: Array<{ entityId?: string; relation?: KnowledgeRelation; message: string }> = [];
  const canonicalPaths = new Map<string, string>();
  for (const entity of graph.entities.values()) {
    if (!/^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:-]*$/.test(entity.id)) issues.push({ entityId: entity.id, message: "Entity ID must use a stable namespaced identifier." });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entity.updatedAt)) issues.push({ entityId: entity.id, message: "Entity updatedAt must use YYYY-MM-DD." });
    if (new Set(entity.aliases).size !== entity.aliases.length) issues.push({ entityId: entity.id, message: "Entity aliases must be unique." });
    if (entity.canonicalPath) {
      if (!entity.canonicalPath.startsWith("/") || entity.canonicalPath.includes("?") || entity.canonicalPath.includes("#")) {
        issues.push({ entityId: entity.id, message: "Canonical paths must be clean root-relative URLs without query strings or fragments." });
      }
      const existing = canonicalPaths.get(entity.canonicalPath);
      if (existing) issues.push({ entityId: entity.id, message: `Canonical path is already used by ${existing}.` });
      canonicalPaths.set(entity.canonicalPath, entity.id);
    }
    if ((entity.status === "verified" || entity.status === "published") && entity.kind !== "ai_product" && entity.sourceIds.length === 0) {
      issues.push({ entityId: entity.id, message: "Verified or published entities require at least one source." });
    }
  }
  const relationKeys = new Set<string>();
  for (const relation of graph.relations) {
    if (relation.from === relation.to) issues.push({ relation, message: "Self-referential relationships are not allowed." });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(relation.updatedAt)) issues.push({ relation, message: "Relationship updatedAt must use YYYY-MM-DD." });
    if (new Set(relation.evidenceSourceIds).size !== relation.evidenceSourceIds.length) issues.push({ relation, message: "Relationship evidence IDs must be unique." });
    if (!graph.entities.has(relation.from)) issues.push({ relation, message: "Relation source does not exist." });
    if (!graph.entities.has(relation.to)) issues.push({ relation, message: "Relation target does not exist." });
    if (relation.status === "verified" && relation.kind !== "belongs_to" && relation.evidenceSourceIds.length === 0) issues.push({ relation, message: "Verified relation requires evidence." });
    const relationKey = `${relation.from}|${relation.kind}|${relation.to}`;
    if (relationKeys.has(relationKey)) issues.push({ relation, message: "Duplicate relationship." });
    relationKeys.add(relationKey);
  }

  const coverage = getKnowledgeGraphCoverage(graph);
  for (const entityId of coverage.orphanEntityIds) issues.push({ entityId, message: "Entity is isolated from the knowledge graph." });

  const endpointRules: Partial<Record<KnowledgeRelationKind, { from: KnowledgeEntityKind[]; to: KnowledgeEntityKind[] }>> = {
    produces: { from: ["company", "factory"], to: ["product"] },
    operates: { from: ["company"], to: ["factory"] },
    operates_in: { from: ["company"], to: ["industry"] },
    complies_with: { from: ["company", "factory", "product"], to: ["standard"] },
    sourced_from: { from: ["article", "guide"], to: ["government_institution"] },
  };
  for (const relation of graph.relations) {
    const rule = endpointRules[relation.kind];
    const from = graph.entities.get(relation.from);
    const to = graph.entities.get(relation.to);
    if (!rule || !from || !to) continue;
    if (!rule.from.includes(from.kind) || !rule.to.includes(to.kind)) {
      issues.push({ relation, message: `Relationship ${relation.kind} does not allow ${from.kind} -> ${to.kind}.` });
    }
  }
  return issues;
}

export const uretirKnowledgeGraph = createUretirKnowledgeGraph();
