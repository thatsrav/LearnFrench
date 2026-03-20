import { ArrowRight, BookOpen, Headphones, Medal, Mic, Pencil, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TEF_A1_UNIT_COUNT } from '../lib/tefPrepFetch'
import { tefPrepSkillPath } from '../lib/tefPrepNav'

const UNIT_BLURBS: Record<number, string> = {
  1: 'Core syntax, verb tenses, and sentence structure essentials.',
  2: 'Lexical mastery — everyday vocabulary in context.',
  3: 'Argumentative strategy for short written tasks.',
  4: 'Listening: rapid audio decoding and inference.',
  5: 'Advanced reading — notices, emails, and short articles.',
  6: 'Speaking Section A — asking for information.',
  7: 'Speaking Section B — structured monologue.',
  8: 'Subjunctive and nuance in formal French.',
  9: 'Time management under exam conditions.',
  10: 'Full-length review and confidence checklist.',
}

const READING_LINK = tefPrepSkillPath('reading')
const ORAL_LABS_LINK = '/tef-prep/oral-labs'
const WRITING_LINK = tefPrepSkillPath('writing')

export default function TefPrepHubPage() {
  return (
    <div className="space-y-10 pb-8">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--atelier-navy-deep)]">TEF Canada · Academic pathway</p>
        <h1 className="font-display mt-3 text-3xl font-bold leading-tight tracking-tight text-[var(--atelier-navy-deep)] md:text-4xl lg:text-[2.75rem]">
          Excellence through <em className="not-italic text-sky-700">Academic Discipline.</em>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Welcome to the Prep Atelier. Select a skill room to begin high-stakes simulation — reading, writing, listening, and
          speaking — then deepen with{' '}
          <Link to="/syllabus" className="font-semibold text-[var(--fl-blue)] underline-offset-2 hover:underline">
            syllabus units
          </Link>
          .
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Link
          to={READING_LINK}
          className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-800">
              Compréhension écrite
            </span>
            <BookOpen className="h-6 w-6 text-[var(--atelier-navy-deep)] opacity-80" />
          </div>
          <h2 className="font-display mt-5 text-xl font-bold text-[var(--atelier-navy-deep)]">Reading room</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
            Exam-style texts and questions — build speed and inference under time pressure.
          </p>
          <p className="mt-4 text-xs font-semibold text-slate-500">Sample track · Unit 1</p>
          <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--atelier-navy-deep)] px-5 py-3 text-sm font-bold text-white transition group-hover:bg-[#001438]">
            Start practice <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link
          to={ORAL_LABS_LINK}
          className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <Headphones className="h-8 w-8 text-[var(--atelier-navy-deep)]" />
          </div>
          <h2 className="font-display mt-5 text-xl font-bold text-[var(--atelier-navy-deep)]">Listening &amp; speaking lab</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
            Daily AI scenarios, no-back mode, oral recording with Whisper + Gemini analysis — TEF protocol.
          </p>
          <p className="mt-4 text-xs font-semibold text-slate-500">Oral atelier · combined track</p>
          <span className="mt-6 text-sm font-bold text-[var(--fl-blue)] group-hover:underline">Open oral lab →</span>
        </Link>

        <Link
          to={WRITING_LINK}
          className="group flex flex-col rounded-2xl border border-slate-200/60 bg-slate-100/80 p-6 shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
        >
          <Pencil className="h-8 w-8 text-slate-600" />
          <h2 className="font-display mt-5 text-xl font-bold text-[var(--atelier-navy-deep)]">Writing room</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
            Section A & B formats with AI-assisted structural analysis and grammar feedback.
          </p>
          <p className="mt-4 text-xs font-semibold text-slate-500">12+ activity templates</p>
          <span className="mt-6 inline-flex w-fit rounded-xl border-2 border-white bg-white px-5 py-3 text-sm font-bold text-[var(--atelier-navy-deep)] shadow-sm transition group-hover:bg-slate-50">
            Start practice
          </span>
        </Link>

        <Link
          to={`${ORAL_LABS_LINK}#speaking`}
          className="group relative flex flex-col overflow-hidden rounded-2xl bg-[var(--atelier-navy-deep)] p-6 text-white shadow-xl shadow-slate-900/20"
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5" />
          <Mic className="relative h-8 w-8 text-sky-200" />
          <h2 className="font-display relative mt-5 text-xl font-bold">Speaking focus</h2>
          <p className="relative mt-2 flex-1 text-sm leading-relaxed text-white/85">
            Same oral lab page — jump to the recording block with live waveform, Whisper STT, and TEF-style scoring.
          </p>
          <div className="relative mt-4 flex items-center gap-2 text-xs text-white/70">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <span key={i} className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--atelier-navy-deep)] bg-sky-400/90 text-[10px] font-bold text-[var(--atelier-navy-deep)]">
                  {String.fromCharCode(65 + i)}
                </span>
              ))}
            </div>
            <span className="font-semibold">Oral track</span>
          </div>
          <span className="relative mt-6 inline-flex w-full items-center justify-center rounded-xl bg-sky-200 py-3.5 text-sm font-bold text-[var(--atelier-navy-deep)] transition group-hover:bg-white">
            Scroll to speaking
          </span>
        </Link>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200/80 bg-slate-100/60 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Medal className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--atelier-navy-deep)]">Target score: CLB 9</p>
            <p className="text-xs text-slate-600">Based on your recent speaking & writing mocks (illustrative).</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mocks taken</p>
            <p className="mt-1 font-display text-xl font-bold text-[var(--atelier-navy-deep)]">08</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total hours</p>
            <p className="mt-1 font-display text-xl font-bold text-[var(--atelier-navy-deep)]">124h</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Accuracy</p>
            <p className="mt-1 font-display text-xl font-bold text-[var(--atelier-navy-deep)]">82%</p>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="h-1 w-10 rounded-full bg-[var(--atelier-navy-deep)]" />
          <h2 className="font-display text-xl font-bold text-[var(--atelier-navy-deep)]">Unit pathway · A1</h2>
        </div>
        <ul className="space-y-3">
          {Array.from({ length: TEF_A1_UNIT_COUNT }, (_, i) => i + 1).map((unit) => (
            <li key={unit}>
              <Link
                to={`/tef-prep/a1/${unit}`}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200/80 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 text-sm font-black text-slate-700">
                    {String(unit).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold text-slate-900">Unité {unit} — TEF A1</p>
                    <p className="mt-1 max-w-xl text-sm text-slate-600">{UNIT_BLURBS[unit] ?? 'Skill-room practice.'}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--fl-blue)] sm:shrink-0">
                  Open <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Users className="h-5 w-5 text-slate-400" />
          <p className="text-sm text-slate-600">
            Need a writing benchmark?{' '}
            <Link to="/scorer" className="font-bold text-[var(--atelier-navy-deep)] underline-offset-2 hover:underline">
              Open AI Scorer
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
