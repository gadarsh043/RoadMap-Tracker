import { useState } from 'react'
import { Heart } from 'lucide-react'
import type { RoadmapItem } from '../../types/roadmap'
import { formatTargetDate } from '../../lib/zoneLogic'
import { ContributorTag } from './ContributorTag'
import { CardDetailModal } from './CardDetailModal'

interface FeatureCardProps {
  item: RoadmapItem
  side?: 'left' | 'right'
  hearted: boolean
  heartCount: number
  onHeart: (itemId: string) => void
  isLoggedIn: boolean
  onLoginRequired: () => void
  faded?: boolean
  compact?: boolean
  cardRef?: (el: HTMLDivElement | null) => void
  isAdmin?: boolean
}

export function FeatureCard({
  item,
  side,
  hearted,
  heartCount,
  onHeart,
  isLoggedIn,
  onLoginRequired,
  faded = false,
  compact = false,
  cardRef,
  isAdmin,
}: FeatureCardProps) {
  const [animating, setAnimating] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleHeart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      onLoginRequired()
      return
    }
    setAnimating(true)
    onHeart(item.id)
    setTimeout(() => setAnimating(false), 300)
  }

  const wrapperClass = compact
    ? 'w-full'
    : `flex justify-center ${
        side === 'left' ? 'md:justify-start md:pl-[8%]' : 'md:justify-end md:pr-[8%]'
      }`

  const cardSizeClass = compact ? 'h-[180px]' : 'w-[320px] h-[200px]'

  return (
    <>
      <div ref={cardRef} className={wrapperClass}>
        <div
          className={`relative ${cardSizeClass} transition-opacity ${
            faded ? 'opacity-70 hover:opacity-100' : ''
          }`}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => setModalOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setModalOpen(true)
              }
            }}
            className="w-full h-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 transition-shadow hover:shadow-md text-left cursor-pointer overflow-hidden flex items-start gap-3"
          >
            <span className="text-2xl shrink-0" aria-hidden>{item.emoji}</span>
            <div className="flex-1 min-w-0 flex flex-col min-h-0 h-full pr-8">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] line-clamp-2">
                {item.title}
              </h3>
              {item.targetDate && (
                <p className="text-xs text-brand-500 font-medium mt-0.5 shrink-0">
                  Est. {formatTargetDate(item.targetDate.toDate())}
                </p>
              )}
              <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-2">
                {item.description}
              </p>
              <ContributorTag email={item.createdByEmail} />
            </div>
          </div>
          <div className="absolute bottom-3 right-3 z-10">
            <button
              type="button"
              onClick={handleHeart}
              className="flex items-center gap-1.5 group cursor-pointer"
              aria-label={hearted ? 'Remove heart' : 'Heart this feature'}
            >
              <Heart
                className={`w-[18px] h-[18px] transition-all duration-200 ${
                  hearted
                    ? 'fill-brand-500 text-brand-500'
                    : 'text-[var(--text-muted)] group-hover:text-brand-400'
                } ${animating ? 'scale-125' : 'scale-100'}`}
              />
              <span
                className={`text-sm font-medium transition-colors ${
                  hearted ? 'text-brand-500' : 'text-[var(--text-muted)]'
                }`}
              >
                {heartCount}
              </span>
            </button>
          </div>
        </div>
      </div>
      <CardDetailModal
        item={modalOpen ? item : null}
        isAdmin={isAdmin}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
