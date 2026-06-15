interface ZigzagPathProps {
  pathData: { fullPath: string; buildingPath: string }
}

export function ZigzagPath({ pathData }: ZigzagPathProps) {
  if (!pathData.fullPath) return null
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="rmap-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#F97316" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0.2" />
        </linearGradient>
        <filter id="rmap-glow" x="-20%" y="-5%" width="140%" height="110%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={pathData.fullPath}
        stroke="url(#rmap-grad)"
        strokeWidth="3"
        strokeDasharray="12,10"
        fill="none"
      />

      {pathData.buildingPath && (
        <path
          d={pathData.buildingPath}
          stroke="#F97316"
          strokeWidth="5"
          strokeDasharray="14,7"
          fill="none"
          filter="url(#rmap-glow)"
          opacity="0.65"
        />
      )}
    </svg>
  )
}

export function MobilePath() {
  return (
    <div
      className="md:hidden absolute left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none"
      aria-hidden
      style={{
        width: '2px',
        backgroundImage:
          'repeating-linear-gradient(to bottom, #F97316 0px, #F97316 8px, transparent 8px, transparent 18px)',
        opacity: 0.22,
      }}
    />
  )
}

export function ZoneHeader({
  emoji,
  title,
  status,
  isAdmin,
  onDropZone,
}: {
  emoji: string
  title: string
  status?: string
  isAdmin?: boolean
  onDropZone?: (status: string, itemId: string) => void
}) {
  return (
    <div
      className={`text-center py-10 md:py-14 relative z-10 ${
        isAdmin && status ? 'admin-zone-drop rounded-2xl border-2 border-dashed border-transparent transition-colors' : ''
      }`}
      data-zone={status}
      onDragOver={
        isAdmin
          ? (e) => {
              e.preventDefault()
              e.currentTarget.classList.add('border-brand-500/40', 'bg-brand-500/5')
            }
          : undefined
      }
      onDragLeave={
        isAdmin
          ? (e) => {
              e.currentTarget.classList.remove('border-brand-500/40', 'bg-brand-500/5')
            }
          : undefined
      }
      onDrop={
        isAdmin && status && onDropZone
          ? (e) => {
              e.preventDefault()
              e.currentTarget.classList.remove('border-brand-500/40', 'bg-brand-500/5')
              const itemId = e.dataTransfer.getData('text/plain')
              if (itemId) onDropZone(status, itemId)
            }
          : undefined
      }
    >
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] inline-flex items-center gap-2.5">
        <span>{emoji}</span> {title}
      </h2>
    </div>
  )
}
