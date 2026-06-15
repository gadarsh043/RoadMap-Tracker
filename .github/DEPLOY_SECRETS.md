# GitHub Actions secrets

Go to: **https://github.com/gadarsh043/RoadMap-Tracker/settings/secrets/actions**

---

## Fix deploy error: "FIREBASE_TOKEN or GCP_SA_KEY is required"

You need **one** Firebase auth secret. Easiest method below.

### Option A — `FIREBASE_TOKEN` (recommended, 2 minutes)

**Step 1** — On your Mac, in Terminal:

```bash
cd "/Users/adarshsonu/Desktop/Personal Projects/RoadMap Tracker"
npx firebase login:ci
```

- Browser opens → sign in with Google
- Terminal prints a long token like `1//0abc...`

**Step 2** — Copy that entire token.

**Step 3** — GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Name | Value |
|------|--------|
| `FIREBASE_TOKEN` | paste the token from Step 1 |

**Step 4** — Re-run deploy: **Actions** tab → failed run → **Re-run all jobs**

---

### Option B — Service account JSON (alternative)

| Name | Value |
|------|--------|
| `FIREBASE_SERVICE_ACCOUNT` | Full JSON file from Firebase Console → Project settings → Service accounts → **Generate new private key** |

---

## All secrets needed for auto-deploy

| Secret | Where to get it |
|--------|-----------------|
| `FIREBASE_TOKEN` | `npx firebase login:ci` (see above) **OR** use `FIREBASE_SERVICE_ACCOUNT` instead |
| `VITE_FIREBASE_API_KEY` | `.env.local` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `.env.local` |
| `VITE_FIREBASE_PROJECT_ID` | `roadmap-t` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `.env.local` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `.env.local` |
| `VITE_FIREBASE_APP_ID` | `.env.local` |
| `VITE_VOICE_API_URL` | `https://roadmap-voice-proxy.g-adarsh043.workers.dev` |

---

## Cloudflare Worker (optional)

Groq key lives on Cloudflare, not GitHub. Worker is already deployed manually.

---

## After secrets are set

Every `git push` to `master` auto-deploys **https://roadmap-t.web.app**
