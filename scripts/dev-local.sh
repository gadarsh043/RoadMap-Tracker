#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local — copy .env.example and fill VITE_FIREBASE_* values."
  exit 1
fi

echo "==> Installing dependencies..."
npm install
cd functions && npm install && cd ..

echo "==> Starting dev server at http://localhost:5173"
echo "    Sign in at /login after creating a user in Firebase Console."
echo "    Voice input requires deployed Cloud Functions (npm run deploy:all)."
npm run dev
