import type { Timestamp } from 'firebase/firestore'

export type RoadmapStatus = 'exploring' | 'upcoming' | 'building' | 'shipped'

export interface RoadmapItem {
  id: string
  title: string
  description: string
  emoji: string
  targetDate: Timestamp | null
  shippedDate: Timestamp | null
  status: RoadmapStatus
  statusOverride: boolean
  heartCount: number
  sortOrder: number
  createdBy: string
  createdByEmail?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface RoadmapItemInput {
  title: string
  description: string
  emoji: string
  targetDate: Date | null
}

export interface UserProfile {
  email: string
  role: 'admin' | 'user'
  createdAt: Timestamp
}

export interface GroupedRoadmap {
  shipped: RoadmapItem[]
  building: RoadmapItem[]
  upcoming: RoadmapItem[]
  exploring: RoadmapItem[]
}

export interface VoiceIdeaResult {
  title: string
  description: string
  emoji: string
  transcript?: string
}
