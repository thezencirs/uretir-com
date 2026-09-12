# Ecosystem Strategy

## Principle

Uretir does not build isolated tools. Every product is a discovery surface, a habit-forming workflow, or a contributor to the manufacturing knowledge graph. A product that cannot strengthen discovery, authority, retention, or AI usefulness is not an ecosystem priority.

## Shared contract

Every product must:

- Use Uretir ID for identity, consent, and member preferences when accounts are introduced.
- Link its answers and results to relevant Uretir articles and entities.
- Contribute structured, source-aware knowledge where its data can be safely reused.
- Preserve performance, accessibility, mobile usability, and indexability for public surfaces.
- Separate sample, editorial, partner, and live-provider data so users and engineers understand freshness and provenance.

## UretirAI: the knowledge-graph interface

UretirAI answers the five core questions: NE URETIR, KIM URETIR, NASIL URETIR, NEREDE URETIR, and NEDEN URETIR. It retrieves from the internal graph first and returns a useful answer with clearly labeled supporting paths:

- Related articles
- Related companies
- Related products
- Related factories
- Related technologies and machines
- Related AI tools

The product should not merely answer a question; it should make the next informed question easier to ask.

## PuanAI: shopping intelligence

PuanAI helps users decide which card, campaign, marketplace, installment plan, or payment method is best for a purchase. Its PostgreSQL catalog displays only records that pass official-source, fingerprint, freshness, validity, and deterministic eligibility checks. It never treats the language model as a campaign database and never presents its output as financial advice.

Current official-page verification is human-operated. Future provider adapters must preserve the existing canonical campaign IDs, source URLs, retrieval timestamps, fingerprints, expiry timestamps, eligibility rules, card/product scope, verification history, and fail-closed stale state. PuanAI should recommend genuinely useful decision and purchase knowledge from Uretir, not attach unrelated links for traffic.

The user-to-recommendation loop and its privacy, safety, and discovery requirements are maintained in [puan-ai.md](./puan-ai.md).

## TesvikAI: production incentive assistant

TesvikAI helps manufacturers understand support opportunities from KOSGEB, TUBITAK, investment incentive programs, industrial support programs, export support, technoparks, development agencies, and European Union funds.

Every result needs the official institution, source document, publication and update dates, eligibility uncertainty, related incentives, related industries, and related AI tools. It provides guidance and source paths, not legal, tax, or application approval advice.

## FiyatAI: market and material intelligence

FiyatAI prepares Uretir for raw-material, commodity, metal, energy, and construction-material price intelligence. It must model pricing as dated, regional, unit-aware data rather than static facts. Its future capabilities include market comparisons, trend analysis, and historical series.

Each price signal should connect to the relevant material, specification, industry, product, and explanatory article. Provider methodology, observation date, currency, unit, and confidence must be visible.

## IhracatAI: export enablement

IhracatAI will help manufacturers research target markets, GTIP classifications, export incentives, taxes, shipping, and trade documentation. It must present time-sensitive requirements with official sources, jurisdiction context, and clear warnings that regulated decisions require professional verification.

## Ecosystem measurement

Measure not just tool usage, but the value of the loop each product creates: article/entity discovery after a result, return usage, saved knowledge, source click-through, task completion, and correction or abandonment rate. The ecosystem wins when every useful action deepens a member's relationship with trusted Uretir knowledge.
