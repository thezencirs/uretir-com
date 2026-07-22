# SEO Playbook

This playbook implements the [SEO Constitution](./seo-constitution.md). Process guidance in this document cannot override the constitution's user-benefit, trust, and anti-manipulation rules.

## Objective

Organic discovery is a product capability. Uretir should earn qualified traffic by publishing useful, structured, internally connected knowledge, not by producing pages designed only to capture keywords.

SEO is the first growth priority. Authority is built through the same system: useful topic coverage, source quality, maintained entity pages, and links that demonstrate contextual understanding. Community and monetization should reinforce this system, never dilute it.

## Quality review before optimization

Before optimizing titles, links, templates, or structured data, verify that the page has a real user purpose, original value, an accountable owner, accurate visible claims, and a maintenance plan. Optimization cannot rescue weak content; improve or retire the content first.

## Topic clusters

Build clusters around durable user questions. Each cluster has a hub page, supporting articles, entity pages, and clear links between them. Typical clusters include artificial intelligence, manufacturing, engineering, design, energy, entrepreneurship, finance opportunities, and export.

Manufacturing, industry, technology, and production are the highest-priority clusters. Build depth before breadth: establish definitive hubs, entities, and supporting answers around a focused manufacturing topic before expanding into adjacent themes.

For every cluster define:

- Search intent and audience level.
- A hub or collection page.
- Pillar articles that explain the subject comprehensively.
- Supporting articles with narrower questions or examples.
- Relevant companies, tools, products, people, and AI experiences.
- A refresh owner and review cadence.

## Internal linking and knowledge graph

Internal links must add context. Link from an article to the entities it explains, the related methods, its prerequisite knowledge, and the next useful question. Avoid generic "read more" links and bulk related-post widgets with no editorial rationale.

The target knowledge graph contains typed relationships such as:

```text
Article -> explains -> Topic
Article -> profiles -> Company
Company -> operates in -> Industry
Tool -> solves -> Problem
Person -> contributes to -> Topic
AI product -> recommends -> Article / Company / Tool
```

The production graph also covers products, industries, factories, cities, technologies, machines, raw materials, and AI tools. Its canonical model and publishing constraints are documented in [knowledge-graph.md](./knowledge-graph.md).

## Metadata and canonicals

- Every indexable route has a distinct title, concise description, canonical URL, and Open Graph representation.
- Canonicals use the preferred public URL without tracking parameters.
- Paginated, filtered, and search-result routes must have deliberate indexability. Do not let parameter combinations create uncontrolled duplicate pages.
- Keep public slugs stable. Redirect retired or changed slugs permanently when a successor exists.

## Discovery contract: no dead ends

Every indexable page must offer a useful next path. This is not a generic related-post requirement; the links should reflect the page's entities, reader intent, and position in the knowledge graph.

- Articles link to their relevant entities, prerequisite concepts, and next questions.
- Entity pages link to their parent taxonomy, direct relationships, authoritative explanatory articles, and adjacent entities.
- Tool and AI product pages link to the knowledge they use or extend.
- Search, filter, and zero-result states offer clear exploration paths instead of terminal screens.
- Navigation modules must remain crawlable, accessible, and useful without client-side behavior.

Measure dead ends through low next-page continuation, orphan pages, shallow link coverage, and crawl-depth analysis. Fix the knowledge path before adding more decorative modules.

## Structured data

Use schema that reflects visible content. The current application already supports Organization, WebSite, Article, CollectionPage, and BreadcrumbList patterns. Add further types only when their required visible properties are complete and accurate.

Potential types include `Person`, `Organization`, `Product`, `SoftwareApplication`, `FAQPage`, and `ProfilePage`. Never add markup to claim ratings, authorship, or product details that the page cannot substantiate.

## Article template

An editorial article should include:

1. Clear title, summary, category, author/source context, and publication/update dates.
2. An answer or framing before unnecessary introduction.
3. Logical headings that match user questions.
4. Useful internal links and sources where factual claims require them.
5. Relevant structured data and a unique canonical URL.
6. A review date for time-sensitive subjects.

## FAQ policy

FAQs answer recurring questions that are not already answered cleanly in the article body. They are not a keyword dumping area. If an FAQ is meaningful, its answer must be complete, visible, and maintained with the page.

## Publishing workflow

1. Choose a topic cluster and search intent.
2. Check existing Uretir pages to prevent duplication and identify links.
3. Draft with sources, a named audience, and a useful outcome.
4. Map the article to the five pillars and its relevant entities before publication.
5. Edit for structure, factual accuracy, accessibility, metadata, and internal linking.
6. Publish with a review date and observe search, engagement, and conversion signals.
7. Refresh, consolidate, redirect, or retire when the information becomes stale.

## Success signals

Track qualified organic sessions, indexed-page health, entity coverage, relationship coverage, internal-link click-through, crawl depth, returning readers, session depth, Core Web Vitals, crawl errors, and conversions to meaningful actions such as saved content, newsletter signup, or Uretir ID registration. Do not judge SEO by impressions alone.
