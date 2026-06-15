import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

  useEffect(() => {
    if (open && initialDate) setViewDate(initialDate)
  }, [open, initialDate])

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

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full right-0 mb-2 z-50 w-[260px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-3"
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
    </div>
  )
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
