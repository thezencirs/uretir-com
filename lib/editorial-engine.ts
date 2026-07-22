export const editorialEntityKinds = [
  "company",
  "product",
  "category",
  "industry",
  "factory",
  "city",
  "technology",
  "machine",
  "raw_material",
  "ai_tool",
] as const;

export type EditorialEntityKind = typeof editorialEntityKinds[number];
export type EditorialRelationship =
  | "primary_subject"
  | "explains"
  | "profiles"
  | "compares"
  | "uses"
  | "produces"
  | "operates_in"
  | "located_in"
  | "enables"
  | "related_to";

export type EditorialEntityReference = {
  entityId: string;
  kind: EditorialEntityKind;
  relationship: EditorialRelationship;
  label: string;
  canonicalPath?: string;
};

export type EditorialSourceKind =
  | "official_announcement"
  | "official_support_program"
  | "official_statistic"
  | "official_report"
  | "official_company_information"
  | "primary_research"
  | "expert_interview"
  | "editorial_analysis";

export type EditorialSourceReference = {
  id: string;
  title: string;
  href: string;
  kind: EditorialSourceKind;
  publisher: string;
  publishedAt?: string;
  accessedAt: string;
  officialDocument?: boolean;
};

export type EditorialImage = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  license?: string;
};

export type OfficialDocumentReference = {
  id: string;
  title: string;
  href: string;
  publisher: string;
  publishedAt?: string;
  documentType: "announcement" | "program" | "statistic" | "report" | "regulation" | "company_document";
};

export type EditorialReview = {
  status: "draft" | "in_review" | "approved" | "published" | "archived";
  subjectMatterReviewer?: string;
  sourceReviewer?: string;
  reviewedAt?: string;
  nextReviewAt?: string;
  editorialNotes?: string;
};

export type EditorialChange = {
  changedAt: string;
  summary: string;
  editor?: string;
};

export type EditorialPublishingRecord = {
  title: string;
  summary: string;
  publishedAt?: string;
  updatedAt?: string;
  readingTimeMinutes?: number;
  sources: EditorialSourceReference[];
  officialDocuments: OfficialDocumentReference[];
  images: EditorialImage[];
  entities: EditorialEntityReference[];
  faqCount: number;
  changeLog: EditorialChange[];
  uncertaintyNotes?: string[];
  review: EditorialReview;
};

export type EditorialReadinessIssue = {
  field: string;
  message: string;
};

/**
 * Validates the minimum evidence and review contract for newly published
 * reference content. It deliberately validates editorial readiness rather
 * than using an arbitrary word-count threshold.
 */
export function getEditorialReadinessIssues(record: EditorialPublishingRecord): EditorialReadinessIssue[] {
  const issues: EditorialReadinessIssue[] = [];
  const requiresPublicationChecks = record.review.status === "approved" || record.review.status === "published";

  if (!record.title.trim()) issues.push({ field: "title", message: "A clear, user-question-led title is required." });
  if (!record.summary.trim()) issues.push({ field: "summary", message: "A concise summary is required." });
  if (!requiresPublicationChecks) return issues;

  if (!record.publishedAt) issues.push({ field: "publishedAt", message: "Published content requires a publication date." });
  if (!record.updatedAt) issues.push({ field: "updatedAt", message: "Published content requires a last-updated date." });
  if (!record.readingTimeMinutes || record.readingTimeMinutes < 1) issues.push({ field: "readingTimeMinutes", message: "A realistic reading-time estimate is required." });
  if (record.sources.length === 0) issues.push({ field: "sources", message: "At least one attributable source is required." });
  if (record.entities.length === 0) issues.push({ field: "entities", message: "At least one knowledge-graph entity relationship is required." });
  if (!record.entities.some((entity) => entity.relationship === "primary_subject" || entity.relationship === "explains" || entity.relationship === "profiles")) issues.push({ field: "entities", message: "A primary subject, explained entity, or profiled entity is required." });
  if (!record.review.subjectMatterReviewer) issues.push({ field: "review.subjectMatterReviewer", message: "An accountable subject-matter reviewer is required." });
  if (!record.review.sourceReviewer) issues.push({ field: "review.sourceReviewer", message: "A source reviewer is required." });
  if (!record.review.reviewedAt) issues.push({ field: "review.reviewedAt", message: "A completed review date is required." });
  if (!record.review.nextReviewAt) issues.push({ field: "review.nextReviewAt", message: "A next-review date is required for long-term maintenance." });
  if (record.changeLog.length === 0) issues.push({ field: "changeLog", message: "Published content requires a transparent initial-publication or update entry." });

  return issues;
}

export function isEditorialPublicationReady(record: EditorialPublishingRecord) {
  return getEditorialReadinessIssues(record).length === 0;
}
