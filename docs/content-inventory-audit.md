# Content Inventory Audit — Sprint 04

## Scope

The audit covers six legacy articles, twelve hub guides, five company records, five AI hubs, PuanAI sample campaign surfaces, Trend Discovery, InsanAI, taxonomy archives, and their shared navigation and publishing systems.

This is a repository audit. It does not claim production traffic, ranking, accessibility, or Core Web Vitals results.

## Findings by content family

### Legacy articles

Strengths:

- canonical routes, metadata, table of contents, FAQ, related reading, and review notices exist;
- summary and key-takeaway blocks now use the shared article model;
- reading time is derived from structured text rather than trusted as a manually entered claim;
- authority gaps are visible and keep every record out of search.

Weaknesses:

- body copy is generic and not yet reference quality;
- no attributable evidence sources are recorded; former internal-navigation entries were removed from the source field;
- named legacy authors and publication dates remain migration fixtures in source data;
- articles lack attributable examples, balanced advantages and disadvantages, complete intent coverage, official sources, and human review;
- entity relationships are structural starting points, not subject-depth coverage.

Decision: keep all six records `in_review`. Rewrite or retire them one by one; do not bulk-publish.

### Hub guides

Strengths:

- every guide begins with a real question;
- six-answer coverage, practical steps, pitfalls, FAQ, official-source routes, related guides, and related products exist;
- all guides now adapt to the same `ContentDocument` and authority gate as articles;
- changing only `status` can no longer make a guide indexable.

Weaknesses:

- no guide has accountable subject-matter and source reviewers;
- examples, advantages, disadvantages, explicit use cases, and key takeaways need editorial enrichment;
- some sources are institution indexes rather than the exact governing document;
- no guide has completed change-log and next-review requirements.

Decision: use one three-guide cluster as the first complete publication reference.

### Company records

Strengths:

- all five company records are quarantined from indexing and rich-result schema;
- unverified products, capacity, employee, facility, export, certification, and sustainability claims are not rendered on review pages;
- official company websites are presented only as research starting points;
- the graph can model review-only companies, products, factories, brands, industries, and standards without allowing them into public recommendations.

Weaknesses:

- legacy detail fields have no claim-level evidence;
- official home pages are not sufficient for historical, capacity, employment, export, certification, or sustainability claims;
- there is no source snapshot, report year, document version, or claim-to-source map.

Decision: do not publish a company profile until every visible claim has evidence and review ownership.

### AI hubs

Strengths:

- each hub states its user problem, availability, limitations, content library, FAQ, and related products;
- discovery paths are shared and trust-labelled;
- UretirAI exposes graph coverage without presenting review entities as verified national coverage.

Weaknesses:

- UretirAI, TesvikAI, FiyatAI, and IhracatAI remain content foundations rather than live AI products;
- no production retrieval, provider freshness, or answer audit trail exists;
- hub guides have not completed editorial publication.

Decision: keep foundation hubs `noindex` until their first reviewed cluster creates a durable public purpose.

### PuanAI

Strengths:

- recommendation flow, assumptions, limitations, and verification warnings are visible;
- campaign detail pages remain `noindex` and emit no Offer schema in sample mode;
- future live records require campaign-level provenance.

Weaknesses:

- sample records use realistic brands and amounts and therefore require persistent, prominent labelling;
- no bank or provider adapter, freshness service, expiry monitor, or failure-state telemetry exists.

Decision: never convert sample records to `verified` without a source adapter and operational freshness checks.

## Cross-system improvements

- one entity and relationship registry replaced overlapping editorial and graph vocabularies;
- one publication authority gate now protects articles, guides, and company documents;
- duplicate graph edges merge while retaining evidence IDs;
- recommendation cards expose destination type and trust state;
- review pages expose their blocking authority requirements;
- article, guide, and company surfaces use one reusable discovery component;
- nested page-level `main` elements were removed so the root layout owns one consistent landmark;
- build validation covers crawl policy, rich schema, review state, graph integrity, and internal routes.

## Remaining highest-risk gaps

1. No human-reviewed reference cluster is publishable.
2. Legacy article and company claims are not evidence-backed.
3. Editorial records still live in TypeScript rather than a revisioned store.
4. Search Console, analytics, and field performance data are not connected.
5. CI does not yet enforce the quality command.
