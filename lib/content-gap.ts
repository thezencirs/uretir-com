import { getContentAuthorityReport } from "@/lib/content-authority";
import type { ContentDocument } from "@/lib/content-model";
import { contentTemplateRegistry, referenceContentFamilies, type ReferenceContentFamily } from "@/lib/content-templates";
import type { EntityKind, EntityRelationship } from "@/lib/entity-types";
import type { KnowledgeEntity, KnowledgeGraph } from "@/lib/knowledge-graph";
import { topicClusterBlueprints, topicClusterKinds, type TopicClusterKind } from "@/lib/topic-clusters";

export type ContentGapEvidence = {
  kind: "missing_entity_kind" | "missing_relationship_kind" | "missing_document" | "authority_blocker" | "missing_canonical";
  value: string;
};

export type ContentGapOpportunity = {
  id: string;
  clusterKind: TopicClusterKind;
  hubEntityId: string;
  hubLabel: string;
  suggestedFamily: ReferenceContentFamily;
  title: string;
  priorityScore: number;
  demandStatus: "not_validated";
  evidence: ContentGapEvidence[];
  rationale: string;
  nextAction: string;
};

export type MissingEntityRequirement = {
  id: string;
  clusterKind: TopicClusterKind;
  hubEntityId: string;
  hubLabel: string;
  requiredKind: EntityKind;
  priorityScore: number;
  status: "coverage_requirement";
  rationale: string;
};

export type ContentGapReport = {
  snapshotAt: string;
  methodology: "repository_coverage_only";
  graph: {
    entities: number;
    relationships: number;
  };
  documents: {
    reviewed: number;
    authorityReady: number;
  };
  opportunityCount: number;
  missingEntityRequirementCount: number;
  clusterOpportunityCounts: Record<TopicClusterKind, number>;
  topOpportunities: ContentGapOpportunity[];
  topMissingEntities: MissingEntityRequirement[];
  highestPriorityAuthorityCluster?: ContentGapOpportunity;
};

function directNeighborhood(graph: KnowledgeGraph, entityId: string) {
  const relations = [...(graph.outgoing.get(entityId) ?? []), ...(graph.incoming.get(entityId) ?? [])];
  const entityIds = new Set([entityId]);
  for (const relation of relations) {
    entityIds.add(relation.from);
    entityIds.add(relation.to);
  }
  const entities = [...entityIds].flatMap((id) => {
    const entity = graph.entities.get(id);
    return entity ? [entity] : [];
  });
  return { relations, entities };
}

function documentsForEntity(documents: ContentDocument[], entityId: string) {
  return documents.filter((document) =>
    document.id === entityId ||
    document.topicCluster?.primaryEntityId === entityId,
  );
}

const guideCategoryClusters: Partial<Record<string, TopicClusterKind>> = {
  "uretir-ai": "artificial_intelligence",
  "puan-ai": "artificial_intelligence",
  "tesvik-ai": "government_program",
  "fiyat-ai": "supply_chain",
  "ihracat-ai": "export",
};

function eligibleClusterKinds(entity: KnowledgeEntity, documents: ContentDocument[]) {
  const owningDocuments = documentsForEntity(documents, entity.id);
  const explicitKinds = new Set(owningDocuments.flatMap((document) => document.topicCluster ? [document.topicCluster.kind] : []));
  if (explicitKinds.size) return explicitKinds;

  if (entity.kind === "guide") {
    for (const document of owningDocuments) {
      const inferred = document.category ? guideCategoryClusters[document.category] : undefined;
      if (inferred) explicitKinds.add(inferred);
    }
    return explicitKinds;
  }

  // Category and industry records can anchor several unrelated cluster types.
  // Without explicit editorial ownership, assigning one would be a fabricated classification.
  if (entity.kind === "category" || entity.kind === "industry") return explicitKinds;

  const structurallyEligible = topicClusterKinds.filter((kind) => topicClusterBlueprints[kind].allowedHubEntityKinds.includes(entity.kind));
  if (structurallyEligible.length === 1) explicitKinds.add(structurallyEligible[0]);
  if (entity.kind === "product") explicitKinds.add("product");
  return explicitKinds;
}

function familyForEntity(entity: KnowledgeEntity, clusterKind: TopicClusterKind): ReferenceContentFamily {
  return referenceContentFamilies.find((family) => {
    const template = contentTemplateRegistry[family];
    return template.primaryEntityKinds.includes(entity.kind) && template.clusterKinds.includes(clusterKind);
  }) ?? referenceContentFamilies.find((family) => contentTemplateRegistry[family].primaryEntityKinds.includes(entity.kind)) ?? "article";
}

function stableGapId(...parts: string[]) {
  return `gap:${parts.join(":").replace(/[^a-z0-9:_-]+/gi, "-").toLowerCase()}`;
}

function opportunityScore(input: {
  entity: KnowledgeEntity;
  relationCount: number;
  missingEntityKinds: EntityKind[];
  missingRelationships: EntityRelationship[];
  matchingDocuments: ContentDocument[];
  authorityBlockers: number;
}) {
  return Math.min(100,
    20 +
    Math.min(20, input.relationCount * 2) +
    Math.min(24, input.missingEntityKinds.length * 6) +
    Math.min(18, input.missingRelationships.length * 4) +
    (input.matchingDocuments.length === 0 ? 10 : 0) +
    Math.min(5, input.authorityBlockers) +
    (input.entity.canonicalPath ? 3 : 0),
  );
}

export function findContentGapOpportunities(graph: KnowledgeGraph, documents: ContentDocument[]) {
  const opportunities: ContentGapOpportunity[] = [];
  const missingEntities: MissingEntityRequirement[] = [];

  for (const clusterKind of topicClusterKinds) {
    const blueprint = topicClusterBlueprints[clusterKind];
    const hubCandidates = [...graph.entities.values()].filter((entity) =>
      blueprint.allowedHubEntityKinds.includes(entity.kind) &&
      eligibleClusterKinds(entity, documents).has(clusterKind),
    );

    for (const entity of hubCandidates) {
      const neighborhood = directNeighborhood(graph, entity.id);
      const coveredEntityKinds = new Set(neighborhood.entities.map((member) => member.kind));
      const coveredRelationships = new Set(neighborhood.relations.map((relation) => relation.kind));
      const missingEntityKinds = blueprint.requiredEntityKinds.filter((kind) => !coveredEntityKinds.has(kind));
      const missingRelationships = blueprint.requiredRelationshipKinds.filter((kind) => !coveredRelationships.has(kind));
      const matchingDocuments = documentsForEntity(documents, entity.id);
      const authorityBlockers = matchingDocuments.reduce((count, document) => count + getContentAuthorityReport(document).blocking.length, 0);
      const evidence: ContentGapEvidence[] = [
        ...missingEntityKinds.map((kind): ContentGapEvidence => ({ kind: "missing_entity_kind", value: kind })),
        ...missingRelationships.map((kind): ContentGapEvidence => ({ kind: "missing_relationship_kind", value: kind })),
        ...(matchingDocuments.length === 0 ? [{ kind: "missing_document", value: "No ContentDocument currently owns this entity intent." } satisfies ContentGapEvidence] : []),
        ...(authorityBlockers > 0 ? [{ kind: "authority_blocker", value: `${authorityBlockers} publication blockers remain across matching documents.` } satisfies ContentGapEvidence] : []),
        ...(!entity.canonicalPath ? [{ kind: "missing_canonical", value: "The entity has no approved canonical public path." } satisfies ContentGapEvidence] : []),
      ];

      if (!evidence.length) continue;
      const priorityScore = opportunityScore({
        entity,
        relationCount: neighborhood.relations.length,
        missingEntityKinds,
        missingRelationships,
        matchingDocuments,
        authorityBlockers,
      });
      const missingSummary = [
        missingEntityKinds.length ? `${missingEntityKinds.length} varlık türü` : "",
        missingRelationships.length ? `${missingRelationships.length} ilişki türü` : "",
        matchingDocuments.length === 0 ? "canonical içerik kaydı" : "",
      ].filter(Boolean).join(", ");

      opportunities.push({
        id: stableGapId(clusterKind, entity.id),
        clusterKind,
        hubEntityId: entity.id,
        hubLabel: entity.label,
        suggestedFamily: familyForEntity(entity, clusterKind),
        title: `${entity.label}: ${blueprint.label} kümesi kapsam tamamlama`,
        priorityScore,
        demandStatus: "not_validated",
        evidence,
        rationale: `Repository grafiğinde bu küme için ${missingSummary || "yayın otoritesi"} eksik. Bu bir gerçek dünya iddiası veya trafik tahmini değil, mevcut kayıtların kapsam analizidir.`,
        nextAction: "Arama talebini doğrulayın, resmî/primary kaynak planını oluşturun ve eksik varlıkları yalnızca kanıtlandıktan sonra kaydedin.",
      });

      for (const requiredKind of missingEntityKinds) {
        missingEntities.push({
          id: stableGapId("entity", clusterKind, entity.id, requiredKind),
          clusterKind,
          hubEntityId: entity.id,
          hubLabel: entity.label,
          requiredKind,
          priorityScore,
          status: "coverage_requirement",
          rationale: `${entity.label} çevresindeki repository grafiğinde ${blueprint.label} blueprint'inin gerektirdiği ${requiredKind} türü henüz kayıtlı değil. Bu kayıt, böyle bir gerçek dünya varlığının bulunmadığını söylemez.`,
        });
      }
    }
  }

  const opportunitySort = (left: ContentGapOpportunity, right: ContentGapOpportunity) =>
    right.priorityScore - left.priorityScore ||
    left.clusterKind.localeCompare(right.clusterKind) ||
    left.hubLabel.localeCompare(right.hubLabel, "tr");
  const missingEntitySort = (left: MissingEntityRequirement, right: MissingEntityRequirement) =>
    right.priorityScore - left.priorityScore ||
    left.clusterKind.localeCompare(right.clusterKind) ||
    left.hubLabel.localeCompare(right.hubLabel, "tr") ||
    left.requiredKind.localeCompare(right.requiredKind);

  return {
    opportunities: opportunities.sort(opportunitySort),
    missingEntities: missingEntities.sort(missingEntitySort),
  };
}

export function createContentGapReport(
  graph: KnowledgeGraph,
  documents: ContentDocument[],
  options: { snapshotAt: string; limit?: number },
): ContentGapReport {
  const limit = options.limit ?? 100;
  const { opportunities, missingEntities } = findContentGapOpportunities(graph, documents);
  const clusterOpportunityCounts = Object.fromEntries(
    topicClusterKinds.map((kind) => [kind, opportunities.filter((opportunity) => opportunity.clusterKind === kind).length]),
  ) as Record<TopicClusterKind, number>;

  return {
    snapshotAt: options.snapshotAt,
    methodology: "repository_coverage_only",
    graph: { entities: graph.entities.size, relationships: graph.relations.length },
    documents: {
      reviewed: documents.length,
      authorityReady: documents.filter((document) => getContentAuthorityReport(document).ready).length,
    },
    opportunityCount: opportunities.length,
    missingEntityRequirementCount: missingEntities.length,
    clusterOpportunityCounts,
    topOpportunities: opportunities.slice(0, limit),
    topMissingEntities: missingEntities.slice(0, limit),
    highestPriorityAuthorityCluster: opportunities[0],
  };
}
