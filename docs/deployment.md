# Deployment and Operations

## Current deployment posture

The repository contains a Next.js application but does not yet document a production hosting provider, deployment pipeline, secret store, monitoring stack, or rollback mechanism. Treat production deployment as an explicit engineering responsibility, not an implicit result of `git push`.

## Required environments

| Environment | Purpose | Data policy |
| --- | --- | --- |
| Local | Development and fast feedback | synthetic or local-only data |
| Preview | Change review and integration validation | no production secrets or personal data |
| Production | Public user traffic | least-privilege access and audited changes |

## Release checklist

1. Confirm scope, owner, and rollback plan.
2. Run lint, production build, and focused manual checks.
3. Verify metadata, canonical URLs, structured data, redirects, and indexability for public route changes.
4. Verify keyboard, mobile, light/dark, and reduced-motion behavior for UI changes.
5. Verify environment variables are documented and no secret entered source control.
6. Deploy through the approved pipeline.
7. Check error monitoring, key route availability, performance, and search-facing output after release.
8. Record notable incidents or reversals in the decision log.

## Secrets and configuration

Keep secrets in the deployment platform's encrypted environment store. Document each variable's purpose, owner, environment scope, rotation expectation, and whether it is safe for client exposure. `NEXT_PUBLIC_*` variables are public by design and must contain no secret.

## Observability target

Before member data or AI products launch, add:

- Error tracking with release identifiers.
- Uptime checks for critical public and authenticated routes.
- Privacy-aware analytics for activation and retention.
- Core Web Vitals monitoring by template.
- Structured logs for authentication, notification, and AI-provider failures.
- Alert ownership and an incident response runbook.

## Rollback

Every production release must be reversible. Prefer immutable releases, database migrations that can roll forward safely, feature flags for risky capability changes, and versioned APIs. Never deploy destructive schema or data changes without a tested backup and restoration plan.
