# AGENTS.md — uretir.com

## Current mission

Continue the uretir.com WhatsApp AI channel network implementation.

Read first:
- `docs/codex-whatsapp-handoff.md`
- `docs/whatsapp-ai-channel-network.md`
- `whatsapp-bot/README.md`

## Non-negotiable channel topology

The shared uretir.com publishing network contains:
- HaberAI
- FinansAI
- PuanAI
- İndirimAI
- ArabaAI
- EvAI

**GüzelAI must remain outside this shared WhatsApp publication network.**

## Existing channel bindings

Already connected in `whatsapp-bot/src/index.mjs`:
- HaberAI
- FinansAI
- PuanAI

Awaiting authorization/environment values:
- İndirimAI
- ArabaAI
- EvAI

Required environment values:
- `INDIRIMAI_CHANNEL_URL`
- `INDIRIMAI_CHANNEL_INVITE_CODE`
- `ARABAAI_CHANNEL_URL`
- `ARABAAI_CHANNEL_INVITE_CODE`
- `EVAI_CHANNEL_URL`
- `EVAI_CHANNEL_INVITE_CODE`

## Safety rules

- Never send direct/private WhatsApp messages.
- Only publish to an explicitly verified WhatsApp Channel where the authenticated account is owner/admin.
- Do not treat broadcasts or private chats as channels.
- Keep GüzelAI out of the target list.
- Keep `EVAI_ENABLE_PARTNER_SOURCES=0` until commercial marketplace reuse/API permission is confirmed.
- Do not bypass robots.txt or anti-bot protections.
- Do not claim 30/90/360-day price lows until sufficient real historical data exists.
- Do not describe public auction estimated/opening values as ordinary market value.

## Validation before first post

Run:
- `pnpm quality`
- `node scripts/verify-whatsapp-channel-config.mjs`

Then restart the persistent WhatsApp Web bot and confirm all new channels resolve as owner/admin before sending any test publication.

After authorization, send at most one test post per newly connected channel and inspect logs for accidental private-chat destinations.
