# Architecture

## Current state

Uretir.com is a Next.js App Router application written in TypeScript. It uses Tailwind CSS for utility styling, Lucide for icons, and static or file-backed domain data in `lib/`. The current application is an editorial product with PuanAI routes and an interactive Uretir ID prototype. It does not yet have a production authentication provider, database, CMS, queue, or API boundary.

This is intentional documentation of the present state; do not treat prototype client state as persistent product behavior.

## Repository map

| Area | Responsibility |
| --- | --- |
| `app/` | Routes, metadata, layouts, server-rendered pages, route-level composition |
| `components/` | Reusable visual and interactive UI components |
| `lib/` | Domain models, content data, routing helpers, SEO, structured data, product-specific logic |
| `public/` | Static assets only |
| `docs/` | Product and engineering operating system |

## Request and rendering model

Use Server Components by default. Introduce a Client Component only when browser state, event handling, or client-only APIs are necessary. Keep interactive islands narrow so content-heavy pages remain fast and indexable.

Each public route should own its metadata and canonical intent. Shared site concerns belong in the root layout and reusable libraries, not duplicated page-by-page.

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

The editorial publishing contract in `lib/editorial-engine.ts` is the bridge between the knowledge graph and future CMS or database adapters. It captures evidence, review, media, official documents, and entity relations independently of the current file-backed content source.

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
