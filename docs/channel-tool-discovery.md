# Six-tool discovery and research interfaces

## User problem and scope
Visitors could not discover all six channel tools from the homepage, and the automotive, property and price-history screens were basic report lists. The homepage and tool directory now expose HaberAI, FinansAI, PuanAI, İndirimAI, ArabaAI and EvAI with separate tool-opening and WhatsApp actions.

The public channel registry is in `lib/channel-tools.ts`. Shared navigation connects the six interfaces. Existing HaberAI, FinansAI and PuanAI workflows remain available. ArabaAI, EvAI and İndirimAI add search, source/location filters, a TRY budget limit, sorting, incremental results and comparison of up to three records. Sorting groups currencies; it does not imply an exchange rate.

## Acceptance and data boundaries
- Each homepage card opens the matching tool and its exact authorized public channel.
- Responsive controls and comparison tables support narrow screens and keyboard navigation.
- Missing data produces an explicit empty or unavailable state; there are no invented records.
- Price-history provisional observations stay outside 30/90/360-day lows.
- Automotive campaigns require current dates. Public auction estimates and reasons never imply ordinary market value.
- Source URLs must use HTTPS; no source images or article bodies are republished.
- This UI change does not activate a publisher, collect new source records, modify delivery state, or change database schema. Refresh reloads current reports.

## Outcome and measurement
Primary outcome: deeper sessions through tool discovery and useful internal links. Existing privacy-safe discovery_select and navigation_select events identify tool destinations without collecting queries, budgets or user selections. Baseline: not yet measured. Evaluate homepage-to-tool opens and cross-tool navigation over 30 days after release; target is an increase from the measured baseline, with no claimed uplift before evidence.

## Validation and rollback
Run pnpm quality and inspect the homepage, directory, all six destinations and mobile comparison behavior. Adapter tests cover dated campaign eligibility, insufficient price history and auction labeling. Rollback is an application release reversal; no data migration is introduced.
