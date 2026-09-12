# Deployment and Operations

## Current deployment posture

The repository has a GitHub Actions quality workflow, but it does not deploy. A production hosting provider, secret store, monitoring stack, operated data platform, and rehearsed rollback mechanism have not been selected. Treat production deployment as an explicit engineering responsibility, not an implicit result of a green build or `git push`. The detailed operating contract is in [Production operations](./production-operations.md).

## Required environments

| Environment | Purpose | Data policy |
| --- | --- | --- |
| Local | Development and fast feedback | synthetic or local-only data |
| Preview | Change review and integration validation | no production secrets or personal data |
| Production | Public user traffic | least-privilege access and audited changes |

## Release checklist

1. Confirm scope, owner, and rollback plan.
2. Require the repository quality workflow and review its lint, dependency audit, production build, and search-foundation results.
3. Verify metadata, canonical URLs, structured data, redirects, and indexability for public route changes.
4. Verify keyboard, mobile, light/dark, and reduced-motion behavior for UI changes.
5. Verify environment variables are documented and no secret entered source control.
6. Deploy through the approved pipeline.
7. Check error monitoring, key route availability, performance, and search-facing output after release.
8. Record notable incidents or reversals in the decision log.

For file-backed dynamic routes, verify both the HTTP status and rendered metadata for an unknown parameter. Next.js 15.5 may write `NoFallbackError` for the intentional hard-404 path; configure monitoring to preserve the log for diagnosis without paging solely on that framework line.

## Secrets and configuration

Keep secrets in the deployment platform's encrypted environment store. Document each variable's purpose, owner, environment scope, rotation expectation, and whether it is safe for client exposure. `NEXT_PUBLIC_*` variables are public by design and must contain no secret.

`URETIR_EDITORIAL_PREVIEW` controls local access to review records. Local development shows reviews unless it is set to `false`; production builds never use it to bypass the publication authority gate. Do not configure it as a public client variable.

Production builds intentionally omit unapproved article, guide, company, and category HTML. A draft must not be made reachable merely to satisfy a launch checklist.

PuanAI requires these server-only variables:

| Variable | Purpose | Failure behavior |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by Prisma's `pg` adapter | Runtime campaign, chat, and admin APIs fail closed |
| `OPENAI_API_KEY` | OpenAI Responses API authentication | Verified results use the deterministic explanation fallback |
| `OPENAI_MODEL` | Optional model override; default `gpt-5.6-sol` | Default is used |
| `PUANAI_ADMIN_PASSWORD` | Administration login secret | Admin login is disabled |
| `PUANAI_SESSION_SECRET` | HMAC signing key for the admin session | Admin login is disabled |

Apply `pnpm db:migrate` before serving a new release and run `pnpm db:seed` only when the reviewed bootstrap campaign records are intended for that environment. `pnpm db:verify` starts an isolated PostgreSQL instance, applies the committed migration, seeds it, checks required table counts, and exercises the verified lookup/exclusion path. Production needs encrypted backups and a tested point-in-time restoration procedure.

## Observability target

The repository contains a typed, provider-neutral interaction event contract. It emits local browser events only; it does not send telemetry or establish a production measurement baseline. Before member data or AI products launch, add:

- Error tracking with release identifiers.
- Uptime checks for critical public and authenticated routes.
- Privacy-aware analytics for activation and retention.
- Core Web Vitals monitoring by template.
- Structured logs for authentication, notification, and AI-provider failures.
- Alert ownership and an incident response runbook.

When the analytics provider is selected, connect it through the local `uretir:analytics` event channel and follow [the measurement system](./measurement-system.md). Do not enable automatic text, form, prompt, or personal-data capture. Provider failure must never block navigation, search, or AI result rendering.

## Rollback

Every production release must be reversible. Prefer immutable releases, database migrations that can roll forward safely, feature flags for risky capability changes, and versioned APIs. Never deploy destructive schema or data changes without a tested backup and restoration plan.

## Current launch boundary

Passing the repository quality command confirms build integrity, not operational readiness. Do not direct real traffic until hosting, rollback, monitoring, alert ownership, privacy review, and post-deploy smoke checks have named owners.
