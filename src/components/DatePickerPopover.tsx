import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const POPOVER_WIDTH = 260
const POPOVER_HEIGHT = 320

interface DatePickerPopoverProps {
  open: boolean
  onClose: () => void
  onSelect: (date: Date) => void
  onClear?: () => void
  anchorRef: React.RefObject<HTMLElement | null>
  initialDate?: Date | null
}

export function DatePickerPopover({
  open,
  onClose,
  onSelect,
  onClear,
  anchorRef,
  initialDate,
}: DatePickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [viewDate, setViewDate] = useState(() => initialDate ?? new Date())
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (open && initialDate) setViewDate(initialDate)
  }, [open, initialDate])

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const anchor = anchorRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const margin = 8

      let top = rect.bottom + margin
      if (top + POPOVER_HEIGHT > window.innerHeight - margin) {
        top = rect.top - POPOVER_HEIGHT - margin
      }
      top = Math.max(margin, Math.min(top, window.innerHeight - POPOVER_HEIGHT - margin))

      let left = rect.left
      if (left + POPOVER_WIDTH > window.innerWidth - margin) {
        left = window.innerWidth - POPOVER_WIDTH - margin
      }
      left = Math.max(margin, left)

      setPosition({ top, left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        popoverRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return
      }
      onClose()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, onClose, anchorRef])

  const { year, month, days, startOffset } = useMemo(() => {
    const y = viewDate.getFullYear()
    const m = viewDate.getMonth()
    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)
    const offset = firstDay.getDay()
    const dayList: Date[] = []
    for (let d = 1; d <= lastDay.getDate(); d++) {
      dayList.push(new Date(y, m, d))
    }
    return { year: y, month: m, days: dayList, startOffset: offset }
  }, [viewDate])

  if (!open) return null

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[100] w-[260px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-3"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 rounded hover:bg-[var(--bg)]"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-[var(--text-primary)]">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 rounded hover:bg-[var(--bg)]"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-[var(--text-muted)] mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="py-0.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {days.map((date) => {
          const isToday = isSameDay(date, new Date())
          const isSelected = initialDate && isSameDay(date, initialDate)
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => {
                onSelect(date)
                onClose()
              }}
              className={`h-8 rounded-lg text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-brand-500 text-white'
                  : isToday
                    ? 'bg-brand-500/15 text-brand-500'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg)]'
              }`}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {onClear && (
        <button
          type="button"
          onClick={() => {
            onClear()
            onClose()
          }}
          className="w-full mt-2 text-xs text-[var(--text-muted)] hover:text-brand-500 py-1"
        >
          Clear date
        </button>
      )}
    </div>,
    document.body,
  )
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
