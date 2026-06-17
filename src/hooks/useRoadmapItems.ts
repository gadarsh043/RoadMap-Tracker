import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  addDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  setDoc,
  where,
  query,
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

  grouped.shipped = sortByDate(grouped.shipped, 'shipped')
  grouped.building = sortByDate(grouped.building, 'target')
  grouped.upcoming = sortByDate(grouped.upcoming, 'target')
  grouped.exploring.sort((a, b) => a.sortOrder - b.sortOrder)

  return grouped
}

function sortByDate(
  items: RoadmapItem[],
  mode: 'shipped' | 'target',
): RoadmapItem[] {
  return [...items].sort((a, b) => {
    const aMs =
      mode === 'shipped'
        ? a.shippedDate?.toMillis() ?? a.targetDate?.toMillis() ?? 0
        : a.targetDate?.toMillis() ?? Number.MAX_SAFE_INTEGER
    const bMs =
      mode === 'shipped'
        ? b.shippedDate?.toMillis() ?? b.targetDate?.toMillis() ?? 0
        : b.targetDate?.toMillis() ?? Number.MAX_SAFE_INTEGER

    if (aMs !== bMs) return aMs - bMs
    return a.sortOrder - b.sortOrder
  })
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

export async function pinRoadmapItem(itemId: string) {
  await updateDoc(doc(db, 'roadmapItems', itemId), {
    statusOverride: true,
    updatedAt: serverTimestamp(),
  })
}

export async function markRoadmapItemShipped(itemId: string, shippedDate?: Date) {
  await updateDoc(doc(db, 'roadmapItems', itemId), {
    status: 'shipped',
    statusOverride: true,
    shippedDate: Timestamp.fromDate(shippedDate ?? new Date()),
    updatedAt: serverTimestamp(),
  })
}

export async function moveRoadmapItem(
  itemId: string,
  status: RoadmapItem['status'],
  targetDate?: Date | null,
) {
  const updates: Record<string, unknown> = {
    status,
    statusOverride: true,
    updatedAt: serverTimestamp(),
  }

  if (targetDate !== undefined) {
    updates.targetDate = targetDate ? Timestamp.fromDate(targetDate) : null
  }

  if (status === 'shipped') {
    updates.shippedDate = Timestamp.fromDate(targetDate ?? new Date())
  }

  await updateDoc(doc(db, 'roadmapItems', itemId), updates)
}

export async function setRoadmapTargetDate(itemId: string, date: Date | null) {
  await updateDoc(doc(db, 'roadmapItems', itemId), {
    targetDate: date ? Timestamp.fromDate(date) : null,
    updatedAt: serverTimestamp(),
  })
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

export function useHeartCounts() {
  const [counts, setCounts] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'hearts'), (snapshot) => {
      const next = new Map<string, number>()
      for (const heartDoc of snapshot.docs) {
        const itemId = heartDoc.data().itemId as string
        if (!itemId) continue
        next.set(itemId, (next.get(itemId) ?? 0) + 1)
      }
      setCounts(next)
    })

    return unsubscribe
  }, [])

  return counts
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

    if (isHearted) {
      await deleteDoc(heartRef)
    } else {
      await setDoc(heartRef, {
        itemId,
        userId,
        createdAt: serverTimestamp(),
      })
    }
  }, [])
}

export async function fetchUsers() {
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as { email: string; role: string; createdAt: Timestamp }),
  }))
}
