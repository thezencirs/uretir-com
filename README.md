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
```

## Repository map

| Directory | Purpose |
| --- | --- |
| `app/` | Routes, layouts, metadata, and page composition |
| `components/` | Reusable interface components |
| `lib/` | Domain models, content, SEO, and product logic |
| `docs/` | The operating system and contributor source of truth |
| `public/` | Static public assets |

## Current product scope

The application currently includes editorial content, category and company surfaces, PuanAI routes, and an interactive Uretir ID product prototype. Persistent identity, community, and AI backend services are planned platform capabilities; see [architecture.md](./docs/architecture.md) and [roadmap.md](./docs/roadmap.md) for their current status and intended boundaries.
