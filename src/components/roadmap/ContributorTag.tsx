interface ContributorTagProps {
  email?: string | null
}

export function ContributorTag({ email }: ContributorTagProps) {
  const label = email?.trim() || 'unknown'
  return (
    <span
      className="inline-block text-[10px] text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded-full px-2 py-0.5 mt-1.5 max-w-[200px] truncate"
      title={`Added by ${label}`}
    >
      Added by {label}
    </span>
  )
}
