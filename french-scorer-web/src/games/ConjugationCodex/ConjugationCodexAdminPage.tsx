import { ClipboardCopy, Database, Download, RotateCcw, Save } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import defaultBundle from './data/conjugations.json'
import type {
  ConjugationsBundle,
  ConversationEntry,
  PracticeDifficulty,
  PracticeQuestion,
  PracticeQuestionType,
  VerbEntry,
} from './data/conjugationsSchema'

const DRAFT_KEY = 'conjugation_codex_admin_draft_v1'

function cloneBundle(b: ConjugationsBundle): ConjugationsBundle {
  return JSON.parse(JSON.stringify(b)) as ConjugationsBundle
}

export default function ConjugationCodexAdminPage() {
  const baseId = useId()
  const [bundle, setBundle] = useState<ConjugationsBundle>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) return JSON.parse(raw) as ConjugationsBundle
    } catch {
      /* ignore */
    }
    return cloneBundle(defaultBundle as ConjugationsBundle)
  })

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(bundle))
    } catch {
      /* ignore */
    }
  }, [bundle])

  const verbIds = useMemo(() => bundle.verbs.map((v) => v.id), [bundle.verbs])

  const downloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'conjugations.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [bundle])

  const copyJson = useCallback(async () => {
    await navigator.clipboard.writeText(JSON.stringify(bundle, null, 2))
  }, [bundle])

  const resetFromShipped = () => {
    if (confirm('Replace working copy with the bundled default from the repo?')) {
      setBundle(cloneBundle(defaultBundle as ConjugationsBundle))
    }
  }

  const clearDraft = () => {
    if (confirm('Clear local draft and reload bundled default?')) {
      localStorage.removeItem(DRAFT_KEY)
      setBundle(cloneBundle(defaultBundle as ConjugationsBundle))
    }
  }

  const mergeFromFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const next = JSON.parse(String(reader.result)) as ConjugationsBundle
        if (!Array.isArray(next.verbs)) throw new Error('Invalid: verbs')
        setBundle(next)
      } catch (e) {
        alert(`Could not parse JSON: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
    reader.readAsText(file)
  }

  /** Minimal “add verb” — appends a stub; edit JSON in Download/Copy for full tenses. */
  const addVerbStub = () => {
    const id = prompt('New verb id (e.g. finir_001):')?.trim()
    if (!id) return
    if (bundle.verbs.some((v) => v.id === id)) {
      alert('Id already exists')
      return
    }
    const inf = prompt('Infinitive (e.g. finir):')?.trim() || 'finir'
    const en = prompt('English gloss:')?.trim() || 'to finish'
    const stub: VerbEntry = {
      id,
      infinitive: inf,
      english: en,
      level: 'A2',
      frequency: 70,
      regular: true,
      tenses: {
        present: {
          je: '',
          tu: '',
          il: '',
          nous: '',
          vous: '',
          ils: '',
        },
      },
    }
    setBundle((b) => ({ ...b, verbs: [...b.verbs, stub] }))
  }

  const addConversationStub = () => {
    const verbId = prompt(`verb_id (one of):\n${verbIds.join(', ')}`)?.trim()
    if (!verbId || !verbIds.includes(verbId)) {
      alert('Unknown verb_id')
      return
    }
    const scene = prompt('Scene title:')?.trim() || 'New scene'
    const cid = `${verbId.replace('_001', '')}_conv_${String(bundle.conversations.filter((c) => c.verb_id === verbId).length + 1).padStart(2, '0')}`
    const row: ConversationEntry = {
      id: cid,
      verb_id: verbId,
      level: 'A2',
      scene,
      dialogues: [
        { speaker: 'A', text: 'Phrase avec le verbe.', highlighted: [] },
        { speaker: 'B', text: 'Réponse.', highlighted: [] },
      ],
    }
    setBundle((b) => ({ ...b, conversations: [...b.conversations, row] }))
  }

  const addMcQuestion = () => {
    const verbId = prompt(`verb_id:\n${verbIds.join(', ')}`)?.trim()
    if (!verbId || !verbIds.includes(verbId)) {
      alert('Unknown verb_id')
      return
    }
    const qid = `${verbId.replace('_001', '')}_mc_admin_${Date.now()}`
    const q: PracticeQuestion = {
      id: qid,
      verb_id: verbId,
      tense: 'present',
      pronoun: 'nous',
      difficulty: 'easy' as PracticeDifficulty,
      type: 'multiple_choice' as PracticeQuestionType,
      sentence: 'Nous ____ ensemble.',
      english: 'We ___ together.',
      choices: ['', '', '', ''],
      correct_index: 0,
      explanation: 'Fill choices and explanation after export.',
    }
    setBundle((b) => ({ ...b, practice_questions: [...b.practice_questions, q] }))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <nav>
        <Link
          to="/grammar-games/conjugation-codex"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[var(--atelier-navy-deep)]"
        >
          ← Conjugation Codex
        </Link>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3 text-indigo-700">
          <Database className="h-9 w-9 shrink-0" aria-hidden />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin</p>
            <h1 className="font-display text-2xl font-bold text-[var(--atelier-navy-deep)]">Conjugation data</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadJson}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--atelier-navy-deep)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#001438]"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download conjugations.json
          </button>
          <button
            type="button"
            onClick={copyJson}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            <ClipboardCopy className="h-4 w-4" aria-hidden />
            Copy JSON
          </button>
        </div>
      </header>

      <p className="text-sm leading-relaxed text-slate-600">
        Edit the bundle in your editor after export, or use the quick stubs below. Draft autosaves to{' '}
        <code className="rounded bg-slate-100 px-1">{DRAFT_KEY}</code>. Replace{' '}
        <code className="rounded bg-slate-100 px-1">src/games/ConjugationCodex/data/conjugations.json</code> with your
        downloaded file when ready. Regenerate bulk content with{' '}
        <code className="rounded bg-slate-100 px-1">node scripts/build-conjugations.mjs</code>.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addVerbStub}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-950 hover:bg-emerald-100"
        >
          + Verb stub
        </button>
        <button
          type="button"
          onClick={addConversationStub}
          className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-950 hover:bg-indigo-100"
        >
          + Conversation stub
        </button>
        <button
          type="button"
          onClick={addMcQuestion}
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-950 hover:bg-amber-100"
        >
          + MC question stub
        </button>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50">
          <Save className="h-4 w-4" aria-hidden />
          Import JSON
          <input
            id={`${baseId}-import`}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) mergeFromFile(f)
              e.target.value = ''
            }}
          />
        </label>
        <button
          type="button"
          onClick={resetFromShipped}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset to bundled
        </button>
        <button type="button" onClick={clearDraft} className="text-sm font-semibold text-rose-700 hover:underline">
          Clear draft
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-display text-lg font-bold text-[var(--atelier-navy-deep)]">Summary</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          <li>
            Verbs: <strong>{bundle.verbs.length}</strong>
          </li>
          <li>
            Conversations: <strong>{bundle.conversations.length}</strong>
          </li>
          <li>
            Practice questions: <strong>{bundle.practice_questions.length}</strong>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview (truncated)</p>
        <pre className="mt-2 max-h-96 overflow-auto rounded-xl bg-slate-900/95 p-4 text-xs text-emerald-100">
          {JSON.stringify(bundle, null, 2).slice(0, 12000)}
          {JSON.stringify(bundle, null, 2).length > 12000 ? '\n…' : ''}
        </pre>
      </section>
    </div>
  )
}
