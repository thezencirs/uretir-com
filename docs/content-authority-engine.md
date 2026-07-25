# Content Authority Engine

## Purpose

The Content Authority Engine is Uretir's enforceable publication standard. It converts editorial ambition into shared types, adapters, validators, trust states, and discovery rules that can operate across tens of thousands of records.

It does not reward page count. It prevents incomplete records from becoming indexable simply because a route exists or a status field changes.

## Runtime architecture

| Layer | Responsibility |
| --- | --- |
| `lib/entity-types.ts` | One canonical entity and relationship vocabulary |
| `lib/search-intent.ts` | Intent taxonomy and required answer coverage |
| `lib/content-model.ts` | Reusable article anatomy and trust states |
| `lib/content-authority.ts` | Authority-readiness audit and publication requirements |
| `lib/editorial-engine.ts` | Sources, documents, reviewers, dates, change log, and uncertainty |
| `lib/hub-guide-document.ts` | Adapter that makes hub guides use the same content contract |
| `lib/publication.ts` | Final indexability gate |
| `lib/content-discovery.ts` | Deduplicated, trust-labelled contextual recommendations |
| `lib/knowledge-graph.ts` | Evidence-aware entity and relationship graph |
| `lib/topic-clusters.ts` | Governed cluster families, membership, ownership, and relationship-coverage checks |

Routes and components may present these records differently, but they may not redefine their own publication standard.

## Required article anatomy

The block model supports:

- concise summary;
- introduction;
- table of contents derived from semantic sections;
- main sections;
- attributable or clearly hypothetical examples;
- advantages and disadvantages;
- use cases;
- FAQ;
- key takeaways;
- related entity groups;
- related guides and AI products;
- source and official-document references;
- editor note and review status;
- publication, update, and reading-time metadata.

Supporting a field is not the same as satisfying it. Empty or generic blocks fail the authority review. Editors must add content because it helps the reader, not because a validator expects a token.

## Search-intent contract

Every document has:

1. one primary intent;
2. optional secondary intents;
3. the exact user question;
4. a decision stage;
5. required answer coverage.

The standard answer vocabulary includes what, why, how, who, where, when, advantages, disadvantages, use cases, examples, FAQ, related topics, sources, and further reading.

Supported intent families include learning, how-to, comparison, general guides, requirements, eligibility, cost, benefits, risks, examples, best practices, industry guides, company profiles, technology guides, investment guides, manufacturing guides, supply chains, exports, and AI.

Minor keyword variants enrich one canonical document. They do not create separate pages.

## Publication gate

A reference document is indexable only when all three conditions pass:

1. the document status is `published`;
2. `EditorialPublishingRecord` passes source, reviewer, freshness, entity, and change-log checks;
3. the authority report has no blocking issue.

The authority report checks:

- article anatomy;
- intent-answer completeness;
- official or primary source coverage;
- accountable human review;
- canonical entity relationships;
- contextual further-reading depth;
- publication and update dates;
- reading time.
- stable topic-cluster membership and the entity coverage required by that cluster family.

Draft and review pages can remain reachable for collaboration. They stay `noindex`, emit no publishable rich-result schema, and display their missing authority controls.

## Trust vocabulary

Content and discovery surfaces use explicit states:

| State | Meaning |
| --- | --- |
| `verified` | Evidence and human review are complete for the stated scope |
| `estimated` | A method-derived estimate, clearly separated from a verified fact |
| `sample` | Structured demonstration data, never a current market claim |
| `coming_soon` | A product or content foundation that is not yet a live service |
| `future_integration` | Architecture prepared for a future verified provider |
| `editorial_review` | A record that must not be treated as published authority |

Do not translate `editorial_review` into weaker language such as “probably correct.” It means publication evidence is incomplete.

## Entity and discovery contract

The shared vocabulary covers companies, products, factories, industries, technologies, machines, raw materials, investment programs, government institutions, AI products, articles, guides, people, standards, cities, universities, brands, incentives, and industrial zones.

Relationships are typed and directional. Duplicate edges are merged deterministically and retain the union of their evidence IDs.

Public recommendations exclude review-only articles, companies, and guides by default. Editorial review surfaces may include them when their status is visible.

Discovery cards always show the destination type and trust state. A recommendation is useful only when it continues the reader's task; mechanical link quotas are prohibited.

## Scale and storage migration

The current file-backed records are suitable for validating contracts, not for operating a large newsroom. The future editorial store must preserve these domain boundaries:

- immutable record ID and revision ID;
- canonical slug and redirect history;
- structured blocks;
- entity IDs and typed relations;
- source snapshots and official document versions;
- reviewer identity and review events;
- publication state and scheduled refresh;
- change log and uncertainty notes.

CMS or database adapters must return the same domain records. Presentation code must not depend on vendor-specific fields.

Cluster membership is a publication contract, not a keyword label. See [Topic cluster operating model](./topic-clusters.md). A future adapter must preserve cluster IDs, primary entities, roles, pillars, owners, review cadence, and cross-cluster links.

## Adding content

1. Define the real question and canonical intent.
2. Search for an existing canonical document.
3. Map required entities and discovery transitions.
4. Create a source plan using official or primary material.
5. Draft the complete article anatomy.
6. Record uncertainty rather than inventing precision.
7. Complete source and subject-matter review.
8. Run the authority report.
9. Verify rendered metadata, schema, sitemap, and links.
10. Publish, observe, refresh, merge, redirect, or retire.
