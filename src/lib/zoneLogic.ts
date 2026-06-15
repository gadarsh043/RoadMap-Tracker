import type { RoadmapItem, RoadmapStatus } from '../types/roadmap'

export function deriveStatus(item: RoadmapItem): RoadmapStatus {
  return item.status
}

export function getEffectiveStatus(item: RoadmapItem): RoadmapStatus {
  return item.status
}

export function formatShippedDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function formatTargetDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
