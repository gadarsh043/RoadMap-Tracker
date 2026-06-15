import type { RoadmapStatus } from '../types/roadmap'

export interface RoadmapSeedItem {
  title: string
  description: string
  emoji: string
  status: RoadmapStatus
  statusOverride: boolean
  targetDate: string | null
  shippedDate: string | null
}

function d(iso: string): string {
  return iso
}

/** LocalPRO Hub — features & work completed (seed for Roadmap Tracker) */
export const localproRoadmapSeed: RoadmapSeedItem[] = [
  // ── SHIPPED ──────────────────────────────────────────────────
  {
    title: 'Project bootstrap & foundation',
    description:
      'Vite + React 18 + TypeScript, Tailwind v4, Framer Motion, shadcn/ui, Supabase client, folder structure, Hallmark design skill, brand assets (black/gold/white, Mont + Glacial Indifference).',
    emoji: '🏗️',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-05-28'),
  },
  {
    title: 'Supabase schema & RLS',
    description:
      'Migrations 001–009: users, listings, bookings, documents, marketing, photographers, signup metadata, admin role controls, self-demotion guard, delete user RPC, agent milestones, email templates.',
    emoji: '🗄️',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-05-29'),
  },
  {
    title: 'Authentication UI',
    description:
      'Login, 2-step signup wizard, signup pending page, password show/hide, AuthBrandPanel, SecureAuthNote, TLS-direct-to-Supabase security model.',
    emoji: '🔐',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-05-30'),
  },
  {
    title: 'Role-based routing & guards',
    description:
      'Protected/public/pending routes, session sync, role homes (admin → pipeline, agent → dashboard, pending → pending page), profile menu with logout.',
    emoji: '🛡️',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-05-30'),
  },
  {
    title: 'Admin user approvals',
    description:
      'Approve/reject/suspend, bulk approve, role selector (agent/marketing/photographer/admin), self-protection UI + DB trigger, rejected tab, permanent delete (auth + profile).',
    emoji: '✅',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-05-31'),
  },
  {
    title: 'Agent Mission Control dashboard',
    description:
      'RLS-scoped listings, Active/Drafts/Archived tabs, filter chips, search, pipeline cards with stage badges, progress dots, go-live dates.',
    emoji: '🎛️',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-01'),
  },
  {
    title: 'Listing Hub (shareable)',
    description:
      'Editable listing detail at /listing/:id, stage advancement buttons, smart draft routing, delete draft, form_data editor, save to Supabase, multi-role access.',
    emoji: '🏠',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-02'),
  },
  {
    title: 'Admin Mission Control split',
    description:
      'Overview at /admin/pipeline (all listings), approvals at /admin/approvals, AdminShell with Mission Control sidebar, quick links (Canva, Dot Loop, NTREIS).',
    emoji: '👑',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-03'),
  },
  {
    title: 'Signup → admin email (n8n)',
    description:
      'Unified n8n workflow, FastAPI CORS-safe proxy POST /internal/notify-signup-pending, Gmail SMTP, signup succeeds even if n8n is down.',
    emoji: '📧',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-04'),
  },
  {
    title: 'Profile & admin user roster',
    description:
      '/profile self-edit with confirm dialog, admin Agents/Photographers/Marketing rosters, bulk ops, create-user API, email edit sync, CSV bulk add.',
    emoji: '👤',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-05'),
  },
  {
    title: 'Role-based signup & global grid UI',
    description:
      'Request access by role (agent/marketing/photographer/admin), requested role default on approval, GridBackground on all routes, fixed auth split layout.',
    emoji: '🎨',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-06'),
  },
  {
    title: 'NTREIS 22-section listing form',
    description:
      'New listing flow, address step, 22-section NTREIS engine with conditional sections, auto-save, review → docs_pending, createListing + stage helpers.',
    emoji: '📋',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-08'),
  },
  {
    title: 'Voice Fill Q&A',
    description:
      'GROQ Whisper transcribe + Llama extract, edge-tts prompts, push-to-talk + hands-free VAD, per-section and global voice queue, option pills for yes/no/select.',
    emoji: '🎤',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-10'),
  },
  {
    title: 'Agent shell & sidebar polish',
    description:
      'AgentSidebar with pipeline legend + quick links, fixed viewport height sidebars, profile initials from name, sheet a11y fix, draft delete RLS.',
    emoji: '🧭',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-11'),
  },
  {
    title: 'Agent milestone automations',
    description:
      'Admin-only personal dates, 8 milestone types, /admin/automations template editor, preview, run now, sent-today log, daily n8n schedule + unified workflow.',
    emoji: '🎂',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-12'),
  },
  {
    title: 'Mock listings & quality pass',
    description:
      '5 mock listings per test agent, ESLint clean, TypeScript + Vite build pass, error boundaries, loading states on all critical paths.',
    emoji: '✨',
    status: 'shipped',
    statusOverride: true,
    targetDate: null,
    shippedDate: d('2026-06-12'),
  },

  // ── BUILDING NOW ─────────────────────────────────────────────
  {
    title: 'Agent welcome email on approval',
    description:
      'Send welcome email via n8n when admin approves a pending user. Documented in Doubts.md — should fire after approve action.',
    emoji: '👋',
    status: 'building',
    statusOverride: true,
    targetDate: d('2026-06-02'),
    shippedDate: null,
  },
  {
    title: 'Multi-admin signup notifications',
    description:
      'Route signup alert emails to Maria + Morgan (both admin inboxes) instead of a single recipient.',
    emoji: '📬',
    status: 'building',
    statusOverride: true,
    targetDate: d('2026-06-03'),
    shippedDate: null,
  },
  {
    title: 'Admin pipeline filters',
    description:
      'Filter org-wide listing overview by agent, stage, and date range. From Doubts.md — overview needs better filtering.',
    emoji: '🔍',
    status: 'building',
    statusOverride: true,
    targetDate: d('2026-06-05'),
    shippedDate: null,
  },
  {
    title: 'Admin edit any listing',
    description:
      'Allow admins to edit listing description and form_data on any agent listing from Listing Hub. From Doubts #4.',
    emoji: '✏️',
    status: 'building',
    statusOverride: true,
    targetDate: d('2026-06-06'),
    shippedDate: null,
  },

  // ── UP NEXT ──────────────────────────────────────────────────
  {
    title: 'RESO property search + pre-fill',
    description:
      'Bridge/NTREIS RESO search to pre-fill NTREIS form from MLS data. Blocked until API credentials; ~5–7 days once unblocked.',
    emoji: '🔗',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-06-12'),
    shippedDate: null,
  },
  {
    title: 'Dot Loop documents hub',
    description:
      'Create loop, status badges, webhook → auto-advance docs_pending → docs_signed. Highest-leverage pipeline step after NTREIS form.',
    emoji: '📄',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-06-20'),
    shippedDate: null,
  },
  {
    title: 'Photography booking',
    description:
      'Calendar UI, photographer tier selection, booking panel, auto-advance listing to shoot_booked stage.',
    emoji: '📸',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-06-28'),
    shippedDate: null,
  },
  {
    title: 'Marketing hub + Canva deep-links',
    description:
      'Asset cards, GROQ marketing brief, n8n fan-out to marketing team, stage → marketing advancement.',
    emoji: '🎯',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-07-06'),
    shippedDate: null,
  },
  {
    title: 'Chrome extension — LP Fill',
    description:
      'Plasmo extension, NTREIS field mapping, 22-section checklist mirror for MLS submission workflow.',
    emoji: '🧩',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-07-18'),
    shippedDate: null,
  },
  {
    title: 'MLS submission step',
    description:
      'Extension status tracking, NTREIS checklist mirror, stage → mls_submitted advancement.',
    emoji: '📤',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-07-22'),
    shippedDate: null,
  },
  {
    title: 'Go Live celebration',
    description:
      'Final checklist, AI listing description polish, confetti UX, n8n fan-out on listing live, stage → live.',
    emoji: '🚀',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-07-25'),
    shippedDate: null,
  },
  {
    title: 'Resend + Twilio booking alerts',
    description:
      'Photographer SMS and email notifications when a shoot is booked. Resend for email, Twilio for SMS.',
    emoji: '📱',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-07-28'),
    shippedDate: null,
  },
  {
    title: 'Full automation config panel',
    description:
      'Workflow toggles, test-fire per automation, last 20 n8n execution logs in admin UI. Partial today — needs completion.',
    emoji: '⚙️',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-08-01'),
    shippedDate: null,
  },
  {
    title: 'Admin Canva template library',
    description:
      '/admin/templates — browse and manage Canva templates linked to marketing workflow.',
    emoji: '🖼️',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-08-05'),
    shippedDate: null,
  },
  {
    title: 'Photographer dedicated dashboard',
    description:
      'Calendar view, assigned bookings, block-out dates, photographer-specific Mission Control.',
    emoji: '📅',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-08-11'),
    shippedDate: null,
  },
  {
    title: 'Netlify + Railway production deploy',
    description:
      'Frontend on Netlify, FastAPI backend on Railway, n8n hosted, production env vars wired.',
    emoji: '🌐',
    status: 'upcoming',
    statusOverride: true,
    targetDate: d('2026-08-20'),
    shippedDate: null,
  },

  // ── EXPLORING ────────────────────────────────────────────────
  {
    title: 'Buyer listing flow',
    description:
      'Enable buyer type card on /listing/new, buyer-specific documents and form variants. Type card currently disabled.',
    emoji: '🛒',
    status: 'exploring',
    statusOverride: true,
    targetDate: null,
    shippedDate: null,
  },
  {
    title: 'Lease listing flow',
    description:
      'Lease type card, lease-specific docs and NTREIS form variants. Type card currently disabled.',
    emoji: '📝',
    status: 'exploring',
    statusOverride: true,
    targetDate: null,
    shippedDate: null,
  },
  {
    title: 'Google OAuth login',
    description:
      'Wire Google provider in Supabase Auth UI. Documented in Supabase README, not yet in login page.',
    emoji: '🔑',
    status: 'exploring',
    statusOverride: true,
    targetDate: null,
    shippedDate: null,
  },
  {
    title: 'Stripe paid marketing add-ons',
    description:
      'Postcard campaigns, open house kits, paid marketing upsells integrated with Stripe checkout.',
    emoji: '💳',
    status: 'exploring',
    statusOverride: true,
    targetDate: null,
    shippedDate: null,
  },
  {
    title: 'TREC MLS / license verification API',
    description:
      'Validate agent license and MLS ID on signup via TREC API. From Doubts #1.',
    emoji: '🏛️',
    status: 'exploring',
    statusOverride: true,
    targetDate: null,
    shippedDate: null,
  },
  {
    title: 'Open House module + QR lead capture',
    description:
      'Open house scheduling and QR-based lead capture for showings. From Doubts #16–17.',
    emoji: '📍',
    status: 'exploring',
    statusOverride: true,
    targetDate: null,
    shippedDate: null,
  },
  {
    title: 'CMA tool & listing performance tracker',
    description:
      'Comparative market analysis using RESO data, listing performance metrics dashboard. Phase 2 in projectSpec.',
    emoji: '📊',
    status: 'exploring',
    statusOverride: true,
    targetDate: null,
    shippedDate: null,
  },
  {
    title: 'Team ideas board with upvotes',
    description:
      'Internal feature voting board — agents upvote ideas with target dates. Mirrors this Roadmap Tracker concept inside LocalPRO.',
    emoji: '💡',
    status: 'exploring',
    statusOverride: true,
    targetDate: null,
    shippedDate: null,
  },
]

export const LOCALPRO_SEED_TAG = 'localpro-hub-v1'
