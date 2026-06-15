import type { RoadmapItem, RoadmapStatus } from '../types/roadmap'

const BUILDING_WINDOW_DAYS = 30

export function deriveStatus(item: RoadmapItem, now = new Date()): RoadmapStatus {
  if (item.statusOverride) {
    return item.status
  }

  const targetDate = item.targetDate?.toDate() ?? null
  if (!targetDate) {
    return 'exploring'
  }

  const today = startOfDay(now)
  const target = startOfDay(targetDate)

  if (target < today) {
    return 'shipped'
  }

  const daysUntil = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntil <= BUILDING_WINDOW_DAYS) {
    return 'building'
  }

  return 'upcoming'
}

export function getEffectiveStatus(item: RoadmapItem, now = new Date()): RoadmapStatus {
  return deriveStatus(item, now)
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatShippedDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function formatTargetDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
