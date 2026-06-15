# GitHub Actions secrets (Settings → Secrets and variables → Actions)

## Required for CI deploy

| Secret | Value |
|--------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | Full JSON from Firebase Console → Project settings → Service accounts → Generate new private key |
| `VITE_FIREBASE_API_KEY` | From `.env.local` |
| `VITE_FIREBASE_AUTH_DOMAIN` | From `.env.local` |
| `VITE_FIREBASE_PROJECT_ID` | `roadmap-t` |
| `VITE_FIREBASE_STORAGE_BUCKET` | From `.env.local` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From `.env.local` |
| `VITE_FIREBASE_APP_ID` | From `.env.local` |

## Groq key (one-time, via Firebase CLI — NOT a GitHub secret)

```bash
npx firebase login
npx firebase functions:secrets:set GROQ_API_KEY
```

## After first deploy

1. Create user `g.adarsh043@gmail.com` in Firebase Authentication
2. Visit `https://us-central1-roadmap-t.cloudfunctions.net/seedAdmin` once
3. Sign out and back in
