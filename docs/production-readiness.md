# Production Readiness

## Production contract

Uretir production output must be safer than local editorial development. A route being implemented or statically modelled does not make its content public.

A reference document is publicly visible only when `isIndexableReference()` confirms all three conditions:

1. The document status is `published`.
2. The accountable editorial record is complete.
3. The content-authority audit has no blocking issue.

Local development may render review records so editors can inspect readiness notices. Production builds exclude those records from generated HTML, public lists, recommendations, category archives, RSS, and the sitemap. File-backed dynamic routes reject unknown or unapproved parameters with a hard HTTP 404 rather than a streamed 200 response containing a not-found view. `URETIR_EDITORIAL_PREVIEW=false` can also disable local preview. The preview flag must never be used to bypass publication review in production.

The current Next.js 15.5 Node server can write an internal `NoFallbackError` line when `dynamicParams = false` rejects an unknown parameter even though the HTTP response is the intended 404. Keep the hard 404: on-demand dynamic parameters use streaming, where `notFound()` can return HTTP 200. Alerting must distinguish expected 404 traffic from application failures, and this framework behavior must be retested on every Next.js upgrade.

## Product data states

Product interfaces use four explicit states:

| State | Meaning | Production rule |
| --- | --- | --- |
| `verified` | Source and freshness evidence are complete | May be shown as verified |
| `estimated` | A calculation or provider record is incomplete | Must disclose uncertainty |
| `sample` | A hypothetical interaction example | Must not use real campaign claims |
| `future_integration` | No operational data connection exists | Must not imply availability |

PuanAI verified records require a source URL, retrieval timestamp, and verification timestamp. A provider record marked verified without this evidence is downgraded before rendering. Current PuanAI records are generic decision scenarios and do not identify a real bank, card, merchant, price, validity date, or campaign.

## Data collection

The contact and newsletter surfaces do not have server-side delivery integrations. They therefore do not render forms that appear to submit or store personal data:

- Contact uses a transparent `mailto:` route.
- Newsletter provides RSS until a consent-aware subscription provider is connected.
- Uretir ID remains a noindex interaction prototype and states that it creates no account and stores no personal data. Production navigation does not promote the prototype.

Instrumented interactions emit provider-neutral browser events only. The bridge reads no form value, writes no browser storage, and makes no network request. This is an integration seam, not active analytics collection.

Before enabling any data collection, document the controller, purpose, retention period, consent model, deletion flow, security owner, incident path, and privacy-policy change.

## Security baseline

The application configures:

- HTTPS strict transport security
- MIME sniffing protection
- same-origin framing and opener isolation
- strict origin referrer behavior
- restrictive browser permissions for camera, microphone, and location
- same-site resource isolation

A nonce-based Content Security Policy remains required before authentication, third-party scripts, or payment-adjacent integrations are introduced.

## Release verification

Every production candidate must pass:

```bash
pnpm quality
```

The command checks lint, production dependency advisories, TypeScript through the production build, generated routes, titles and descriptions, self-referential canonical URLs, Open Graph alignment, 404 metadata isolation, robots, sitemap, RSS, parseable structured data, authored landmarks and IDs, internal routes and anchors, draft exclusion, PuanAI sample safety, the non-persistent measurement contract, knowledge-graph integrity, security-header configuration, and documentation links.

The pinned production baseline uses Next.js `15.5.21` or newer in the 15.x line. Workspace overrides keep Sharp and PostCSS on patched versions required by the production audit; remove an override only after the parent dependency resolves to an equally safe version.

Manual browser QA must cover:

- desktop and mobile overflow
- light and dark themes
- keyboard navigation and focus visibility
- loading, empty, not-found, and error states
- PuanAI trust labels and scenario interaction
- absence of console errors or hydration warnings

## Known release blockers

The application has an approved Vercel production target, GitHub-connected deployment path, custom domain, and deployment rollback control. Operational readiness still requires uptime monitoring, error tracking, privacy-aware analytics, Core Web Vitals monitoring, named incident ownership, and a rehearsed database-aware rollback procedure.
