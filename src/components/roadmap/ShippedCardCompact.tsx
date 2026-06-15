import { Check } from 'lucide-react'
import type { RoadmapItem } from '../../types/roadmap'
import { formatShippedDate } from '../../lib/zoneLogic'
import { ContributorTag } from './ContributorTag'
import { AdminCardActions } from './AdminCardActions'

interface ShippedCardCompactProps {
  item: RoadmapItem
  isAdmin?: boolean
  isDragging?: boolean
  onDragStart?: (itemId: string) => void
}

export function ShippedCardCompact({
  item,
  isAdmin,
  isDragging,
  onDragStart,
}: ShippedCardCompactProps) {
  const shippedLabel = item.shippedDate
    ? formatShippedDate(item.shippedDate.toDate())
    : item.targetDate
      ? formatShippedDate(item.targetDate.toDate())
      : 'Recently'

  return (
    <div
      className={`relative bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 pt-8 transition-shadow hover:shadow-md min-w-[140px] max-w-[200px] flex-1 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {isAdmin && (
        <div className="absolute top-1 left-1 z-20">
          <AdminCardActions item={item} onDragStart={onDragStart} />
        </div>
      )}
      <div className="absolute -top-1.5 -right-1.5 z-10">
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      </div>
      <div className="flex flex-col items-center text-center gap-1 pt-1">
        <span className="text-xl" aria-hidden>{item.emoji}</span>
        <h3 className="text-xs font-semibold text-[var(--text-primary)] opacity-70 line-clamp-2 leading-tight">
          {item.title}
        </h3>
        <p className="text-[10px] text-[var(--text-muted)]">Shipped {shippedLabel}</p>
        <ContributorTag email={item.createdByEmail} />
      </div>
    </div>
  )
}
