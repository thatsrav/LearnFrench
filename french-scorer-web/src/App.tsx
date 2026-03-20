import { BookOpen, Home, PenSquare, Trophy } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { label: 'Home', icon: Home, to: '/' },
  { label: 'Writing Lab', icon: PenSquare, to: '/' },
  { label: 'Syllabus', icon: BookOpen, to: '/syllabus' },
  { label: 'Leaderboard', icon: Trophy, to: '/leaderboard' },
]

export default function App() {
  return (
    <div className="h-full bg-[#F8FAFC] text-slate-800">
      <div className="flex h-full">
        <aside className="w-[92px] border-r border-[#002654]/20 bg-[#002654] p-3">
          <div className="mb-6 rounded-2xl bg-white/10 py-3 text-center text-xs font-semibold text-white">
            FR
          </div>
          <nav className="space-y-2">
            {navItems.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                title={label}
                className={({ isActive }) =>
                  [
                    'flex w-full flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium transition',
                    isActive ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/15',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                <span className="text-center leading-tight">{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <header className="mb-5">
            <p className="text-sm font-medium text-[#2955B8]">Modern French</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Bento Dashboard</h1>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
