import type { ContentBlock, ContentKind } from "@/lib/content-model";
import type { EntityKind } from "@/lib/entity-types";
import type { SearchIntentKind } from "@/lib/search-intent";
import type { TopicClusterKind } from "@/lib/topic-clusters";

export const referenceContentFamilies = [
  "article",
  "guide",
  "company_profile",
  "technology_profile",
  "machine_profile",
  "raw_material_profile",
  "factory_profile",
  "industry_profile",
  "government_program",
  "investment_guide",
  "export_guide",
  "ai_guide",
] as const;

export type ReferenceContentFamily = (typeof referenceContentFamilies)[number];
export type ContentBlockType = ContentBlock["type"];

export type ContentTemplateDefinition = {
  family: ReferenceContentFamily;
  label: string;
  documentKind: ContentKind;
  primaryEntityKinds: EntityKind[];
  clusterKinds: TopicClusterKind[];
  allowedIntents: SearchIntentKind[];
  requiredBlocks: ContentBlockType[];
  requiredEntityKinds: EntityKind[];
  defaultReviewCadenceDays: number;
};

const referenceBlocks: ContentBlockType[] = [
  "summary",
  "paragraph",
  "heading",
  "example",
  "pros-cons",
  "key-takeaways",
  "faq",
  "sources",
  "internal-links",
];

const profileBlocks: ContentBlockType[] = [
  "summary",
  "paragraph",
  "heading",
  "key-takeaways",
  "faq",
  "sources",
  "internal-links",
];

export const contentTemplateRegistry: Record<ReferenceContentFamily, ContentTemplateDefinition> = {
  article: {
    family: "article",
    label: "Makale",
    documentKind: "article",
    primaryEntityKinds: ["article"],
    clusterKinds: ["manufacturing", "product", "technology", "standard", "supply_chain"],
    allowedIntents: ["ne", "neden", "nasıl yapılır", "karşılaştırma", "örnekler", "en iyi uygulamalar"],
    requiredBlocks: referenceBlocks,
    requiredEntityKinds: ["article"],
    defaultReviewCadenceDays: 365,
  },
  guide: {
    family: "guide",
    label: "Rehber",
    documentKind: "guide",
    primaryEntityKinds: ["guide"],
    clusterKinds: ["manufacturing", "technology", "standard", "supply_chain"],
    allowedIntents: ["nasıl yapılır", "rehber", "gereksinimler", "hazırlık", "doğrulama"],
    requiredBlocks: referenceBlocks,
    requiredEntityKinds: ["guide"],
    defaultReviewCadenceDays: 180,
  },
  company_profile: {
    family: "company_profile",
    label: "Şirket profili",
    documentKind: "ne-uretir",
    primaryEntityKinds: ["company"],
    clusterKinds: ["company"],
    allowedIntents: ["ne", "kim", "nerede", "şirket profili", "şirket rehberi"],
    requiredBlocks: ["summary", "paragraph", "company-text", "company-products", "company-list", "faq", "sources", "internal-links"],
    requiredEntityKinds: ["company", "product", "factory", "industry"],
    defaultReviewCadenceDays: 180,
  },
  technology_profile: {
    family: "technology_profile",
    label: "Teknoloji profili",
    documentKind: "article",
    primaryEntityKinds: ["technology"],
    clusterKinds: ["technology"],
    allowedIntents: ["ne", "neden", "nasıl yapılır", "teknoloji rehberi", "avantajlar", "dezavantajlar"],
    requiredBlocks: profileBlocks,
    requiredEntityKinds: ["technology", "industry", "company", "machine"],
    defaultReviewCadenceDays: 180,
  },
  machine_profile: {
    family: "machine_profile",
    label: "Makine profili",
    documentKind: "article",
    primaryEntityKinds: ["machine"],
    clusterKinds: ["industrial_equipment"],
    allowedIntents: ["ne", "nasıl yapılır", "maliyet", "gereksinimler", "karşılaştırma"],
    requiredBlocks: profileBlocks,
    requiredEntityKinds: ["machine", "company", "industry", "technology"],
    defaultReviewCadenceDays: 180,
  },
  raw_material_profile: {
    family: "raw_material_profile",
    label: "Hammadde profili",
    documentKind: "article",
    primaryEntityKinds: ["raw_material"],
    clusterKinds: ["product", "manufacturing", "supply_chain"],
    allowedIntents: ["ne", "nerede", "maliyet", "karşılaştırma", "avantajlar", "dezavantajlar"],
    requiredBlocks: profileBlocks,
    requiredEntityKinds: ["raw_material", "product", "industry", "technology"],
    defaultReviewCadenceDays: 90,
  },
  factory_profile: {
    family: "factory_profile",
    label: "Fabrika profili",
    documentKind: "article",
    primaryEntityKinds: ["factory"],
    clusterKinds: ["factory"],
    allowedIntents: ["ne", "kim", "nerede", "nasıl yapılır", "şirket rehberi"],
    requiredBlocks: profileBlocks,
    requiredEntityKinds: ["factory", "company", "city", "machine", "product"],
    defaultReviewCadenceDays: 180,
  },
  industry_profile: {
    family: "industry_profile",
    label: "Sektör profili",
    documentKind: "article",
    primaryEntityKinds: ["industry"],
    clusterKinds: ["manufacturing", "investment", "export", "supply_chain"],
    allowedIntents: ["ne", "kim", "nerede", "sektör rehberi", "maliyet", "örnekler"],
    requiredBlocks: profileBlocks,
    requiredEntityKinds: ["industry", "company", "product", "technology"],
    defaultReviewCadenceDays: 180,
  },
  government_program: {
    family: "government_program",
    label: "Kamu programı",
    documentKind: "guide",
    primaryEntityKinds: ["investment_program", "incentive"],
    clusterKinds: ["government_program"],
    allowedIntents: ["ne", "uygunluk", "gereksinimler", "nasıl yapılır", "doğrulama"],
    requiredBlocks: referenceBlocks,
    requiredEntityKinds: ["government_institution", "investment_program", "incentive", "industry"],
    defaultReviewCadenceDays: 30,
  },
  investment_guide: {
    family: "investment_guide",
    label: "Yatırım rehberi",
    documentKind: "guide",
    primaryEntityKinds: ["guide", "investment_program"],
    clusterKinds: ["investment"],
    allowedIntents: ["yatırım rehberi", "maliyet", "gereksinimler", "uygunluk", "hazırlık"],
    requiredBlocks: referenceBlocks,
    requiredEntityKinds: ["investment_program", "government_institution", "industry", "company"],
    defaultReviewCadenceDays: 90,
  },
  export_guide: {
    family: "export_guide",
    label: "İhracat rehberi",
    documentKind: "guide",
    primaryEntityKinds: ["guide"],
    clusterKinds: ["export"],
    allowedIntents: ["ihracat rehberi", "gereksinimler", "nasıl yapılır", "maliyet", "hazırlık"],
    requiredBlocks: referenceBlocks,
    requiredEntityKinds: ["guide", "company", "product", "industry", "government_institution"],
    defaultReviewCadenceDays: 90,
  },
  ai_guide: {
    family: "ai_guide",
    label: "AI rehberi",
    documentKind: "guide",
    primaryEntityKinds: ["guide", "ai_product", "ai_tool"],
    clusterKinds: ["artificial_intelligence"],
    allowedIntents: ["AI rehberi", "ne", "nasıl yapılır", "karşılaştırma", "örnekler", "riskler"],
    requiredBlocks: referenceBlocks,
    requiredEntityKinds: ["ai_product", "ai_tool", "technology", "industry"],
    defaultReviewCadenceDays: 90,
  },
};

export function validateContentTemplateRegistry() {
  const issues: string[] = [];
  for (const family of referenceContentFamilies) {
    const template = contentTemplateRegistry[family];
    if (template.family !== family) issues.push(`Template key mismatch: ${family}.`);
    if (!template.primaryEntityKinds.length) issues.push(`Primary entity coverage is missing: ${family}.`);
    if (!template.clusterKinds.length) issues.push(`Cluster coverage is missing: ${family}.`);
    if (!template.allowedIntents.length) issues.push(`Search-intent coverage is missing: ${family}.`);
    if (!template.requiredBlocks.includes("summary") || !template.requiredBlocks.includes("internal-links")) {
      issues.push(`Reference anatomy is incomplete: ${family}.`);
    }
    if (template.defaultReviewCadenceDays < 1 || template.defaultReviewCadenceDays > 730) {
      issues.push(`Review cadence is invalid: ${family}.`);
    }
  }
  return issues;
}
