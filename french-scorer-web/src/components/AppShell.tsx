import { BookOpen, Bot, Flag, Home, Trophy, User } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import AppFooter from './AppFooter'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition md:px-4',
    isActive
      ? 'bg-[#2563eb] text-white shadow-md shadow-blue-600/20'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')

export default function AppShell() {
  return (
    <div className="flex min-h-full flex-col bg-[#f8f9fb]">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
          <NavLink to="/" className="flex shrink-0 items-center gap-2">
            <span className="font-display flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#4f46e5] text-lg font-bold text-white shadow-md">
              F
            </span>
            <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:inline">FrenchLearn</span>
          </NavLink>

          <nav className="mx-auto hidden flex-1 flex-wrap items-center justify-center gap-0.5 md:flex lg:gap-1">
            <NavLink to="/" end className={navLinkClass}>
              <Home size={17} />
              <span>Home</span>
            </NavLink>
            <NavLink to="/tef-prep" className={navLinkClass}>
              <Flag size={17} />
              <span>TEF Prep</span>
            </NavLink>
            <NavLink to="/syllabus" className={navLinkClass}>
              <BookOpen size={17} />
              <span>Study units</span>
            </NavLink>
            <NavLink to="/leaderboard" className={navLinkClass}>
              <Trophy size={17} />
              <span>Scores</span>
            </NavLink>
            <NavLink to="/scorer" className={navLinkClass}>
              <Bot size={17} />
              <span>AI Scorer</span>
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <nav className="-mx-1 flex max-w-[58vw] snap-x snap-mandatory gap-0.5 overflow-x-auto pb-0.5 md:hidden">
              <NavLink to="/" end className={(p) => `${navLinkClass(p)} shrink-0 snap-start px-2.5`}>
                <Home size={16} />
              </NavLink>
              <NavLink to="/tef-prep" className={(p) => `${navLinkClass(p)} shrink-0 snap-start px-2.5`}>
                <Flag size={16} />
              </NavLink>
              <NavLink to="/syllabus" className={(p) => `${navLinkClass(p)} shrink-0 snap-start px-2.5`}>
                <BookOpen size={16} />
              </NavLink>
              <NavLink to="/leaderboard" className={(p) => `${navLinkClass(p)} shrink-0 snap-start px-2.5`}>
                <Trophy size={16} />
              </NavLink>
              <NavLink to="/scorer" className={(p) => `${navLinkClass(p)} shrink-0 snap-start px-2.5`}>
                <Bot size={16} />
              </NavLink>
            </nav>
            <NavLink
              to="/account"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              aria-label="Account"
            >
              <User size={20} />
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-10">
        <Outlet />
      </main>

      <AppFooter />
    </div>
  )
}
