/**
 * Canonical vocabulary shared by editorial records, the knowledge graph,
 * internal-link recommendations, structured data, and future retrieval.
 * Product code must extend this registry instead of creating local variants.
 */
export const entityKinds = [
  "company",
  "factory",
  "brand",
  "product",
  "category",
  "industry",
  "machine",
  "manufacturing_process",
  "raw_material",
  "supply_chain",
  "technology",
  "ai_model",
  "ai_tool",
  "ai_product",
  "person",
  "university",
  "government_institution",
  "standard",
  "industrial_zone",
  "city",
  "investment_program",
  "incentive",
  "article",
  "guide",
] as const;

export type EntityKind = typeof entityKinds[number];

export const entityRelationshipKinds = [
  "primary_subject",
  "belongs_to",
  "related_to",
  "explains",
  "profiles",
  "compares",
  "produces",
  "uses",
  "located_in",
  "operates_in",
  "operates",
  "enables",
  "founded_by",
  "works_at",
  "developed_by",
  "complies_with",
  "eligible_for",
  "supports",
  "sourced_from",
  "processes",
  "governed_by",
  "part_of",
  "answers",
] as const;

export type EntityRelationship = typeof entityRelationshipKinds[number];
