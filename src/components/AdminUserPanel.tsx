import { useEffect, useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { createUserAccount } from '../lib/functions'
import { fetchUsers } from '../hooks/useRoadmapItems'

interface AdminUserPanelProps {
  open: boolean
  onClose: () => void
}

export function AdminUserPanel({ open, onClose }: AdminUserPanelProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [users, setUsers] = useState<{ id: string; email: string; role: string }[]>([])

  useEffect(() => {
    if (open) {
      fetchUsers()
        .then(setUsers)
        .catch(() => setUsers([]))
    }
  }, [open])

  if (!open) return null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await createUserAccount(email, password)
      setSuccess(`Created account for ${email}`)
      setEmail('')
      setPassword('')
      const updated = await fetchUsers()
      setUsers(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-brand-500" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Manage Users</h2>
        </div>

        <form onSubmit={handleCreate} className="space-y-3 mb-6">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--bg)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--bg)]"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-400 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create user'}
          </button>
        </form>

        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Existing users</h3>
          {users.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No users yet.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg)] text-sm"
                >
                  <span className="text-[var(--text-primary)]">{u.email}</span>
                  <span className="text-xs text-[var(--text-muted)] capitalize">{u.role}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
