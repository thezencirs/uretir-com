# Topic Cluster Operating Model

## Purpose

Topic clusters are the unit of authority growth at Uretir. A page is not publishable merely because its copy is complete: it must belong to a coherent body of knowledge, have a canonical role, connect to governed entities, and offer useful next steps. The runtime contract is defined in `lib/topic-clusters.ts`; this document defines how teams use it.

## Permanent cluster families

The authority engine supports twelve reusable families:

| Cluster family | Primary question | Required relationship coverage |
| --- | --- | --- |
| Company | Who produces? | products, factories, industries, technologies, standards |
| Factory | Where and how is it produced? | companies, industries, machines, materials, processes |
| Product | What is produced? | producers, materials, technologies, industries |
| Technology | How is it produced? | products, industries, machines, processes |
| Manufacturing | How and why is it produced? | processes, machines, materials, technologies, standards |
| Investment | Why, where, and by whom is capacity built? | industries, locations, programs, institutions |
| Export | Who exports what, where, and how? | companies, products, markets, programs, institutions |
| Standard | Which rules govern production? | products, factories, processes, institutions |
| Artificial intelligence | How does AI support a decision? | AI products, guides, industries, technologies |
| Government program | Who is eligible and how do they apply? | institutions, programs, industries, companies |
| Industrial equipment | Which machine performs which process? | machines, technologies, processes, products |
| Supply chain | How do inputs become deliverable products? | materials, products, companies, factories, locations |

These are content structures, not instructions to mass-create pages. A family may remain empty until the team has an authoritative question, evidence, and an accountable reviewer.

## Runtime contract

Each publishable document carries a `topicCluster` membership with:

- a stable `cluster:` identifier;
- one cluster family;
- one primary entity;
- at least one Uretir pillar;
- a declared cluster role such as pillar, support, comparison, reference, or update;
- related cluster identifiers where a genuine cross-cluster path exists.

A cluster definition owns the title, canonical hub, owner, review cadence, member entities, and required entity and relationship coverage. Definitions must pass the repository validator before activation. An unresolved member, duplicate member, isolated cluster, missing owner, or unsupported relationship is blocking.

## Canonical roles

One page owns one dominant intent. A cluster should normally contain:

1. a canonical pillar or hub that explains scope and routes users;
2. reference pages for stable entities and definitions;
3. task-oriented guides for real questions;
4. comparisons only when the compared criteria and evidence are explicit;
5. update pages only when historical change has independent value.

FAQ is normally a visible facet of the canonical page, not a mechanism for generating question variants. A question may become a separate page only when it has distinct intent, sufficient original value, and a non-duplicative canonical purpose.

## Activation workflow

1. Document the audience, question, cluster family, primary entity, and five-pillar coverage.
2. Search existing canonical records and enrich an existing page when the intent overlaps.
3. Register or reuse governed entities; never create a string-only relationship when an entity should own identity.
4. Define the smallest useful cluster and its required relationship coverage.
5. Produce sources, anatomy, examples, limitations, FAQ, and continuation links.
6. Complete source, subject, SEO, and editorial reviews.
7. Run the authority and repository quality gates.
8. Publish one complete cluster, observe discovery and reader behavior, then expand based on evidence.

## Quality signals

Teams evaluate clusters, not page count:

- percentage of members passing the authority gate;
- relationship and entity-kind coverage;
- orphan and dead-end count;
- canonical overlap and content-decay risk;
- source freshness and overdue review count;
- organic entry growth by cluster;
- onward navigation, return visits, and AI-assisted discovery;
- unanswered questions that are supported by real demand.

Indexed page count is a diagnostic, never the goal.

`lib/content-gap.ts` compares each unambiguously owned hub neighborhood with these blueprints. Generic guides, categories, and industries are not assigned to a cluster merely because the blueprint permits their entity kind; explicit membership or a governed product-family mapping is required. This prevents mechanically plausible but editorially false cluster recommendations.

## Scale boundary

At hundreds of thousands of records, the same contract must survive CMS, search-index, and database adapters. Storage may change, but stable IDs, canonical ownership, revision history, source provenance, review states, cluster membership, and publication authority cannot be weakened. Search indexes are derived projections and never the source of editorial truth.
