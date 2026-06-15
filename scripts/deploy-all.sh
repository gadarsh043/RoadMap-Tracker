#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Checking Firebase login..."
if ! npx firebase projects:list >/dev/null 2>&1; then
  echo ""
  echo "Firebase CLI is not logged in."
  echo "Run this in your terminal first:"
  echo "  npx firebase login"
  echo ""
  echo "Then re-run: npm run deploy:all"
  exit 1
fi

echo "==> Deploying Firestore rules..."
npx firebase deploy --only firestore:rules

echo "==> Checking GROQ_API_KEY secret..."
if ! npx firebase functions:secrets:access GROQ_API_KEY >/dev/null 2>&1; then
  echo ""
  echo "GROQ_API_KEY secret is not set."
  echo "Run this and paste your Groq key when prompted:"
  echo "  npx firebase functions:secrets:set GROQ_API_KEY"
  echo ""
  echo "Then re-run: npm run deploy:all"
  exit 1
fi

echo "==> Building frontend..."
npm run build

echo "==> Deploying functions, hosting, and rules..."
npx firebase deploy

echo ""
echo "==> Deploy complete!"
echo "Hosting: https://roadmap-t.web.app"
echo ""
echo "Next steps (one-time admin setup):"
echo "1. Firebase Console -> Authentication -> Add user g.adarsh043@gmail.com"
echo "2. Open: https://us-central1-roadmap-t.cloudfunctions.net/seedAdmin"
echo "3. Sign out and sign back in to refresh admin claim"
