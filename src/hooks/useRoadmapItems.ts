import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  addDoc,
  updateDoc,
  getDocs,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getEffectiveStatus } from '../lib/zoneLogic'
import type { GroupedRoadmap, RoadmapItem, RoadmapItemInput } from '../types/roadmap'

export function useRoadmapItems() {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [grouped, setGrouped] = useState<GroupedRoadmap>({
    shipped: [],
    building: [],
    upcoming: [],
    exploring: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'roadmapItems'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nextItems = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as RoadmapItem[]

      nextItems.sort((a, b) => a.sortOrder - b.sortOrder)
      setItems(nextItems)
      setGrouped(groupItems(nextItems))
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { items, grouped, loading }
}

function groupItems(items: RoadmapItem[]): GroupedRoadmap {
  const grouped: GroupedRoadmap = {
    shipped: [],
    building: [],
    upcoming: [],
    exploring: [],
  }

  for (const item of items) {
    const zone = getEffectiveStatus(item)
    grouped[zone].push(item)
  }

  return grouped
}

export async function createRoadmapItem(
  input: RoadmapItemInput,
  userId: string,
  sortOrder: number,
  userEmail?: string,
) {
  const now = serverTimestamp()
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
    createdByEmail: userEmail ?? null,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updateRoadmapSchedule(
  itemId: string,
  targetDate: Date | null,
  statusOverride = false,
  status?: RoadmapItem['status'],
) {
  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
    statusOverride,
  }

  if (targetDate !== undefined) {
    updates.targetDate = targetDate ? Timestamp.fromDate(targetDate) : null
  }

  if (statusOverride && status) {
    updates.status = status
    if (status === 'shipped' && targetDate) {
      updates.shippedDate = Timestamp.fromDate(targetDate)
    }
  }

  await updateDoc(doc(db, 'roadmapItems', itemId), updates)
}

export async function unpinRoadmapItem(itemId: string) {
  await updateDoc(doc(db, 'roadmapItems', itemId), {
    statusOverride: false,
    updatedAt: serverTimestamp(),
  })
}

export async function setRoadmapTargetDate(itemId: string, date: Date | null) {
  await updateRoadmapSchedule(itemId, date, false)
}

export async function setRoadmapZoneOverride(itemId: string, status: RoadmapItem['status']) {
  const updates: Record<string, unknown> = {
    status,
    statusOverride: true,
    updatedAt: serverTimestamp(),
  }

  if (status === 'shipped') {
    updates.shippedDate = Timestamp.now()
  }

  await updateDoc(doc(db, 'roadmapItems', itemId), updates)
}

export function useUserHearts(userId: string | null) {
  const [heartedIds, setHeartedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) {
      setHeartedIds(new Set())
      return
    }

    const q = query(collection(db, 'hearts'), where('userId', '==', userId))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ids = new Set(snapshot.docs.map((d) => d.data().itemId as string))
      setHeartedIds(ids)
    })

    return unsubscribe
  }, [userId])

  return heartedIds
}

export function useToggleHeart() {
  return useCallback(async (itemId: string, userId: string, isHearted: boolean) => {
    const heartId = `${itemId}_${userId}`
    const heartRef = doc(db, 'hearts', heartId)
    const itemRef = doc(db, 'roadmapItems', itemId)

    await runTransaction(db, async (transaction) => {
      const itemSnap = await transaction.get(itemRef)
      if (!itemSnap.exists()) return

      const currentCount = itemSnap.data().heartCount ?? 0

      if (isHearted) {
        transaction.delete(heartRef)
        transaction.update(itemRef, { heartCount: Math.max(0, currentCount - 1) })
      } else {
        transaction.set(heartRef, {
          itemId,
          userId,
          createdAt: serverTimestamp(),
        })
        transaction.update(itemRef, { heartCount: currentCount + 1 })
      }
    })
  }, [])
}

export async function fetchUsers() {
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as { email: string; role: string; createdAt: Timestamp }),
  }))
}
