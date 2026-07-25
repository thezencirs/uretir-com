# Universal Search

## Current behavior

`/ara` searches public AI hubs and discovery centres. In local editorial preview it can also display review records with an explicit label. In production, articles, guides, and companies enter the index only after the existing publication authority gate passes.

Search-result pages are always `noindex,follow`. Canonical topic and entity pages—not query combinations—are the indexable destinations.

## Architecture

`lib/search-index.ts` defines a provider-neutral `SearchIndexAdapter`. The repository adapter supplies the safe fallback and:

- normalizes Turkish characters;
- ranks title, keyword, and summary matches deterministically;
- filters by record kind and limits query length;
- preserves trust-state labels;
- rejects duplicate records and production review leakage.

An external engine may replace retrieval when the corpus requires it, but must produce the same public record contract and preserve the publication boundary.

## Measurement boundary

The current implementation does not persist raw search queries. After a consent-aware analytics adapter is approved, measure search starts, result selections, privacy-preserving zero-result aggregates, result-type distribution, continuation depth, repeated searches, and time to a useful destination.

Do not send raw prompts, query strings, email addresses, company names entered by users, or document text to an analytics provider by default.

## Relevance operations

Search review includes Turkish spelling and diacritics, aliases, entity ambiguity, empty results, stale-record exclusion, mobile keyboard flow, focus order, and trust labels. Aggregated zero-result evidence is one editorial signal, never automatic permission to create a page.
