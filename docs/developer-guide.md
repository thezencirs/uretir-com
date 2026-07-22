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
pnpm lint
pnpm build
```

The production build is the final TypeScript and route-generation check. Do not rely only on a development server.

## Working conventions

- Use `@/` imports for repository-root modules.
- Prefer named exports for reusable components and domain helpers.
- Keep route composition in `app/`; keep reusable UI in `components/`; keep data and business logic in `lib/`.
- Use TypeScript types to describe domain data. Avoid anonymous object shapes that cross module boundaries.
- Use Server Components by default. Add `"use client"` only at the smallest interactive boundary.
- Do not place secrets, provider tokens, or production credentials in source files or `NEXT_PUBLIC_*` variables.

## Adding a page

1. Define the route and its user intent.
2. Add route-level metadata, canonical behavior, and structured data where relevant.
3. Reuse documented design tokens and interaction patterns.
4. Confirm keyboard access, reduced-motion behavior, responsive layout, and empty/error states.
5. Add the route to the sitemap only when it should be indexed.
6. Update the relevant documentation if the page introduces a new capability or public contract.

## Adding data-backed functionality

Do not couple a component directly to a future vendor SDK. Start with an interface in `lib/` or a service module, then provide a local adapter. This makes the later migration to a database, CMS, or provider intentional and testable.

## Quality checklist

- `pnpm lint` passes.
- `pnpm build` passes.
- No console errors in the changed flow.
- Interactive controls have accessible names and visible focus.
- Public copy is proofread in its published language.
- New images have meaningful alt text or are correctly marked decorative.
- Metadata, sitemap, and internal links match the page's intended indexability.
