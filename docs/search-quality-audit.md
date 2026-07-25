# Search Quality Audit — 2026-07-25

## Scope

This audit covers the App Router routes, metadata, crawl controls, sitemaps, structured data, RSS, navigation, editorial components, content models, knowledge graph, AI hubs, error states, accessibility, and build-time performance of Uretir.com.

Scores are repository-readiness assessments, not Lighthouse field measurements or Search Console results. They must not be presented as real-user Core Web Vitals.

## Scorecard

| Area | Score | Evidence |
| --- | ---: | --- |
| SEO foundation | 88/100 | Canonicals, unique route metadata, robots controls, dynamic sitemap filtering, RSS, redirects, Open Graph, Twitter metadata, and publication-gated structured data are implemented. |
| Performance readiness | 89/100 | Pages are predominantly Server Components and statically generated; client code is limited to interaction surfaces. No heavy image inventory or third-party scripts are present. |
| Accessibility | 87/100 | Skip link, semantic regions, labelled navigation, keyboard focus, reduced motion, disclosure components, loading status, and accessible error paths exist. |
| Content quality | 66/100 | Hub guides have strong question-led structures, sources, FAQ, risks, and next paths. Legacy articles and company records still require complete source review. |
| Knowledge graph | 78/100 | Typed entities and evidence-aware relationships cover guides, AI products, institutions, people, companies, factories, standards, incentives, technologies, and other target entities. Coverage is still narrow. |
| Editorial system | 84/100 | Publication status, source records, review ownership, next-review dates, change logs, and noindex/schema gates are enforceable. Human review has not yet cleared a reference cluster. |
| Internal linking | 85/100 | Hubs and guides expose contextual paths and graph relationships. Legacy article-to-entity recommendations remain category/tag-heavy. |
| Trust | 92/100 | Sample, future, in-review, and verified states are separated. Drafts do not enter the sitemap or emit rich-result schemas. Trend and person systems refuse unsupported publication. |

## Completed improvements

### Crawl and index control

- Removed the `/_next/` robots exclusion so crawlers can render required CSS and JavaScript.
- Kept private API surfaces and the Uretir ID prototype out of crawl paths.
- Added route-level `noindex, follow` to unfinished products, review content, internal searches, prototypes, and the startup vision page.
- Limited the sitemap to routes and records eligible for indexing.
- Added archive URLs only when at least one approved child record exists.
- Updated sitemap modification dates without pretending drafts are published.

### Metadata and structured data

- Preserved a canonical URL for every public route.
- Removed an unverified organization founding date.
- Prevented draft guides and articles from publishing article dates in Open Graph.
- Prevented noindex category and company archives from emitting rich-result-oriented JSON-LD.
- Changed editorial article authorship to `Organization` by default; `Person` requires a real attributable author.
- Kept Article, FAQ, Organization, Offer, and Person schemas behind publication-readiness gates.
- Added site-specific RSS discovery metadata.

### Discovery infrastructure

- Added an RSS 2.0 feed that includes only approved, indexable articles.
- Added permanent redirects for common AI product URL variants.
- Added a source-aware trend discovery contract.
- Added an InsanAI profile contract that requires independent sources and human review.
- Expanded the knowledge graph vocabulary to the full entity set required by the product vision.

### Experience and resilience

- Added custom 404, route error, global error, and loading experiences.
- Added safe response headers for content type, framing, referrer behavior, and unused device permissions.
- Added reusable article blocks for summaries, examples, advantages and limitations, editor notes, and entity links.
- Added a build-output validation command for robots, sitemap, RSS, noindex, structured data, and review-page claim leakage.

## Indexability policy

A URL is indexable only when:

1. it returns a successful canonical response;
2. it has a unique purpose and user question;
3. its evidence and review record are complete;
4. it does not duplicate a stronger canonical page;
5. it is not a prototype, internal search, sample record, or unfinished product;
6. the visible content and structured data describe the same verified subject.

`noindex` pages remain crawlable when their links help discovery. Robots.txt is not used as a substitute for page-level indexing controls.

## Sitemap scale plan

The current single sitemap is appropriate for the small approved inventory. Before a section approaches 40,000 indexable URLs:

1. partition records by stable section (`articles`, `companies`, `guides`, `people`, `entities`);
2. use Next.js `generateSitemaps`;
3. keep each shard below 45,000 URLs to preserve operational headroom below the protocol limit;
4. generate only canonical, approved records;
5. expose a sitemap index and monitor submitted-versus-indexed counts by section.

Reference: [Next.js `generateSitemaps`](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps).

## Search Console readiness

The codebase is ready for a site-level Search Console property, but no verification token or live property is assumed.

Launch checklist:

1. verify the canonical HTTPS domain;
2. submit `/sitemap.xml`;
3. inspect the home page, PuanAI, and the first approved reference cluster;
4. confirm rendered HTML, canonical, robots, and structured data;
5. monitor Page indexing, Core Web Vitals, HTTPS, manual actions, and rich-result reports;
6. connect read-only performance data to the Trend Discovery Center;
7. never use query data to auto-publish pages.

## Remaining weaknesses

### High priority

- No article, guide, company, or person cluster has completed accountable human review.
- Legacy company records include detailed claims that must be verified against exact official documents before publication.
- Legacy article authors and body copy are review fixtures, not publishable expert content.
- Some hub guides link to institution home pages rather than the exact governing document.
- Search Console, analytics, and real-user Core Web Vitals are not connected.

### Medium priority

- Article recommendations primarily use categories and tags rather than the full entity graph.
- Hub metadata wrappers repeat small amounts of route configuration.
- Search foundation output now has a build-time validator; metadata unit tests, browser-level accessibility checks, and CI enforcement are still missing.
- Content records live in TypeScript rather than a revisioned editorial store.
- `app/globals.css` is large and should be split by product surface when ownership expands.

### Low priority

- Social previews use one site-level visual rather than article-specific verified imagery.
- RSS is intentionally empty until the first article passes publication review.
- Sitemap sharding is documented but not activated because the approved inventory does not justify it.

## Core Web Vitals readiness

Repository review indicates:

- LCP risk is low on text-led server-rendered pages; no large hero image blocks initial rendering.
- CLS risk is low because major visual regions have explicit dimensions or stable CSS layout.
- INP risk is concentrated in PuanAI and Uretir ID client interactions; they should receive field monitoring after deployment.

These are engineering assessments only. Real scores require production RUM or a controlled Lighthouse run against the deployed build.

## Highest-impact next sprint

Publish one complete, evidence-backed manufacturing cluster:

1. select three closely related high-intent questions;
2. gather exact primary sources and official documents;
3. resolve canonical entities and relationships;
4. complete subject and source reviews;
5. add change and next-review records;
6. publish the cluster with Article, FAQ, and breadcrumb schemas;
7. submit and inspect the URLs in Search Console;
8. measure entrances, continuation clicks, source usage, and return visits for at least one review cycle.
