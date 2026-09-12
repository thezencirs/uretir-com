# Architecture

## Current state

Uretir.com is a Next.js App Router application written in TypeScript. It uses Tailwind CSS for utility styling, Lucide for icons, and static or file-backed editorial data in `lib/`. PuanAI is the first durable application service: PostgreSQL and Prisma own campaign and conversation records, Next.js Route Handlers expose validated APIs, and the OpenAI Responses API explains only rule-engine-approved results. The interactive Uretir ID prototype remains local-review only. The repository does not yet have an external identity provider, CMS, queue, analytics provider, or operated production data platform.

This is intentional documentation of the present state; do not treat prototype client state as persistent product behavior.

## Repository map

| Area | Responsibility |
| --- | --- |
| `app/` | Routes, metadata, layouts, server-rendered pages, route-level composition |
| `components/` | Reusable visual and interactive UI components |
| `lib/` | Domain models, content data, routing helpers, SEO, structured data, product-specific logic |
| `prisma/` | PuanAI schema, migrations, official-source seed records, and database history model |
| `app/api/puan-ai/` | Validated chat, campaign search, history, session, and administration Route Handlers |
| `tests/` | Unit and integration coverage for intent, safety, ranking, and grounded explanation |
| `public/` | Static assets only |
| `docs/` | Product and engineering operating system |
| `.github/` | Pull-request review contract and repository quality automation |

## Request and rendering model

Use Server Components by default. Introduce a Client Component only when browser state, event handling, or client-only APIs are necessary. Keep interactive islands narrow so content-heavy pages remain fast and indexable.

Each public route should own its metadata and canonical intent. Shared site concerns belong in the root layout and reusable libraries, not duplicated page-by-page.

Product measurement follows the same boundary. Components declare typed, non-personal event intent through `lib/analytics.ts`; a small browser bridge emits local custom events without persistence or network delivery. A future consent-aware provider must be implemented as an adapter to that channel rather than imported throughout product components.

## Domain boundaries

The application should evolve into explicit services behind stable interfaces:

```text
Presentation (Next.js routes and components)
        |
Application services (content, profiles, following, bookmarks, notifications)
        |
Domain models and policies
        |
Adapters (database, CMS, auth providers, search, AI providers, analytics)
```

Routes and components must depend on application interfaces, not database queries or a specific vendor SDK. Adapters may change without forcing a product rewrite.

## Target platform boundaries

| Capability | Owning service | Primary data |
| --- | --- | --- |
| Uretir ID | Identity and profile service | account, session, profile, consent |
| Community | Social graph service | follow edges, verification, badges, contribution events |
| Personalization | Preference service | interests, follows, explicit settings, safe behavioral signals |
| Knowledge graph | Content and entity service | articles, companies, products, industries, factories, cities, technologies, machines, materials, AI tools, sources, typed relations |
| Discovery | Search service | indexed public entities, saved searches, ranking signals |
| Engagement | Notification service | subscriptions, preferences, delivery events |
| AI products | AI orchestration service | product-scoped conversations, retrieval context, audit metadata |
| PuanAI campaigns | Campaign verification service | banks, cards, merchants, rules, sources, checks, revisions, conversations |
| Measurement | Analytics adapter | allowlisted product events, consent state, release context |

The editorial publishing contract in `lib/editorial-engine.ts` is the bridge between the knowledge graph and future CMS or database adapters. `lib/content-authority.ts` adds the article-anatomy, search-intent, relationship, official-source, discovery, and topic-cluster checks required before publication. `lib/topic-clusters.ts` defines reusable authority families without creating pages. Hub guides use an adapter to enter the same `ContentDocument` contract; route families may no longer define weaker local publication rules.

PuanAI follows a separate runtime boundary: `catalog-service.ts` loads normalized records, `rule-engine.ts` rejects unverified, stale, inactive, out-of-date, or ineligible campaigns, and `ai-service.ts` receives only the surviving compact campaign payload. The model never queries or replaces the database. Mutating verified campaign terms, rules, installments, or card scope automatically unpublishes the campaign until a new source verification is recorded.

Growth operations remain outside presentation code. `lib/content-templates.ts` governs reference families, `lib/editorial-workflow.ts` governs revision approvals, and `lib/content-gap.ts` computes repository-only coverage opportunities. Trend demand enters through provider-neutral ingestion batches and a separate evidence gate. None of these modules can create or publish a route automatically.

## Data and API rules

- Every persistent entity has a stable opaque ID, creation time, update time, and ownership model.
- Public URLs are treated as contracts. Change them only with redirects and a documented reason.
- APIs must version deliberately when a breaking change cannot be avoided.
- Authorization is enforced in services, never only by hiding UI controls.
- Store the minimum personal data needed for the stated product purpose.
- Events that affect score, badges, notifications, or recommendations must be idempotent and auditable.
- Entity aliases, canonical slugs, relationship sources, and review dates are first-class data. They may not be reconstructed only from page copy.

## Architectural quality gates

Before introducing a dependency or data store, document: ownership, failure mode, retention, privacy impact, cost model, rollback path, and observability. Record irreversible choices in the decision log.

The current integration boundary and the required CMS, search, migration, release, rollback, logging, and monitoring behavior are governed by [Production operations](./production-operations.md).

## Site editorial desk (11 September 2026)

The internal /yonetici editor now stores navigation labels, homepage copy and sourced developments in PostgreSQL. See [site-editor.md](./site-editor.md) for draft, publication, restoration and setup contracts. The shared PuanAI administrator session protects all mutations. This is a small internal CMS, not an external CMS integration.
