# Site editor and developments

The requested outcome is more returning readers through a maintained, source-linked news desk and faster editorial updates without code changes. Baseline: no news desk or site-copy editor. Over four weeks, measure returning visits and time needed to rename a menu item; target more returning visits and under two minutes per rename. These are targets, not observed results; no analytics provider is connected.

Scope: five news categories, primary-source summaries, editable navigation labels and homepage headings, and an authenticated editor. Existing URLs and reference-article gates remain intact. This is an editorial snapshot, not exhaustive coverage or an automatic news feed.

Acceptance: anonymous visitors cannot edit; drafts stay private; published changes persist across browsers; concurrent edits cannot silently overwrite one another; news has a source and verification date.

## Owner workflow

Open /yonetici and sign in with the existing PuanAI administrator password. Edit **Üst başlıklar**, **Ana sayfa** and **Haberler**. Save a draft, inspect the preview, then publish. Publication applies the entire edited document. Menu URLs and category identifiers remain stable when names change.

The editor shares the existing administrator role. DATABASE_URL, PUANAI_ADMIN_PASSWORD and a 32+ character PUANAI_SESSION_SECRET must be configured on the server. Apply migrations with pnpm db:migrate before release. Never expose these values as public environment variables.

Published data and the current draft live in site_content. Publishing retains the previous published document for restoration. Optimistic revision checks protect concurrent saves. Without a database, public routes show the bundled snapshot and the editor refuses saves. A configured database failure is surfaced instead of silently replacing edits with defaults.

This change is prepared locally, not deployed to uretir.com. Bundled news was researched on 11 September 2026; publication, check, deadline and event dates are separate. Date statuses use Europe/Istanbul. Future-dated news and hidden entries are excluded. No scheduled collection is configured.
