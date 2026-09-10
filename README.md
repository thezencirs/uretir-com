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

The application includes authority-gated editorial, a source-backed Turkish product marketplace, a password-protected marketplace management panel, and PuanAI's deterministic campaign decision engine. Managed web and mobile application records share the existing PostgreSQL/Prisma boundary and appear alongside the reviewed file-backed catalog only after publication. PuanAI persists normalized bank/card/campaign evidence, signed WhatsApp intake, source verification, freshness enforcement, calculation/scoring output, conversations, and automation audit records in PostgreSQL. It fails closed when evidence or runtime configuration is unavailable. An interactive Uretir ID prototype remains local-review only; production builds exclude unapproved editorial records.
