# Cloudflare + Firebase hosting setup

Voice AI runs on a **free Cloudflare Worker**. Firebase (Spark) hosts the app, auth, and database.

## Architecture

```
Browser (roadmap-t.web.app)
  ├── Firebase Auth / Firestore / Hosting  (free Spark)
  └── POST → Cloudflare Worker
        ├── /              → Groq (voice)
        └── /create-user   → Firebase Admin (user creation)
                              ↑
                         secrets (never in browser)
```

## Cloudflare Dashboard (Git-connected build)

If you connected the GitHub repo in **Workers & Pages → Create → Worker → Connect to Git**, use these settings.  
This deploys **only the voice worker** — not the React app (Firebase still hosts that).

| Setting | Value |
|---------|--------|
| **Root directory** | `workers/voice-proxy` |
| **Build command** | *(leave empty)* or `npm install` |
| **Deploy command** | `npx wrangler deploy` |

**Do not use:**

| Wrong | Why |
|-------|-----|
| Root `/` | Installs 800+ packages and builds the Vite app |
| Build `npm run build` | Builds the frontend, not the worker |

### Secrets in Cloudflare (required)

Dashboard → **Workers & Pages** → **roadmap-voice-proxy** → **Settings** → **Variables and Secrets**:

| Name | Type | Value |
|------|------|--------|
| `GROQ_API_KEY` | Secret | Your `gsk_...` Groq key |
| `FIREBASE_API_KEY` | Secret | Same as `VITE_FIREBASE_API_KEY` in `.env.local` |
| `FIREBASE_SERVICE_ACCOUNT` | Secret | Full JSON from Firebase Console → Project settings → Service accounts → Generate new private key |

`ALLOWED_ORIGINS` is already in `wrangler.toml` — no need to duplicate unless you override in the dashboard.

### After a successful deploy

Your worker URL looks like:

`https://roadmap-voice-proxy.<your-subdomain>.workers.dev`

Find it on the worker overview page in the Cloudflare dashboard, or in the deploy log line `Published roadmap-voice-proxy`.

Add to `.env.local` and GitHub secret `VITE_VOICE_API_URL`.

---

## One-time: Cloudflare Worker (CLI)

### 1. Create a free Cloudflare account

https://dash.cloudflare.com/sign-up (no card required for Workers free tier)

### 2. Install worker dependencies

```bash
cd workers/voice-proxy
npm install
```

### 3. Log in to Wrangler

```bash
npx wrangler login
```

### 4. Set secrets

Use the same values you already have locally:

```bash
cd workers/voice-proxy

# Groq key (gsk_...)
npx wrangler secret put GROQ_API_KEY

# Firebase Web API key (same as VITE_FIREBASE_API_KEY in .env.local)
npx wrangler secret put FIREBASE_API_KEY

# Firebase Admin service account JSON (for admin "Create user" in the app)
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT
```

### 5. Update allowed origins (if needed)

Edit `workers/voice-proxy/wrangler.toml` → `ALLOWED_ORIGINS` should include:

- `http://localhost:5173`
- `https://roadmap-t.web.app`
- `https://roadmap-t.firebaseapp.com`
- Any custom domain you add later

### 6. Deploy the worker

```bash
npm run deploy
# or from repo root: npm run deploy:worker
```

Copy the URL printed, e.g. `https://roadmap-voice-proxy.<account>.workers.dev`

### 7. Point the frontend at the worker

In `.env.local`:

```
VITE_VOICE_API_URL=https://roadmap-voice-proxy.<account>.workers.dev
```

Restart `npm run dev` and test the mic while signed in.

## Firebase hosting (no Blaze)

```bash
npx firebase login
npm run deploy:hosting
```

Or full rules + hosting:

```bash
npm run deploy:rules
npm run deploy:hosting
```

**Do not** deploy Cloud Functions unless you upgrade to Blaze. Voice no longer uses them.

## GitHub Actions

Add these repository secrets:

| Secret | Purpose |
|--------|---------|
| `VITE_VOICE_API_URL` | Worker URL after deploy |
| `CLOUDFLARE_API_TOKEN` | Workers deploy (optional CI) |
| `CLOUDFLARE_ACCOUNT_ID` | From Cloudflare dashboard |

Existing `VITE_FIREBASE_*` and `FIREBASE_SERVICE_ACCOUNT` secrets stay the same.

## Re-deploy worker after changes

```bash
npm run deploy:worker
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error on create user | Redeploy worker; ensure `FIREBASE_SERVICE_ACCOUNT` secret is set |
| CORS error on voice | Add your origin to `ALLOWED_ORIGINS` in `wrangler.toml`, redeploy worker |
| 403 Admin access required | Sign in as the admin email (`ADMIN_EMAIL` in `wrangler.toml`) |
| 503 User creation not configured | Set `FIREBASE_SERVICE_ACCOUNT` secret on the worker |
| 401 Unauthorized | Sign in to the app first; token must be valid |
| Voice API not configured | Set `VITE_VOICE_API_URL` in `.env.local` or GitHub secret |
| Groq errors | Check `GROQ_API_KEY` secret: `npx wrangler secret list` |
| `ERR_BLOCKED_BY_CLIENT` on Firestore | Browser ad blocker — disable for your site or ignore (usually harmless) |
