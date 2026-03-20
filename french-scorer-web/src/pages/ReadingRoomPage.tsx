import { ChevronLeft, ChevronRight, Headphones, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ReadingRoomPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Reading Room</p>
          <h1 className="font-display mt-1 text-2xl font-bold text-[#1e293b] md:text-3xl">
            Le Petit Prince
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Parallel text, patterns, and translation toggles — styled like your Academic Atelier mock.
          </p>
        </div>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-800">
          B1 Intermediate
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full bg-[#1e293b] px-5 py-2.5 text-sm font-bold text-white shadow-md"
        >
          Listen to page
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#1e293b]"
        >
          Save passage
        </button>
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
          <input type="checkbox" defaultChecked className="accent-indigo-600" />
          Patterns
        </label>
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
          <input type="checkbox" className="accent-indigo-600" />
          Translation
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <p className="text-lg leading-relaxed text-[#1e293b]">
              <span className="rounded-md bg-indigo-50 px-1">
                On ne voit bien qu’avec le cœur.
              </span>{' '}
              L’essentiel est invisible pour les yeux.
            </p>
          </div>
          <div className="relative rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-sm">
            <p className="text-sm leading-relaxed text-slate-700">
              One sees clearly only with the heart. What is essential is invisible to the eye.
            </p>
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-md">
              <Headphones className="h-4 w-4 text-indigo-600" />
              <div className="h-1 flex-1 rounded-full bg-slate-200">
                <div className="h-full w-1/3 rounded-full bg-indigo-500" />
              </div>
              <span className="text-xs font-mono text-slate-500">0:42 / 2:10</span>
              <span className="text-xs font-bold text-slate-600">1.0×</span>
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-3xl bg-[#1e293b] p-6 text-white shadow-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Grammar marker</p>
            <p className="mt-2 font-display text-lg font-bold">Présent + infinitif</p>
            <p className="mt-2 text-sm text-slate-300">
              “On ne voit… qu’avec” — fixed expression; “voir” + infinitive in other patterns.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vocabulary</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2 border-b border-slate-200/80 pb-2">
                <dt className="font-semibold text-[#1e293b]">essentiel</dt>
                <dd className="text-slate-600">essential</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-slate-200/80 pb-2">
                <dt className="font-semibold text-[#1e293b]">invisible</dt>
                <dd className="text-slate-600">invisible</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <footer className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
        <span className="flex items-center gap-1 opacity-60">
          <ChevronLeft className="h-4 w-4" /> Previous chapter
        </span>
        <MoreHorizontal className="h-5 w-5 text-slate-400" />
        <span className="flex items-center gap-1">
          Next chapter <ChevronRight className="h-4 w-4" />
        </span>
      </footer>

      <p className="text-center text-xs text-slate-500">
        Full chapter sync and audio are coming soon.{' '}
        <Link to="/syllabus" className="font-semibold text-indigo-600 hover:underline">
          Browse course library
        </Link>
      </p>
    </div>
  )
}
