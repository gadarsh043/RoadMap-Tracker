import { useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { shellPanelClass } from './GridBackground'
import type { RoadmapItem } from '../types/roadmap'
import { setRoadmapTargetDate } from '../hooks/useRoadmapItems'

interface AdminCalendarProps {
  items: RoadmapItem[]
  onDateDrop: (itemId: string, date: Date) => void
  onItemClick?: (item: RoadmapItem) => void
}
export function AdminCalendar({ items, onDateDrop, onItemClick }: AdminCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [localDraggingId, setLocalDraggingId] = useState<string | null>(null)
  const didDragRef = useRef(false)

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

  const itemsByDate = useMemo(() => {
    const map = new Map<string, RoadmapItem[]>()
    for (const item of items) {
      if (!item.targetDate) continue
      const key = dateKey(item.targetDate.toDate())
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    return map
  }, [items])

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const activeDragId = localDraggingId

  const handleChipClick = (item: RoadmapItem) => {
    if (didDragRef.current) return
    onItemClick?.(item)
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('text/plain') || activeDragId
    if (!itemId) return
    onDateDrop(itemId, date)
    setLocalDraggingId(null)
  }

  return (
    <div className={`mx-auto max-w-5xl px-6 mb-8 rounded-2xl border border-[var(--border)] p-4 ${shellPanelClass}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Admin Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)]"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-[var(--text-secondary)] min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)]"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--text-muted)] mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((date) => {
          const key = dateKey(date)
          const dayItems = itemsByDate.get(key) ?? []
          const isToday = dateKey(new Date()) === key

          return (
            <div
              key={key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, date)}
              className={`min-h-[88px] max-h-[120px] overflow-y-auto p-1 rounded-lg border transition-colors ${
                activeDragId
                  ? 'border-dashed border-brand-500/50 hover:bg-brand-500/5'
                  : 'border-transparent'
              } ${isToday ? 'bg-brand-500/5' : 'hover:bg-[var(--bg)]'}`}
            >
              <div className={`text-xs font-medium mb-1 sticky top-0 ${isToday ? 'text-brand-500' : 'text-[var(--text-muted)]'}`}>
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      didDragRef.current = true
                      e.dataTransfer.setData('text/plain', item.id)
                      e.dataTransfer.effectAllowed = 'move'
                      setLocalDraggingId(item.id)
                    }}
                    onDragEnd={() => {
                      setLocalDraggingId(null)
                      setTimeout(() => {
                        didDragRef.current = false
                      }, 0)
                    }}
                    onClick={() => handleChipClick(item)}
                    className={`w-full text-left text-[10px] truncate px-1 py-0.5 rounded bg-brand-500/10 text-brand-500 cursor-pointer hover:bg-brand-500/20 ${
                      activeDragId === item.id ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
                    }`}
                    title={`${item.title} — click to edit, drag to reschedule`}
                  >
                    {item.emoji} {item.title}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-3">
        Click a chip to edit (change date, section). Drag chips between days in this month.
      </p>
    </div>
  )
}

export async function handleAdminDateDrop(itemId: string, date: Date) {
  await setRoadmapTargetDate(itemId, date)
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}
