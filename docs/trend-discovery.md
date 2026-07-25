# Trend Discovery Center

## Purpose

The Trend Discovery Center identifies evidence-backed content opportunities. It is not a news generator and never labels editorial intuition as a trend.

The implementation contract is defined in `lib/trend-discovery.ts`; the transparent product foundation is available at `/trendler`.

## Source policy

Supported source classes:

- first-party search performance;
- search-interest tools;
- official statistics;
- official institution bulletins;
- attributable government announcements;
- attributable technology and industry news;
- attributable editorial observations.

Every signal records its provider record ID, source, provenance URL, observation and retrieval times, measurement window, direction, verification time, and optional sample size. Connector checkpoints and ingestion batches are provider-neutral and validated before a signal can enter opportunity assessment. Source connection and signal verification are separate states.

## Opportunity gate

A topic remains blocked unless it has:

- at least two verified signals;
- signals from at least two source kinds;
- at least one first-party or official source;
- a real user question;
- related entity IDs;
- editorial evaluation of originality and usefulness.

Passing the signal gate creates a candidate, not a page. Human editorial review determines whether to enrich an existing canonical guide, create a new guide, or take no action.

Technology and industry news are supporting secondary signals. They cannot satisfy the required first-party or official evidence by themselves. The repository currently has no connected source and therefore makes no trend claim.

## Prohibited behavior

- fabricated search-volume numbers;
- inferred trends presented as measured facts;
- automated page publication;
- keyword-variant page generation;
- copying news summaries;
- treating one viral observation as durable demand.
