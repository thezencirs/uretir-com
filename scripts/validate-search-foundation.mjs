import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const appOutput = join(projectRoot, ".next", "server", "app");
const failures = [];
const checks = [];

function assert(condition, message) {
  if (condition) {
    checks.push(message);
    return;
  }
  failures.push(message);
}

function read(relativePath) {
  const fullPath = join(appOutput, relativePath);
  assert(existsSync(fullPath), `Build output exists: ${relativePath}`);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

function collectHtml(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) return collectHtml(target);
    return entry.isFile() && entry.name.endsWith(".html") ? [target] : [];
  });
}

function hasNoindex(html) {
  return /<meta\s+name="robots"\s+content="[^"]*\bnoindex\b[^"]*"/i.test(html);
}

function canonicalOf(html) {
  return html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
}

function routeOf(file) {
  const label = relative(appOutput, file).replaceAll("\\", "/");
  if (label === "_not-found.html") return undefined;
  if (label === "index.html") return "/";
  return `/${label.replace(/\.html$/, "")}`;
}

function routePattern(route) {
  const escaped = route
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[\\\[(?:\.\.\.)?[^\]]+\\\]\\\]/g, ".*")
    .replace(/\\\[(?:\.\.\.)?[^\]]+\\\]/g, "[^/]+");
  return new RegExp(`^${escaped || "/"}\\/?$`);
}

function decodeHtml(value) {
  return value.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
}

assert(existsSync(appOutput), "Next.js production build exists");

const robots = read("robots.txt.body");
assert(!/Disallow:\s*\/_next\b/i.test(robots), "robots.txt allows framework rendering assets");
assert(/Disallow:\s*\/api\/?$/im.test(robots), "robots.txt protects API routes");
assert(/Sitemap:\s*https:\/\/uretir\.com\/sitemap\.xml/im.test(robots), "robots.txt advertises the canonical sitemap");

const sitemap = read("sitemap.xml.body");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const sitemapUrlKeys = new Set(sitemapUrls.map((url) => new URL(url).toString()));
assert(sitemapUrls.length > 0, "sitemap contains at least one approved URL");
assert(new Set(sitemapUrls).size === sitemapUrls.length, "sitemap contains no duplicate URLs");
assert(sitemapUrls.every((url) => url.startsWith("https://uretir.com/")), "sitemap URLs use the canonical HTTPS origin");

const allHtml = collectHtml(appOutput);
const noindexPages = allHtml.filter((file) => hasNoindex(readFileSync(file, "utf8")));
const forbiddenRichType = /"@type":"(?:Article|NewsArticle|BlogPosting|FAQPage|Offer|Person|Corporation)"/;
const htmlByCanonicalPath = new Map();

for (const file of allHtml) {
  const html = readFileSync(file, "utf8");
  const label = relative(appOutput, file).replaceAll("\\", "/");
  const route = routeOf(file);
  const canonical = canonicalOf(html);
  if (canonical?.startsWith("https://uretir.com")) htmlByCanonicalPath.set(new URL(canonical).pathname, html);
  assert((html.match(/<title>/g) ?? []).length === 1, `rendered page has exactly one title: ${label}`);
  assert((html.match(/<meta\s+name="description"\s+content="[^"]+"/gi) ?? []).length === 1, `rendered page has exactly one meta description: ${label}`);
  assert((html.match(/<h1\b/g) ?? []).length === 1, `rendered page has exactly one H1: ${label}`);
  assert((html.match(/<main\b/g) ?? []).length === 1, `rendered page has exactly one main landmark: ${label}`);
  const canonicalTags = html.match(/<link\s+rel="canonical"\s+href="[^"]+"/gi) ?? [];
  if (route) {
    assert(canonicalTags.length === 1, `rendered route has exactly one canonical: ${label}`);
    if (canonical) {
      const parsedCanonical = new URL(canonical);
      assert(parsedCanonical.origin === "https://uretir.com", `canonical uses the production origin: ${label}`);
      assert(parsedCanonical.pathname === route, `canonical is self-referential: ${label}`);
      assert(!parsedCanonical.search && !parsedCanonical.hash, `canonical excludes query and fragment: ${label}`);
      const openGraphUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i)?.[1];
      assert(openGraphUrl === canonical, `Open Graph URL matches canonical: ${label}`);
      if (!hasNoindex(html)) assert(sitemapUrlKeys.has(parsedCanonical.toString()), `indexable canonical is present in sitemap: ${canonical}`);
    }
  } else {
    assert(canonicalTags.length === 0, "404 output does not inherit a canonical URL");
    assert(!/<meta\s+property="og:url"/i.test(html), "404 output does not inherit an Open Graph URL");
  }
  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [index, block] of jsonLdBlocks.entries()) {
    try {
      JSON.parse(block[1]);
      checks.push(`JSON-LD parses successfully: ${label} block ${index + 1}`);
    } catch {
      failures.push(`JSON-LD parses successfully: ${label} block ${index + 1}`);
    }
  }
  const authoredIds = [...html.matchAll(/\sid="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((id) => !/^[_A-Z][:_A-Z0-9]*$/.test(id));
  assert(new Set(authoredIds).size === authoredIds.length, `rendered page has no duplicate authored IDs: ${label}`);
}

for (const file of noindexPages) {
  const html = readFileSync(file, "utf8");
  const label = relative(appOutput, file).replaceAll("\\", "/");
  assert(!forbiddenRichType.test(html), `noindex page emits no publishable rich-result schema: ${label}`);
  const canonical = canonicalOf(html);
  if (canonical) assert(!sitemapUrls.includes(canonical), `noindex canonical is absent from sitemap: ${canonical}`);
}

const productionDrafts = [
  join("blog", "yapay-zeka-ile-fikri-prototipe-donusturmek.html"),
  join("rehber", "uretim-sorusu-nasil-arastirilir.html"),
  join("ne-uretir", "tupras.html"),
];
for (const draftPath of productionDrafts) {
  assert(!existsSync(join(appOutput, draftPath)), `editorial draft is absent from production HTML: ${draftPath}`);
}
for (const routeFile of [
  join("app", "blog", "[slug]", "page.tsx"),
  join("app", "kategori", "[category]", "page.tsx"),
  join("app", "ne-uretir", "[slug]", "page.tsx"),
  join("app", "rehber", "[slug]", "page.tsx"),
  join("app", "puan-ai", "kampanya", "[slug]", "page.tsx"),
]) {
  const source = readFileSync(join(projectRoot, routeFile), "utf8");
  assert(source.includes("export const dynamicParams = false"), `file-backed route rejects unknown production parameters: ${routeFile}`);
}

const home = read("index.html");
assert(!home.includes("/blog/yapay-zeka-ile-fikri-prototipe-donusturmek"), "homepage does not promote editorial drafts");
assert(!home.includes("/kategori/teknoloji"), "homepage does not link to empty draft-only categories");
assert(!home.includes('href="/kategori/yapay-zeka"'), "production navigation does not promote a draft-only category");
assert(!home.includes('href="/uretir-id"'), "production navigation does not promote the identity prototype");
assert(home.includes('data-analytics-event="navigation_select"'), "production navigation exposes the provider-neutral measurement contract");
assert(home.includes('action="/ara"'), "homepage search submits to universal discovery");

const searchPageSource = readFileSync(join(projectRoot, "app", "ara", "page.tsx"), "utf8");
assert(searchPageSource.includes("robots: { index: false, follow: true }"), "universal search results remain noindex");
assert(searchPageSource.includes("Evrensel keşif"), "universal search renders its discovery boundary");
assert(!sitemapUrls.includes("https://uretir.com/ara"), "internal search is absent from the sitemap");
assert(home.includes('href="/ara"'), "production header exposes universal search");
assert(home.includes("/ara?q={search_term_string}"), "WebSite SearchAction points to universal search");

for (const route of ["_not-found.html", "insan-ai.html", "trendler.html", "startup.html", "uretir-id.html", "yakinda.html"]) {
  assert(hasNoindex(read(route)), `unfinished or utility route remains noindex: ${route}`);
}

const puanHtml = [
  read("puan-ai.html"),
  ...collectHtml(join(appOutput, "puan-ai")).map((file) => readFileSync(file, "utf8")),
].join("\n");
assert(puanHtml.includes("Varsayımsal"), "PuanAI labels hypothetical decision scenarios");
assert(!/\b(?:Migros|Hepsiburada|Teknosa|Starbucks|Shell|Amazon|Akbank|Garanti BBVA|Worldcard|Axess)\b/i.test(puanHtml), "PuanAI production HTML contains no unverified real-brand campaign claims");
assert(puanHtml.includes("Gerçek tarih yok"), "PuanAI sample scenarios do not imply live validity dates");
assert(puanHtml.includes('data-analytics-event="ai_intent_select"'), "PuanAI intent choices expose typed measurement events");
assert(puanHtml.includes('data-analytics-event="ai_prompt_submit"'), "PuanAI free-text interaction measures intent without embedding input values");

const analyticsSource = readFileSync(join(projectRoot, "lib", "analytics.ts"), "utf8");
const analyticsBridgeSource = readFileSync(join(projectRoot, "components", "analytics-event-bridge.tsx"), "utf8");
assert(analyticsSource.includes("safeTargetPattern"), "analytics targets are restricted to machine-defined identifiers");
assert(!analyticsBridgeSource.includes("fetch(") && !analyticsBridgeSource.includes("localStorage"), "analytics bridge performs no network request or browser storage");

const feed = read("feed.xml.body");
const feedLinks = [...feed.matchAll(/<item>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/g)].map((match) => match[1]);
assert(feedLinks.every((url) => sitemapUrls.includes(url)), "RSS items are also approved sitemap URLs");

const appPaths = JSON.parse(readFileSync(join(projectRoot, ".next", "server", "app-paths-manifest.json"), "utf8"));
assert(Object.keys(appPaths).includes("/ara/page"), "universal search is registered as an application route");
const routePatterns = Object.keys(appPaths).flatMap((entry) => {
  if (entry.endsWith("/page")) {
    const route = entry.slice(0, -5) || "/";
    return [routePattern(route)];
  }
  if (entry.endsWith("/route")) return [routePattern(entry.slice(0, -6) || "/")];
  return [];
});
const brokenRoutes = [];
const brokenAnchors = [];

for (const file of allHtml) {
  const html = readFileSync(file, "utf8");
  const currentPath = canonicalOf(html)?.startsWith("https://uretir.com") ? new URL(canonicalOf(html)).pathname : undefined;
  const hrefs = [...html.matchAll(/<a\b[^>]*\shref="([^"]+)"/gi)].map((match) => decodeHtml(match[1]));
  for (const href of hrefs) {
    if (/^(?:mailto:|tel:|javascript:)/i.test(href)) continue;
    if (/^https?:\/\//i.test(href) && !href.startsWith("https://uretir.com")) continue;
    const parsed = href.startsWith("http") ? new URL(href) : new URL(href, `https://uretir.com${currentPath ?? "/"}`);
    const targetPath = parsed.pathname.replace(/\/+$/, "") || "/";
    if (!routePatterns.some((pattern) => pattern.test(targetPath))) brokenRoutes.push(`${relative(appOutput, file)} -> ${href}`);
    if (/^\/(?:blog|rehber|ne-uretir|kategori|puan-ai\/kampanya)\/[^/]+$/.test(targetPath) && !htmlByCanonicalPath.has(targetPath)) {
      brokenRoutes.push(`${relative(appOutput, file)} -> ${href} (no production document)`);
    }
    if (parsed.hash) {
      const targetHtml = targetPath === currentPath ? html : htmlByCanonicalPath.get(targetPath);
      const id = decodeURIComponent(parsed.hash.slice(1));
      if (targetHtml && !targetHtml.includes(`id="${id}"`)) brokenAnchors.push(`${relative(appOutput, file)} -> ${href}`);
    }
  }
}
assert(brokenRoutes.length === 0, `internal links resolve to application routes${brokenRoutes.length ? `: ${brokenRoutes.slice(0, 5).join(", ")}` : ""}`);
assert(brokenAnchors.length === 0, `internal anchor links resolve to rendered IDs${brokenAnchors.length ? `: ${brokenAnchors.slice(0, 5).join(", ")}` : ""}`);

const graphPage = read("uretir-ai.html");
assert(graphPage.includes("varlığın tamamı en az bir ilişkiye bağlı."), "knowledge graph passes rendered integrity and orphan validation");

const clusterSource = readFileSync(join(projectRoot, "lib", "topic-clusters.ts"), "utf8");
for (const clusterKind of ["company", "factory", "product", "technology", "manufacturing", "investment", "export", "standard", "artificial_intelligence", "government_program", "industrial_equipment", "supply_chain"]) {
  assert(clusterSource.includes(`"${clusterKind}"`), `topic cluster registry includes ${clusterKind}`);
}
assert(clusterSource.includes("validateTopicClusterBlueprints"), "topic cluster blueprints expose a repository validation contract");

const templateSource = readFileSync(join(projectRoot, "lib", "content-templates.ts"), "utf8");
for (const family of ["article", "guide", "company_profile", "technology_profile", "machine_profile", "raw_material_profile", "factory_profile", "industry_profile", "government_program", "investment_guide", "export_guide", "ai_guide"]) {
  assert(templateSource.includes(`"${family}"`), `content template registry includes ${family}`);
}
assert(templateSource.includes("validateContentTemplateRegistry"), "content template registry exposes an integrity validator");

const workflowSource = readFileSync(join(projectRoot, "lib", "editorial-workflow.ts"), "utf8");
for (const stage of ["source_review", "entity_review", "editorial_review", "seo_review", "knowledge_graph_review", "publication_review", "update_review"]) {
  assert(workflowSource.includes(`"${stage}"`), `editorial workflow includes ${stage}`);
}
assert(workflowSource.includes("publicationReady"), "editorial workflow has a fail-closed publication mode");

const authoritySource = readFileSync(join(projectRoot, "lib", "content-authority.ts"), "utf8");
assert(authoritySource.includes("getClusterMembershipIssues"), "publication authority validates topic cluster membership");
assert(authoritySource.includes("requiredEntityKinds"), "authority advice follows cluster-specific entity coverage");

const graphSource = readFileSync(join(projectRoot, "lib", "knowledge-graph.ts"), "utf8");
assert(graphSource.includes("orphanEntityIds"), "knowledge graph reports isolated entities");
assert(graphSource.includes('kind: "operates"'), "company-to-factory relationships use a specific operation verb");

const contentFactorySource = readFileSync(join(projectRoot, "lib", "content-factory.ts"), "utf8");
assert(!contentFactorySource.includes("Problemi ölçülebilir bir kullanıcı ihtiyacı olarak tanımlayın"), "legacy adapters do not inject generic editorial takeaways");

const packageJson = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8"));
assert(packageJson.packageManager === "pnpm@11.15.1", "package manager version is reproducible");
assert(packageJson.scripts.quality.includes("report:gaps:check"), "quality gate rejects stale content-gap reports");
assert(packageJson.scripts.quality.includes("report:ecosystem:check"), "quality gate rejects stale ecosystem reports");
assert(packageJson.devDependencies.tsx, "editorial reporting runtime is an explicit development dependency");
const workspacePolicy = readFileSync(join(projectRoot, "pnpm-workspace.yaml"), "utf8");
assert(/esbuild:\s*true/.test(workspacePolicy), "report compiler build script is explicitly allowlisted");
const qualityWorkflow = readFileSync(join(projectRoot, ".github", "workflows", "quality.yml"), "utf8");
assert(qualityWorkflow.includes("pnpm install --frozen-lockfile"), "CI installs the exact dependency lock");
assert(qualityWorkflow.includes("pnpm quality"), "CI runs the complete repository quality gate");
assert(!/\bdeploy\b/i.test(qualityWorkflow), "CI does not imply an unapproved deployment target");
assert(existsSync(join(projectRoot, ".github", "pull_request_template.md")), "pull requests use the repository trust and operations checklist");

const contentGapReport = JSON.parse(readFileSync(join(projectRoot, "reports", "content-gap-report.json"), "utf8"));
assert(contentGapReport.methodology === "repository_coverage_only", "content-gap ranking identifies its repository-only methodology");
assert(contentGapReport.opportunityCount >= 100, "repository has enough measured coverage gaps for a Top 100 opportunity report");
assert(contentGapReport.missingEntityRequirementCount >= 100, "repository has enough measured entity requirements for a Top 100 report");
assert(contentGapReport.topOpportunities.length === 100, "content-gap report contains exactly 100 ranked opportunities");
assert(contentGapReport.topMissingEntities.length === 100, "content-gap report contains exactly 100 ranked entity requirements");
assert(contentGapReport.topOpportunities.every((item) => item.demandStatus === "not_validated"), "coverage opportunities never imply unverified search demand");
assert(contentGapReport.topMissingEntities.every((item) => item.status === "coverage_requirement"), "missing entities are labelled as requirements rather than invented records");
assert(new Set(contentGapReport.topOpportunities.map((item) => item.id)).size === 100, "Top 100 opportunity IDs are unique");
assert(new Set(contentGapReport.topMissingEntities.map((item) => item.id)).size === 100, "Top 100 entity requirement IDs are unique");

const ecosystemReport = JSON.parse(readFileSync(join(projectRoot, "reports", "ecosystem-completion-report.json"), "utf8"));
assert(ecosystemReport.counts.personas === 13, "ecosystem audit covers all 13 requested personas");
assert(ecosystemReport.top100MissingFeatures.length === 100, "ecosystem report contains exactly 100 ranked missing capabilities");
assert(ecosystemReport.top50OfficialSources.length === 50, "ecosystem report contains exactly 50 official source entry points");
assert(ecosystemReport.top25AICapabilities.length === 25, "ecosystem report contains exactly 25 shared AI capabilities");
assert(new Set(ecosystemReport.top100MissingFeatures.map((item) => item.id)).size === 100, "Top 100 ecosystem gap IDs are unique");
assert(new Set(ecosystemReport.top50OfficialSources.map((item) => item.id)).size === 50, "official source registry IDs are unique");
assert(ecosystemReport.aiProducts.filter((item) => item.status === "candidate").every((item) => !item.route), "candidate AI products expose no public routes");
assert(ecosystemReport.aiProducts.some((item) => item.id === "hibe-ai" && item.status === "consolidate"), "HibeAI is consolidated instead of duplicating TeşvikAI");

const nextConfig = readFileSync(join(projectRoot, "next.config.ts"), "utf8");
for (const header of ["Strict-Transport-Security", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Cross-Origin-Opener-Policy"]) {
  assert(nextConfig.includes(header), `production security header configured: ${header}`);
}

const documentationFiles = [
  join(projectRoot, "README.md"),
  ...readdirSync(join(projectRoot, "docs"), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(projectRoot, "docs", entry.name)),
];
for (const file of documentationFiles) {
  const markdown = readFileSync(file, "utf8");
  const localLinks = [...markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map((match) => match[1])
    .filter((target) => !/^(?:https?:|mailto:|#)/i.test(target))
    .map((target) => decodeURIComponent(target.split("#")[0].split("?")[0]));
  for (const target of localLinks) {
    assert(existsSync(resolve(file, "..", target)), `documentation link resolves: ${relative(projectRoot, file)} -> ${target}`);
  }
}

if (failures.length) {
  console.error(`Search foundation validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Search foundation validation passed: ${checks.length} checks across ${allHtml.length} static HTML files.`);
console.log(`Approved sitemap URLs: ${sitemapUrls.length}; noindex pages inspected: ${noindexPages.length}; RSS items: ${feedLinks.length}.`);
