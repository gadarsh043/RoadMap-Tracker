import { useEffect, useRef, useState } from 'react'
import { Calendar, Check, X } from 'lucide-react'
import { DatePickerPopover } from '../DatePickerPopover'
import type { RoadmapItem, RoadmapStatus } from '../../types/roadmap'
import { formatShippedDate, formatTargetDate } from '../../lib/zoneLogic'
import {
  moveRoadmapItem,
  setRoadmapTargetDate,
  markRoadmapItemShipped,
} from '../../hooks/useRoadmapItems'
import { ContributorTag } from './ContributorTag'

const ZONE_OPTIONS: { value: RoadmapStatus; label: string }[] = [
  { value: 'shipped', label: 'Shipped' },
  { value: 'building', label: 'Building Now' },
  { value: 'upcoming', label: 'Up Next' },
  { value: 'exploring', label: 'Exploring' },
]

interface CardDetailModalProps {
  item: RoadmapItem | null
  isAdmin?: boolean
  onClose: () => void
}

export function CardDetailModal({ item, isAdmin, onClose }: CardDetailModalProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const calendarRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!item) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [item, onClose])

  if (!item) return null

  const dateLabel = item.shippedDate
    ? `Shipped ${formatShippedDate(item.shippedDate.toDate())}`
    : item.targetDate
      ? `Est. ${formatTargetDate(item.targetDate.toDate())}`
      : null

  const handleZoneChange = async (status: RoadmapStatus) => {
    if (status === item.status) return
    setBusy(true)
    try {
      await moveRoadmapItem(item.id, status, item.targetDate?.toDate() ?? null)
    } finally {
      setBusy(false)
    }
  }

  const handleDateSelect = async (date: Date) => {
    setBusy(true)
    try {
      await setRoadmapTargetDate(item.id, date)
    } finally {
      setBusy(false)
    }
  }

  const handleClearDate = async () => {
    setBusy(true)
    try {
      await setRoadmapTargetDate(item.id, null)
    } finally {
      setBusy(false)
    }
  }

  const handleMarkShipped = async () => {
    if (item.status === 'shipped') return
    setBusy(true)
    try {
      await markRoadmapItemShipped(item.id, item.targetDate?.toDate())
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg)]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <span className="text-3xl shrink-0" aria-hidden>{item.emoji}</span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h2>
            {dateLabel && !isAdmin && (
              <p className="text-xs text-brand-500 font-medium mt-1">{dateLabel}</p>
            )}
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mt-4 leading-relaxed whitespace-pre-wrap">
          {item.description}
        </p>

        <div className="flex justify-center mt-4">
          <ContributorTag email={item.createdByEmail} />
        </div>

        {isAdmin && (
          <div className="mt-6 pt-4 border-t border-[var(--border)] space-y-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Admin
            </p>

            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2">Section</p>
              <div className="flex flex-wrap gap-2">
                {ZONE_OPTIONS.map((zone) => (
                  <button
                    key={zone.value}
                    type="button"
                    disabled={busy}
                    onClick={() => handleZoneChange(zone.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      item.status === zone.value
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-500/40 hover:text-brand-500'
                    }`}
                  >
                    {zone.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2">Date</p>
              <div className="relative inline-block">
                <button
                  ref={calendarRef}
                  type="button"
                  disabled={busy}
                  onClick={() => setPickerOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500/40"
                >
                  <Calendar className="w-4 h-4" />
                  {item.targetDate
                    ? formatTargetDate(item.targetDate.toDate())
                    : item.shippedDate
                      ? formatShippedDate(item.shippedDate.toDate())
                      : 'Set date'}
                </button>
                <DatePickerPopover
                  open={pickerOpen}
                  onClose={() => setPickerOpen(false)}
                  onSelect={handleDateSelect}
                  onClear={item.status === 'exploring' ? handleClearDate : undefined}
                  anchorRef={calendarRef}
                  initialDate={item.targetDate?.toDate() ?? item.shippedDate?.toDate() ?? null}
                />
              </div>
            </div>

            {item.status !== 'shipped' && (
              <button
                type="button"
                disabled={busy}
                onClick={handleMarkShipped}
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Mark as shipped
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
