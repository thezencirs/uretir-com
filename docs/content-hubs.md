# Content Hub Engine

## Purpose

The content hub engine turns UretirAI, PuanAI, TesvikAI, FiyatAI, and IhracatAI into connected knowledge products rather than isolated landing pages. It gives every hub the same search-intent, trust, source, review, and internal-linking contract.

The public implementation lives in:

- `lib/content-hubs.ts` for typed hub and guide records;
- `components/content-hub-page.tsx` for reusable product landing pages;
- `components/hub-knowledge-section.tsx` for intent clusters and guide discovery;
- `components/hub-guide-page.tsx` for the reference-guide reading experience;
- `app/rehber/[slug]/page.tsx` for guide routing, metadata, and publication gating.

## Hub contract

Every hub must state:

- the user problem it solves;
- its current availability state;
- what data is and is not live;
- its product promise and limitations;
- the search intents it serves;
- educational guides and FAQ;
- related Uretir products and knowledge paths;
- one clear next action.

The supported availability states are:

| State | Meaning | Allowed claims |
| --- | --- | --- |
| `sample` | A working experience uses explicitly labelled sample records. | Explain interaction and decision logic. Never imply that records are current or provider-verified. |
| `foundation` | The editorial and information architecture is usable; live AI output is not. | Publish reviewed educational material and describe the intended product boundary. |
| `future_integration` | The model is ready for a future verified data source. | Explain the analysis method. Never display invented or stale market data. |

## Guide contract

Each guide starts with a real user question and includes:

1. a concise answer;
2. what, why, how, who, when, and where;
3. an actionable sequence;
4. common failure modes;
5. source references with publisher and access date;
6. FAQ;
7. related topics;
8. at least five useful internal discovery links.

Word count is not a publication criterion. Evidence, decision usefulness, and editorial accountability are.

## Search-intent model

Guides use one primary intent:

- `öğrenme`: understand a concept or method;
- `karşılaştırma`: make a decision between alternatives;
- `hazırlık`: prepare a process or evidence package;
- `doğrulama`: verify a changing or consequential claim.

Keywords may inform language, but the user question and task determine the page. New pages are not created for minor keyword variants. Closely related questions enrich one reference guide.

## Editorial state and indexing

New guide records default to `in_review`. An `in_review` guide:

- is reachable for product and editorial review;
- displays an explicit review notice;
- uses `noindex, follow`;
- is excluded from the sitemap;
- emits no Article, FAQ, or breadcrumb structured data;
- never presents its creation date as a publication date.

Moving a guide to `published` requires the same accountability defined in `editorial-engine.md`: named subject-matter and source reviewers, review and next-review dates, attributable sources, entity relationships, and a change log. A future implementation should consolidate hub guides with `EditorialPublishingRecord` before the first public indexable guide is approved.

AI agents and developers must not self-approve editorial content or invent reviewer identities.

## Source maintenance

Official-source links are a starting point, not proof that every statement remains current. Time-sensitive claims require:

- the exact document or announcement, not only an institution homepage;
- document version or publication date where available;
- access date;
- scope and jurisdiction;
- a scheduled next review;
- a visible change note after material updates.

Current hub guides intentionally avoid publishing campaign amounts, support rates, deadlines, commodity prices, tax rates, or program eligibility decisions.

## Internal-linking rules

No guide may end with only a generic archive link. It must connect to:

- its parent AI hub;
- at least two question-adjacent guides;
- at least one other AI hub where the task continues;
- the broader Uretir content or entity ecosystem;
- relevant company, product, industry, technology, or tool pages when verified records exist.

Cross-hub links must reflect a real task transition. Examples include incentive preparation to export supports, raw-material comparison to export pricing, and AI source evaluation to campaign verification.

## Publishing workflow

1. Record the user question and primary intent.
2. Check for an existing canonical guide.
3. Define related entities and task transitions.
4. Gather primary and official sources.
5. Draft the six-answer frame, steps, risks, and FAQ.
6. Run source and subject-matter reviews.
7. Add review ownership, next-review date, and initial change log.
8. Approve the record for publication.
9. Verify metadata, canonical, structured data, sitemap inclusion, and internal links.
10. Monitor search discovery, continuation clicks, return visits, and source freshness.

## Success measures

Measure the engine by:

- approved reference guides, not draft count;
- non-branded organic entrances by hub and intent;
- internal continuation rate;
- source-link usage;
- time to complete scheduled reviews;
- stale-content incidents;
- returning readers;
- AI sessions that continue into trusted content.
