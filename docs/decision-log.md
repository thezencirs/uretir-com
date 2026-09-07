# Decision Log

## Purpose

This log preserves the reasoning behind consequential choices. Use it for decisions that affect architecture, data ownership, public URLs, platform dependencies, privacy, deployment, or long-term product behavior.

Do not use it for routine implementation details that are obvious from code. Do use it when a future contributor would reasonably ask, "Why was it done this way?"

## Status values

- Proposed: under review; do not treat as an implementation contract.
- Accepted: approved direction.
- Superseded: replaced by a later decision; keep the original for context.
- Deprecated: still present but should not be extended.

## ADR template

```md
## ADR-YYYY-MM-DD: Short decision title

Status: Proposed | Accepted | Superseded | Deprecated
Owners: Names or team

### Context
What problem, constraint, or opportunity requires a decision?

### Decision
What are we doing?

### Consequences
What becomes easier, harder, riskier, or necessary next?

### Alternatives considered
What was rejected and why?

### Follow-up
What must happen to make this decision safe and complete?
```

## ADR-2026-07-23: Establish repository documentation as the operating system

Status: Accepted
Owners: Product and Engineering

### Context

Uretir has been evolving through direct implementation requests without a durable repository-level explanation of product intent, architecture, quality standards, or decision history. This makes onboarding difficult and risks inconsistent choices as more contributors and AI agents participate.

### Decision

Create and maintain the `/docs` operating system. Documentation defines the current state, target direction, quality principles, contribution process, and major decisions. Changes that affect these areas must update documentation in the same change set.

### Consequences

Contributors spend more time framing non-trivial work, but the project gains continuity, clearer reviews, and lower dependency on individual context. Documentation needs active ownership; stale documents are treated as defects.

### Alternatives considered

Relying on issues, chat history, or a single README was rejected because none provides a coherent, durable source of truth across product, engineering, SEO, design, and operations.

### Follow-up

Review the roadmap monthly, decision log during architecture reviews, and all documents whenever the first persistent backend services are introduced.

## ADR-2026-07-23: Keep the application modular before selecting backend vendors

Status: Accepted
Owners: Engineering

### Context

The current app is a file-backed Next.js product. Uretir ID, community, personalization, search, notifications, and AI products will require persistence and external providers, but committing prematurely to a database, authentication vendor, CMS, or AI stack would create avoidable coupling.

### Decision

Define domain and application-service boundaries before selecting provider adapters. Routes and UI should depend on internal interfaces rather than direct vendor SDK calls whenever a capability is expected to evolve.

### Consequences

The first backend implementation will require interface design, but provider changes and staged migrations remain manageable. Prototype client state must not be confused with production persistence.

### Alternatives considered

Directly embedding vendor calls in routes and components was rejected because it makes data ownership, testing, authorization, and future migration harder.

### Follow-up

Record a new ADR before selecting authentication, database, CMS, search, analytics, or AI orchestration providers.

## ADR-2026-07-23: Make sustainable organic growth the product prioritization gate

Status: Accepted  
Owners: Product, Editorial, and Engineering

### Context

Uretir has multiple possible product directions. Without a shared prioritization rule, the team could spend effort on attractive pages or isolated features that do not compound acquisition, authority, community value, or AI usefulness.

### Decision

Every new feature must materially contribute to at least one of seven outcomes: more Google traffic, longer user sessions, more returning visitors, better internal linking, stronger authority, higher community engagement, or better AI usefulness. Prioritize traffic first, authority second, community third, and monetization after those assets create durable demand.

### Consequences

Feature briefs, roadmap reviews, content planning, and technical investments now require a named growth outcome and measurable behavior change. Some desirable work will be postponed until it has a credible contribution.

### Alternatives considered

Independent page-by-page prioritization was rejected because it does not reliably create a connected, compounding organic-growth system.

### Follow-up

Establish analytics baselines and a monthly growth review before using this gate to make high-confidence investment decisions.

## ADR-2026-07-23: Treat the manufacturing knowledge graph as the core information architecture

Status: Accepted
Owners: Product, Editorial, SEO, and Engineering

### Context

To become the trusted production destination in Turkey, Uretir must scale beyond disconnected articles. Companies, products, industries, factories, cities, technologies, machines, raw materials, and AI tools need consistent identities and relationships so public pages improve one another's discovery and authority.

### Decision

Model Uretir content as a manufacturing knowledge graph anchored in the five permanent pillars: NE URETIR, KIM URETIR, NASIL URETIR, NEREDE URETIR, and NEDEN URETIR. Every public content or entity page connects to one or more pillars and exposes evidence-backed typed relationships through useful internal links.

### Consequences

Content planning, data modeling, editorial workflow, internal linking, and AI retrieval must all use shared entity and relationship contracts. The team must resist thin, automatically generated pages and invest in taxonomy, aliases, review dates, duplicate detection, and source attribution.

### Alternatives considered

Treating articles, company pages, tools, and AI products as separate collections was rejected because it would create dead ends, fragmented authority, and limited reusable context for search or AI.

### Follow-up

Before the next entity-template implementation, define the first canonical taxonomy, relationship vocabulary, and source-review workflow described in [knowledge-graph.md](./knowledge-graph.md).

## ADR-2026-07-23: Build products as ecosystem discovery loops

Status: Accepted  
Owners: Product, Editorial, and Engineering

### Context

UretirAI, PuanAI, TesvikAI, FiyatAI, and IhracatAI could become standalone destinations with disconnected data and limited authority. That would weaken Uretir's long-term advantage and create more work without compounding search visibility or user habits.

### Decision

Treat every AI product as a discovery loop into the manufacturing knowledge graph. Each result or answer uses source-aware data, explains freshness and limits, and links to relevant Uretir articles and entities. PuanAI remains structured sample data until verified live integrations meet the documented adapter contract.

### Consequences

Product teams need shared entity identifiers, source metadata, and internal-link rules. Live integrations require provenance, freshness, expiry, and fallback behavior before they can influence user decisions.

### Alternatives considered

Building independent tools with separate content and no graph links was rejected because it does not build authority, durable discovery, or a coherent member experience.

### Follow-up

Define the first provider-adapter interface only after selecting a narrow, source-verifiable PuanAI or TesvikAI data slice.

## ADR-2026-07-23: Adopt the SEO Constitution as a permanent quality constraint

Status: Accepted  
Owners: Product, Editorial, SEO, and Engineering

### Context

Organic traffic is central to Uretir's mission, creating pressure to optimize pages and output. Without a durable constraint, that pressure could lead to low-value content, manipulated signals, invented claims, or experiences that serve metrics rather than users.

### Decision

Adopt [seo-constitution.md](./seo-constitution.md) as the permanent quality policy. User benefit, evidence, transparency, human editorial accountability, accessibility, and long-term trust override page-count and ranking incentives. The constitution's prohibitions cannot be waived by routine roadmap, campaign, or delivery decisions.

### Consequences

SEO, editorial, AI, and engineering work need explicit quality review. New publishing records include source context, review ownership, next-review date, change log, and uncertainty notes where needed.

### Alternatives considered

Using only a tactical SEO playbook was rejected because process guidance can be deprioritized under delivery pressure without a higher-order constitutional rule.

### Follow-up

Audit high-traffic legacy pages against the constitution before optimizing them further.

## ADR-2026-07-23: Make PuanAI a transparent recommendation and discovery loop

Status: Accepted
Owners: Product, Data, Editorial, and Engineering

### Context

Campaign lists do not solve the user's decision: the useful question is which option is best for a particular purchase, under current eligibility and payment constraints. A recommendation without source, freshness, assumptions, or related guidance would be misleading and would not deepen the Uretir ecosystem.

### Decision

PuanAI transforms structured campaign data and consented user preferences into explainable recommendations. Every output includes assumptions, eligibility, expiry, freshness, alternatives, and contextual paths to articles, card guides, and shopping guides. Current data remains explicitly sample data until live provider adapters are verified.

### Consequences

The product needs normalized campaign records and adapter boundaries before it can make live claims. Personalization is optional, consented, and inspectable. Editorial guides become a core output of the product loop, not unrelated traffic modules.

### Alternatives considered

Showing an unranked campaign directory or presenting opaque "best card" claims was rejected because neither earns sustained trust or solves a purchase decision responsibly.

### Follow-up

Define the first normalized campaign adapter and source-freshness test before any live campaign integration.

## ADR-2026-07-23: Quarantine unreviewed reference records from organic search

Status: Accepted
Owners: Editorial, SEO, and Engineering

### Context

Seed articles and company profiles can be useful for testing a reading experience, but a visible page without attributable evidence, accountable reviewers, a refresh date, and a change record is not yet a publishable reference. Including such records in sitemaps or rich-result schema would conflict with Uretir's quality and transparency commitments.

### Decision

Reference records remain reachable for editorial review but default to `in_review`. Only records with a complete `EditorialPublishingRecord`, a `published` status, and no readiness issues may be indexed, added to the sitemap, or emit article, organization, offer, or FAQ structured data. Reader-facing review notices explain the state instead of implying publication.

### Consequences

Organic page count may be lower during the migration, by design. The next publishing work must add primary sources, reviewer ownership, a next review date, entity relations, and a change log before a record becomes eligible for discovery. This gives every future AI agent and contributor an enforceable code path rather than a documentation-only rule.

### Alternatives considered

Leaving seed records indexed with generic source labels was rejected because it would create an appearance of authority without the evidence required to earn it.

### Follow-up

Migrate one complete high-intent reference cluster end to end, then measure search discovery and reader behavior before expanding the library.

## ADR-2026-07-24: Standardize AI products as source-aware content hubs

Status: Accepted
Owners: Product, Editorial, SEO, and Engineering

### Context

UretirAI, PuanAI, TesvikAI, FiyatAI, and IhracatAI need useful content before live integrations are available. Separate page implementations would duplicate interaction patterns, fragment internal linking, and make trust states inconsistent. Publishing unreviewed guides to create organic inventory would violate the SEO Constitution.

### Decision

Use one typed hub and guide model for all five products. Every hub exposes its current availability, limitations, search-intent clusters, educational guides, FAQ, related products, and a clear next action. Every guide answers a real question through a shared six-answer structure, sources, practical steps, risks, FAQ, and at least five discovery links.

New hub guides default to `in_review`, remain `noindex`, stay out of the sitemap, and emit no article or FAQ structured data. Only accountable human editorial review can move a guide to `published`; AI agents and developers cannot invent reviewers or self-approve content.

### Consequences

The platform now has a scalable editorial surface without pretending that sample data, future integrations, or draft guidance are current verified services. Organic growth from these guides begins only after a human-reviewed cluster passes the publication contract, so near-term indexed page count is intentionally constrained.

### Alternatives considered

Independent hub pages, keyword-variant pages, and automatically published AI drafts were rejected because they create dead ends, inconsistent trust signals, thin inventory, and avoidable source risk.

### Follow-up

Select one high-intent cluster, replace institution-homepage references with exact program documents where applicable, complete subject-matter and source review, and publish the first measured reference cluster end to end.

## ADR-2026-07-25: Separate trend signals from editorial publication

Status: Accepted
Owners: Editorial, SEO, Data, and Engineering

### Context

Search demand, industry news, statistics, and institution announcements can reveal useful questions, but individual signals are noisy and easy to misrepresent. Automatically turning them into pages would optimize for volume and expose Uretir to fabricated or short-lived trend claims.

### Decision

Trend discovery uses source-identified, time-bound signals. A topic needs at least two verified signals from different source classes and at least one first-party or official source before it can become an editorial candidate. Passing the signal gate never publishes content automatically.

### Consequences

The trend interface remains empty until trusted sources are connected. Editorial teams can explain why an opportunity exists and decide whether to enrich an existing canonical guide instead of creating a duplicate page.

### Follow-up

Connect read-only Search Console data after domain verification, then validate the first opportunity against an official statistical or institution source.

## ADR-2026-07-25: Require evidence before creating people profiles

Status: Accepted
Owners: Editorial, Knowledge Graph, and Engineering

### Context

InsanAI can deepen the relationship between people, ideas, technologies, companies, and research. It also creates a high risk of invented biographies, copied summaries, mistaken affiliations, and misleading Person structured data.

### Decision

The initial InsanAI collection is empty. A profile requires two independent reliable sources, one primary or official source, attributable contributions, subject and source reviewers, and scheduled re-review before publication or Person schema emission.

### Consequences

InsanAI launches as transparent architecture rather than a populated directory. Profile quality and source accountability take priority over page count.

### Follow-up

Select one historically stable person with accessible primary sources and complete the workflow as a reference implementation.

## ADR-2026-07-25: Use one authority gate for every reference content family

Status: Accepted
Owners: Editorial, SEO, Knowledge Graph, and Engineering

### Context

Articles used `ContentDocument` and `EditorialPublishingRecord`, while hub guides could become indexable from a local status check. Editorial and knowledge-graph modules also maintained overlapping entity vocabularies. At large scale, these differences would create inconsistent review standards, duplicated logic, and accidental publication paths.

### Decision

Use one canonical entity and relationship registry, one search-intent answer vocabulary, and one content authority audit. Hub guides adapt into `ContentDocument`; publication requires document status, editorial readiness, and authority readiness. Discovery recommendations use one reusable component and expose trust state.

### Consequences

A route-specific `published` flag cannot bypass source, reviewer, anatomy, intent, relationship, or internal-link checks. Legacy content remains reachable for migration but visibly fails the authority gate. New CMS or database adapters must preserve the same domain contract.

### Alternatives considered

Maintaining separate validators for articles, guides, and company profiles was rejected because their behavior would drift and because fixes would need to be repeated across route families.

### Follow-up

Use the contract to complete one three-guide manufacturing cluster, then connect the quality command to continuous integration.

## ADR-2026-07-25: Exclude editorial drafts from production output

Status: Accepted
Owners: Editorial, SEO, Product, and Engineering

### Context

Noindex prevents search indexing but does not prevent real users from opening unfinished records or sharing their URLs. Public review pages also expose incomplete claims and create a route that future code could accidentally promote.

### Decision

Local development may render review records with readiness notices. Production builds only generate and list documents that pass the complete publication authority gate. Draft articles, guides, companies, and draft-only categories are absent from production HTML, navigation lists, homepage promotion, sitemap, and RSS.

### Consequences

The public library can be intentionally sparse while editorial work continues. Editors retain local inspection capability, and the build validator fails if known review records leak into production output.

### Follow-up

Add authenticated editorial preview when a CMS is introduced; do not replace the current boundary with a public query-string preview.

## ADR-2026-07-25: Use claim-free PuanAI scenarios until verified providers exist

Status: Accepted
Owners: Product, Data, Editorial, Security, and Engineering

### Context

Demo records that combine real banks, merchants, fees, dates, and campaign conditions can be mistaken for current offers even when a sample badge is present.

### Decision

PuanAI sample mode uses generic, explicitly hypothetical decision scenarios without real brand, price, fee, validity, or campaign claims. Verified provider records require a source URL plus retrieval and verification timestamps. Incomplete verified provenance is downgraded before rendering.

### Consequences

The interaction model remains testable without creating financial misinformation. Live usefulness depends on a future provider contract, freshness service, failure policy, and source-level audit trail.

### Follow-up

Implement one read-only provider adapter in a non-production environment and test stale, missing, contradictory, and revoked campaign states before enabling verified output.

## ADR-2026-07-25: Separate product instrumentation from analytics providers

Status: Accepted
Owners: Product, Data, Privacy, and Engineering

### Context

Organic growth, session depth, return behavior, and AI usefulness require consistent measurement. Adding a vendor SDK directly to product components would couple the interface to one provider, invite inconsistent event names, and risk accidental capture of search terms, prompts, email addresses, or other user-provided values.

### Decision

Product components declare only allowlisted event names, surfaces, and short machine targets through a typed helper. A global bridge emits local `uretir:analytics` custom events without reading input values, setting cookies, writing storage, or making network requests. Production collection remains disabled until a consent-aware provider adapter, retention policy, privacy review, and named owners are approved.

The 404 output also owns an explicit metadata boundary: it is noindex and must not inherit the homepage canonical or Open Graph URL. Production navigation does not promote the non-persistent Uretir ID prototype.

### Consequences

Measurement semantics can be reviewed and tested before a vendor is selected. Future adapters have one stable integration seam and cannot justify broad automatic capture. The repository still has no live analytics or real-user baseline, and that limitation must remain explicit in release decisions.

### Follow-up

Select the production hosting and consent architecture, map one approved analytics adapter to the event channel in preview, validate denied-consent and provider-outage behavior, and establish the first audited baseline.

## ADR-2026-07-25: Separate repository coverage gaps from market demand

Status: Accepted
Owners: Editorial, SEO, Knowledge Graph, Search Quality, and Engineering

### Context

Topic-cluster blueprints can identify missing entity and relationship coverage, but they cannot establish search volume, trend direction, or commercial value. Treating graph completeness as demand would create confidently ranked but unsupported article ideas.

### Decision

Generate a deterministic content-gap report from the current graph, document ownership, authority blockers, and topic-cluster requirements. Every result is marked `demandStatus: not_validated`. A separate verified-signal gate must approve demand before a gap becomes an editorial candidate.

Generic guide, category, and industry entities require explicit cluster ownership before classification. Linking to an entity does not make a document the canonical owner of that entity.

### Consequences

Editorial teams receive a reproducible Top 100 backlog without fabricated keyword metrics or entity names. Some strategically interesting topics remain unranked until Search Console, search-interest, or official signals are connected.

### Follow-up

Connect read-only Search Console data, validate one cluster against a second official or first-party signal, and combine demand evidence with—not in place of—the authority score.

## ADR-2026-07-25: Require governed topic-cluster membership before publication

Status: Accepted
Owners: Editorial, SEO, Knowledge Graph, and Engineering

### Context

Entity relationships alone do not establish why a document exists, which canonical body of knowledge it strengthens, or whether the cluster has sufficient breadth. At scale, free-text topic labels would create duplicate hubs, orphan pages, and inconsistent internal linking.

### Decision

Every reference document must declare a stable topic-cluster membership before it can pass the authority gate. Cluster families have governed entity and relationship expectations, five-pillar coverage, canonical roles, ownership, and review cadence. The contract supports company, factory, product, technology, manufacturing, investment, export, standard, artificial-intelligence, government-program, industrial-equipment, and supply-chain clusters.

### Consequences

Existing legacy documents remain review records until they receive honest cluster membership. The system gains reusable authority architecture without generating any page or pretending that an empty cluster is complete.

### Follow-up

Register one narrow manufacturing cluster with verified sources, accountable owners, and complete entity coverage; publish only after the full cluster audit passes.

## ADR-2026-07-25: Automate repository quality but defer deployment automation

Status: Accepted
Owners: Engineering and Operations

### Context

The repository quality command was local-only, while production hosting, secrets, monitoring, data topology, and rollback ownership remain undecided. Combining quality automation with an assumed deployment target would hide operational gaps.

### Decision

Run the locked `pnpm quality` command in GitHub Actions for pull requests and pushes to `main`. Keep continuous deployment out of the workflow until the production-operating decisions and named owners in `production-operations.md` are approved.

### Consequences

Build, dependency, lint, and search-foundation regressions can be blocked consistently. A green check remains evidence of repository integrity, not a deploy authorization or editorial approval.

### Follow-up

Enable branch protection for the quality job, select preview and production infrastructure, rehearse immutable promotion and rollback, and add provider-specific delivery only after observability and secret controls exist.

## ADR-2026-07-25: Complete user journeys before creating AI product routes

Status: Accepted
Owners: Product, Search, Data, Editorial, Security, and Engineering

### Context

The proposed AI portfolio covers valuable manufacturing tasks, but creating a landing page for every name would overstate capability, split authority, and duplicate source, freshness, identity, and evaluation work.

### Decision

Maintain one typed portfolio registry with explicit states: available foundation, sample only, future integration, candidate, and consolidate. Candidate products have no public route. Shared trust and retrieval capabilities are implemented once. HibeAI is consolidated into TeşvikAI because grant discovery uses the same applicant profile, programme registry, source verification, and update workflow.

### Consequences

The repository can plan a broad ecosystem without unsupported product promises or thin pages. New public products require a complete persona, data, discovery, operating, measurement, and failure contract.

### Follow-up

Prove one end-to-end TeşvikAI source family and one authority-ready manufacturing cluster before approving another AI route.

## ADR-2026-07-25: Use publication-aware universal search as the discovery seam

Status: Accepted
Owners: Search, Editorial, SEO, Product, and Engineering

### Context

Header, homepage, and structured search previously routed only to the blog, leaving AI hubs, companies, guides, and future entity types outside one coherent discovery flow.

### Decision

Route global search to `/ara`. Use a provider-neutral search adapter and preserve the publication authority boundary in every implementation. Search-result pages remain noindex, and production search cannot expose editorial review records. Raw queries are not persisted before consent-aware measurement is approved.

### Consequences

Users gain one discovery path without changing the existing design system. The repository fallback is deterministic and safe, while an external engine can be introduced later without rewriting page contracts.

### Follow-up

Connect consent-aware search telemetry, establish a relevance evaluation set, and introduce a managed search provider only when corpus size and measured failures justify it.
# ADR-2026-09-07: Treat WhatsApp posts as candidate evidence, not campaign truth

Status: Accepted
Owners: Product, Data, Editorial, Security, and Engineering

### Context

PuanAI will receive campaign discoveries through a WhatsApp agent and channel. Channel copy is useful for speed and audience engagement, but it may omit dates, eligibility, exclusions, or an authoritative source.

### Decision

Persist every incoming message as an idempotent campaign submission. Require provider signature or a private ingest token. Extract only explicitly stated values, verify the linked HTTPS source, and keep the result in a review queue. No intake record can automatically publish a campaign. The deterministic eligibility, benefit, effective-cost, and scoring engines continue to consume only fresh verified campaign records.

### Consequences

New offers can be discovered quickly without allowing social copy to create financial claims. Operations must configure WhatsApp, cron, database, and admin secrets in Vercel and monitor `SOURCE_UNAVAILABLE`, `URL_REQUIRED`, and `NEEDS_REVIEW` records.

### Follow-up

Define the retention period for raw WhatsApp messages, connect alerting for queue age, and build approved official-source adapters for the highest-volume banks and merchants.
