export type CampaignLifecycleStatus = "ACTIVE" | "UPCOMING" | "EXPIRED" | "SUSPENDED" | "UNVERIFIED" | "SOURCE_UNAVAILABLE" | "CONFLICT";
export type Freshness = "FRESH" | "RECENT" | "AGING" | "STALE" | "VERY_STALE";

export function dataFreshness(fetchedAt: Date, now = new Date()): Freshness {
  const hours = Math.max(0, (now.getTime() - fetchedAt.getTime()) / 3_600_000);
  if (hours <= 24) return "FRESH";
  if (hours <= 72) return "RECENT";
  if (hours <= 168) return "AGING";
  if (hours <= 720) return "STALE";
  return "VERY_STALE";
}

export function campaignLifecycle(input: { validFrom: Date; validUntil: Date; verified: boolean; sourceAvailable: boolean; suspended?: boolean; conflict?: boolean }, now = new Date()): CampaignLifecycleStatus {
  if (input.suspended) return "SUSPENDED";
  if (!input.sourceAvailable) return "SOURCE_UNAVAILABLE";
  if (input.conflict) return "CONFLICT";
  if (!input.verified) return "UNVERIFIED";
  if (input.validUntil.getTime() < now.getTime()) return "EXPIRED";
  if (input.validFrom.getTime() > now.getTime()) return "UPCOMING";
  return "ACTIVE";
}

export const SOURCE_TRUST_SCORE = Object.freeze({
  OFFICIAL_BANK: 100,
  OFFICIAL_CARD_PROGRAM: 100,
  OFFICIAL_MERCHANT: 95,
  OFFICIAL_BRAND: 95,
  TRUSTED_MARKETPLACE: 85,
  COMPARISON_SITE: 75,
  USER_SUBMITTED: 50,
  OTHER: 40,
});

export function detectConflicts<T extends Record<string, unknown>>(records: Array<{ sourceId: string; trustScore: number; fetchedAt: Date; data: T }>, fields: Array<keyof T>) {
  return fields.flatMap((field) => {
    const distinct = new Map<string, unknown>();
    for (const record of records) distinct.set(JSON.stringify(record.data[field] ?? null), record.data[field] ?? null);
    if (distinct.size < 2) return [];
    const preferred = [...records].sort((a, b) => b.trustScore - a.trustScore || b.fetchedAt.getTime() - a.fetchedAt.getTime())[0];
    return [{ field: String(field), values: [...distinct.values()], sourceIds: records.map((record) => record.sourceId), preferredSourceId: preferred.sourceId }];
  });
}
