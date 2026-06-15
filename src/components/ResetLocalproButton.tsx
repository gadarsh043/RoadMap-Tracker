import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { resetAndImportLocalproRoadmap } from '../lib/seedRoadmap'

interface ResetLocalproButtonProps {
  userId: string
  onSuccess?: (count: number) => void
}

export function ResetLocalproButton({ userId, onSuccess }: ResetLocalproButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    const confirmed = window.confirm(
      'This deletes all LocalPRO seed items and re-imports fresh data. Continue?',
    )
    if (!confirmed) return

    setLoading(true)
    try {
      const count = await resetAndImportLocalproRoadmap(userId)
      onSuccess?.(count)
    } catch (err) {
      console.error(err)
      window.alert('Reset failed. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-brand-500 disabled:opacity-50"
      title="Reset LocalPRO seed data"
    >
      <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">Reset LocalPRO</span>
    </button>
  )
}
