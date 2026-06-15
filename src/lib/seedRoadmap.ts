import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  writeBatch,
  doc,
} from 'firebase/firestore'
import { db } from './firebase'
import { localproRoadmapSeed, LOCALPRO_SEED_TAG } from '../data/localproRoadmapSeed'
import type { RoadmapSeedItem } from '../data/localproRoadmapSeed'

export async function isLocalproSeedImported(): Promise<boolean> {
  const q = query(collection(db, 'roadmapItems'), where('seedTag', '==', LOCALPRO_SEED_TAG))
  const snap = await getDocs(q)
  return !snap.empty
}

export async function importLocalproRoadmap(userId: string): Promise<number> {
  const already = await isLocalproSeedImported()
  if (already) {
    throw new Error('LocalPRO Hub roadmap was already imported.')
  }

  const batch = writeBatch(db)
  const col = collection(db, 'roadmapItems')
  const now = Timestamp.now()

  localproRoadmapSeed.forEach((item, index) => {
    const ref = doc(col)
    batch.set(ref, buildSeedDoc(item, userId, index, now))
  })

  await batch.commit()
  return localproRoadmapSeed.length
}

function buildSeedDoc(
  item: RoadmapSeedItem,
  userId: string,
  sortOrder: number,
  now: Timestamp,
) {
  return {
    title: item.title,
    description: item.description,
    emoji: item.emoji,
    status: item.status,
    statusOverride: item.statusOverride,
    targetDate: item.targetDate ? Timestamp.fromDate(new Date(item.targetDate)) : null,
    shippedDate: item.shippedDate ? Timestamp.fromDate(new Date(item.shippedDate)) : null,
    heartCount: 0,
    sortOrder,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
    seedTag: LOCALPRO_SEED_TAG,
    project: 'LocalPRO Hub',
  }
}

/** Single-item create (user-submitted ideas) */
export async function createRoadmapItemFromInput(
  input: { title: string; description: string; emoji: string; targetDate: Date | null },
  userId: string,
  sortOrder: number,
) {
  await addDoc(collection(db, 'roadmapItems'), {
    title: input.title.trim(),
    description: input.description.trim(),
    emoji: input.emoji || '💡',
    targetDate: input.targetDate ? Timestamp.fromDate(input.targetDate) : null,
    shippedDate: null,
    status: 'exploring',
    statusOverride: false,
    heartCount: 0,
    sortOrder,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
