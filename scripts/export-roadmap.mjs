/**
 * Export all roadmapItems from Firestore to scripts/roadmap-export.json
 * Usage: npm run export:roadmap
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})

const db = getFirestore(app)
const snap = await getDocs(collection(db, 'roadmapItems'))

function ts(v) {
  if (!v?.toDate) return null
  return v.toDate().toISOString().slice(0, 10)
}

const items = snap.docs
  .map((d) => {
    const x = d.data()
    return {
      id: d.id,
      title: x.title,
      description: x.description,
      emoji: x.emoji,
      status: x.status,
      statusOverride: x.statusOverride,
      targetDate: ts(x.targetDate),
      shippedDate: ts(x.shippedDate),
      heartCount: x.heartCount ?? 0,
      sortOrder: x.sortOrder,
      createdByEmail: x.createdByEmail ?? null,
      seedTag: x.seedTag ?? null,
      project: x.project ?? null,
    }
  })
  .sort((a, b) => a.sortOrder - b.sortOrder)

const grouped = { shipped: [], building: [], upcoming: [], exploring: [] }
for (const item of items) {
  grouped[item.status]?.push(item)
}

const out = {
  exportedAt: new Date().toISOString(),
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  summary: {
    total: items.length,
    shipped: grouped.shipped.length,
    building: grouped.building.length,
    upcoming: grouped.upcoming.length,
    exploring: grouped.exploring.length,
  },
  grouped,
  allItems: items,
}

const outPath = join(root, 'scripts/roadmap-export.json')
writeFileSync(outPath, JSON.stringify(out, null, 2))
console.log(`Exported ${items.length} items → scripts/roadmap-export.json`)
