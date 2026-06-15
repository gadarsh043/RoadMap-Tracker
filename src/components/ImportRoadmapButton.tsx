import { useState } from 'react'
import { Download } from 'lucide-react'
import { importLocalproRoadmap, isLocalproSeedImported } from '../lib/seedRoadmap'
import { localproRoadmapSeed } from '../data/localproRoadmapSeed'

interface ImportRoadmapButtonProps {
  userId: string
}

export function ImportRoadmapButton({ userId }: ImportRoadmapButtonProps) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!userId) return null

  const handleImport = async () => {
    setError('')
    setLoading(true)
    try {
      const exists = await isLocalproSeedImported()
      if (exists) {
        setDone(true)
        return
      }
      const count = await importLocalproRoadmap(userId)
      setDone(true)
      alert(`Imported ${count} LocalPRO Hub roadmap items into Firebase.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleImport}
        disabled={loading || done}
        className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-brand-500 disabled:opacity-50"
        title={`Import ${localproRoadmapSeed.length} LocalPRO Hub features`}
      >
        <Download className="w-4 h-4" />
        {done ? 'LocalPRO imported' : loading ? 'Importing…' : 'Import LocalPRO'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
