# Content Growth Engine

## Purpose

Uretir grows by completing authoritative knowledge destinations, not by manufacturing URLs. The content growth engine converts repository evidence into reviewable editorial work while keeping search demand, real-world facts, and editorial approval as separate gates.

The implementation is split across:

- `lib/content-templates.ts`: reusable reference-content families;
- `lib/editorial-workflow.ts`: accountable review stages;
- `lib/content-gap.ts`: repository coverage comparison and ranking;
- `lib/trend-discovery.ts`: provider-neutral verified-signal intake;
- `scripts/report-content-gaps.ts`: deterministic editorial report generation.

## Reusable content families

The registry supports twelve governed families:

| Family | Primary entities | Typical cluster |
| --- | --- | --- |
| Article | article | manufacturing, product, technology, standard |
| Guide | guide | manufacturing, technology, standard |
| Company profile | company | company |
| Technology profile | technology | technology |
| Machine profile | machine | industrial equipment |
| Raw-material profile | raw material | product, manufacturing, supply chain |
| Factory profile | factory | factory |
| Industry profile | industry | manufacturing, investment, export |
| Government program | program or incentive | government program |
| Investment guide | guide or program | investment |
| Export guide | guide | export |
| AI guide | guide or AI product | artificial intelligence |

Each definition owns compatible intents, required content blocks, entity coverage, cluster families, and a default review cadence. Definitions do not create routes or content. A future CMS chooses a family and must still provide evidence, original value, a canonical purpose, and full authority review.

## Editorial workflow

Every approved revision passes these stages in order:

1. source review;
2. entity review;
3. editorial review;
4. SEO review;
5. knowledge-graph review;
6. publication review;
7. update review.

The first six stages require an attributable approval before publication. Update review must be completed or scheduled with a due date. A decision records the content ID, revision ID, status, reviewer, decision date, due date when applicable, and a concise note. Legacy drafts may lack this record; approved and published content may not.

## Content-gap methodology

The gap engine compares the current direct neighborhood of each unambiguous cluster hub with the governed topic-cluster blueprint. It detects:

- missing required entity kinds;
- missing relationship kinds;
- absence of an owning `ContentDocument`;
- authority blockers in the owning document;
- absence of an approved canonical path.

Multi-purpose records such as generic guides, industries, and categories are not assigned to a cluster without explicit ownership evidence. Product guides may use their governed AI-hub family as an interim classification. Merely linking to an entity does not make a document the owner of that entity's canonical intent.

The priority score measures repository completeness opportunity only. It is not keyword volume, traffic potential, commercial value, or proof that a real-world entity exists or does not exist.

## Current measured snapshot

The [human-readable generated report](../reports/content-gap-report.md) and its JSON companion currently record:

- 156 graph entities;
- 220 directional relationships;
- 23 reviewed content documents;
- 0 authority-ready documents;
- 112 repository-derived cluster opportunities;
- 327 missing entity-kind requirements;
- the first 100 opportunities and first 100 entity requirements as a stable ranked output.

The highest-ranked repository-completeness candidate is the UretirAI artificial-intelligence cluster. This does not establish it as the highest-traffic topic. That decision remains blocked until first-party or verified demand signals exist.

## Trend intelligence

Connectors may later consume Search Console, search-interest, official statistics, government announcements, technology news, and industry news. Every ingested signal requires a provider record ID, provenance URL, observation and retrieval timestamps, source identity, window, and verification state.

A trend opportunity still requires two verified signals from different source kinds and one first-party or official source. Technology or industry news can provide context but cannot independently authorize a page. No connector publishes or creates a draft automatically.

## From gap to publication

```text
Repository coverage gap
  -> demand validation
  -> canonical overlap check
  -> source plan
  -> entity and cluster brief
  -> expert draft
  -> seven-stage workflow
  -> authority gate
  -> publication
  -> observation
  -> update, consolidate, redirect, or retire
```

A failed demand check closes or parks the opportunity. It does not lower the publication standard.

## Scale to one million records

At large scale:

- compute gaps in partitioned cluster snapshots rather than loading the full graph into a request;
- keep CMS, graph, search, analytics, and trend systems behind adapters;
- use stable IDs and revision-aware events;
- materialize relationship coverage and intent coverage as rebuildable projections;
- rank work asynchronously and version the ranking algorithm;
- keep demand evidence and editorial approval immutable and auditable;
- publish through the same fail-closed authority contract.

The generated report is an operational artifact, not a public page. Search indexes and AI retrieval systems consume only approved public records.
