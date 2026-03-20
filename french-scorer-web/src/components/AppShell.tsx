import {
  Bell,
  BookOpen,
  Bot,
  GraduationCap,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  TrendingUp,
  Trophy,
  User,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import AppFooter from './AppFooter'
import { useAuth } from '../contexts/AuthContext'

const RECENT_SCORES_KEY = 'french_scorer_recent_scores_v1'

function readLastCefr(): string {
  try {
    const raw = localStorage.getItem(RECENT_SCORES_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    if (!Array.isArray(parsed) || parsed.length === 0) return 'B2'
    const last = parsed[parsed.length - 1] as { cecr?: string }
    const c = String(last?.cecr ?? '').trim()
    return c || 'B2'
  } catch {
    return 'B2'
  }
}

function breadcrumbForPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'Home'
  if (pathname.startsWith('/tef-prep')) return 'TEF Canada Academic Pathway'
  if (pathname.startsWith('/scorer')) return 'Dashboard / AI Scorer'
  if (pathname.startsWith('/syllabus')) return 'Dashboard / Syllabus Atelier'
  if (pathname.startsWith('/account')) return 'Account'
  if (pathname.startsWith('/leaderboard')) return 'Dashboard / Scores'
  if (pathname.startsWith('/unit/')) return 'Syllabus / Module overview'
  if (pathname.startsWith('/lesson/')) return 'Syllabus / Lesson'
  return 'Dashboard'
}

function SidebarFooter({ pathname }: { pathname: string }) {
  if (pathname === '/' || pathname === '') {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#1A1B4B] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-200/90">Pro access</p>
        <p className="mt-2 text-xs leading-relaxed text-white/75">
          Unlock advanced phonetics and expanded AI feedback.
        </p>
        <Link
          to="/account"
          className="mt-4 block w-full rounded-xl bg-[#4F46E5] py-2.5 text-center text-xs font-bold text-white shadow-md transition hover:bg-[#4338ca]"
        >
          Upgrade to Premium
        </Link>
      </div>
    )
  }
  if (pathname.startsWith('/tef-prep')) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-300/90">Exam countdown</p>
        <p className="mt-2 font-display text-2xl font-bold text-white">14</p>
        <p className="text-xs font-medium text-white/55">Days to TEF</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[62%] rounded-full bg-sky-400" />
        </div>
      </div>
    )
  }
  if (pathname.startsWith('/scorer')) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#071428] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">Pro plan</p>
        <p className="mt-1 text-sm font-semibold text-white">Active</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[75%] rounded-full bg-emerald-400" />
        </div>
        <p className="mt-2 text-xs text-white/50">750 / 1000 AI credits</p>
      </div>
    )
  }
  const level = readLastCefr()
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#152a52] to-[#0a1628] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/55">Academic status</p>
      <p className="mt-2 font-display text-lg font-bold text-white">
        {level} · Scholar track
      </p>
      <p className="mt-1 text-xs leading-relaxed text-white/45">Inferred from your latest AI scores on this device.</p>
    </div>
  )
}

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    'relative flex items-center gap-3 rounded-xl px-3 py-3 pl-4 text-sm font-semibold transition',
    isActive
      ? 'bg-[var(--atelier-accent-soft)] text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-md before:bg-sky-400'
      : 'text-white/75 hover:bg-white/[0.06] hover:text-white',
  ].join(' ')

export default function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const crumb = useMemo(() => breadcrumbForPath(location.pathname), [location.pathname])

  const closeMobile = () => setMobileOpen(false)

  const onLogout = async () => {
    await signOut()
    navigate('/welcome')
    closeMobile()
  }

  return (
    <div className="flex min-h-full bg-[var(--atelier-surface)]">
      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={closeMobile}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-white/5 bg-[var(--atelier-sidebar)] shadow-2xl transition-transform duration-200 lg:static lg:z-0 lg:w-64 lg:translate-x-0 lg:shadow-none xl:w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 lg:block">
          <Link to="/" onClick={closeMobile} className="block">
            <p className="font-display text-xl font-bold leading-tight text-white">FrenchLearn</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">The Academic Atelier</p>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden"
            onClick={closeMobile}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          <NavLink to="/" end className={navItemClass} onClick={closeMobile}>
            <Home size={20} className="shrink-0 opacity-90" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/syllabus" className={navItemClass} onClick={closeMobile}>
            <BookOpen size={20} className="shrink-0 opacity-90" />
            <span>Syllabus</span>
          </NavLink>
          <NavLink to="/tef-prep" className={navItemClass} onClick={closeMobile}>
            <GraduationCap size={20} className="shrink-0 opacity-90" />
            <span>TEF Prep</span>
          </NavLink>
          <NavLink to="/scorer" className={navItemClass} onClick={closeMobile}>
            <Bot size={20} className="shrink-0 opacity-90" />
            <span>AI Scorer</span>
          </NavLink>
          <NavLink to="/leaderboard" className={navItemClass} onClick={closeMobile}>
            <Trophy size={20} className="shrink-0 opacity-90" />
            <span>Scores</span>
          </NavLink>
          <NavLink to="/account" className={navItemClass} onClick={closeMobile}>
            <User size={20} className="shrink-0 opacity-90" />
            <span>Account</span>
          </NavLink>
        </nav>

        <div className="mt-auto space-y-3 border-t border-white/10 p-4">
          <SidebarFooter pathname={location.pathname} />
          <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
            <Link
              to="/welcome"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
              onClick={closeMobile}
            >
              <HelpCircle size={16} />
              Help Center
            </Link>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <p className="hidden min-w-0 truncate text-sm font-semibold text-[var(--atelier-navy-deep)] sm:block md:max-w-[200px] lg:max-w-none">
              {crumb}
            </p>

            <div className="mx-auto hidden max-w-xl flex-1 px-4 md:flex">
              <label className="relative w-full">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Search lessons, grammar rules…"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  readOnly
                />
              </label>
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                className="hidden rounded-full p-2.5 text-slate-500 hover:bg-slate-100 sm:inline-flex"
                aria-label="Analytics"
              >
                <TrendingUp size={20} />
              </button>
              <button
                type="button"
                className="hidden rounded-full p-2.5 text-slate-500 hover:bg-slate-100 sm:inline-flex"
                aria-label="Notifications"
              >
                <Bell size={20} />
              </button>
              <Link
                to="/account"
                className="hidden rounded-full p-2.5 text-slate-500 hover:bg-slate-100 sm:inline-flex"
                aria-label="Settings"
              >
                <Settings size={20} />
              </Link>
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 transition hover:border-sky-200 hover:bg-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--atelier-navy-deep)] text-xs font-bold text-white">
                  FL
                </span>
                <span className="hidden text-left text-xs leading-tight lg:block">
                  <span className="block font-bold text-slate-900">Scholar</span>
                  <span className="text-[10px] font-medium text-slate-500">Academic lead</span>
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </div>
  )
}
