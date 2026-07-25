import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { companies } from "@/lib/companies";
import { createContentGapReport } from "@/lib/content-gap";
import { createArticleDocument, createCompanyDocument } from "@/lib/content-factory";
import { hubGuides } from "@/lib/content-hubs";
import { createHubGuideDocument } from "@/lib/hub-guide-document";
import { createUretirKnowledgeGraph } from "@/lib/knowledge-graph";
import { posts } from "@/lib/posts";

const graph = createUretirKnowledgeGraph();
const documents = [
  ...posts.map(createArticleDocument),
  ...companies.map(createCompanyDocument),
  ...hubGuides.map(createHubGuideDocument),
];
const snapshotAt = [...graph.entities.values()].map((entity) => entity.updatedAt).sort().at(-1) ?? "unknown";
const report = createContentGapReport(graph, documents, { snapshotAt, limit: 100 });
const serialized = `${JSON.stringify(report, null, 2)}\n`;
const markdownEscape = (value: string | number) => String(value).replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
const markdown = [
  "# Content Gap Report",
  "",
  `Snapshot: ${report.snapshotAt}`,
  "",
  "> This report measures repository coverage only. Every opportunity has unvalidated demand and must pass source, demand, duplicate, and human editorial review before content work begins.",
  "",
  "## Coverage summary",
  "",
  `- Graph entities: ${report.graph.entities}`,
  `- Graph relationships: ${report.graph.relationships}`,
  `- Content documents reviewed: ${report.documents.reviewed}`,
  `- Authority-ready documents: ${report.documents.authorityReady}`,
  `- Measured opportunities: ${report.opportunityCount}`,
  `- Missing entity-kind requirements: ${report.missingEntityRequirementCount}`,
  "",
  "## Top 100 missing topic opportunities",
  "",
  "| # | Score | Cluster | Hub | Suggested family | Demand |",
  "| ---: | ---: | --- | --- | --- | --- |",
  ...report.topOpportunities.map((item, index) =>
    `| ${index + 1} | ${item.priorityScore} | ${markdownEscape(item.clusterKind)} | ${markdownEscape(item.hubLabel)} | ${markdownEscape(item.suggestedFamily)} | ${item.demandStatus} |`,
  ),
  "",
  "## Top 100 missing entity requirements",
  "",
  "| # | Score | Cluster | Hub | Required entity kind | Status |",
  "| ---: | ---: | --- | --- | --- | --- |",
  ...report.topMissingEntities.map((item, index) =>
    `| ${index + 1} | ${item.priorityScore} | ${markdownEscape(item.clusterKind)} | ${markdownEscape(item.hubLabel)} | ${markdownEscape(item.requiredKind)} | ${item.status} |`,
  ),
  "",
  "## Interpretation",
  "",
  "A missing entity requirement means the required entity kind is not registered in the current direct graph neighborhood. It does not mean that such an entity does not exist in the real world. Research and verified demand signals are required before creating any record or page.",
  "",
].join("\n");

const outputIndex = process.argv.indexOf("--output");
const requestedPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : "reports/content-gap-report.json";
const outputPath = resolve(process.cwd(), requestedPath);
const markdownPath = outputPath.replace(/\.json$/i, ".md");

if (process.argv.includes("--check")) {
  if (
    !existsSync(outputPath) ||
    readFileSync(outputPath, "utf8") !== serialized ||
    !existsSync(markdownPath) ||
    readFileSync(markdownPath, "utf8") !== markdown
  ) {
    process.stderr.write("Content gap report is stale. Run pnpm report:gaps and commit the generated report.\n");
    process.exit(1);
  }
  process.stdout.write(`Content gap report is current: ${report.topOpportunities.length} opportunities and ${report.topMissingEntities.length} missing entity requirements.\n`);
} else if (process.argv.includes("--write")) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized, "utf8");
  writeFileSync(markdownPath, markdown, "utf8");
  process.stdout.write(`Content gap reports written to ${outputPath} and ${markdownPath}\n`);
  process.stdout.write(`${report.topOpportunities.length} opportunities and ${report.topMissingEntities.length} missing entity requirements ranked.\n`);
} else {
  process.stdout.write(serialized);
}
