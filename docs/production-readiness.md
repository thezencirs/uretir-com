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

PuanAI verified records require an active HTTPS official-source URL, retrieval timestamp, source fingerprint, verification timestamp, future next-review time, active related entities, and a current campaign validity interval. The most recent verification fingerprint must match the source fingerprint. Missing, stale, rejected, inactive, future-dated, expired, or mismatched records fail closed and do not reach the language model or interface. Any administrator change to verified campaign terms, rules, installments, or card scope automatically unpublishes the record until it is verified again.

## Data collection

The contact and newsletter surfaces do not have server-side delivery integrations. They therefore do not render forms that appear to submit or store personal data:

- Contact uses a transparent `mailto:` route.
- Newsletter provides RSS until a consent-aware subscription provider is connected.
- Uretir ID remains a noindex interaction prototype and states that it creates no account and stores no personal data. Production navigation does not promote the prototype.

PuanAI stores anonymous conversation text and referenced campaign IDs in PostgreSQL so the user can reopen or delete a conversation. A random HttpOnly, SameSite=Strict cookie scopes history to one browser and contains no bank or account identifier. Prompts are not copied to the provider-neutral analytics channel. When `OPENAI_API_KEY` is configured, the current question and a bounded list of verified campaign facts are sent to OpenAI for explanation; payment credentials and transaction history are neither requested nor accepted as campaign inputs.

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

PuanAI administration uses a server-only password, an HMAC-signed HttpOnly session cookie, same-origin mutation checks, Zod input validation, and noindex metadata. The public assistant does not collect payment credentials. A nonce-based Content Security Policy remains a repository-wide hardening item before adding external identity, payment handling, or additional third-party browser scripts.

## Release verification

Every production candidate must pass:

```bash
pnpm quality
```

The command checks the Prisma schema, lint, unit and integration tests, production dependency advisories, TypeScript through the production build, generated routes, titles and descriptions, self-referential canonical URLs, Open Graph alignment, 404 metadata isolation, robots, sitemap, RSS, parseable structured data, authored landmarks and IDs, internal routes and anchors, draft exclusion, PuanAI's fail-closed verification contract, the privacy-safe measurement contract, knowledge-graph integrity, security-header configuration, and documentation links.

The pinned production baseline uses Next.js `15.5.21` or newer in the 15.x line. Workspace overrides keep Sharp and PostCSS on patched versions required by the production audit; remove an override only after the parent dependency resolves to an equally safe version.

Manual browser QA must cover:

- desktop and mobile overflow
- light and dark themes
- keyboard navigation and focus visibility
- loading, empty, not-found, and error states
- PuanAI chat streaming, search filters, history deletion, official-source links, admin re-verification, and trust labels
- absence of console errors or hydration warnings

## Known release blockers

The repository can produce a safe public build, but an operational launch still requires an approved hosting target, deployment pipeline, rollback mechanism, uptime monitoring, error tracking, privacy-aware analytics, Core Web Vitals monitoring, and named incident ownership.
