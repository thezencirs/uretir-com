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
