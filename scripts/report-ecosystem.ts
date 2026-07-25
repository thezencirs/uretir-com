import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { aiCapabilities, validateAICapabilities } from "@/lib/ai-capabilities";
import { aiProducts, validateAIProductRegistry } from "@/lib/ai-product-ecosystem";
import { createEcosystemGaps, ecosystemScores, personaAudits, validateEcosystemAudit } from "@/lib/ecosystem-audit";
import { incentiveDomains } from "@/lib/incentive-discovery";
import { officialSources, validateOfficialSourceRegistry } from "@/lib/official-source-registry";
import { repositorySearchAdapter, validateSearchIndex } from "@/lib/search-index";

const snapshotAt = "2026-07-25";
const topMissing = createEcosystemGaps();
const validationErrors = [
  ...validateAICapabilities(),
  ...validateAIProductRegistry(),
  ...validateOfficialSourceRegistry(),
  ...validateEcosystemAudit(),
  ...validateSearchIndex(),
];

if (validationErrors.length) {
  process.stderr.write(`Ecosystem validation failed:\n- ${validationErrors.join("\n- ")}\n`);
  process.exit(1);
}

const roadmap = {
  sevenDays: topMissing.filter((item) => item.horizon === "7_days"),
  thirtyDays: topMissing.filter((item) => item.horizon === "30_days").slice(0, 20),
  ninetyDays: topMissing.filter((item) => item.horizon === "90_days").slice(0, 20),
};

const report = {
  snapshotAt,
  executiveSummary: {
    immediateAnswer: "Uretir is not missing more public pages first. It is missing production measurement, one authority-ready content cluster, verified source ingestion, and a persistent identity/workspace layer.",
    productionReadyGap: "Hosting, observability, consent-aware analytics, rollback ownership, and verified programme ingestion are not connected.",
    next90Days: "Prove one complete loop: validated demand → authority-ready cluster → universal discovery → grounded AI retrieval → measured return behavior.",
  },
  scores: ecosystemScores,
  counts: {
    personas: personaAudits.length,
    aiProducts: aiProducts.length,
    aiCapabilities: aiCapabilities.length,
    officialSources: officialSources.length,
    incentiveDomains: incentiveDomains.length,
    searchableRecordsInCurrentEnvironment: repositorySearchAdapter.listPublicRecords().length,
    topMissingFeatures: topMissing.length,
  },
  personaAudits,
  aiProducts,
  top25AICapabilities: aiCapabilities,
  top50OfficialSources: officialSources,
  top100MissingFeatures: topMissing,
  roadmap,
  priorities: {
    production: ["Approve hosting and data region", "Connect error, uptime, logs, and Core Web Vitals", "Rehearse immutable deploy and rollback", "Approve consent and retention"],
    growth: ["Connect Search Console read-only", "Instrument zero-result and continuation journeys", "Publish one authority-ready topic cluster", "Measure internal-link continuation"],
    data: ["Pilot one TeşvikAI source family", "Fingerprint and diff official records", "Expire stale records automatically", "Keep human verification in the release gate"],
  },
};

const serialized = `${JSON.stringify(report, null, 2)}\n`;
const cell = (value: string | number) => String(value).replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
const markdown = [
  "# Uretir Ecosystem Completion Report",
  "",
  `Snapshot: ${snapshotAt}`,
  "",
  "> This is a repository-readiness audit, not a claim of market demand, production traffic, or live AI capability. Candidate products do not have public routes.",
  "",
  "## Executive answer",
  "",
  report.executiveSummary.immediateAnswer,
  "",
  `**Production-ready gap:** ${report.executiveSummary.productionReadyGap}`,
  "",
  `**Next 90 days:** ${report.executiveSummary.next90Days}`,
  "",
  "## Scores",
  "",
  "| Area | Score / 100 | Evidence |",
  "| --- | ---: | --- |",
  ...ecosystemScores.map((item) => `| ${cell(item.area)} | ${item.score} | ${cell(item.evidence)} |`),
  "",
  "## Persona audit",
  "",
  "| Persona | Can do today | Cannot do today | Likely exit reason |",
  "| --- | --- | --- | --- |",
  ...personaAudits.map((item) => `| ${cell(item.name)} | ${cell(item.currentCanDo.join("; "))} | ${cell(item.cannotDo.join("; "))} | ${cell(item.likelyExitReasons.join("; "))} |`),
  "",
  "## AI product ecosystem",
  "",
  "| Product | State | Purpose | Route | Primary prerequisites |",
  "| --- | --- | --- | --- | --- |",
  ...aiProducts.map((item) => `| ${cell(item.name)} | ${item.status} | ${cell(item.purpose)} | ${item.route ?? "No public route"} | ${cell(item.prerequisites.join("; "))} |`),
  "",
  "## Top 25 AI capabilities",
  "",
  "| # | Capability | State | Outcome | Principal risk |",
  "| ---: | --- | --- | --- | --- |",
  ...aiCapabilities.map((item) => `| ${item.priority} | ${cell(item.name)} | ${item.state} | ${cell(item.outcome)} | ${cell(item.principalRisk)} |`),
  "",
  "## Top 50 official data sources",
  "",
  "| # | Source | Scope | Domains | Integration | Portal |",
  "| ---: | --- | --- | --- | --- | --- |",
  ...officialSources.map((item, index) => `| ${index + 1} | ${cell(item.name)} | ${item.scope} | ${cell(item.domains.join(", "))} | ${item.integrationMode} | [Official portal](${item.url}) |`),
  "",
  "A verified portal is not a permanently valid record. Time-sensitive claims require record-level retrieval time, verification time, source fingerprint, and next-review date.",
  "",
  "## Top 100 missing features",
  "",
  "| # | Score | Missing capability | Evidence source | Owner | Horizon | Dependency |",
  "| ---: | ---: | --- | --- | --- | --- | --- |",
  ...topMissing.map((item, index) => `| ${index + 1} | ${item.priorityScore} | ${cell(item.title)} | ${item.source} | ${cell(item.owner)} | ${item.horizon} | ${cell(item.dependency)} |`),
  "",
  "## Production priorities",
  "",
  ...report.priorities.production.map((item) => `- ${item}`),
  "",
  "## Growth priorities",
  "",
  ...report.priorities.growth.map((item) => `- ${item}`),
  "",
  "## Data and verification priorities",
  "",
  ...report.priorities.data.map((item) => `- ${item}`),
  "",
  "## 7-day roadmap",
  "",
  ...roadmap.sevenDays.map((item) => `- **${item.title}** — ${item.dependency}`),
  "",
  "## 30-day roadmap",
  "",
  ...roadmap.thirtyDays.map((item) => `- **${item.title}** — ${item.dependency}`),
  "",
  "## 90-day roadmap",
  "",
  ...roadmap.ninetyDays.map((item) => `- **${item.title}** — ${item.dependency}`),
  "",
  "## Related repository audits",
  "",
  "- [Top 100 content and entity gaps](./content-gap-report.md)",
  "- [Ecosystem operating model](../docs/ecosystem-completion.md)",
  "- [TeşvikAI trust contract](../docs/tesvik-ai.md)",
  "",
].join("\n");

const outputIndex = process.argv.indexOf("--output");
const requestedPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : "reports/ecosystem-completion-report.json";
const outputPath = resolve(process.cwd(), requestedPath);
const markdownPath = outputPath.replace(/\.json$/i, ".md");

if (process.argv.includes("--check")) {
  if (!existsSync(outputPath) || readFileSync(outputPath, "utf8") !== serialized || !existsSync(markdownPath) || readFileSync(markdownPath, "utf8") !== markdown) {
    process.stderr.write("Ecosystem report is stale. Run pnpm report:ecosystem and commit the generated reports.\n");
    process.exit(1);
  }
  process.stdout.write(`Ecosystem report is current: ${topMissing.length} gaps, ${officialSources.length} sources, ${aiCapabilities.length} capabilities.\n`);
} else if (process.argv.includes("--write")) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized, "utf8");
  writeFileSync(markdownPath, markdown, "utf8");
  process.stdout.write(`Ecosystem reports written to ${outputPath} and ${markdownPath}\n`);
} else {
  process.stdout.write(serialized);
}
