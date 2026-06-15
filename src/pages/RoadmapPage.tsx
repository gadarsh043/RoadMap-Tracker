import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogIn, LogOut, Moon, Sun, Users } from 'lucide-react'
import { GridBackground } from '../components/GridBackground'
import { IdeaInputBar } from '../components/IdeaInputBar'
import { AdminCalendar, handleAdminDateDrop } from '../components/AdminCalendar'
import { AdminUserPanel } from '../components/AdminUserPanel'
import { ResetLocalproButton } from '../components/ResetLocalproButton'
import { ShippedCardCompact } from '../components/roadmap/ShippedCardCompact'
import { BuildingCard } from '../components/roadmap/BuildingCard'
import { FeatureCard } from '../components/roadmap/FeatureCard'
import { ZigzagPath, MobilePath, ZoneHeader } from '../components/roadmap/ZigzagPath'
import { buildSmoothPath, getSide } from '../components/roadmap/helpers'
import { useAuth, logout } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { CardDetailModal } from '../components/roadmap/CardDetailModal'
import { useRoadmapItems, useUserHearts, useToggleHeart } from '../hooks/useRoadmapItems'

function LoginToast({ show, message }: { show: boolean; message: string }) {
  if (!show) return null
  return (
    <div className="fixed top-20 right-6 z-50 bg-brand-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-[fadeSlideIn_0.2s_ease-out]">
      {message}
    </div>
  )
}

export default function RoadmapPage() {
  const { user, isLoggedIn, isAdmin, loading: authLoading } = useAuth()
  const { toggleTheme, isDark } = useTheme()
  const { items, grouped, loading: itemsLoading } = useRoadmapItems()
  const heartedIds = useUserHearts(user?.uid ?? null)
  const toggleHeart = useToggleHeart()

  const [showLoginToast, setShowLoginToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Sign in to continue')
  const [pathData, setPathData] = useState({ fullPath: '', buildingPath: '' })
  const [adminPanelOpen, setAdminPanelOpen] = useState(false)
  const [calendarModalItemId, setCalendarModalItemId] = useState<string | null>(null)

  const calendarModalItem =
    calendarModalItemId != null
      ? items.find((i) => i.id === calendarModalItemId) ?? null
      : null

  const { shipped, building, upcoming, exploring } = grouped
  const connectedCount = building.length + upcoming.length

  const timelineRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  if (cardRefs.current.length !== connectedCount) {
    cardRefs.current = Array(connectedCount).fill(null)
  }

  const handleLoginRequired = useCallback((message = 'Sign in to continue') => {
    setToastMessage(message)
    setShowLoginToast(true)
    setTimeout(() => setShowLoginToast(false), 2500)
  }, [])

  const handleHeart = useCallback(
    async (itemId: string) => {
      if (!user) return
      const isHearted = heartedIds.has(itemId)
      await toggleHeart(itemId, user.uid, isHearted)
    },
    [user, heartedIds, toggleHeart],
  )

  const handleDateDrop = useCallback(async (itemId: string, date: Date) => {
    await handleAdminDateDrop(itemId, date)
  }, [])

  const handleResetSuccess = useCallback((count: number) => {
    setToastMessage(`Reset complete — ${count} LocalPRO items imported`)
    setShowLoginToast(true)
    setTimeout(() => setShowLoginToast(false), 3000)
  }, [])

  const computePath = useCallback(() => {
    const container = timelineRef.current
    if (!container || connectedCount < 2) {
      setPathData({ fullPath: '', buildingPath: '' })
      return
    }

    const cRect = container.getBoundingClientRect()
    const points: { x: number; y: number }[] = []

    cardRefs.current.forEach((ref, i) => {
      if (!ref) return
      const cardEl =
        ref.querySelector('div > div[class*="rounded-2xl"]') ||
        ref.firstElementChild ||
        ref
      const r = (cardEl as HTMLElement).getBoundingClientRect()
      const side = getSide(i)

      const x =
        side === 'left'
          ? r.right - cRect.left + 14
          : r.left - cRect.left - 14
      const y = r.top - cRect.top + r.height / 2

      points.push({ x, y })
    })

    if (points.length < 2) return

    const fullPath = buildSmoothPath(points)
    const bEnd = Math.min(points.length - 1, building.length)
    const bPoints = points.slice(0, bEnd + 1)
    const buildingPath = bPoints.length >= 2 ? buildSmoothPath(bPoints) : ''

    setPathData({ fullPath, buildingPath })
  }, [connectedCount, building.length])

  useEffect(() => {
    const timers = [setTimeout(computePath, 50), setTimeout(computePath, 300)]
    const ro = new ResizeObserver(computePath)
    if (timelineRef.current) ro.observe(timelineRef.current)
    window.addEventListener('resize', computePath)
    window.addEventListener('scroll', computePath, { passive: true })
    return () => {
      timers.forEach(clearTimeout)
      ro.disconnect()
      window.removeEventListener('resize', computePath)
      window.removeEventListener('scroll', computePath)
    }
  }, [computePath, items])

  let gi = 0

  if (authLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <GridBackground variant={isDark ? 'dark' : 'light'} fixed />
      <LoginToast show={showLoginToast} message={toastMessage} />

      <header className="fixed top-0 left-0 right-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-bold text-[var(--text-primary)] whitespace-nowrap">
              Roadmap
              {isAdmin && (
                <span className="text-brand-500 font-medium text-sm ml-1">(Admin)</span>
              )}
            </span>
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setAdminPanelOpen(true)}
                  className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-brand-500"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Users</span>
                </button>
                {user && (
                  <ResetLocalproButton userId={user.uid} onSuccess={handleResetSuccess} />
                )}
              </>
            )}
          </div>

          <div className="text-center min-w-0 px-2">
            {isLoggedIn && user?.email && (
              <span className="text-sm text-[var(--text-muted)] truncate block max-w-[200px] sm:max-w-none mx-auto">
                {user.email}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-brand-500 hover:bg-[var(--bg)]"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-brand-500 hover:bg-[var(--bg)]"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-brand-500 hover:bg-[var(--bg)]"
                aria-label="Sign in"
              >
                <LogIn className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/[0.06] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-12 md:pt-32 md:pb-16 text-center">
          <h1 className="text-4xl md:text-[3.5rem] font-extrabold text-[var(--text-primary)] leading-tight">
            Where we&apos;re headed
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] mt-4">
            Our roadmap — built with your input.
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-3">
            Heart the features you&apos;re most excited about.
          </p>
        </div>
      </section>

      {isAdmin && (
        <AdminCalendar
          items={items}
          onDateDrop={handleDateDrop}
          onItemClick={(item) => setCalendarModalItemId(item.id)}
        />
      )}

      <section className="relative max-w-5xl mx-auto px-6 pb-32">
        <ZoneHeader emoji="🚀" title="Shipped" />
        {shipped.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)] mb-12">Nothing shipped yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center mb-16 md:mb-24">
            {shipped.map((item) => (
              <ShippedCardCompact key={item.id} item={item} isAdmin={isAdmin} />
            ))}
          </div>
        )}

        <div ref={timelineRef} className="relative">
          <MobilePath />
          <ZigzagPath pathData={pathData} />

          <div className="relative z-10">
            <ZoneHeader emoji="🔨" title="Building Now" />
            <div className="space-y-6 md:space-y-28 lg:space-y-36">
              {building.length === 0 && (
                <p className="text-center text-sm text-[var(--text-muted)]">Nothing in progress yet.</p>
              )}
              {building.map((item) => {
                const idx = gi++
                return (
                  <BuildingCard
                    key={item.id}
                    item={item}
                    side={getSide(idx)}
                    cardRef={(el) => { cardRefs.current[idx] = el }}
                    isAdmin={isAdmin}
                  />
                )
              })}
            </div>

            <ZoneHeader emoji="💡" title="Up Next" />
            <div className="space-y-6 md:space-y-28 lg:space-y-36">
              {upcoming.length === 0 && (
                <p className="text-center text-sm text-[var(--text-muted)]">No upcoming items yet.</p>
              )}
              {upcoming.map((item) => {
                const idx = gi++
                return (
                  <FeatureCard
                    key={item.id}
                    item={item}
                    side={getSide(idx)}
                    hearted={heartedIds.has(item.id)}
                    heartCount={item.heartCount}
                    onHeart={handleHeart}
                    isLoggedIn={isLoggedIn}
                    onLoginRequired={() => handleLoginRequired('Sign in to vote on features')}
                    cardRef={(el) => { cardRefs.current[idx] = el }}
                    isAdmin={isAdmin}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <ZoneHeader emoji="🔮" title="Exploring" />
        {exploring.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)]">No ideas being explored yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {exploring.map((item) => (
              <FeatureCard
                key={item.id}
                item={item}
                hearted={heartedIds.has(item.id)}
                heartCount={item.heartCount}
                onHeart={handleHeart}
                isLoggedIn={isLoggedIn}
                onLoginRequired={() => handleLoginRequired('Sign in to vote on features')}
                faded
                compact
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-[var(--border)] py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed">
            Priorities may shift based on your feedback. No dates, no promises — just direction.
          </p>
        </div>
      </footer>

      <IdeaInputBar
        isLoggedIn={isLoggedIn}
        userId={user?.uid ?? null}
        userEmail={user?.email ?? null}
        itemCount={items.length}
        onLoginRequired={() => handleLoginRequired('Sign in to share your ideas')}
      />

      <AdminUserPanel open={adminPanelOpen} onClose={() => setAdminPanelOpen(false)} />

      <CardDetailModal
        item={calendarModalItem}
        isAdmin={isAdmin}
        onClose={() => setCalendarModalItemId(null)}
      />
    </div>
  )
}
