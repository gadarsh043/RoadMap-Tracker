import { useRef, useState } from 'react'
import { GripVertical, Pin, Plus } from 'lucide-react'
import { DatePickerPopover } from '../DatePickerPopover'
import { unpinRoadmapItem, setRoadmapTargetDate } from '../../hooks/useRoadmapItems'
import type { RoadmapItem } from '../../types/roadmap'

interface AdminCardActionsProps {
  item: RoadmapItem
  onDragStart?: (itemId: string) => void
  allowClearDate?: boolean
}

export function AdminCardActions({ item, onDragStart, allowClearDate }: AdminCardActionsProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const plusRef = useRef<HTMLButtonElement>(null)

  const handleUnpin = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await unpinRoadmapItem(item.id)
  }

  const handleDateSelect = async (date: Date) => {
    await setRoadmapTargetDate(item.id, date)
  }

  const handleClearDate = async () => {
    await setRoadmapTargetDate(item.id, null)
  }

  return (
    <div className="absolute top-2 right-2 z-20 flex items-center gap-0.5">
      {item.statusOverride && (
        <button
          type="button"
          onClick={handleUnpin}
          className="p-1 rounded-lg bg-brand-500 text-white hover:bg-brand-400 shadow-sm"
          title="Unpin — follow date-based zone"
          aria-label="Unpin item"
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="relative">
        <button
          ref={plusRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setPickerOpen((v) => !v)
          }}
          className="p-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-brand-500 hover:border-brand-500/40"
          title="Set or change date"
          aria-label="Pick date"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <DatePickerPopover
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleDateSelect}
          onClear={allowClearDate ? handleClearDate : undefined}
          anchorRef={plusRef}
          initialDate={item.targetDate?.toDate() ?? null}
        />
      </div>

      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', item.id)
          e.dataTransfer.effectAllowed = 'move'
          onDragStart?.(item.id)
        }}
        className="p-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-brand-500 cursor-grab active:cursor-grabbing"
        title="Drag to calendar or zone"
        aria-label="Drag handle"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>
    </div>
  )
}
