# Uretir.com

Uretir is a knowledge, community, and AI product ecosystem for people and organizations that make things. The repository contains the public Next.js application and its operating documentation.

## Start here

Read the [Uretir Operating System](./docs/README.md) before making non-trivial product or engineering changes. It documents the vision, architecture, design principles, content and SEO systems, community model, AI product direction, roadmap, deployment posture, and contribution process.

## Stack

- Next.js App Router and React
- TypeScript with strict checking
- Tailwind CSS
- Lucide icons
- Route-level metadata, JSON-LD, sitemap, robots, and Open Graph generation

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Validation

```bash
pnpm lint
pnpm build
pnpm validate:search
```

Run `pnpm quality` to execute the complete sequence.

## Repository map

| Directory | Purpose |
| --- | --- |
| `app/` | Routes, layouts, metadata, and page composition |
| `components/` | Reusable interface components |
| `lib/` | Domain models, content, SEO, and product logic |
| `docs/` | The operating system and contributor source of truth |
| `public/` | Static public assets |
| `scripts/` | Build-output and repository quality checks |

## Current product scope

The application includes authority-gated editorial, category and company architecture, claim-free PuanAI decision scenarios, and a provider-neutral, non-persistent measurement contract. An interactive Uretir ID product prototype remains available for local review but is not promoted by production navigation. Production builds exclude unapproved reference records; local development keeps them available for editorial review. Persistent identity, community, live campaign, analytics provider, and AI backend services are planned capabilities; see [architecture.md](./docs/architecture.md), [measurement-system.md](./docs/measurement-system.md), [production-readiness.md](./docs/production-readiness.md), and [roadmap.md](./docs/roadmap.md) for current boundaries.
