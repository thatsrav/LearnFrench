import { Link } from 'react-router-dom'

export default function AppFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/80 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-display text-lg font-semibold text-slate-900">FrenchLearn</p>
          <p className="mt-1 text-xs text-slate-500">© {new Date().getFullYear()} FrenchLearn. The Breathable Atelier.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Link to="/" className="hover:text-indigo-600">
            Privacy
          </Link>
          <Link to="/" className="hover:text-indigo-600">
            Terms
          </Link>
          <Link to="/" className="hover:text-indigo-600">
            Support
          </Link>
          <Link to="/account" className="hover:text-indigo-600">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}
