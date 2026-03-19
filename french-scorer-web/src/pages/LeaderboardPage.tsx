import { useMemo } from 'react'
import { loadRecentScores } from '../lib/history'

export default function LeaderboardPage() {
  const scores = loadRecentScores()

  const topEntries = useMemo(
    () =>
      [...scores]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((s, idx) => ({
          rank: idx + 1,
          score: s.score,
          cecr: s.cecr || '—',
          provider: s.provider || '—',
          date: new Date(s.ts).toLocaleDateString(),
        })),
    [scores],
  )

  const average = useMemo(() => {
    if (!scores.length) return 0
    return Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length)
  }, [scores])

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Leaderboard</h2>
      <p className="mt-1 text-sm text-slate-500">Your best writing scores and performance summary.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Attempts</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{scores.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Average Score</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{average}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Best Score</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{topEntries[0]?.score ?? 0}</p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Rank</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Score</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">CEFR</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {topEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                  No attempts yet. Complete your first writing score to populate leaderboard.
                </td>
              </tr>
            ) : (
              topEntries.map((row) => (
                <tr key={`${row.rank}-${row.date}-${row.score}`}>
                  <td className="px-3 py-2 text-sm font-semibold text-slate-800">#{row.rank}</td>
                  <td className="px-3 py-2 text-sm text-slate-700">{row.score}</td>
                  <td className="px-3 py-2 text-sm text-slate-700">{row.cecr}</td>
                  <td className="px-3 py-2 text-sm text-slate-700">{row.provider}</td>
                  <td className="px-3 py-2 text-sm text-slate-500">{row.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

