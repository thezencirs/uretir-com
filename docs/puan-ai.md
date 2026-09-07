# PuanAI Product Loop

## Purpose

PuanAI is Uretir's shopping-intelligence product. It helps a user make a better purchase decision by connecting current campaign data, transparent analysis, personal preferences, and durable Uretir guidance.

The goal is not to show a campaign list. The goal is to become a daily assistant that answers: which card, payment method, marketplace, or installment option is most useful for this purchase right now?

## Core flow

```mermaid
flowchart TD
  U["User question or purchase intent"] --> D["Current campaign data"]
  D --> A["PuanAI analysis layer"]
  U --> P["Consented preferences and saved context"]
  P --> A
  A --> R["Personalized recommendation"]
  R --> C["Related campaign and card guidance"]
  R --> M["Related Uretir articles"]
  R --> G["Credit card guides"]
  R --> S["Shopping and payment guides"]
  C --> U
  M --> U
  G --> U
  S --> U
```

## Input contract

### User intent

PuanAI accepts explicit intent such as purchase category, merchant, estimated spend, desired installment count, card ownership, reward preference, and time sensitivity. Do not infer sensitive financial details from unrelated behavior.

### Campaign data

PostgreSQL is the source of truth. The normalized Prisma schema records banks, cards, campaigns, campaign rules, merchants, merchant categories, reward types, installments, official sources, verification logs, campaign history, and anonymous conversations. A campaign is eligible for an answer only when it is published, within its validity interval, connected to active master data, backed by an HTTPS official source, and covered by a non-stale verified log whose fingerprint matches the source record.

The repository seed contains a small set of manually verified July 2026 campaigns from official bank campaign pages plus one unpublished draft for administration testing. Seed data is a bootstrap set, not an automated promise that a source has not changed; the verification schedule must be operated continuously.

### Personal context

Personalization uses only explicit or consented signals: saved cards, preferred reward type, saved merchants/categories, followed shopping guides, and notification preferences. Users can inspect, edit, or disable these signals. PuanAI must work meaningfully without an account.

## Analysis layer

The analysis layer ranks eligible options; it does not present an unexplained answer. Each recommendation must expose:

- The best option and the reason it was selected.
- Assumptions such as spend, merchant, card ownership, and payment method.
- Campaign eligibility and expiry.
- Source and freshness status.
- Alternatives with meaningful trade-offs.
- Uncertainty or missing information that may change the result.

Never imply that a campaign is valid, a marketplace is cheapest, or a card is best without adequate current data. PuanAI is decision support, not financial advice.

## Runtime request path

```text
User question
  -> Zod request validation
  -> deterministic Turkish intent detection
  -> PostgreSQL campaign retrieval
  -> date, source, fingerprint, freshness, entity, amount, exclusion and installment rules
  -> compact verified context
  -> OpenAI Responses API explanation or deterministic fallback
  -> streamed answer plus complete verification cards
```

If no record survives the rule engine, the API returns exactly: `I couldn't verify a current campaign.` Provider errors never widen the result set; they fall back to a deterministic explanation of the already verified records.

## Discovery outputs

Every useful recommendation offers relevant next paths, chosen for the user's actual task:

- Related Uretir articles for the purchase or decision context.
- Credit card guides explaining fees, reward programs, installment rules, and eligibility.
- Shopping guides covering merchants, timing, payment methods, and price-comparison literacy.
- Related campaigns, cards, banks, and merchant pages.

Links must be contextual. Do not add unrelated article modules merely to increase sessions.

## Data architecture

```text
Official bank page / future provider adapter
  -> official_sources fingerprint
  -> verification_logs freshness decision
  -> normalized campaign, rule and installment records
  -> deterministic eligibility and ranking
  -> bounded LLM explanation
  -> official-source link and verification evidence
```

The normalized record must remain independent of any one bank, marketplace, affiliate provider, or future data vendor. Provider adapters own ingestion; PuanAI owns canonical IDs, normalized terms, freshness, eligibility interpretation, and user-facing explanation.

## Quality and safety

- Display bank, dates, reward, installment, conditions, last verification date, and original campaign source for every recommendation.
- Hide records immediately when verification is stale, rejected, missing, or inconsistent with the source fingerprint.
- Do not hide exclusions, caps, participation requirements, or expiry dates.
- Do not collect payment credentials, bank passwords, or transaction history.
- Store anonymous conversation history under a random HttpOnly client key; provide deletion and never send previous prompts to analytics.
- Never rank an option higher because of an undisclosed commercial relationship.
- Keep public campaign and guide pages fast, accessible, and crawlable.

## Success signals

Measure task completion, source click-through, recommendation correction rate, saved campaigns, return usage, notification usefulness, relevant guide discovery, and user trust feedback. Do not use raw clicks as the only indicator of value.
