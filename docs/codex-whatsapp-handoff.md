# Codex Handoff — Uretir WhatsApp AI Network

Date: 2026-09-27

## Goal

Continue implementation in Codex while this ChatGPT thread is used for WhatsApp channel authorization and brand assets.

The production architecture is:

```text
uretir.com
  ├─ HaberAI
  ├─ FinansAI
  ├─ PuanAI
  ├─ İndirimAI
  ├─ ArabaAI
  └─ EvAI

GüzelAI is intentionally NOT part of this WhatsApp publication network.
```

## Current production health

- Repository quality gate: PASS
- Production smoke checks: PASS
- Vercel production deployment: PASS
- Prisma migrations are deployed through `vercel-build = pnpm db:migrate && pnpm build`
- Public routes and APIs are smoke-tested after successful quality builds.
- Cron routes must return 401 without authorization.

## Existing connected WhatsApp channels

The current WhatsApp Web bot already contains these channel invite codes:

- HaberAI: `0029VbDk4gHGpLHXkGseaf3Y`
- FinansAI: `0029VbDIS6B4inoiXI8jeE05`
- PuanAI: `0029VbDbbII8PgsA574OLl1H`

Do not send private/direct messages. Publishing is channel-only.

## Awaiting channel authorization

These targets are already implemented but remain disabled until their environment values exist:

- `INDIRIMAI_CHANNEL_INVITE_CODE`
- `INDIRIMAI_CHANNEL_URL`
- `ARABAAI_CHANNEL_INVITE_CODE`
- `ARABAAI_CHANNEL_URL`
- `EVAI_CHANNEL_INVITE_CODE`
- `EVAI_CHANNEL_URL`

Once supplied, no architecture rewrite should be needed.

## WhatsApp bot

Main file:
- `whatsapp-bot/src/index.mjs`

Behavior:
- HaberAI: claim mode
- FinansAI: snapshot mode, ~hourly
- PuanAI: queue mode, ~hourly
- İndirimAI: snapshot mode, ~hourly once authorized
- ArabaAI: queue mode, ~hourly once authorized
- EvAI: queue mode, 75-minute minimum interval and hard daily cap of 10 once authorized

The bot deduplicates fingerprints and rotates group/category where possible.

## Production endpoints

### HaberAI
- `/api/haber-ai/whatsapp`

### FinansAI
- `/api/finans-ai`
- `/api/finans-ai/whatsapp`

### PuanAI
- `/api/puan-ai/whatsapp`

### İndirimAI
- `/indirim-ai`
- `/api/indirim-ai`
- `/api/cron/indirim-ai`
- `/api/indirim-ai/whatsapp`

### ArabaAI
- `/araba-ai`
- `/api/araba-ai`
- `/api/cron/araba-ai`
- `/api/araba-ai/whatsapp`

### EvAI
- `/ev-ai`
- `/api/ev-ai`
- `/api/cron/ev-ai`
- `/api/ev-ai/whatsapp`

## Data-source safety

### İndirimAI
- Tracks trusted commerce sources.
- Honors robots.txt fail-closed.
- 30/90/360-day low labels are only emitted after sufficient real observation history.
- Do not backfill invented history.

### ArabaAI
- Tracks official automotive price lists and campaigns.
- Stores price history.
- Prefer campaigns with explicit validity dates for WhatsApp publication.

### EvAI
- Public/government sources can operate subject to robots/access rules.
- Commercial marketplace adapters remain disabled by default:
  `EVAI_ENABLE_PARTNER_SOURCES=0`
- Do not enable sahibinden.com / Emlakjet / Hepsiemlak / Zingat reuse until permission/API/reuse terms are confirmed.
- Public auction / estimated values must not be described as ordinary market value.
- WhatsApp daily publication cap: 10.

## Scheduling

Workflow:
- `.github/workflows/indirim-araba-ai-refresh.yml`

Cadence:
- İndirimAI: every 6h
- ArabaAI: every 4h
- EvAI: every 2h

Production health workflow:
- `.github/workflows/production-smoke.yml`

## Recent SEO/quality fixes

The prior 19 search-foundation failures were resolved. Important fixes include:
- sitemap coverage
- OG canonical alignment
- redirect/noindex handling
- structural HTML validation excluding scripts/templates
- public static assets excluded from broken-route detection
- Üretir ID removed from production primary navigation
- provider-neutral navigation analytics restored

Do not regress these checks.

## Next Codex tasks after channel authorization

1. Insert the three new channel invite codes/URLs through deployment environment configuration.
2. Restart/redeploy the WhatsApp Web bot process.
3. Verify owner/admin access for each channel.
4. Run one dry-run fetch against each `/api/*/whatsapp` endpoint.
5. Send exactly one test post to each newly authorized channel.
6. Confirm no private chat/DM destinations appear in logs.
7. Confirm fingerprint state persists across bot restart.
8. Confirm EvAI stops after 10 channel posts within an Istanbul calendar day.
9. Keep GüzelAI outside the shared channel target list.

## Brand rule

All channel posts should reinforce uretir.com:
- HaberAI • uretir.com
- FinansAI • uretir.com
- PuanAI • uretir.com
- İndirimAI • uretir.com
- ArabaAI • uretir.com
- EvAI • uretir.com
