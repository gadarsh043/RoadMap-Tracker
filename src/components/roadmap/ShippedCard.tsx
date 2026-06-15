import { Check, Pin } from 'lucide-react'
import type { RoadmapItem } from '../../types/roadmap'
import { formatShippedDate } from '../../lib/zoneLogic'

interface ShippedCardProps {
  item: RoadmapItem
  side: 'left' | 'right'
  cardRef: (el: HTMLDivElement | null) => void
  isAdmin?: boolean
  isDragging?: boolean
  onDragStart?: (itemId: string) => void
}

export function ShippedCard({
  item,
  side,
  cardRef,
  isAdmin,
  isDragging,
  onDragStart,
}: ShippedCardProps) {
  const shippedLabel = item.shippedDate
    ? formatShippedDate(item.shippedDate.toDate())
    : item.targetDate
      ? formatShippedDate(item.targetDate.toDate())
      : 'Recently'

  return (
    <div
      ref={cardRef}
      draggable={isAdmin}
      onDragStart={
        isAdmin
          ? (e) => {
              e.dataTransfer.setData('text/plain', item.id)
              onDragStart?.(item.id)
            }
          : undefined
      }
      className={`flex justify-center ${
        side === 'left' ? 'md:justify-start md:pl-[8%]' : 'md:justify-end md:pr-[8%]'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="relative w-full max-w-[360px] md:w-[320px]">
        <div className="absolute -top-2.5 -right-2.5 z-20">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
        {item.statusOverride && (
          <div className="absolute -top-2.5 -left-2.5 z-20">
            <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shadow-sm">
              <Pin className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0" aria-hidden>{item.emoji}</span>
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] opacity-60">
                {item.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Shipped {shippedLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
