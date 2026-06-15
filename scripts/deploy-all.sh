#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Checking Firebase login..."
if ! npx firebase projects:list >/dev/null 2>&1; then
  echo ""
  echo "Firebase CLI is not logged in."
  echo "Run: npx firebase login"
  exit 1
fi

if [ -z "${VITE_VOICE_API_URL:-}" ] && [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [ -z "${VITE_VOICE_API_URL:-}" ]; then
  echo ""
  echo "VITE_VOICE_API_URL is not set."
  echo "Deploy the Cloudflare worker first (see docs/CLOUDFLARE.md), then add to .env.local:"
  echo "  VITE_VOICE_API_URL=https://roadmap-voice-proxy.<account>.workers.dev"
  echo ""
  read -r -p "Continue hosting deploy without voice URL? [y/N] " ans
  if [[ ! "$ans" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "==> Deploying Firestore rules..."
npx firebase deploy --only firestore:rules

echo "==> Building frontend..."
npm run build

echo "==> Deploying hosting..."
npx firebase deploy --only hosting

echo ""
echo "==> Deploy complete!"
echo "Hosting: https://roadmap-t.web.app"
echo ""
echo "Voice: deploy worker with  npm run deploy:worker  (see docs/CLOUDFLARE.md)"
