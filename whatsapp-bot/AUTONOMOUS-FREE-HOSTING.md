# Üretir WhatsApp Publisher — autonomous no-prompt architecture

## Primary zero-hosting-cost publisher: GitHub Actions

The repository is public. The primary publisher therefore runs as a short-lived GitHub Actions job twice per hour instead of consuming an always-on VM.

- The WhatsApp LocalAuth directory and channel fingerprint state are archived after every run.
- The archive is encrypted with a key derived from the existing GitHub `CRON_SECRET` secret before it enters Actions cache.
- Each run restores and decrypts that state, starts WhatsApp Web, checks all six channels once, sends only due/unseen content, then encrypts state again and exits.
- One initial QR scan is required. After that no ChatGPT prompt is part of the publication loop.
- Railway and Oracle/local Docker remain optional fallback modes.

This avoids a recurring publisher-hosting bill and keeps publication compute ephemeral. Standard GitHub-hosted runner usage for public repositories is free under GitHub's published policy.

## Data self-healing

`.github/workflows/channel-autopilot.yml` checks all six uretir.com feeds hourly. Empty feeds trigger the relevant protected refresh endpoint and are checked again.

## Fallback: long-running Docker publisher

If scheduled Actions are ever unavailable, the same bot can run continuously with Docker Compose on an owner-controlled machine or an eligible cloud VM.

```bash
cd whatsapp-bot
cp .env.example .env
docker compose up -d --build
```

The compose profile stores LocalAuth and delivery state on a persistent Docker volume and restarts automatically. Its panel binds only to localhost. For a remote machine use SSH tunneling:

```bash
ssh -L 3217:127.0.0.1:3217 ubuntu@YOUR_VM_IP
```

Then open `http://127.0.0.1:3217/?token=YOUR_PANEL_TOKEN`.

## Cost caveat

"No recurring hosting bill" is achievable; no third-party service can be guaranteed to remain literally unlimited forever. Railway Free is credit-limited, Vercel Hobby is quota-limited, and Oracle Always Free has resource and idle-reclamation rules. The repository is designed so the publisher is portable and does not depend on paid LLM/API calls.
