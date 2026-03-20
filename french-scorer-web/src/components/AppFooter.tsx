import { Link } from 'react-router-dom'

export default function AppFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/90 bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-display text-base font-semibold text-[var(--atelier-navy-deep)]">FrenchLearn Academic</p>
          <p className="mt-1 text-xs text-slate-500">© {new Date().getFullYear()} FrenchLearn · The Academic Atelier</p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span className="cursor-pointer transition hover:text-[var(--atelier-navy-deep)]">Help Center</span>
          <span className="cursor-pointer transition hover:text-[var(--atelier-navy-deep)]">Terms of Service</span>
          <span className="cursor-pointer transition hover:text-[var(--atelier-navy-deep)]">Privacy Policy</span>
          <Link to="/account" className="transition hover:text-[var(--atelier-navy-deep)]">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}
