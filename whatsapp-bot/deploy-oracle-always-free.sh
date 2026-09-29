#!/usr/bin/env bash
set -euo pipefail

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created whatsapp-bot/.env. Set PANEL_TOKEN to a long random value, then run this script again."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose-plugin
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER" || true
  echo "Docker installed. Log out/in once if docker requires group permission, then rerun."
  exit 0
fi

docker compose up -d --build
docker compose ps

echo
echo "Publisher is configured with restart=unless-stopped and persistent Docker storage."
echo "Open TCP 3217 only to your own IP/VPN if you need remote QR access."
echo "Health: http://127.0.0.1:3217/health"
