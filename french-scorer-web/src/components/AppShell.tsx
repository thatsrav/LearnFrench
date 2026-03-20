import { BookOpen, Bot, Flag, Home, Mic, Trophy, User } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
    isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-700 hover:bg-slate-100',
  ].join(' ')

export default function AppShell() {
  return (
    <div className="min-h-full bg-[#f1f5f9]">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-md">
              F
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">FrenchLearn</span>
          </NavLink>

          <nav className="flex flex-wrap items-center justify-end gap-1 md:gap-2">
            <NavLink to="/" className={navLinkClass}>
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </NavLink>
            <NavLink to="/scorer" className={navLinkClass}>
              <Bot size={18} />
              <span className="hidden sm:inline">AI Scorer</span>
            </NavLink>
            <NavLink to="/tef-prep" className={navLinkClass}>
              <Flag size={18} />
              <span className="hidden sm:inline">TEF Prep</span>
            </NavLink>
            <NavLink to="/reading" className={navLinkClass}>
              <BookOpen size={18} />
              <span className="hidden sm:inline">Reading</span>
            </NavLink>
            <NavLink to="/speaking" className={navLinkClass}>
              <Mic size={18} />
              <span className="hidden sm:inline">Speaking</span>
            </NavLink>
            <NavLink to="/leaderboard" className={navLinkClass}>
              <Trophy size={18} />
              <span className="hidden sm:inline">Scores</span>
            </NavLink>
            <NavLink to="/account" className={navLinkClass}>
              <User size={18} />
              <span className="hidden sm:inline">Account</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
