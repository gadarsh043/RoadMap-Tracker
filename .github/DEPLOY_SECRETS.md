# GitHub Actions secrets (Settings → Secrets and variables → Actions)

## Firebase deploy (required)

| Secret | Value |
|--------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | Full JSON from Firebase Console → Project settings → Service accounts → Generate new private key |
| `VITE_FIREBASE_API_KEY` | From `.env.local` |
| `VITE_FIREBASE_AUTH_DOMAIN` | From `.env.local` |
| `VITE_FIREBASE_PROJECT_ID` | `roadmap-t` |
| `VITE_FIREBASE_STORAGE_BUCKET` | From `.env.local` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From `.env.local` |
| `VITE_FIREBASE_APP_ID` | From `.env.local` |
| `VITE_VOICE_API_URL` | Cloudflare Worker URL after `npm run deploy:worker` |

## Cloudflare Worker (optional — for CI worker deploy)

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create (Workers edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar |

Groq key is **not** a GitHub secret. Set it on Cloudflare:

```bash
cd workers/voice-proxy
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put FIREBASE_API_KEY
```

See [docs/CLOUDFLARE.md](../docs/CLOUDFLARE.md) for full setup.

## After first deploy

1. Create user `g.adarsh043@gmail.com` in Firebase Authentication (admin is matched by email in Firestore rules).
