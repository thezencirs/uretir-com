# Ecosystem Completion Operating Model

## Purpose

Uretir grows by completing high-value user journeys, not by multiplying routes. A capability is part of the ecosystem only when it has a defined user, measurable outcome, trustworthy data contract, discovery path, operating owner, and failure policy.

The generated [ecosystem completion report](../reports/ecosystem-completion-report.md) is the measurable backlog. It combines persona failures, AI capability dependencies, product prerequisites, and production controls. It does not treat ideas, candidate products, or market demand as implemented facts.

## Completion gate

A product capability may move from candidate to implementation only when:

1. It improves organic discovery, session depth, return behavior, authority, community engagement, or AI usefulness.
2. Its target persona and job are explicit.
3. Existing products cannot deliver the same outcome more coherently.
4. Required sources are available under a documented access and reuse policy.
5. Freshness, contradiction, withdrawal, and provider-outage behavior are defined.
6. Search, knowledge graph, related content, and cross-product handoff are specified.
7. Success and guardrail metrics have named owners.
8. Production monitoring, support, rollback, and data retention are approved.

No candidate AI product receives a public route merely to reserve a name. HibeAI is intentionally consolidated into TeşvikAI because a separate product would duplicate source, eligibility, freshness, and user context.

## Persona audit

The repository maintains thirteen operating personas in `lib/ecosystem-audit.ts`: factory owner, entrepreneur, engineer, architect, investor, farmer, exporter, manufacturer, student, researcher, government-support applicant, SME owner, and AI enthusiast.

Each audit records what the person can and cannot do, why the person would leave, which capability closes the gap, and which metric would show that the gap was genuinely closed. The audit is regenerated with `pnpm report:ecosystem`. Product reviews must use the generated Top 100 rather than a separate feature wish list.

## Search and discovery

`/ara` is the public discovery seam. The repository adapter indexes public AI hubs and discovery centres, and admits guides, articles, and companies only through the publication boundary. Production search must never expose review records.

The `SearchIndexAdapter` contract allows a future external search service without coupling pages to one provider. Any replacement must preserve stable identifiers, publication and trust-state filtering, Turkish normalization, a deterministic fallback, noindex search-result pages, and privacy-reviewed measurement.

## Content discovery engine

Editorial candidates may combine four evidence families:

- first-party demand: Search Console and consent-approved internal-search aggregates;
- official change signals: announcements, programmes, statistics, regulations, and reports;
- knowledge-graph gaps: missing entities and relationships;
- topic-cluster gaps: incomplete five-pillar coverage and weak canonical ownership.

A repository gap is not demand. A trend is not authority. A candidate enters the editorial queue only after the source, demand, duplicate, and human-review gates in `lib/trend-discovery.ts` and `lib/editorial-workflow.ts`.

## AI ecosystem

`lib/ai-product-ecosystem.ts` is the portfolio registry. It records purpose, personas, inputs, outputs, official-source families, graph relationships, search scopes, related content, roadmap, and prerequisites.

`lib/ai-capabilities.ts` is the shared capability backlog. Products reuse citation, freshness, entity resolution, uncertainty, human escalation, and answer-audit capabilities instead of creating product-specific copies.

Status meanings:

- `available_foundation`: a truthful educational or architecture foundation exists; this does not imply live AI.
- `sample_only`: the interaction is testable with explicitly hypothetical data.
- `future_integration`: a public educational foundation exists but data integration does not.
- `candidate`: no public route and no delivery promise.
- `consolidate`: the outcome belongs inside another product.

## Operating rhythm

Weekly, triage source changes, stale records, search failures, editorial blockers, and production incidents. Monthly, regenerate ecosystem and content-gap reports; audit product status, persona failures, citations, internal links, accessibility, and search relevance. Quarterly, recalculate evidence-backed scores; review product consolidation; rehearse source failure and rollback; and review privacy, retention, model risk, and expert ownership.

## Production boundary

The repository remains pre-production until hosting, observability, consent-aware analytics, secrets, backup/restore, incident ownership, and rollback are approved. A green `pnpm quality` run demonstrates repository integrity; it is not production authorization.
