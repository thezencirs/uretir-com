import { getOfficialSource } from "@/lib/official-source-registry";

export const incentiveDomains = [
  "agriculture",
  "livestock",
  "investment",
  "regional",
  "export",
  "technology",
  "sme",
  "energy",
  "education",
  "employment",
  "eu",
  "development_agency",
  "municipality",
] as const;

export type IncentiveDomain = (typeof incentiveDomains)[number];
export type ProgrammeVerificationState = "under_review" | "verified" | "stale" | "archived";

export type OfficialRecordProvenance = {
  sourceId: string;
  sourceUrl: string;
  retrievedAt: string;
  verifiedAt: string;
  nextReviewAt: string;
  sourceFingerprint: string;
  officialRecordId?: string;
};
export type VerifiedProgrammeRecord = {
  id: string;
  title: string;
  authority: string;
  domains: IncentiveDomain[];
  verificationState: ProgrammeVerificationState;
  provenance: OfficialRecordProvenance;
  eligibilityRules: Array<{
    field: keyof ApplicantProfile;
    operator: "equals" | "includes" | "one_of";
    expected: string | string[];
    sourceClaim: string;
  }>;
  applicationWindow?: { opensAt?: string; closesAt?: string; sourceClaim: string };
  amount?: { description: string; sourceClaim: string };
  supersededBy?: string;
};

export type ApplicantProfile = {
  applicantType?: string;
  sector?: string;
  activity?: string;
  city?: string;
  region?: string;
  companySize?: string;
  projectStage?: string;
  exportStatus?: string;
  technologyArea?: string;
};

export type IncentiveAssessment = {
  programmeId: string;
  outcome: "potential_match" | "not_enough_information" | "not_a_match" | "source_not_usable";
  matchedRules: string[];
  missingFields: Array<keyof ApplicantProfile>;
  failedRules: string[];
  sourceUrl: string;
  verifiedAt: string;
  disclaimer: string;
};

const disclaimer = "Bu sonuç nihai uygunluk veya destek kararı değildir. Güncel koşullar ve karar yetkili kuruma aittir.";

function isFresh(record: VerifiedProgrammeRecord, now: string) {
  return record.verificationState === "verified" && record.provenance.verifiedAt <= now && record.provenance.nextReviewAt >= now;
}

/**
 * Fail-closed pre-assessment. It never returns “eligible”; stale, incomplete,
 * under-review, or archived source records cannot produce a match.
 */
export function assessIncentiveProgramme(record: VerifiedProgrammeRecord, profile: ApplicantProfile, now = new Date().toISOString()): IncentiveAssessment {
  const base = {
    programmeId: record.id,
    sourceUrl: record.provenance.sourceUrl,
    verifiedAt: record.provenance.verifiedAt,
    disclaimer,
  };
  if (!isFresh(record, now)) {
    return { ...base, outcome: "source_not_usable", matchedRules: [], missingFields: [], failedRules: ["Kaynak kaydı doğrulanmış ve güncel değil."] };
  }

  const matchedRules: string[] = [];
  const missingFields: Array<keyof ApplicantProfile> = [];
  const failedRules: string[] = [];
  for (const rule of record.eligibilityRules) {
    const actual = profile[rule.field];
    if (!actual) {
      missingFields.push(rule.field);
      continue;
    }
    const expected = Array.isArray(rule.expected) ? rule.expected : [rule.expected];
    const matches =
      rule.operator === "equals"
        ? expected.includes(actual)
        : rule.operator === "one_of"
          ? expected.includes(actual)
          : expected.some((value) => actual.includes(value));
    if (matches) matchedRules.push(rule.sourceClaim);
    else failedRules.push(rule.sourceClaim);
  }
  if (failedRules.length) return { ...base, outcome: "not_a_match", matchedRules, missingFields, failedRules };
  if (missingFields.length) return { ...base, outcome: "not_enough_information", matchedRules, missingFields: [...new Set(missingFields)], failedRules };
  return { ...base, outcome: "potential_match", matchedRules, missingFields: [], failedRules: [] };
}

export function validateProgrammeRecord(record: VerifiedProgrammeRecord) {
  const errors: string[] = [];
  const registeredSource = getOfficialSource(record.provenance.sourceId);
  if (!registeredSource) errors.push("Source is not registered.");
  if (!record.provenance.sourceUrl.startsWith("https://")) errors.push("Programme source URL must use HTTPS.");
  if (!record.provenance.sourceFingerprint) errors.push("Source fingerprint is required.");
  if (record.verificationState === "verified" && !record.eligibilityRules.length) errors.push("A verified programme requires claim-linked rules.");
  if (record.applicationWindow && !record.applicationWindow.sourceClaim) errors.push("Application window requires claim provenance.");
  if (record.amount && !record.amount.sourceClaim) errors.push("Amount requires claim provenance.");
  if (record.provenance.verifiedAt > record.provenance.nextReviewAt) errors.push("Next review must follow verification.");
  return errors;
}

export type IncentiveSourceConnector = {
  sourceId: string;
  fetchChangedRecords(checkpoint?: string): Promise<{
    checkpoint: string;
    records: unknown[];
  }>;
};

export type IncentiveReviewEvent = {
  programmeId: string;
  event: "created" | "verified" | "changed" | "stale" | "archived";
  actor: string;
  occurredAt: string;
  sourceFingerprint: string;
  note: string;
};
