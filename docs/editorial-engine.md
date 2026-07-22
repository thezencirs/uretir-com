# Editorial Engine

## Objective

Uretir publishes expert-grade manufacturing knowledge that can become a durable reference, not a volume-driven article feed. The editorial engine is the system for researching, reviewing, enriching, publishing, updating, and retiring that knowledge at scale.

## Publishing standard

Every article must answer a real user question, have a clear primary entity or topic, cite attributable evidence, and create useful paths into the manufacturing knowledge graph. A page is not publishable merely because it is complete in a CMS.

Do not publish thin, duplicate, unsupported, or filler content. Fewer definitive pages are more valuable than many interchangeable ones.

## Source policy

The preferred source hierarchy is:

1. Official institution announcements, support programs, statistics, and reports.
2. Official company information and company documents.
3. Primary research, interviews, or clearly attributed expert material.
4. Uretir editorial analysis, explicitly separated from factual source material.

Each source records title, publisher, URL, source type, access date, and publication date when available. Official documents are stored as explicit references rather than buried in prose.

## Article record

Every new article must support:

- Publication and last-updated dates.
- Reading-time estimate.
- Attributable source references and official document references.
- Image gallery with descriptive alt text, captions, credits, and licence context where relevant.
- FAQ, related articles, related companies, and related AI tools.
- Explicit knowledge-graph links to relevant companies, products, categories, industries, factories, cities, technologies, machines, raw materials, and AI tools.
- Subject-matter review, source review, review date, and next-review date.
- A transparent change log for initial publication and material updates.
- Uncertainty notes when the available evidence is incomplete, contested, or time-sensitive.

The implementation contract is defined in [lib/editorial-engine.ts](../lib/editorial-engine.ts). `ContentDocument.editorial` is intentionally optional while legacy content is migrated; new reference content must use it.

## Required article anatomy

Every published reference article includes:

1. A professional title that reflects the real user question.
2. A quick answer or clear framing near the beginning.
3. A detailed explanation with evidence, limitations, and practical context.
4. A timeline when chronology changes the reader's decision.
5. Official references and named source context where factual claims matter.
6. Publication date, last-updated date, and next-review date.
7. Relevant images with captions and rights context when imagery adds understanding.
8. Related articles, companies, and AI tools that continue the reader's task.
9. FAQ only when it answers genuine recurring questions.
10. Accurate structured data and canonical internal links.

Each article should connect naturally to at least five other Uretir pages when verified graph coverage exists. If fewer useful targets exist, create an editorial backlog to deepen the graph; never fill the requirement with weak or unrelated links.

## Workflow

```text
Question intake
  -> search-intent and duplicate check
  -> entity map and source plan
  -> research
  -> expert draft
  -> source review
  -> subject-matter review
  -> metadata, schema, media, FAQ, and internal-link review
  -> publish
  -> measure
  -> refresh, merge, redirect, or retire
```

## Mandatory briefing fields

Before drafting, record the target user question, intended reader, primary and secondary growth outcomes, five-pillar mapping, primary entities, search intent, source plan, expected update cadence, and existing Uretir pages that should link to or from the new page.

## Review and freshness

Every published item has a named owner and next-review date. Time-sensitive content such as incentives, programs, statistics, company facts, prices, and regulations receives a shorter review interval. If an item cannot be verified or refreshed, update, consolidate, noindex, redirect, or archive it rather than letting it decay.

When facts or advice remain uncertain, the article must say so in reader-facing language. Do not hide uncertainty in metadata or replace it with invented precision. The [SEO Constitution](./seo-constitution.md) is the permanent quality policy for this workflow.

## Migration policy

Existing editorial pages may continue to render while they are audited. They are not evidence that a new article meets the publishing standard. Migrate high-traffic and high-authority pages first by adding authoritative sources, entity relations, review records, and deeper editorial content.
