# Navigation and language release — 2026-09-10

User problem: tools, published mobile apps and the map are hard to find and Turkish navigation mixes English labels. The previous interrupted release also contains the requested general product management panel and three planned AI tool pages.

Acceptance: Home, Updates, Map, Tools and Apps are reachable from desktop and mobile navigation. Turkish is the default. English stays in the corresponding translated discovery section; remaining editorial/tool pages use an explicitly labelled Google Translate link. Tools contains browser products; Apps contains published mobile products. Preserve existing catalog and source links. Planned AI tools must not claim working AI capabilities. Entry animation reference is pending the next user task.

Primary outcome: better internal discovery and longer useful sessions. Expected behavior: direct navigation to relevant product type. No telemetry baseline exists; assess navigation selections and tool/app discovery after four weeks when measurement is available. No new tracking is introduced. Existing verified catalog, Vercel configuration and additive database migration are dependencies.

Deployment: preserve the established GitHub main / Vercel production pipeline and custom domain. Local source in the original Documents directories is read-only in this session; release work is retained in the temporary release checkout and Git.

Validation: 35 automated tests pass; temporary PostgreSQL migrations and draft/publish/unpublish lifecycle pass; production dependency audit is clean after Next.js 15.5.24 and sharp 0.35.4 patches; production build and 618 search checks pass. HTTP smoke checks pass for all five Turkish and English discovery routes, an English product detail and management page. Unauthenticated management API returns 401 and /map redirects with 308 to /harita.
