import {
  Bell,
  BookMarked,
  BookOpen,
  ChevronRight,
  Gamepad2,
  GraduationCap,
  Headphones,
  HelpCircle,
  Library,
  LogOut,
  Menu,
  Mic,
  Pencil,
  Search,
  Settings,
  Sparkles,
  Trophy,
  User,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import AppFooter from './AppFooter'
import { useAuth } from '../contexts/AuthContext'
import { TEF_PREP_HUB, tefPrepSkillPath } from '../lib/tefPrepNav'
import { levelBadgeLabel, readUserCefrLevel } from '../lib/userCefr'

/** Breadcrumbs left of search (design: Dashboard · Courses · Library) */
function breadcrumbsForPath(pathname: string): { root: string; mid?: string; leaf?: string } {
  if (pathname === '/' || pathname === '') return { root: 'Dashboard', mid: 'Courses', leaf: 'Overview' }
  if (pathname.startsWith('/syllabus')) return { root: 'Dashboard', mid: 'Courses', leaf: 'Library' }
  if (pathname.startsWith('/reading-room')) return { root: 'Dashboard', mid: 'The Atelier', leaf: 'Reading Room' }
  if (pathname.startsWith('/writing')) return { root: 'Dashboard', mid: 'The Atelier', leaf: 'Writing Area' }
  if (pathname.startsWith('/game')) return { root: 'Dashboard', mid: 'The Atelier', leaf: 'Grammar Games' }
  if (pathname.startsWith('/tef-prep')) {
    const skillMatch = pathname.match(/\/(reading|writing|listening|speaking)(?:\/|$|\?)/)
    const leafBySkill: Record<string, string> = {
      reading: 'Reading Room',
      writing: 'Writing Area',
      listening: 'Listening Area',
      speaking: 'Speaking Area',
    }
    if (skillMatch?.[1] && leafBySkill[skillMatch[1]]) {
      return { root: 'Dashboard', mid: 'TEF Prep', leaf: leafBySkill[skillMatch[1]] }
    }
    return { root: 'Dashboard', mid: 'TEF Prep', leaf: 'Track' }
  }
  if (pathname.startsWith('/scorer')) return { root: 'Dashboard', mid: 'The Atelier', leaf: 'AI Scorer' }
  if (pathname.startsWith('/leaderboard')) return { root: 'Dashboard', leaf: 'Scores' }
  if (pathname.startsWith('/account')) return { root: 'Account' }
  if (pathname.startsWith('/unit/')) return { root: 'Dashboard', mid: 'Courses', leaf: 'Module' }
  if (pathname.startsWith('/lesson/')) return { root: 'Dashboard', mid: 'Courses', leaf: 'Lesson' }
  return { root: 'Dashboard' }
}

function SidebarFooterLight({ pathname }: { pathname: string }) {
  if (pathname.startsWith('/tef-prep')) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Exam countdown</p>
        <p className="font-display mt-2 text-2xl font-bold text-[#1e293b]">14</p>
        <p className="text-xs font-medium text-slate-600">Days to TEF</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-[62%] rounded-full bg-indigo-500" />
        </div>
      </div>
    )
  }
  const level = readUserCefrLevel()
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Level</p>
      <p className="font-display mt-2 text-lg font-bold text-[#1e293b]">
        {level} · Upper track
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">From your latest scores on this device.</p>
    </div>
  )
}

const navy = '#1e293b'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'relative flex items-center gap-3 rounded-xl px-3 py-3 pr-4 text-sm font-semibold transition',
    isActive
      ? 'bg-indigo-50 text-[#1e293b] shadow-sm before:absolute before:right-0 before:top-2 before:bottom-2 before:w-1 before:rounded-l-md before:bg-indigo-600'
      : 'text-slate-600 hover:bg-slate-100 hover:text-[#1e293b]',
  ].join(' ')

const subNavClass = ({ isActive }: { isActive: boolean }) =>
  [
    'relative flex items-center gap-2 rounded-lg py-2.5 pl-3 pr-3 text-sm transition',
    isActive
      ? 'bg-indigo-50 font-semibold text-[#1e293b] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-md before:bg-indigo-600'
      : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1e293b]',
  ].join(' ')

const TEF_SUB_LINKS = [
  { to: '/reading-room', label: 'Reading Room', icon: BookOpen },
  { to: '/writing', label: 'Writing Area', icon: Pencil },
  { to: tefPrepSkillPath('listening'), label: 'Listening Area', icon: Headphones },
  { to: tefPrepSkillPath('speaking'), label: 'Speaking Area', icon: Mic },
] as const

export default function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [tefExpanded, setTefExpanded] = useState(true)
  const crumbs = useMemo(() => breadcrumbsForPath(location.pathname), [location.pathname])
  const onTefTrack = location.pathname.startsWith('/tef-prep')
  const headerLevelBadge = levelBadgeLabel(readUserCefrLevel())

  const closeMobile = () => setMobileOpen(false)

  const onLogout = async () => {
    await signOut()
    navigate('/welcome')
    closeMobile()
  }

  return (
    <div className="flex min-h-full bg-[#f1f5f9]">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:static lg:z-0 lg:w-64 lg:translate-x-0 lg:shadow-none xl:w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
          <Link to="/" onClick={closeMobile} className="block">
            <p className="font-display text-xl font-bold italic leading-tight" style={{ color: navy }}>
              FrenchLearn
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              The Academic Atelier
            </p>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={closeMobile}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <p className="px-5 pt-3 text-[10px] font-bold uppercase tracking-widest text-indigo-600">The Atelier</p>
        <p className="px-5 pb-2 text-[11px] text-slate-500">Level: B2 upper intermediate</p>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
          <NavLink to="/" end className={navClass} onClick={closeMobile}>
            <Library size={20} className="shrink-0 text-indigo-600" />
            <span>Main Syllabus</span>
          </NavLink>

          <div className="rounded-xl">
            <div className="flex items-stretch gap-0.5">
              <button
                type="button"
                onClick={() => setTefExpanded((e) => !e)}
                className="flex shrink-0 items-center justify-center rounded-lg px-1.5 text-slate-500 hover:bg-slate-100"
                aria-expanded={tefExpanded}
                aria-label={tefExpanded ? 'Collapse TEF Prep' : 'Expand TEF Prep'}
              >
                <ChevronRight
                  size={18}
                  className={['transition-transform', tefExpanded ? 'rotate-90' : ''].join(' ')}
                />
              </button>
              <NavLink
                to={TEF_PREP_HUB}
                end
                onClick={closeMobile}
                className={({ isActive }) =>
                  [
                    'relative flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-3 pr-4 text-sm font-semibold transition',
                    isActive
                      ? 'bg-indigo-50 text-[#1e293b] shadow-sm before:absolute before:right-0 before:top-2 before:bottom-2 before:w-1 before:rounded-l-md before:bg-indigo-600'
                      : onTefTrack
                        ? 'text-[#1e293b] hover:bg-slate-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#1e293b]',
                  ].join(' ')
                }
              >
                <GraduationCap size={20} className="shrink-0 text-slate-500" />
                <span className="truncate">TEF Prep</span>
              </NavLink>
            </div>
            {tefExpanded ? (
              <div className="ml-2 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-2">
                {TEF_SUB_LINKS.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={subNavClass} onClick={closeMobile}>
                    <Icon size={18} className="shrink-0 text-slate-400" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>

          <NavLink to="/game" className={navClass} onClick={closeMobile}>
            <Gamepad2 size={20} className="shrink-0 text-slate-500" />
            <span>Game</span>
          </NavLink>

          <div className="my-3 border-t border-slate-100" />

          <NavLink to="/syllabus" className={navClass} onClick={closeMobile}>
            <BookMarked size={20} className="shrink-0 text-slate-500" />
            <span>Course library</span>
          </NavLink>
          <NavLink to="/scorer" className={navClass} onClick={closeMobile}>
            <Sparkles size={20} className="shrink-0 text-slate-500" />
            <span>AI Scorer</span>
          </NavLink>
        </nav>

        <div className="mt-auto space-y-3 border-t border-slate-100 p-4">
          <Link
            to="/game"
            onClick={closeMobile}
            className="block w-full rounded-2xl py-3.5 text-center text-sm font-bold text-white shadow-md transition hover:opacity-95"
            style={{ backgroundColor: navy }}
          >
            Daily Challenge
          </Link>
          <SidebarFooterLight pathname={location.pathname} />
          <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
            <Link
              to="/welcome"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              onClick={closeMobile}
            >
              <HelpCircle size={16} />
              Help Center
            </Link>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-6">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <nav className="hidden min-w-0 flex-1 items-center gap-2 text-sm font-medium text-slate-500 sm:flex">
              <span className="font-semibold text-[#1e293b]">{crumbs.root}</span>
              {crumbs.mid ? (
                <>
                  <span className="text-slate-300">/</span>
                  <span className={crumbs.leaf ? '' : 'font-semibold text-[#1e293b]'}>{crumbs.mid}</span>
                </>
              ) : null}
              {crumbs.leaf ? (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold text-[#1e293b]">{crumbs.leaf}</span>
                </>
              ) : null}
            </nav>

            <div className="mx-auto hidden max-w-md flex-1 px-2 md:flex lg:max-w-xl">
              <label className="relative w-full">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Search lessons, grammar rules…"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  readOnly
                />
              </label>
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <span className="mr-1 hidden rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800 md:inline">
                {headerLevelBadge}
              </span>
              <Link
                to="/leaderboard"
                className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100"
                aria-label="Scores"
              >
                <Trophy size={20} />
              </Link>
              <button type="button" className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
                <Bell size={20} />
              </button>
              <Link
                to="/account"
                className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100"
                aria-label="Settings"
              >
                <Settings size={20} />
              </Link>
              <Link
                to="/account"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-gradient-to-br from-indigo-100 to-slate-100"
                aria-label="Account"
              >
                <User size={20} className="text-indigo-800" />
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
