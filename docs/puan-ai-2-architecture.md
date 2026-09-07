# PuanAI 2.0 architecture

## Trust boundary

The LLM is an explanation layer. Prices, rewards, dates, eligibility, effective cost and score are produced by deterministic services. Missing or unverifiable evidence produces `UNVERIFIED` or `SOURCE_UNAVAILABLE`; it never produces a numeric advantage.

## Request flow

`User query -> intent extraction -> source plan -> source verification -> normalization -> campaign matching -> benefit calculation -> scoring -> grounded explanation`

## WhatsApp campaign intake

WhatsApp is an evidence-discovery channel, not an authority source. Meta Cloud API can send signed webhooks to `/api/puan-ai/whatsapp/webhook`; a custom agent can send the provider-neutral contract to `/api/puan-ai/intake` with a bearer token. Both paths persist an idempotent `CampaignSubmission` record.

`WhatsApp message -> signature/authentication -> deduplication -> URL extraction -> source fetch -> expiry/date check -> structured draft -> admin review -> campaign verification -> eligibility engine`

- A post without an HTTPS source is `URL_REQUIRED`.
- An unreachable source is `SOURCE_UNAVAILABLE` and is retried with a bounded attempt count.
- An expired source is `EXPIRED`.
- A reachable page with incomplete card, amount, or validity evidence is `NEEDS_REVIEW`.
- Even a `VERIFIED` submission is only a source-backed draft. It never creates or publishes a campaign automatically.
- Existing published campaigns still require matching source fingerprints and a fresh verification log before they can enter a decision.

The scheduled intake processor runs every six hours through both the Vercel cron endpoint and the GitHub maintenance workflow. The endpoint requires `CRON_SECRET`. This redundancy is intentional; all operations are idempotent.

## Domain boundaries

- `Bank`, `CardProgram`, `Card` and `Campaign` are separate entities.
- `OfficialSource` records provenance, validity, trust, health and verification time.
- `PriceObservation` is append-only evidence for a product/merchant price; no price is inferred when this evidence is absent.
- `CampaignConflict` makes disagreements explicit and records the preferred source without deleting conflicting evidence.
- `ScoringConfiguration` stores versioned, admin-editable weights. Positive weights must total 100.

## Production jobs

- Every 6 hours: verify active campaigns and critical price observations.
- Every 24 hours: discover campaign pages from approved official source adapters.
- Daily: run `pnpm puanai:maintenance` for expiration and stale-verification enforcement.
- Daily: source health checks with robots.txt, terms, per-host rate limits, conditional requests and exponential backoff.

Schedulers are deployment concerns and must call these idempotent jobs. No scheduler is simulated inside the web process.

## Current live-source check — 6 September 2026

Official Bankkart pages were reachable and exposed current September campaigns, including the electronics campaign ending 30 September 2026 and the Monster campaign ending 10 September 2026. These observations were used only to exercise the verification path; they are not inserted by a seed. A production ingest must fetch and fingerprint each page at runtime before publishing it.

## Known boundaries

- Price observations require merchant-specific adapters or authorized APIs.
- A campaign with missing dates remains unverified.
- Price-history decisions (`BUY NOW` / `WAIT`) stay disabled until sufficient real observations exist.
- Authentication currently protects admin data management; anonymous conversations use a scoped client cookie and never request payment credentials.
- WhatsApp messages are stored only for campaign operations. Sender identifiers are optional and must not be used for marketing or profiling without a separate consent and retention decision.
