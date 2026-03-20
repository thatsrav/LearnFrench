import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Volume2 } from 'lucide-react'
import TefPrepWebListeningPractice from '../components/TefPrepWebListeningPractice'
import { fetchTefA1Skill, type TefSkill } from '../lib/tefPrepFetch'

type Mcq = { question_fr: string; options: string[]; answer_index: number }
type LetterOpt = { letter: string; text_fr: string }
type ReadingItem = { item_number: number; question_fr: string; options: LetterOpt[]; answer_index: number }

function speakFrCa(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-CA'
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length
}

const SKILLS: TefSkill[] = ['reading', 'writing', 'listening', 'speaking']

export default function TefPrepActivityPage() {
  const { unit: unitStr, skill: skillStr } = useParams()
  const unit = Number(unitStr)
  const skill = skillStr as TefSkill
  const [data, setData] = useState<unknown>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [draft, setDraft] = useState('')

  const validSkill = SKILLS.includes(skill)

  useEffect(() => {
    if (!Number.isFinite(unit) || unit < 1 || unit > 10 || !validSkill) {
      setLoading(false)
      return
    }
    if (skill === 'listening') {
      setLoading(false)
      setErr(null)
      setData(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        const j = await fetchTefA1Skill(unit, skill)
        if (!cancelled) setData(j)
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [unit, skill, validSkill])

  const readingBlocks = useMemo(() => {
    if (!data || skill !== 'reading') return null
    const r = data as Record<string, unknown>
    const doc = r.document as { body_fr?: string } | undefined
    const items = r.items as ReadingItem[] | undefined
    if (doc?.body_fr && items?.length) {
      return items.map((it, idx) => ({
        key: `i${it.item_number}`,
        heading: `${it.item_number}. ${it.question_fr}`,
        options: it.options.map((o) => `${o.letter}) ${o.text_fr}`),
        answer_index: it.answer_index,
        storageIndex: idx,
      }))
    }
    const questions = r.questions as Mcq[] | undefined
    if (questions?.length) {
      return questions.map((q, idx) => ({
        key: `q${idx}`,
        heading: q.question_fr,
        options: q.options,
        answer_index: q.answer_index,
        storageIndex: idx,
      }))
    }
    return []
  }, [data, skill])

  if (!Number.isFinite(unit) || unit < 1 || unit > 10 || !validSkill) {
    return <p className="text-slate-700">Paramètres invalides.</p>
  }

  if (loading) return <p className="text-slate-600">Chargement…</p>
  if (err) return <p className="text-red-700">{err}</p>

  if (skill === 'listening') {
    return (
      <div className="space-y-6">
        <Link
          to="/tef-prep"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          ← Retour au tableau de bord
        </Link>
        <TefPrepWebListeningPractice tefUnit={unit} />
      </div>
    )
  }

  if (!data) return null

  const meta = (d: Record<string, unknown>) => (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
      <span className="font-semibold">{String(d.tef_task_id)}</span>
      <span className="mx-2">·</span>
      <span>CLB {String(d.clb_target)}</span>
      <span className="mx-2">·</span>
      <span>{String(d.strictness_level)}</span>
      <span className="mx-2">·</span>
      <span>densité {Number(d.lexical_density).toFixed(2)}</span>
    </div>
  )

  if (skill === 'reading') {
    const r = data as Record<string, unknown>
    return (
      <div className="space-y-4">
        <Link to={`/tef-prep/a1/${unit}`} className="text-sm font-semibold text-blue-600 hover:underline">
          ← Unité {unit}
        </Link>
        {meta(r)}
        {r.instructions_fr ? (
          <p className="text-sm font-semibold text-slate-800">{String(r.instructions_fr)}</p>
        ) : null}
        {r.document ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {(() => {
              const doc = r.document as { label_fr?: string; body_fr: string }
              return (
                <>
                  {doc.label_fr ? (
                    <p className="text-xs font-bold uppercase text-slate-500">{doc.label_fr}</p>
                  ) : null}
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
                    {doc.body_fr}
                  </pre>
                </>
              )
            })()}
          </div>
        ) : null}
        {r.title_fr && r.content_fr ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold text-slate-900">{String(r.title_fr)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">{String(r.content_fr)}</p>
            {r.gloss_en ? <p className="mt-2 text-xs italic text-slate-500">{String(r.gloss_en)}</p> : null}
          </div>
        ) : null}
        {readingBlocks?.map((block) => (
          <div key={block.key} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">{block.heading}</p>
            <ul className="mt-2 space-y-2">
              {block.options.map((opt, oi) => {
                const picked = answers[block.storageIndex] === oi
                return (
                  <li key={oi}>
                    <button
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, [block.storageIndex]: oi }))}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        picked ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  if (skill === 'writing') {
    const w = data as Record<string, unknown>
    const wc = wordCount(draft)
    const minW = Number(w.min_words)
    const maxW = Number(w.max_words)
    const ok = wc >= minW && wc <= maxW
    return (
      <div className="space-y-4">
        <Link to={`/tef-prep/a1/${unit}`} className="text-sm font-semibold text-blue-600 hover:underline">
          ← Unité {unit}
        </Link>
        {meta(w)}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase text-violet-700">{String(w.genre ?? w.task_type)}</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{String(w.prompt_fr)}</p>
          <p className="mt-2 text-sm text-slate-600">{String(w.prompt_en)}</p>
          {(w.constraints_fr as string[])?.map((c, i) => (
            <p key={i} className="mt-2 text-xs text-slate-600">
              • {c}
            </p>
          ))}
        </div>
        <p className="text-sm text-slate-600">
          Mots : {wc} / {minW}–{maxW} {ok ? '✓' : ''}
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-900 shadow-inner focus:border-violet-400 focus:outline-none"
          placeholder="Écrivez ici…"
        />
        <p className="text-xs text-slate-500">
          Astuce : utilisez <Link className="font-semibold text-blue-600 hover:underline" to="/scorer">AI Scorer</Link> pour un retour.
        </p>
      </div>
    )
  }

  const s = data as Record<string, unknown>
  const cues = (s.cues_oral_fr as string[]) ?? []
  return (
    <div className="space-y-4">
      <Link to={`/tef-prep/a1/${unit}`} className="text-sm font-semibold text-blue-600 hover:underline">
        ← Unité {unit}
      </Link>
      {meta(s)}
      <div className="rounded-2xl border border-orange-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">{String(s.situation_fr)}</p>
        <p className="mt-2 text-sm text-slate-600">{String(s.situation_en)}</p>
      </div>
      <p className="text-xs font-bold uppercase text-slate-500">Formules possibles</p>
      <ul className="space-y-2">
        {cues.map((line, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => speakFrCa(line)}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <Volume2 className="h-4 w-4 shrink-0 text-orange-600" />
              {line}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
