/** Stored in SQLite `writing_entries.category` — labels match display. */
export const JOURNAL_CATEGORY_OPTIONS = ['Daily Life', 'Travel', 'Work', 'Opinion'] as const

export type JournalCategory = (typeof JOURNAL_CATEGORY_OPTIONS)[number]

export function isJournalCategory(s: string): s is JournalCategory {
  return (JOURNAL_CATEGORY_OPTIONS as readonly string[]).includes(s)
}
