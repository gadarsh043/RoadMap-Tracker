import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { RoadmapItemInput } from '../types/roadmap'

interface IdeaConfirmModalProps {
  open: boolean
  initial: Partial<RoadmapItemInput> & { title: string; description: string }
  onClose: () => void
  onConfirm: (input: RoadmapItemInput) => Promise<void>
}

export function IdeaConfirmModal({ open, initial, onClose, onConfirm }: IdeaConfirmModalProps) {
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [emoji, setEmoji] = useState(initial.emoji ?? '💡')
  const [targetDate, setTargetDate] = useState(
    initial.targetDate ? formatDateInput(initial.targetDate) : '',
  )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(initial.title)
      setDescription(initial.description)
      setEmoji(initial.emoji ?? '💡')
      setTargetDate(initial.targetDate ? formatDateInput(initial.targetDate) : '')
    }
  }, [open, initial.title, initial.description, initial.emoji, initial.targetDate])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onConfirm({
        title: title.trim(),
        description: description.trim(),
        emoji: emoji || '💡',
        targetDate: targetDate ? new Date(targetDate) : null,
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Confirm your idea</h2>
        <p className="text-sm text-[var(--text-muted)] mb-5">
          Review the details and pick an estimated date.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="w-16">
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-2 py-2 text-center text-xl border border-[var(--border)] rounded-xl bg-[var(--bg)]"
                maxLength={4}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--bg)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--bg)] text-[var(--text-primary)] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Estimated date (optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--bg)] text-[var(--text-primary)]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-400 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add to roadmap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0]
}
