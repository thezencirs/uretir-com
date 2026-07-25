export type TrendSourceKind =
  | "search_console"
  | "search_trends"
  | "official_statistics"
  | "official_bulletin"
  | "government_announcement"
  | "technology_news"
  | "industry_news"
  | "editorial_observation";
export type TrendSourceStatus = "not_connected" | "connected" | "degraded";

export type TrendSource = {
  id: string;
  name: string;
  kind: TrendSourceKind;
  href: string;
  status: TrendSourceStatus;
  authority: "first_party" | "official" | "editorial";
  freshnessTargetHours: number;
};

export type TrendSignal = {
  id: string;
  externalId: string;
  sourceId: string;
  sourceUrl: string;
  topic: string;
  observedAt: string;
  retrievedAt: string;
  windowDays: number;
  direction: "rising" | "stable" | "falling";
  magnitude?: number;
  sampleSize?: number;
  verifiedAt?: string;
};

export type TrendConnectorCheckpoint = {
  sourceId: string;
  cursor?: string;
  lastSuccessfulAt?: string;
};

export type TrendIngestionBatch = {
  sourceId: string;
  retrievedAt: string;
  checkpoint: TrendConnectorCheckpoint;
  signals: TrendSignal[];
};

export type TrendSignalConnector = {
  sourceId: string;
  fetchSince(checkpoint?: TrendConnectorCheckpoint): Promise<TrendIngestionBatch>;
};

export type TrendOpportunity = {
  topic: string;
  userQuestion: string;
  relatedEntityIds: string[];
  sourceSignalIds: string[];
  status: "blocked" | "candidate" | "editorial_review" | "approved";
  rationale: string;
};

export const trendSources: TrendSource[] = [
  { id: "gsc", name: "Google Search Console", kind: "search_console", href: "https://search.google.com/search-console/about", status: "not_connected", authority: "first_party", freshnessTargetHours: 24 },
  { id: "google-trends", name: "Google Trends", kind: "search_trends", href: "https://trends.google.com/trends/", status: "not_connected", authority: "first_party", freshnessTargetHours: 24 },
  { id: "tuik", name: "TÜİK Veri Portalı", kind: "official_statistics", href: "https://veriportali.tuik.gov.tr/tr", status: "not_connected", authority: "official", freshnessTargetHours: 168 },
  { id: "official-bulletins", name: "Resmî kurum duyuruları", kind: "official_bulletin", href: "https://www.resmigazete.gov.tr/", status: "not_connected", authority: "official", freshnessTargetHours: 24 },
];

export function validateTrendIngestionBatch(batch: TrendIngestionBatch, sources = trendSources) {
  const issues: string[] = [];
  const source = sources.find((candidate) => candidate.id === batch.sourceId);
  if (!source) issues.push(`Unknown trend source: ${batch.sourceId}.`);
  if (batch.checkpoint.sourceId !== batch.sourceId) issues.push("Checkpoint source does not match the ingestion batch.");
  if (!/^\d{4}-\d{2}-\d{2}T/.test(batch.retrievedAt)) issues.push("Batch retrieval time must be an ISO timestamp.");
  const signalIds = new Set<string>();
  const externalIds = new Set<string>();
  for (const signal of batch.signals) {
    if (signal.sourceId !== batch.sourceId) issues.push(`Signal source mismatch: ${signal.id}.`);
    if (!signal.sourceUrl.startsWith("https://")) issues.push(`Signal requires an HTTPS provenance URL: ${signal.id}.`);
    if (signalIds.has(signal.id)) issues.push(`Duplicate signal ID: ${signal.id}.`);
    if (externalIds.has(signal.externalId)) issues.push(`Duplicate provider record in batch: ${signal.externalId}.`);
    signalIds.add(signal.id);
    externalIds.add(signal.externalId);
  }
  return issues;
}

export function assessTrendOpportunity(input: Omit<TrendOpportunity, "status" | "rationale">, signals: TrendSignal[], sources = trendSources): TrendOpportunity {
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const evidence = signals.filter((signal) => input.sourceSignalIds.includes(signal.id) && signal.verifiedAt);
  const sourceKinds = new Set(evidence.map((signal) => sourceMap.get(signal.sourceId)?.kind).filter(Boolean));
  const hasFirstPartyOrOfficial = evidence.some((signal) => {
    const authority = sourceMap.get(signal.sourceId)?.authority;
    return authority === "first_party" || authority === "official";
  });

  if (evidence.length < 2 || sourceKinds.size < 2 || !hasFirstPartyOrOfficial) {
    return { ...input, status: "blocked", rationale: "En az iki doğrulanmış, farklı türde sinyal ve bir birinci taraf veya resmî kaynak gerekir." };
  }
  return { ...input, status: "candidate", rationale: "Sinyal eşiği karşılandı; arama niyeti ve editoryal değer incelemesi gerekiyor." };
}
