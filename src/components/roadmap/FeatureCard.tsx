import { useState } from 'react'
import { Heart, Pin } from 'lucide-react'
import type { RoadmapItem } from '../../types/roadmap'
import { formatTargetDate } from '../../lib/zoneLogic'

interface FeatureCardProps {
  item: RoadmapItem
  side: 'left' | 'right'
  hearted: boolean
  heartCount: number
  onHeart: (itemId: string) => void
  isLoggedIn: boolean
  onLoginRequired: () => void
  faded?: boolean
  cardRef?: (el: HTMLDivElement | null) => void
  isAdmin?: boolean
  isDragging?: boolean
  onDragStart?: (itemId: string) => void
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
  cardRef,
  isAdmin,
  isDragging,
  onDragStart,
}: FeatureCardProps) {
  const [animating, setAnimating] = useState(false)

  const handleHeart = () => {
    if (!isLoggedIn) {
      onLoginRequired()
      return
    }
    setAnimating(true)
    onHeart(item.id)
    setTimeout(() => setAnimating(false), 300)
  }

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
      <div
        className={`w-full max-w-[360px] md:w-[320px] transition-opacity ${
          faded ? 'opacity-70 hover:opacity-100' : ''
        }`}
      >
        <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 transition-shadow hover:shadow-md">
          {item.statusOverride && (
            <div className="absolute -top-2.5 -left-2.5 z-20">
              <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center shadow-sm">
                <Pin className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0" aria-hidden>{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{item.title}</h3>
              {item.targetDate && (
                <p className="text-xs text-brand-500 font-medium mt-0.5">
                  Est. {formatTargetDate(item.targetDate.toDate())}
                </p>
              )}
              <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
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
    </div>
  )
}
