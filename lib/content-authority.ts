import type { ContentDocument } from "@/lib/content-model";
import type { EditorialEntityKind, EditorialSourceKind } from "@/lib/editorial-engine";
import { evaluateIntentCoverage, type SearchIntentAnswer } from "@/lib/search-intent";
import { getClusterMembershipIssues, topicClusterBlueprints } from "@/lib/topic-clusters";

export type AuthorityIssueSeverity = "blocking" | "advisory";

export type ContentAuthorityIssue = {
  field: string;
  message: string;
  severity: AuthorityIssueSeverity;
};

export type ContentAuthorityReport = {
  score: number;
  ready: boolean;
  blocking: ContentAuthorityIssue[];
  advisory: ContentAuthorityIssue[];
  answeredIntent: SearchIntentAnswer[];
};

const officialSourceKinds = new Set<EditorialSourceKind>([
  "official_announcement",
  "official_support_program",
  "official_statistic",
  "official_report",
  "official_company_information",
  "primary_research",
]);

const discoveryKinds = new Set<EditorialEntityKind>([
  "company",
  "factory",
  "product",
  "industry",
  "machine",
  "manufacturing_process",
  "raw_material",
  "supply_chain",
  "technology",
  "standard",
  "university",
  "government_institution",
  "investment_program",
  "incentive",
  "guide",
  "ai_product",
  "ai_tool",
]);

function hasBlock(document: ContentDocument, type: ContentDocument["blocks"][number]["type"]) {
  return document.blocks.some((block) => block.type === type);
}

function mainSectionCount(document: ContentDocument) {
  return document.blocks.filter((block) => {
    if (block.type === "heading") return block.level === 2;
    return block.type === "company-text" || block.type === "company-products" || block.type === "company-list";
  }).length;
}

function answeredByStructure(document: ContentDocument): SearchIntentAnswer[] {
  const answered = new Set<SearchIntentAnswer>();
  const headingText = document.blocks
    .filter((block) => block.type === "heading")
    .map((block) => block.text.toLocaleLowerCase("tr-TR"))
    .join(" ");

  if (hasBlock(document, "paragraph")) answered.add("what");
  if (/\bneden\b/.test(headingText)) answered.add("why");
  if (/\bnasıl\b/.test(headingText)) answered.add("how");
  if (/\bkim\b/.test(headingText)) answered.add("who");
  if (/\bnerede\b/.test(headingText)) answered.add("where");
  if (/\bne zaman\b/.test(headingText)) answered.add("when");
  if (hasBlock(document, "pros-cons")) {
    answered.add("advantages");
    answered.add("disadvantages");
  }
  if (hasBlock(document, "example")) answered.add("examples");
  if (document.blocks.some((block) => block.type === "heading" && /kullanım|senaryo|uygulama/.test(block.text.toLocaleLowerCase("tr-TR")))) answered.add("use_cases");
  if (document.faq.length > 0) answered.add("faq");
  if ((document.entityRelations?.length ?? 0) > 0) answered.add("related_topics");
  if (document.sources.length > 0) answered.add("sources");
  if (document.internalLinks.length > 0) answered.add("further_reading");
  return [...answered];
}

export function getContentAuthorityReport(document: ContentDocument): ContentAuthorityReport {
  const issues: ContentAuthorityIssue[] = [];
  const add = (field: string, message: string, severity: AuthorityIssueSeverity = "blocking") => issues.push({ field, message, severity });
  const sectionCount = mainSectionCount(document);
  const officialSources = document.editorial?.sources.filter((source) => officialSourceKinds.has(source.kind)) ?? [];
  const canonicalRelations = document.entityRelations?.filter((entity) => entity.canonicalPath) ?? [];
  const discoveryRelations = canonicalRelations.filter((entity) => discoveryKinds.has(entity.kind));
  const answeredIntent = answeredByStructure(document);
  const intentCoverage = evaluateIntentCoverage(document.searchIntent, answeredIntent);

  if (!hasBlock(document, "summary")) add("blocks.summary", "A concise summary block is required.");
  if (!document.blocks.some((block) => block.type === "paragraph" && block.lead)) add("blocks.introduction", "A clear introduction is required.");
  if (sectionCount < 3) add("blocks.mainSections", "At least three meaningful main sections are required.");
  if (document.faq.length < 2) add("faq", "At least two useful FAQ answers are required.");
  if (document.kind === "article" || document.kind === "guide") {
    if (!hasBlock(document, "example")) add("blocks.examples", "At least one attributable or clearly hypothetical example is required.");
    if (!hasBlock(document, "key-takeaways")) add("blocks.keyTakeaways", "A key-takeaways block is required.");
    if (!hasBlock(document, "pros-cons")) add("blocks.prosCons", "Advantages and disadvantages must be addressed.");
  }
  if (document.kind === "ne-uretir") {
    if (!hasBlock(document, "company-products")) add("blocks.products", "A company reference requires a sourced product or output section.");
    if (!hasBlock(document, "company-list")) add("blocks.facilities", "A company reference requires a sourced facility or operating-location section.");
    if (!hasBlock(document, "company-text")) add("blocks.profile", "A company reference requires a sourced activity profile.");
  }
  if (!document.readTime) add("readingTime", "A reading-time estimate is required.");
  if (!document.updatedAt) add("updatedAt", "A last-updated date is required.");
  if (!document.publishedAt) add("publishedAt", "A publication date is required.");
  if (!document.editorial) add("editorial", "The accountable editorial publishing record is missing.");
  if (officialSources.length === 0) add("editorial.sources", "At least one official or primary source is required.");
  if (canonicalRelations.length < 3) add("entityRelations", "At least three canonical entity relationships are required.");
  if (discoveryRelations.length < 2) add("entityRelations.discovery", "At least two useful discovery relationships are required.");
  if (document.internalLinks.length < 5) add("internalLinks", "At least five contextual further-reading paths are required.");
  if (!document.editorial?.review.subjectMatterReviewer || !document.editorial.review.sourceReviewer) add("editorial.review", "Subject-matter and source review must both be attributable.");
  if (!document.topicCluster) {
    add("topicCluster", "A reviewed topic-cluster membership is required before publication.");
  } else {
    for (const issue of getClusterMembershipIssues(document.topicCluster)) add(`topicCluster.${issue.field}`, issue.message, issue.severity);
  }
  for (const missing of intentCoverage.missing) add(`searchIntent.${missing}`, `Search intent answer is missing: ${missing}.`);

  if (document.topicCluster) {
    const entityKinds = new Set(canonicalRelations.map((relation) => relation.kind));
    const blueprint = topicClusterBlueprints[document.topicCluster.kind];
    for (const kind of blueprint.requiredEntityKinds) {
      if (!entityKinds.has(kind)) add(`entityRelations.${kind}`, `The ${blueprint.label} cluster has no canonical ${kind} discovery path in this document.`, "advisory");
    }
  }

  const blocking = issues.filter((issue) => issue.severity === "blocking");
  const advisory = issues.filter((issue) => issue.severity === "advisory");
  const score = Math.max(0, Math.round(100 - blocking.length * 5 - advisory.length * 2));
  return { score, ready: blocking.length === 0, blocking, advisory, answeredIntent };
}

export function isContentAuthorityReady(document: ContentDocument) {
  return getContentAuthorityReport(document).ready;
}
