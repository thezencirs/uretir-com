# Production Operations

## Current truth

The repository has a reproducible pull-request quality gate: Node.js 22, pnpm 11.15.1, locked dependency installation, linting, production dependency audit, production build, and search-foundation validation. It does not have continuous deployment, a selected hosting provider, production monitoring, a secret store, or an operated data platform. Passing CI is evidence of repository integrity, not permission to send production traffic.

## Environment contract

| Environment | Purpose | Allowed data | Promotion authority |
| --- | --- | --- | --- |
| Local | implementation and editorial review | synthetic, public-source, or local-only records | contributor |
| Preview | integrated review and release rehearsal | no production secrets or personal data | reviewer |
| Production | public, durable service | approved least-privilege data only | named release owner |

Builds must be immutable and identify the source revision. Preview and production use the same build inputs except for environment-bound configuration. A change may not rely on a developer workstation, an undocumented variable, or a post-build file edit.

## Continuous integration

`.github/workflows/quality.yml` runs on every pull request and every push to `main`. The mandatory command is `pnpm quality`. Branch protection should require this job and at least one accountable review before merge.

CI does not publish content or deploy an environment. A content record still needs source, subject, SEO, and editorial authority. A green workflow cannot override the domain publication gate.

## Continuous delivery boundary

Do not add an automated production deployment until these decisions are recorded:

- hosting and region;
- release and rollback owners;
- secret and configuration store;
- preview isolation;
- observability and paging providers;
- database and search-index topology;
- privacy, retention, backup, and restoration policy.

The eventual pipeline should promote one tested artifact from preview to production, require an explicit production approval, run route and dependency checks before promotion, and execute post-deploy smoke checks. It must never rebuild a different artifact during promotion.

## Rollback

Rollback triggers include critical-route failure, incorrect indexability or canonical output, elevated server errors, broken authentication, corrupted search results, data-integrity risk, or a material Core Web Vitals regression.

The release owner should:

1. stop further promotion and identify the release ID;
2. route traffic to the last known-good immutable artifact;
3. disable a risky capability through an approved server-side flag when rollback alone is insufficient;
4. verify critical routes, metadata, search, and error rates;
5. preserve logs and record the incident;
6. repair forward only after the immediate risk is contained.

Application rollback and data rollback are separate decisions. Destructive database changes require a tested backup, restoration evidence, and a forward-compatible transition before release.

## Observability

Production requires four complementary signals:

- availability: synthetic checks for the homepage, search, AI hubs, canonical content, sitemap, robots, and a hard 404;
- errors: release-aware server and browser exceptions with ownership and severity;
- performance: real-user Core Web Vitals by route template, device class, and release;
- product health: privacy-reviewed events for discovery, continuation, return, and AI usefulness.

Logs use structured fields: timestamp, severity, service, environment, release ID, request ID, route template, operation, outcome, duration, and safe error code. Never log prompts, form values, email addresses, tokens, campaign payloads, full URLs with query strings, or other personal or secret values by default. Redaction happens before transport, not only in the dashboard.

Alerts must name an owner, threshold, runbook, and escalation path. Known framework diagnostics may remain searchable without paging when they do not represent user-visible failure.

## Configuration registry

Every environment variable needs a name, purpose, owner, environments, sensitivity, default behavior, and rotation or review date. `URETIR_EDITORIAL_PREVIEW` is the only repository-documented editorial variable: it is server-only, local-review oriented, and cannot bypass production publication authority. No secret belongs in a `NEXT_PUBLIC_*` variable.

## CMS adapter

A future CMS is an authoring interface, not the publication authority. Its adapter must preserve:

- stable document and entity IDs;
- revisions and change notes;
- canonical path ownership;
- source records and claim provenance;
- reviewer identities and review timestamps;
- topic-cluster membership and five-pillar coverage;
- entity relationships;
- editorial status and freshness dates.

Inbound records are validated into `ContentDocument` and `EditorialPublishingRecord`. Invalid or incomplete records fail closed and remain absent from production output. Webhooks enqueue revalidation; they do not directly publish.

## Search infrastructure

The search index is a replaceable projection of approved records. Only public, indexable, authority-ready documents enter it. Each indexed record should include stable ID, canonical URL, title, summary, locale, document kind, intent, entities, cluster, freshness, and trust state.

Use versioned indexes and an alias swap for zero-downtime rebuilds. Validate document count, canonical uniqueness, prohibited drafts, analyzers for Turkish text, representative queries, latency, and rollback before swapping. Query logs require consent and minimization; raw user text must not become content automatically.

## Database migration path

File-backed records remain the reference implementation until an operated database exists. Migrate in stages:

1. define versioned storage schemas from the domain contracts;
2. export and checksum source records;
3. import into a non-production database and compare counts, IDs, relationships, and authority results;
4. run shadow reads and report mismatches without changing user output;
5. rehearse backup, restore, and rollback;
6. switch one bounded content family behind a server-side control;
7. observe, then expand.

Avoid irreversible schema deletion during transition. Search, CMS, and analytics stores do not become sources of truth.

## Release responsibility

| Responsibility | Accountable role |
| --- | --- |
| Code and build integrity | Engineering release owner |
| Claims and source provenance | Editorial and subject reviewer |
| Canonical and indexability output | SEO owner |
| Data migration and restoration | Data owner |
| Monitoring and incident response | Operations owner |
| Privacy and security acceptance | Privacy/security owner |

One person may hold several roles in an early team, but the release record must name the people rather than assume ownership.

## Production readiness gate

Production traffic remains blocked until CI is required, a preview artifact is verified, CD and rollback are rehearsed, monitoring and alerts reach named owners, secret and privacy controls are approved, backups restore successfully, and the first public authority cluster passes editorial review. See [Deployment](./deployment.md) and [Production readiness](./production-readiness.md).
