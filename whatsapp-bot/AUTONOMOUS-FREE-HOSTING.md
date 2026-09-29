# Üretir WhatsApp Publisher — no-prompt autonomous hosting

## Recommended zero-recurring-hosting-cost layout

1. **uretir.com / Vercel** remains the data and feed layer.
2. **GitHub Actions** continues scheduled source refresh jobs.
3. **WhatsApp Publisher** runs as one long-lived Docker container on an Oracle Cloud Always Free VM (or an always-on local machine).
4. The WhatsApp session and send fingerprints live on persistent storage at `/data`.
5. After one QR pairing, the container restarts automatically and publishes without ChatGPT prompts.

## Why Railway is not the primary free host

Railway Free has a monthly resource credit, not unlimited compute. It is useful as a staging/fallback host but must not be the only publisher if the requirement is no recurring hosting bill.

## Oracle Always Free deployment

Use an Always Free-eligible compute shape in the tenancy home region. ARM/Ampere is suitable; the Dockerfile supports Debian/ARM Chromium packages.

On the VM:

```bash
git clone https://github.com/thezencirs/uretir-com.git
cd uretir-com/whatsapp-bot
cp .env.example .env
# Edit PANEL_TOKEN in .env
bash deploy-oracle-always-free.sh
```

The compose file binds the panel to localhost only. Open an SSH tunnel from your computer:

```bash
ssh -L 3217:127.0.0.1:3217 ubuntu@YOUR_VM_IP
```

Then open `http://127.0.0.1:3217/?token=YOUR_PANEL_TOKEN` once and scan the WhatsApp QR with the account that owns/administers all six channels. Port 3217 does not need to be exposed publicly.

## Local-PC fallback

The same folder also works with Docker Desktop:

```powershell
Copy-Item .env.example .env
docker compose up -d --build
```

This has no cloud hosting bill but requires the computer and internet connection to remain on.

## Operational guarantees

- One Chromium/WhatsApp session serves all six channels.
- Poll interval defaults to 10 minutes.
- Per-channel publish limits and fingerprint deduplication remain active.
- EvAI keeps its daily cap.
- Container restarts automatically after host reboot.
- Persistent session state survives container replacement.

No third-party free tier can be guaranteed to stay free or unlimited forever; this architecture avoids paid AI/API dependencies in the publication loop and can move between hosts without code changes.


## Self-healing data loop

`.github/workflows/channel-autopilot.yml` checks all six WhatsApp-ready feeds every hour. If HaberAI, PuanAI, IndirimAI, ArabaAI or EvAI becomes empty, it calls the corresponding protected refresh endpoint and checks again. This workflow is intentionally separate from message delivery: GitHub repairs data, the long-running publisher delivers messages.
