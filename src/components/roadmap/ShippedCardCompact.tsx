import { useState } from 'react'
import type { RoadmapItem } from '../../types/roadmap'
import { formatShippedDate } from '../../lib/zoneLogic'
import { ContributorTag } from './ContributorTag'
import { CardDetailModal } from './CardDetailModal'

interface ShippedCardCompactProps {
  item: RoadmapItem
  isAdmin?: boolean
}

export function ShippedCardCompact({ item, isAdmin }: ShippedCardCompactProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const shippedLabel = item.shippedDate
    ? formatShippedDate(item.shippedDate.toDate())
    : item.targetDate
      ? formatShippedDate(item.targetDate.toDate())
      : 'Recently'

  return (
    <>
      <div className="w-[180px] h-[160px] bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden transition-shadow hover:shadow-md">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex flex-col items-center text-center gap-1 px-3 py-3 w-full h-full cursor-pointer"
        >
          <span className="text-xl shrink-0" aria-hidden>{item.emoji}</span>
          <h3 className="text-xs font-semibold text-[var(--text-primary)] opacity-70 line-clamp-2 leading-tight w-full">
            {item.title}
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] shrink-0">Shipped {shippedLabel}</p>
          <ContributorTag email={item.createdByEmail} />
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
