# Roadmap Tracker

A collaborative roadmap app with a zigzag timeline UI, voice-to-idea input (Groq Whisper + LLM), heart voting, and admin drag-and-drop scheduling.

## Quick finish (Firebase Spark + Cloudflare — no Blaze)

```bash
# 1. Cloudflare worker (voice — Groq key stays on Cloudflare)
cd workers/voice-proxy && npm install
npx wrangler login
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put FIREBASE_API_KEY   # same as VITE_FIREBASE_API_KEY
npm run deploy
# Copy worker URL → VITE_VOICE_API_URL in .env.local

# 2. Firebase hosting (free Spark)
npx firebase login
npm run deploy:all
```

Full steps: [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md)

**Repo:** https://github.com/gadarsh043/RoadMap-Tracker (branch: `master`)

## Stack

- **Frontend:** Vite, React, TypeScript, Tailwind v4
- **Backend:** Firebase Auth, Firestore, Hosting (Spark — free)
- **Voice AI:** Cloudflare Worker → Groq API (free tier, key server-side)
- **Deploy:** Firebase Hosting + Cloudflare Workers

## Setup

### 1. Firebase project

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore** database
4. Register a web app and copy config values

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in your Firebase web config and Cloudflare worker URL:

```
VITE_FIREBASE_API_KEY=...
...
VITE_VOICE_API_URL=https://roadmap-voice-proxy.<account>.workers.dev
```

See [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md) to deploy the worker and get this URL.

**Do NOT put your Groq key in `.env.local`** — it lives in Cloudflare Worker secrets only.

### 3. Install & run locally

```bash
npm install
npm run dev
# or
npm run dev:local
```

Open `http://localhost:5173`. Text ideas, auth, and hearts work once `.env.local` is filled. Voice needs the Cloudflare worker URL in `VITE_VOICE_API_URL`.

### 4. Cloudflare Worker (Groq — free, no Firebase Blaze)

See **[docs/CLOUDFLARE.md](docs/CLOUDFLARE.md)** for full steps.

```bash
cd workers/voice-proxy
npm install
npx wrangler login
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put FIREBASE_API_KEY
npm run deploy
```

Add the worker URL to `.env.local` as `VITE_VOICE_API_URL`.

### 5. Deploy hosting (Firebase Spark)

```bash
npx firebase login
npm run deploy:all
```

Deploys Firestore rules + hosting only (no Cloud Functions / no Blaze).

## Features

- **Public view** — anyone can browse the roadmap
- **Logged-in users** — submit ideas (text or voice), heart Up Next / Exploring items
- **Admin** (`g.adarsh043@gmail.com`) — drag cards to calendar dates, drop on zone headers to override status, create new users

## Voice input

1. Sign in
2. Click the mic in the floating bottom bar
3. Audio → Cloudflare Worker → Groq Whisper + LLM → title, description, emoji
4. Confirm and pick an estimated date

Requires `VITE_VOICE_API_URL` pointing at your deployed worker.

## Admin scheduling

- Drag any card onto a date in the admin calendar strip
- Drop a card on a zone header (Shipped / Building / Up Next / Exploring) to manually override its zone
- Pinned icon indicates manually placed items
