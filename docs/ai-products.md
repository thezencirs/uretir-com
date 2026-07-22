# AI Products

## Product thesis

Uretir AI products turn fragmented information into useful, accountable assistance. They are not generic chat wrappers. Each product needs a defined user job, trusted source boundary, transparent uncertainty, and a path to action.

AI work must clear the same growth gate as every other investment. Its primary contribution should be better AI usefulness, while also improving return visits, discovery, and the value of Uretir's structured knowledge assets.

## Shared platform

Every AI product uses Uretir ID as its identity and consent layer. A member has one account, profile, preference center, and notification model across the ecosystem. Product-specific conversation history and settings remain scoped to the product, while explicit interests and authorized profile signals can improve recommendations across products.

```text
Uretir ID
  |-- profile, consent, interests, notification preferences
  |-- UretirAI
  |-- PuanAI
  |-- TesvikAI
  |-- HibeAI
  |-- FiyatAI
  |-- EnerjiAI
  `-- IhracatAI
```

## Product portfolio

| Product | User job | Initial value boundary |
| --- | --- | --- |
| UretirAI | Learn, research, and navigate the Uretir knowledge graph | Answers grounded in internal content with explicit article and entity paths |
| PuanAI | Discover and track relevant bank and card campaigns | Clear campaign eligibility, dates, source links, and relevant Uretir articles |
| TesvikAI | Understand production incentives | Structured eligibility guidance connected to company and industry pages; never legal assurance |
| HibeAI | Find grants and funding opportunities | Deadline-aware opportunities with source provenance |
| FiyatAI | Research price signals and procurement context | Transparent source dates, regions, uncertainty, and connected raw-material knowledge |
| EnerjiAI | Understand energy costs, options, and transitions | Scenario guidance with assumptions made visible |
| IhracatAI | Navigate export markets and requirements | Market research and process guidance, not regulated advice |

## AI behavior standards

- Cite or link to the underlying Uretir and external sources whenever factual claims matter.
- State limitations, time sensitivity, and uncertainty clearly.
- Never imply legal, financial, medical, tax, or regulatory certainty.
- Do not use a member's private profile or conversation history outside the stated purpose and consent.
- Separate retrieved facts, model synthesis, and user-provided assumptions where possible.
- Provide an escalation path to source material, an expert, or a manual workflow when confidence is low.
- Use internal content and entity links as the default discovery path when they are relevant; no AI response should strand a user at an unsupported conclusion.

## Discovery responsibilities

AI products are distribution surfaces for the knowledge graph. They must create a clear loop back into durable public or member knowledge rather than becoming isolated destinations:

- UretirAI retrieves and cites internal articles and entities before relying on broad model knowledge.
- PuanAI recommends related production, finance, or decision-making content when the relationship is genuinely useful.
- TesvikAI links opportunities to the companies, industries, and production contexts they affect.
- FiyatAI links price signals to raw-material articles, specifications, supply context, and related industries.
- Future products inherit the same requirement: every answer, result, or recommendation should improve informed discovery.

The detailed product responsibilities, data freshness boundaries, and ecosystem metrics are maintained in [ecosystem-strategy.md](./ecosystem-strategy.md).

## Data and privacy model

Conversation history belongs to the member and is visible, exportable, and deletable under the platform privacy policy. Retrieval data must be permission-aware. Analytics should favor aggregated product learning over identifying behavioral surveillance.

## Delivery sequence

Build shared identity, preferences, source retrieval, evaluation, and audit capabilities before multiplying standalone AI interfaces. A new AI product should prove that it can reuse the platform and create a distinct outcome; otherwise it belongs inside an existing product.
