import {
  entityKinds,
  entityRelationshipKinds,
  type EntityKind,
  type EntityRelationship,
} from "@/lib/entity-types";

export const uretirPillars = [
  "ne_uretir",
  "kim_uretir",
  "nasil_uretir",
  "nerede_uretir",
  "neden_uretir",
] as const;

export type UretirPillar = (typeof uretirPillars)[number];

export const topicClusterKinds = [
  "company",
  "factory",
  "product",
  "technology",
  "manufacturing",
  "investment",
  "export",
  "standard",
  "artificial_intelligence",
  "government_program",
  "industrial_equipment",
  "supply_chain",
] as const;

export type TopicClusterKind = (typeof topicClusterKinds)[number];
export type TopicClusterRole = "hub" | "pillar" | "supporting" | "entity_reference";

export type ContentClusterMembership = {
  clusterId: string;
  kind: TopicClusterKind;
  role: TopicClusterRole;
  primaryEntityId: string;
  supportingEntityIds: string[];
  relatedClusterIds: string[];
};

export type TopicClusterBlueprint = {
  kind: TopicClusterKind;
  label: string;
  primaryPillar: UretirPillar;
  supportingPillars: UretirPillar[];
  allowedHubEntityKinds: EntityKind[];
  requiredEntityKinds: EntityKind[];
  requiredRelationshipKinds: EntityRelationship[];
  minimumMemberCount: number;
};

export type TopicClusterDefinition = {
  id: string;
  kind: TopicClusterKind;
  label: string;
  hubEntityId: string;
  memberEntityIds: string[];
  relatedClusterIds: string[];
  owner: string;
  reviewCadenceDays: number;
  status: "planning" | "in_review" | "active" | "retired";
};

export type TopicClusterIssue = {
  field: string;
  message: string;
  severity: "blocking" | "advisory";
};

type TopicClusterGraphSnapshot = {
  entities: ReadonlyMap<string, { kind: EntityKind }>;
  relations: ReadonlyArray<{
    from: string;
    to: string;
    kind: EntityRelationship;
  }>;
};

export const topicClusterBlueprints: Record<TopicClusterKind, TopicClusterBlueprint> = {
  company: {
    kind: "company",
    label: "Şirket",
    primaryPillar: "kim_uretir",
    supportingPillars: ["ne_uretir", "nerede_uretir", "nasil_uretir"],
    allowedHubEntityKinds: ["company"],
    requiredEntityKinds: ["company", "product", "factory", "industry"],
    requiredRelationshipKinds: ["produces", "operates", "operates_in"],
    minimumMemberCount: 6,
  },
  factory: {
    kind: "factory",
    label: "Fabrika",
    primaryPillar: "nerede_uretir",
    supportingPillars: ["kim_uretir", "ne_uretir", "nasil_uretir"],
    allowedHubEntityKinds: ["factory"],
    requiredEntityKinds: ["factory", "company", "city", "machine", "product"],
    requiredRelationshipKinds: ["operates", "located_in", "uses", "produces"],
    minimumMemberCount: 7,
  },
  product: {
    kind: "product",
    label: "Ürün",
    primaryPillar: "ne_uretir",
    supportingPillars: ["kim_uretir", "nasil_uretir", "neden_uretir"],
    allowedHubEntityKinds: ["product", "category"],
    requiredEntityKinds: ["product", "company", "industry", "raw_material", "technology"],
    requiredRelationshipKinds: ["produces", "belongs_to", "uses", "enables"],
    minimumMemberCount: 7,
  },
  technology: {
    kind: "technology",
    label: "Teknoloji",
    primaryPillar: "nasil_uretir",
    supportingPillars: ["ne_uretir", "kim_uretir", "neden_uretir"],
    allowedHubEntityKinds: ["technology"],
    requiredEntityKinds: ["technology", "industry", "company", "machine", "guide"],
    requiredRelationshipKinds: ["uses", "enables", "explains"],
    minimumMemberCount: 7,
  },
  manufacturing: {
    kind: "manufacturing",
    label: "Üretim yöntemi",
    primaryPillar: "nasil_uretir",
    supportingPillars: ["ne_uretir", "nerede_uretir", "neden_uretir"],
    allowedHubEntityKinds: ["manufacturing_process", "guide", "industry"],
    requiredEntityKinds: ["manufacturing_process", "machine", "raw_material", "technology", "industry"],
    requiredRelationshipKinds: ["uses", "processes", "enables", "explains"],
    minimumMemberCount: 8,
  },
  investment: {
    kind: "investment",
    label: "Yatırım",
    primaryPillar: "neden_uretir",
    supportingPillars: ["kim_uretir", "ne_uretir", "nerede_uretir"],
    allowedHubEntityKinds: ["investment_program", "guide"],
    requiredEntityKinds: ["investment_program", "government_institution", "industry", "company", "guide"],
    requiredRelationshipKinds: ["eligible_for", "supports", "explains"],
    minimumMemberCount: 7,
  },
  export: {
    kind: "export",
    label: "İhracat",
    primaryPillar: "neden_uretir",
    supportingPillars: ["kim_uretir", "ne_uretir", "nerede_uretir"],
    allowedHubEntityKinds: ["guide", "industry", "product"],
    requiredEntityKinds: ["guide", "company", "product", "industry", "government_institution"],
    requiredRelationshipKinds: ["explains", "supports", "operates_in"],
    minimumMemberCount: 7,
  },
  standard: {
    kind: "standard",
    label: "Standart",
    primaryPillar: "nasil_uretir",
    supportingPillars: ["kim_uretir", "neden_uretir"],
    allowedHubEntityKinds: ["standard", "guide"],
    requiredEntityKinds: ["standard", "company", "industry", "government_institution", "guide"],
    requiredRelationshipKinds: ["complies_with", "explains", "governed_by"],
    minimumMemberCount: 6,
  },
  artificial_intelligence: {
    kind: "artificial_intelligence",
    label: "Yapay zekâ",
    primaryPillar: "nasil_uretir",
    supportingPillars: ["ne_uretir", "kim_uretir", "neden_uretir"],
    allowedHubEntityKinds: ["ai_product", "ai_tool", "ai_model"],
    requiredEntityKinds: ["ai_product", "ai_tool", "technology", "industry", "guide"],
    requiredRelationshipKinds: ["developed_by", "enables", "explains", "related_to"],
    minimumMemberCount: 7,
  },
  government_program: {
    kind: "government_program",
    label: "Kamu programı",
    primaryPillar: "neden_uretir",
    supportingPillars: ["kim_uretir", "ne_uretir"],
    allowedHubEntityKinds: ["investment_program", "incentive", "guide"],
    requiredEntityKinds: ["government_institution", "investment_program", "incentive", "industry", "guide"],
    requiredRelationshipKinds: ["supports", "eligible_for", "sourced_from", "explains"],
    minimumMemberCount: 7,
  },
  industrial_equipment: {
    kind: "industrial_equipment",
    label: "Endüstriyel ekipman",
    primaryPillar: "ne_uretir",
    supportingPillars: ["kim_uretir", "nasil_uretir", "neden_uretir"],
    allowedHubEntityKinds: ["machine", "category"],
    requiredEntityKinds: ["machine", "company", "industry", "technology", "guide"],
    requiredRelationshipKinds: ["produces", "uses", "enables", "explains"],
    minimumMemberCount: 7,
  },
  supply_chain: {
    kind: "supply_chain",
    label: "Tedarik zinciri",
    primaryPillar: "nerede_uretir",
    supportingPillars: ["kim_uretir", "ne_uretir", "nasil_uretir"],
    allowedHubEntityKinds: ["supply_chain", "industry", "guide"],
    requiredEntityKinds: ["supply_chain", "company", "factory", "product", "raw_material", "city"],
    requiredRelationshipKinds: ["part_of", "sourced_from", "located_in", "produces"],
    minimumMemberCount: 8,
  },
};

const clusterIdPattern = /^cluster:[a-z0-9][a-z0-9-]{2,79}$/;
const entityIdPattern = /^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:-]{1,119}$/;

export function getClusterMembershipIssues(membership: ContentClusterMembership): TopicClusterIssue[] {
  const issues: TopicClusterIssue[] = [];
  if (!clusterIdPattern.test(membership.clusterId)) issues.push({ field: "clusterId", message: "Cluster ID must be a stable cluster: identifier.", severity: "blocking" });
  if (!entityIdPattern.test(membership.primaryEntityId)) issues.push({ field: "primaryEntityId", message: "A stable primary entity ID is required.", severity: "blocking" });
  if (membership.supportingEntityIds.length < 2) issues.push({ field: "supportingEntityIds", message: "At least two supporting entity IDs are required.", severity: "blocking" });
  const memberIds = [membership.primaryEntityId, ...membership.supportingEntityIds];
  if (new Set(memberIds).size !== memberIds.length) issues.push({ field: "supportingEntityIds", message: "Cluster membership cannot contain duplicate entities.", severity: "blocking" });
  if (membership.relatedClusterIds.some((id) => !clusterIdPattern.test(id))) issues.push({ field: "relatedClusterIds", message: "Related cluster IDs must use stable cluster: identifiers.", severity: "blocking" });
  if (membership.relatedClusterIds.includes(membership.clusterId)) issues.push({ field: "relatedClusterIds", message: "A cluster cannot relate to itself.", severity: "blocking" });
  if (new Set(membership.relatedClusterIds).size !== membership.relatedClusterIds.length) issues.push({ field: "relatedClusterIds", message: "Related cluster IDs must be unique.", severity: "blocking" });
  return issues;
}

export function getTopicClusterDefinitionIssues(
  definition: TopicClusterDefinition,
  graph: TopicClusterGraphSnapshot,
): TopicClusterIssue[] {
  const issues: TopicClusterIssue[] = [];
  const blueprint = topicClusterBlueprints[definition.kind];
  const severity = definition.status === "active" ? "blocking" : "advisory";
  const members = [...new Set(definition.memberEntityIds)];
  const memberSet = new Set(members);

  if (!clusterIdPattern.test(definition.id)) issues.push({ field: "id", message: "Cluster ID must be a stable cluster: identifier.", severity: "blocking" });
  if (!definition.owner.trim()) issues.push({ field: "owner", message: "A named cluster owner is required.", severity });
  if (!Number.isInteger(definition.reviewCadenceDays) || definition.reviewCadenceDays < 1 || definition.reviewCadenceDays > 730) {
    issues.push({ field: "reviewCadenceDays", message: "Review cadence must be between 1 and 730 days.", severity });
  }
  if (!memberSet.has(definition.hubEntityId)) issues.push({ field: "hubEntityId", message: "The hub entity must be included in cluster membership.", severity });
  if (members.length !== definition.memberEntityIds.length) issues.push({ field: "memberEntityIds", message: "Cluster members must be unique.", severity });
  if (members.length < blueprint.minimumMemberCount) issues.push({ field: "memberEntityIds", message: `The ${blueprint.label} blueprint requires at least ${blueprint.minimumMemberCount} connected members.`, severity });

  const entities = members.flatMap((id) => {
    const entity = graph.entities.get(id);
    if (!entity) {
      issues.push({ field: "memberEntityIds", message: `Cluster member does not exist in the graph: ${id}.`, severity });
      return [];
    }
    return [{ id, entity }];
  });
  const hub = graph.entities.get(definition.hubEntityId);
  if (hub && !blueprint.allowedHubEntityKinds.includes(hub.kind)) {
    issues.push({ field: "hubEntityId", message: `Hub entity kind ${hub.kind} is not valid for a ${blueprint.label} cluster.`, severity });
  }

  const coveredKinds = new Set(entities.map(({ entity }) => entity.kind));
  for (const kind of blueprint.requiredEntityKinds) {
    if (!coveredKinds.has(kind)) issues.push({ field: "memberEntityIds", message: `Required entity coverage is missing: ${kind}.`, severity });
  }

  const internalRelations = graph.relations.filter((relation) => memberSet.has(relation.from) && memberSet.has(relation.to));
  const coveredRelationships = new Set(internalRelations.map((relation) => relation.kind));
  for (const kind of blueprint.requiredRelationshipKinds) {
    if (!coveredRelationships.has(kind)) issues.push({ field: "relations", message: `Required relationship coverage is missing: ${kind}.`, severity });
  }

  const connectedIds = new Set(internalRelations.flatMap((relation) => [relation.from, relation.to]));
  for (const id of members) {
    if (!connectedIds.has(id)) issues.push({ field: "memberEntityIds", message: `Cluster member is isolated inside the cluster: ${id}.`, severity });
  }

  return issues;
}

export function validateTopicClusterBlueprints() {
  const issues: string[] = [];
  const entityKindSet = new Set<string>(entityKinds);
  const relationshipKindSet = new Set<string>(entityRelationshipKinds);
  for (const kind of topicClusterKinds) {
    const blueprint = topicClusterBlueprints[kind];
    if (blueprint.kind !== kind) issues.push(`Blueprint key mismatch: ${kind}.`);
    if (!blueprint.allowedHubEntityKinds.every((entityKind) => entityKindSet.has(entityKind))) issues.push(`Unknown hub entity kind in ${kind}.`);
    if (!blueprint.requiredEntityKinds.every((entityKind) => entityKindSet.has(entityKind))) issues.push(`Unknown required entity kind in ${kind}.`);
    if (!blueprint.requiredRelationshipKinds.every((relationshipKind) => relationshipKindSet.has(relationshipKind))) issues.push(`Unknown relationship kind in ${kind}.`);
    if (new Set([blueprint.primaryPillar, ...blueprint.supportingPillars]).size !== blueprint.supportingPillars.length + 1) issues.push(`Duplicate pillar mapping in ${kind}.`);
  }
  return issues;
}
