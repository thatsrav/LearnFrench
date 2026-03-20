import { BookOpen, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function WritingAreaPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="font-display text-lg italic text-indigo-800 md:text-xl">Writing Production</p>
        <h1 className="font-display mt-1 text-2xl font-bold text-[#1e293b] md:text-3xl">
          Composition libre
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Draft in French with accents, tags, and word count — then submit for AI analysis in the Scorer.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Accuracy</p>
              <p className="font-display mt-1 text-3xl font-bold text-[#1e293b]">—</p>
              <p className="text-xs text-slate-500">Submit writing in AI Scorer to track.</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Combo streak</p>
              <p className="font-display mt-1 text-3xl font-bold text-[#1e293b]">0</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
              <button type="button" className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-bold">
                B
              </button>
              <button type="button" className="rounded-lg border border-slate-200 px-3 py-1 text-sm italic">
                I
              </button>
              <button
                type="button"
                className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800"
              >
                ACCENTS
              </button>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                L’ÉTÉ
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                VOYAGE
              </span>
            </div>
            <textarea
              className="min-h-[220px] w-full resize-y rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm text-[#1e293b] outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Décrivez votre dernière vacances au passé composé…"
              defaultValue="L’été dernier, je suis allé à Paris avec mes amis. Nous avons visité le Louvre."
            />
            <p className="mt-3 text-right text-xs text-slate-500">42 / 150 mots (example)</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/syllabus"
              className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline"
            >
              <BookOpen className="h-4 w-4" />
              View reference grammar
            </Link>
            <Link
              to="/scorer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1e293b] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
            >
              <Rocket className="h-4 w-4" />
              Submit for analysis
            </Link>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-[#1e293b] p-6 text-white shadow-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Current assignment</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Describe your last summer vacation using the <strong className="text-white">passé composé</strong>.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-slate-500">Linguistic focus</p>
            <div className="mt-3 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#1e293b]">
                  <span>Past participles</span>
                  <span>85%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[85%] rounded-full bg-indigo-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#1e293b]">
                  <span>Auxiliary verbs</span>
                  <span>60%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[60%] rounded-full bg-pink-400" />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm italic text-slate-600 shadow-sm">
            Remember that <em>être</em> is used for verbs of motion and many pronominal verbs in passé composé.
          </div>
        </aside>
      </div>
    </div>
  )
}
