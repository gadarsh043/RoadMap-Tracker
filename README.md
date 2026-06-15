# Roadmap Tracker

A collaborative roadmap app with a zigzag timeline UI, voice-to-idea input (Groq Whisper + LLM), heart voting, and admin drag-and-drop scheduling.

## Stack

- **Frontend:** Vite, React, TypeScript, Tailwind v4
- **Backend:** Firebase Auth, Firestore, Cloud Functions
- **Voice AI:** Groq API (server-side only)
- **Deploy:** Firebase Hosting

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

Fill in your Firebase web config:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Update `.firebaserc` with your project ID.

### 3. Install & run locally

```bash
npm install
npm run dev
# or
npm run dev:local
```

Open `http://localhost:5173`. Text ideas, auth, and hearts work once `.env.local` is filled. Voice needs deployed functions.

### 4. Cloud Functions (Groq key — server-side only)

**Do NOT put your Groq key in `.env.local` or GitHub.**

After `npx firebase login`:

```bash
npx firebase functions:secrets:set GROQ_API_KEY
# Paste your gsk_... key when prompted
```

### 5. Deploy everything

```bash
npx firebase login          # one-time, opens browser
npm run deploy:all          # rules → functions → hosting
```

Or step by step:

```bash
npm run deploy:rules
npm run deploy:functions
npm run deploy
```

### 6. Seed admin

1. In Firebase Console → Authentication, manually create user `g.adarsh043@gmail.com` with a password
2. Call the seed function once:

```
https://<region>-<project-id>.cloudfunctions.net/seedAdmin
```

This sets the `admin` custom claim and creates the admin user profile.

## Features

- **Public view** — anyone can browse the roadmap
- **Logged-in users** — submit ideas (text or voice), heart Up Next / Exploring items
- **Admin** (`g.adarsh043@gmail.com`) — drag cards to calendar dates, drop on zone headers to override status, create new users

## Voice input

1. Click the mic icon in the floating bottom bar
2. Speak your idea
3. Groq Whisper transcribes → LLM extracts title, description, emoji
4. Confirm and pick an estimated date

## Admin scheduling

- Drag any card onto a date in the admin calendar strip
- Drop a card on a zone header (Shipped / Building / Up Next / Exploring) to manually override its zone
- Pinned icon indicates manually placed items
