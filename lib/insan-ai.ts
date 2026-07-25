import { absoluteUrl } from "@/lib/seo";

export type PersonSource = {
  id: string;
  title: string;
  href: string;
  publisher: string;
  kind: "official_profile" | "primary_research" | "university_profile" | "company_profile" | "book" | "talk" | "reputable_archive";
  accessedAt: string;
};

export type PersonProfile = {
  id: string;
  slug: string;
  displayName: string;
  biography: string;
  occupations: string[];
  majorContributions: string[];
  importantIdeas: string[];
  books: Array<{ title: string; year?: number }>;
  talks: Array<{ title: string; href: string }>;
  research: Array<{ title: string; href: string }>;
  influence: string[];
  relatedEntityIds: string[];
  sources: PersonSource[];
  status: "draft" | "in_review" | "published" | "archived";
  review: {
    subjectReviewer?: string;
    sourceReviewer?: string;
    reviewedAt?: string;
    nextReviewAt?: string;
  };
};

export const insanAIProfiles: PersonProfile[] = [];

export function getPersonProfileReadinessIssues(profile: PersonProfile) {
  const issues: string[] = [];
  if (!profile.biography.trim()) issues.push("Biography is required.");
  if (profile.majorContributions.length === 0) issues.push("At least one attributable contribution is required.");
  if (profile.sources.length < 2) issues.push("At least two independent, reliable sources are required.");
  if (!profile.sources.some((source) => ["official_profile", "primary_research", "university_profile"].includes(source.kind))) issues.push("At least one primary or official source is required.");
  if (!profile.review.subjectReviewer) issues.push("A subject-matter reviewer is required.");
  if (!profile.review.sourceReviewer) issues.push("A source reviewer is required.");
  if (!profile.review.reviewedAt || !profile.review.nextReviewAt) issues.push("Review and next-review dates are required.");
  return issues;
}
export function isPersonProfilePublishable(profile: PersonProfile) {
  return profile.status === "published" && getPersonProfileReadinessIssues(profile).length === 0;
}

export function personProfileSchema(profile: PersonProfile) {
  if (!isPersonProfilePublishable(profile)) return null;
  const url = absoluteUrl(`/insan-ai/${profile.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: profile.displayName,
    description: profile.biography,
    url,
    jobTitle: profile.occupations,
    knowsAbout: [...profile.majorContributions, ...profile.importantIdeas],
    subjectOf: profile.sources.map((source) => ({ "@type": "CreativeWork", name: source.title, url: source.href })),
  };
}
