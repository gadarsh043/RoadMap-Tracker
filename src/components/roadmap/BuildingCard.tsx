import { Pin } from 'lucide-react'
import type { RoadmapItem } from '../../types/roadmap'
import { formatTargetDate } from '../../lib/zoneLogic'
import { ContributorTag } from './ContributorTag'
import { AdminCardActions } from './AdminCardActions'

interface BuildingCardProps {
  item: RoadmapItem
  side: 'left' | 'right'
  cardRef: (el: HTMLDivElement | null) => void
  isAdmin?: boolean
  isDragging?: boolean
  onDragStart?: (itemId: string) => void
}

export function BuildingCard({
  item,
  side,
  cardRef,
  isAdmin,
  isDragging,
  onDragStart,
}: BuildingCardProps) {
  return (
    <div
      ref={cardRef}
      className={`flex justify-center ${
        side === 'left' ? 'md:justify-start md:pl-[8%]' : 'md:justify-end md:pr-[8%]'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="relative w-full max-w-[360px] md:w-[320px]">
        {isAdmin && <AdminCardActions item={item} onDragStart={onDragStart} />}
        <div className="absolute -top-1.5 -right-1.5 z-20">
          <span className="relative flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-50" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-brand-500" />
          </span>
        </div>
        {item.statusOverride && !isAdmin && (
          <div className="absolute -top-2.5 -left-2.5 z-20">
            <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shadow-sm">
              <Pin className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
        <div className="bg-[var(--surface)] border-2 border-brand-500 rounded-2xl p-5 shadow-sm shadow-brand-500/10 transition-shadow hover:shadow-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0" aria-hidden>{item.emoji}</span>
            <div className="flex-1 min-w-0 pr-16">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{item.title}</h3>
              {item.targetDate && (
                <p className="text-xs text-brand-500 font-medium mt-0.5">
                  Est. {formatTargetDate(item.targetDate.toDate())}
                </p>
              )}
              <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                {item.description}
              </p>
              <ContributorTag email={item.createdByEmail} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
