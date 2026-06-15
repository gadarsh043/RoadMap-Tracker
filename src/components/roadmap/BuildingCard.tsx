import { Pin } from 'lucide-react'
import type { RoadmapItem } from '../../types/roadmap'

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
        <div className="absolute -top-1.5 -right-1.5 z-20">
          <span className="relative flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-50" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-brand-500" />
          </span>
        </div>
        {item.statusOverride && (
          <div className="absolute -top-2.5 -left-2.5 z-20">
            <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shadow-sm">
              <Pin className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
        <div className="bg-[var(--surface)] border-2 border-brand-500 rounded-2xl p-5 shadow-sm shadow-brand-500/10 transition-shadow hover:shadow-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0" aria-hidden>{item.emoji}</span>
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
