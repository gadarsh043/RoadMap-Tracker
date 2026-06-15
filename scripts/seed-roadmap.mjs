/**
 * Seed LocalPRO Hub roadmap items directly into Firestore.
 *
 * Usage (pick one):
 *   1. In the app: sign in → click "Import LocalPRO" in the header
 *   2. CLI: download service account JSON from Firebase Console, then:
 *      GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/seed-roadmap.mjs
 */

import { readFileSync, existsSync } from 'fs'
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const PROJECT_ID = 'roadmap-t'
const SEED_TAG = 'localpro-hub-v1'
const SEED_USER = 'seed-script'
const ADMIN_EMAIL = 'g.adarsh043@gmail.com'
const forceReset = process.argv.includes('--force')

const seedItems = [
  { title: 'Project bootstrap & foundation', description: 'Vite + React 18 + TypeScript, Tailwind v4, Framer Motion, shadcn/ui, Supabase client, brand assets.', emoji: '🏗️', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-05-28' },
  { title: 'Supabase schema & RLS', description: 'Migrations 001–009: users, listings, milestones, email templates, admin RPCs.', emoji: '🗄️', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-05-29' },
  { title: 'Authentication UI', description: 'Login, 2-step signup, pending page, password toggles, secure auth note.', emoji: '🔐', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-05-30' },
  { title: 'Role-based routing & guards', description: 'Protected routes, session sync, role homes, profile menu.', emoji: '🛡️', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-05-30' },
  { title: 'Admin user approvals', description: 'Approve/reject, bulk ops, role selector, self-protection, permanent delete.', emoji: '✅', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-05-31' },
  { title: 'Agent Mission Control dashboard', description: 'RLS listings, tabs, filters, search, pipeline cards.', emoji: '🎛️', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-01' },
  { title: 'Listing Hub (shareable)', description: 'Editable /listing/:id, stage buttons, draft routing, delete draft.', emoji: '🏠', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-02' },
  { title: 'Admin Mission Control split', description: 'Pipeline overview + separate approvals, AdminShell sidebar.', emoji: '👑', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-03' },
  { title: 'Signup → admin email (n8n)', description: 'FastAPI proxy → n8n → Gmail on pending signup.', emoji: '📧', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-04' },
  { title: 'Profile & admin user roster', description: '/profile, admin rosters, bulk ops, create-user API.', emoji: '👤', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-05' },
  { title: 'Role-based signup & global grid', description: 'Multi-role access requests, grid background, auth split layout.', emoji: '🎨', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-06' },
  { title: 'NTREIS 22-section form', description: 'New listing, address step, 22 sections, auto-save, review flow.', emoji: '📋', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-08' },
  { title: 'Voice Fill Q&A', description: 'GROQ transcribe/extract, edge-tts, push-to-talk, hands-free VAD.', emoji: '🎤', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-10' },
  { title: 'Agent shell & sidebar polish', description: 'Pipeline legend, quick links, profile initials, a11y fixes.', emoji: '🧭', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-11' },
  { title: 'Agent milestone automations', description: 'Personal dates, template editor, n8n daily + manual run, sent log.', emoji: '🎂', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-12' },
  { title: 'Mock listings & quality pass', description: 'Test data, ESLint clean, builds pass, error boundaries.', emoji: '✨', status: 'shipped', statusOverride: true, targetDate: null, shippedDate: '2026-06-12' },
  { title: 'Agent welcome email on approval', description: 'n8n welcome email when admin approves user.', emoji: '👋', status: 'building', statusOverride: true, targetDate: '2026-06-02', shippedDate: null },
  { title: 'Multi-admin signup notifications', description: 'Alert Maria + Morgan on new signups.', emoji: '📬', status: 'building', statusOverride: true, targetDate: '2026-06-03', shippedDate: null },
  { title: 'Admin pipeline filters', description: 'Filter by agent, stage, date on org overview.', emoji: '🔍', status: 'building', statusOverride: true, targetDate: '2026-06-05', shippedDate: null },
  { title: 'Admin edit any listing', description: 'Admins edit any agent listing from Listing Hub.', emoji: '✏️', status: 'building', statusOverride: true, targetDate: '2026-06-06', shippedDate: null },
  { title: 'RESO property search + pre-fill', description: 'MLS search to pre-fill NTREIS form. Needs API creds.', emoji: '🔗', status: 'upcoming', statusOverride: true, targetDate: '2026-06-12', shippedDate: null },
  { title: 'Dot Loop documents hub', description: 'Create loop, webhooks, auto-advance to docs_signed.', emoji: '📄', status: 'upcoming', statusOverride: true, targetDate: '2026-06-20', shippedDate: null },
  { title: 'Photography booking', description: 'Calendar, tier, booking panel → shoot_booked.', emoji: '📸', status: 'upcoming', statusOverride: true, targetDate: '2026-06-28', shippedDate: null },
  { title: 'Marketing hub + Canva', description: 'Asset cards, GROQ brief, n8n fan-out to marketing.', emoji: '🎯', status: 'upcoming', statusOverride: true, targetDate: '2026-07-06', shippedDate: null },
  { title: 'Chrome extension — LP Fill', description: 'Plasmo, NTREIS field mapping, checklist mirror.', emoji: '🧩', status: 'upcoming', statusOverride: true, targetDate: '2026-07-18', shippedDate: null },
  { title: 'Go Live celebration', description: 'Final checklist, AI description, confetti, n8n fan-out.', emoji: '🚀', status: 'upcoming', statusOverride: true, targetDate: '2026-07-25', shippedDate: null },
  { title: 'Netlify + Railway deploy', description: 'Production hosting for frontend + FastAPI + n8n.', emoji: '🌐', status: 'upcoming', statusOverride: true, targetDate: '2026-08-20', shippedDate: null },
  { title: 'Buyer listing flow', description: 'Enable buyer type, buyer-specific docs.', emoji: '🛒', status: 'exploring', statusOverride: true, targetDate: null, shippedDate: null },
  { title: 'Lease listing flow', description: 'Lease type card and lease docs.', emoji: '📝', status: 'exploring', statusOverride: true, targetDate: null, shippedDate: null },
  { title: 'Google OAuth login', description: 'Wire Google provider in login UI.', emoji: '🔑', status: 'exploring', statusOverride: true, targetDate: null, shippedDate: null },
  { title: 'Stripe marketing add-ons', description: 'Paid postcard and open house campaigns.', emoji: '💳', status: 'exploring', statusOverride: true, targetDate: null, shippedDate: null },
  { title: 'CMA & performance tracker', description: 'RESO-based CMA, listing metrics. Phase 2.', emoji: '📊', status: 'exploring', statusOverride: true, targetDate: null, shippedDate: null },
]

function initAdmin() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (credPath && existsSync(credPath)) {
    const sa = JSON.parse(readFileSync(credPath, 'utf8'))
    initializeApp({ credential: cert(sa), projectId: PROJECT_ID })
    return
  }
  try {
    initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID })
  } catch {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account JSON.')
    console.error('Download from: Firebase Console → Project settings → Service accounts → Generate key')
    process.exit(1)
  }
}

async function main() {
  initAdmin()
  const db = getFirestore()

  if (forceReset) {
    const toDelete = await db.collection('roadmapItems').where('seedTag', '==', SEED_TAG).get()
    const deleteBatch = db.batch()
    toDelete.docs.forEach((d) => deleteBatch.delete(d.ref))
    if (!toDelete.empty) {
      await deleteBatch.commit()
      console.log(`Deleted ${toDelete.size} existing LocalPRO seed items.`)
    }
  } else {
    const existing = await db.collection('roadmapItems').where('seedTag', '==', SEED_TAG).limit(1).get()
    if (!existing.empty) {
      console.log('LocalPRO seed already exists. Skipping. Use --force to reset.')
      return
    }
  }

  const batch = db.batch()
  const now = Timestamp.now()
  seedItems.forEach((item, i) => {
    const ref = db.collection('roadmapItems').doc()
    batch.set(ref, {
      title: item.title,
      description: item.description,
      emoji: item.emoji,
      status: item.status,
      statusOverride: item.statusOverride,
      targetDate: item.targetDate ? Timestamp.fromDate(new Date(item.targetDate)) : null,
      shippedDate: item.shippedDate ? Timestamp.fromDate(new Date(item.shippedDate)) : null,
      heartCount: 0,
      sortOrder: i,
      createdBy: SEED_USER,
      createdByEmail: ADMIN_EMAIL,
      createdAt: now,
      updatedAt: now,
      seedTag: SEED_TAG,
      project: 'LocalPRO Hub',
    })
  })
  await batch.commit()
  console.log(`Seeded ${seedItems.length} LocalPRO Hub items into roadmap-t Firestore.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
