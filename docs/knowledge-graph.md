# Manufacturing Knowledge Graph

## Purpose

Uretir is building the definitive manufacturing knowledge platform for Turkey. The graph is the information architecture that lets hundreds of thousands of pages compound authority instead of becoming an unconnected archive.

Every public knowledge page represents an entity, a relationship, an evidence-backed claim, or a carefully scoped combination of those things. Pages are not created in isolation.

## Canonical pillars

Every entity and content item must connect to one or more permanent Uretir pillars:

| Pillar | Graph role | Examples |
| --- | --- | --- |
| NE URETIR | What exists or is made | product, machine, material, technology, tool |
| KIM URETIR | Who creates or operates | company, expert, university, manufacturer, team |
| NASIL URETIR | How creation happens | process, method, workflow, machine operation, case study |
| NEREDE URETIR | Where creation happens | factory, city, industrial zone, region, supply chain |
| NEDEN URETIR | Why the activity matters | problem, application, market, incentive, impact, opportunity |

The five pillars are facets, not page templates. A company may belong to KIM URETIR while linking to its products, factories, cities, technologies, materials, and reasons for production across the other pillars.

## Core entity model

| Entity | Required identity | High-value relationships |
| --- | --- | --- |
| Article | stable slug, type, owner, source standard, update date | explains, compares, profiles, relates-to |
| Company | canonical name, stable ID, status, verification state | produces, operates-in, uses, owns, employs |
| Product | canonical name, category, lifecycle status | made-by, uses-material, solves, made-at |
| Industry | canonical name, taxonomy position | includes-company, uses-technology, located-in |
| Factory | canonical name, operator, location precision | owned-by, produces, uses-machine, located-in |
| City / region | canonical name, administrative taxonomy | hosts, specializes-in, supports |
| Technology | canonical name, definition, maturity | used-by, enables, replaces, related-to |
| Machine | canonical name, function, manufacturer when known | used-in, processes, made-by |
| Raw material | canonical name, specification scope | used-by, priced-by, sourced-from |
| AI tool | canonical name, product scope, source policy | recommends, answers-with, relates-to |
| Topic / category | stable taxonomy position | contains, prerequisite-for, related-to |

Each entity must use a stable opaque internal ID and a canonical public slug. Aliases, old names, spelling variants, and redirects belong in the data model so the graph does not fragment around naming differences.

## Topic-cluster model

Clusters are the operational layer above individual entities. Uretir maintains company, industry, product, technology, factory, investment, export, energy, government incentive, AI, machine, and raw-material clusters. Each cluster needs a hub, definitive reference pages, support content, entity coverage targets, relationship targets, a named owner, and refresh cadence.

Build depth before breadth. A cluster earns expansion when its existing hub, entities, source coverage, and internal paths offer a better answer than the competing public result—not when it merely has more URLs.

## Relationship model

Relationships are typed, directional, and attributable. Do not reduce all connections to generic "related" links.

```text
Company -> produces -> Product
Company -> operates -> Factory
Factory -> located-in -> City
Factory -> uses -> Machine
Product -> uses -> Raw Material
Product -> belongs-to -> Industry
Technology -> enables -> Process
Article -> explains -> Technology
Article -> profiles -> Company
Article -> answers -> Search Intent
AI Tool -> recommends -> Article / Entity
```

Every relationship requires a source, editorial assertion, or accepted contributor evidence. Store confidence, source date, and review date when the relationship may change.

## Page-generation rules

- An entity page exists only when there is enough verified, non-duplicative material to make it useful.
- Each page has one canonical intent and one canonical URL.
- Entity pages expose their strongest graph relationships as contextual internal links.
- A page should offer at least one next step in the same pillar and one meaningful cross-pillar path when evidence exists.
- Do not mass-generate pages from sparse data. An incomplete entity is better kept internal until it can meet quality standards.
- Public graph pages must remain server-rendered or statically generated when practical, fast, accessible, and indexable.

## Internal-link contract

Every article is expected to link to the entities necessary to understand it: relevant companies, products, categories, industries, factories, cities, technologies, machines, materials, and AI tools. The exact set depends on the article; links must be editorially justified, not mechanically maximized.

Every entity page should link to:

1. Its parent and sibling taxonomy where useful.
2. Directly related entities with clear relationship labels.
3. The best explanatory articles and source-backed updates.
4. A next question or task that increases discovery depth.

## Quality and governance

- The graph has taxonomy owners. New entity types and relationship verbs require documented approval.
- Editorial owners review time-sensitive entities and claims on a defined cadence.
- Duplicate detection happens before publishing through canonical names, aliases, slugs, and relationship comparison.
- Contributors may suggest entities or corrections, but publication requires source and editorial review.
- `noindex`, redirect, merge, and retirement decisions preserve graph continuity rather than silently deleting context.

## Metrics

Measure entity coverage by pillar, high-confidence relationship coverage, orphan-page count, internal link click-through, crawl depth, indexation quality, topic-cluster performance, source freshness, and organic traffic to entity and article templates.
