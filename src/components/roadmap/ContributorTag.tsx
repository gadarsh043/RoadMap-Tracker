import { ADMIN_EMAIL } from '../../hooks/useAuth'

interface ContributorTagProps {
  email?: string | null
  className?: string
}

export function ContributorTag({ email, className = '' }: ContributorTagProps) {
  const label = email?.trim() || ADMIN_EMAIL
  return (
    <span
      className={`block text-[10px] text-[var(--text-muted)] truncate text-center mx-auto max-w-full px-1 mt-auto pt-1 ${className}`}
      title={label}
    >
      {label}
    </span>
  )
}
