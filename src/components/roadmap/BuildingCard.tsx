import { useState } from 'react'
import type { RoadmapItem } from '../../types/roadmap'
import { formatTargetDate } from '../../lib/zoneLogic'
import { ContributorTag } from './ContributorTag'
import { CardDetailModal } from './CardDetailModal'

interface BuildingCardProps {
  item: RoadmapItem
  side: 'left' | 'right'
  cardRef: (el: HTMLDivElement | null) => void
  isAdmin?: boolean
}

export function BuildingCard({ item, side, cardRef, isAdmin }: BuildingCardProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div
        ref={cardRef}
        className={`flex justify-center ${
          side === 'left' ? 'md:justify-start md:pl-[8%]' : 'md:justify-end md:pr-[8%]'
        }`}
      >
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-[320px] h-[200px] bg-[var(--surface)] border-2 border-brand-500 rounded-2xl p-4 shadow-sm shadow-brand-500/10 transition-shadow hover:shadow-md text-left cursor-pointer overflow-hidden flex items-start gap-3"
        >
          <span className="text-2xl shrink-0" aria-hidden>{item.emoji}</span>
          <div className="flex-1 min-w-0 flex flex-col min-h-0 h-full">
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] line-clamp-2">
              {item.title}
            </h3>
            {item.targetDate && (
              <p className="text-xs text-brand-500 font-medium mt-0.5 shrink-0">
                Est. {formatTargetDate(item.targetDate.toDate())}
              </p>
            )}
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-3">
              {item.description}
            </p>
            <ContributorTag email={item.createdByEmail} />
          </div>
        </button>
      </div>
      <CardDetailModal
        item={modalOpen ? item : null}
        isAdmin={isAdmin}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
