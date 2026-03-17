import { useMemo, useState } from 'react'
import './App.css'

type FrenchScore = {
  score: number
  cecr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | string
  strengths: string[]
  improvements: string[]
  corrected_version: string
}

function App() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FrenchScore | null>(null)

  const canSubmit = useMemo(() => text.trim().length > 0 && !loading, [text, loading])

  async function onScore() {
    const trimmed = text.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const resp = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        throw new Error(data?.error || `Request failed (${resp.status})`)
      }
      setResult(data?.result ?? null)
      if (!data?.result) {
        throw new Error('No result returned from server.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
        <h1 style={{ marginBottom: 8 }}>French Scorer (Gemini)</h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>
          Paste your French text, then score it. (API key stays on the backend.)
        </p>

        <label style={{ display: 'block', fontWeight: 600, marginTop: 16 }}>
          French text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Écrivez votre texte ici…"
          style={{
            width: '100%',
            marginTop: 8,
            padding: 12,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: 'inherit',
            resize: 'vertical',
          }}
        />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
          <button
            onClick={onScore}
            disabled={!canSubmit}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              background: canSubmit ? '#646cff' : 'rgba(255,255,255,0.08)',
              color: 'white',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontWeight: 700,
            }}
          >
            {loading ? 'Scoring…' : 'Score my French'}
          </button>
          {loading && <span style={{ opacity: 0.8 }}>Calling Gemini…</span>}
        </div>

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              border: '1px solid rgba(255, 80, 80, 0.45)',
              background: 'rgba(255, 80, 80, 0.10)',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Score</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>
                  {result.score}/100
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>CECR</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{result.cecr}</div>
              </div>
            </div>

            <h3 style={{ marginBottom: 6, marginTop: 16 }}>Strengths</h3>
            <ul style={{ marginTop: 0 }}>
              {result.strengths?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>

            <h3 style={{ marginBottom: 6, marginTop: 16 }}>Improvements</h3>
            <ul style={{ marginTop: 0 }}>
              {result.improvements?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>

            <h3 style={{ marginBottom: 6, marginTop: 16 }}>Corrected version</h3>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                padding: 12,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(0,0,0,0.25)',
                marginTop: 0,
              }}
            >
              {result.corrected_version}
            </pre>
          </div>
        )}
      </div>
    </>
  )
}

export default App
