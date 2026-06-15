import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../hooks/useAuth'
import { GridBackground } from '../components/GridBackground'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <GridBackground variant="light" fixed />
      <div className="relative z-10 w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Sign in</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Log in to share ideas and vote on features.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--bg)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--bg)] text-[var(--text-primary)]"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-400 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          <Link to="/" className="hover:text-brand-500 transition-colors">
            Back to roadmap
          </Link>
        </p>
      </div>
    </div>
  )
}
