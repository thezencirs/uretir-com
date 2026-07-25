# Developer Guide

## Prerequisites

- Node.js 20 or newer
- pnpm (the repository includes `pnpm-lock.yaml`)
- A modern browser for responsive and accessibility checks

## Local workflow

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Before submitting a change, run:

```bash
pnpm quality
```

The quality command checks lint, production dependencies, generated content-gap freshness, the production build, and search-facing output. The production build is the final TypeScript and route-generation check. Do not rely only on a development server.

Regenerate the repository-derived editorial backlog after graph, template, intent, or content changes:

```bash
pnpm report:gaps
```

The report describes repository coverage only. Never present its priority score as search volume or traffic potential.

Regenerate the ecosystem audit after changing personas, the AI portfolio, AI capabilities, official-source registry, search contract, or roadmap:

```bash
pnpm report:ecosystem
```

The generated report is drift-checked by `pnpm quality`. Candidate products and official portal entries must never be described as live product capability or current programme evidence.

## Working conventions

- Use `@/` imports for repository-root modules.
- Prefer named exports for reusable components and domain helpers.
- Keep route composition in `app/`; keep reusable UI in `components/`; keep data and business logic in `lib/`.
- Use TypeScript types to describe domain data. Avoid anonymous object shapes that cross module boundaries.
- Use Server Components by default. Add `"use client"` only at the smallest interactive boundary.
- Do not place secrets, provider tokens, or production credentials in source files or `NEXT_PUBLIC_*` variables.

## Product measurement

Instrument meaningful interactions with `analyticsAttributes()` from `lib/analytics.ts`; do not add untyped analytics attributes or import a provider SDK into product components. Event names and surfaces are version-controlled contracts.

Targets must be short machine identifiers. Never include search text, AI prompts, email addresses, card information, names, user IDs, query strings, or other user-provided values. The browser bridge emits local events only. Read [the measurement system](./measurement-system.md) before changing event semantics or connecting a provider.

## Adding a page

1. Define the route and its user intent.
2. Add route-level metadata, canonical behavior, and structured data where relevant.
3. For reference content, create or adapt a `ContentDocument` and run the authority and editorial publication gates.
4. Use the canonical entity and relationship vocabulary from `lib/entity-types.ts`.
5. Reuse documented design tokens, discovery components, and interaction patterns.
6. Confirm keyboard access, reduced-motion behavior, responsive layout, and empty/error states.
7. Add the route to the sitemap only when it should be indexed.
8. Update the relevant documentation if the page introduces a new capability or public contract.

## Adding data-backed functionality

Do not couple a component directly to a future vendor SDK. Start with an interface in `lib/` or a service module, then provide a local adapter. This makes the later migration to a database, CMS, or provider intentional and testable.

## Quality checklist

- `pnpm lint` passes.
- `pnpm build` passes.
- `pnpm validate:search` passes after the production build.
- No console errors in the changed flow.
- Interactive controls have accessible names and visible focus.
- Public copy is proofread in its published language.
- New images have meaningful alt text or are correctly marked decorative.
- Metadata, sitemap, and internal links match the page's intended indexability.
