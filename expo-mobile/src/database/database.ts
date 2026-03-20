import * as SQLite from 'expo-sqlite'
import { UNIT_SEED_DATA } from './SeedData'

export type ProgressStatus = 'locked' | 'available' | 'completed'

let dbInstance: SQLite.SQLiteDatabase | null = null

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance
  dbInstance = await SQLite.openDatabaseAsync('french-learning.db')
  return dbInstance
}

export async function initializeDatabase(): Promise<void> {
  const db = await getDb()

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY NOT NULL,
      level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1')),
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      unit_id TEXT PRIMARY KEY NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('locked', 'available', 'completed')),
      score INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_score_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT,
      ts INTEGER NOT NULL,
      score INTEGER NOT NULL,
      cecr TEXT NOT NULL DEFAULT '',
      provider TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_user_score_events_user_ts
      ON user_score_events (user_id, ts);

    CREATE TABLE IF NOT EXISTS spaced_repetition_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL DEFAULT '',
      item_id TEXT NOT NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('vocab', 'grammar')),
      unit_id TEXT NOT NULL,
      front_text TEXT NOT NULL,
      back_text TEXT NOT NULL,
      last_review INTEGER NOT NULL,
      next_review INTEGER NOT NULL,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      interval_days INTEGER NOT NULL DEFAULT 1,
      repetitions INTEGER NOT NULL DEFAULT 0,
      UNIQUE (user_id, item_id)
    );

    CREATE INDEX IF NOT EXISTS idx_spaced_rep_next
      ON spaced_repetition_items (user_id, next_review);

    CREATE TABLE IF NOT EXISTS spaced_repetition_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL DEFAULT '',
      item_id TEXT NOT NULL,
      reviewed_at INTEGER NOT NULL,
      quality INTEGER NOT NULL CHECK (quality >= 0 AND quality <= 5),
      remembered INTEGER NOT NULL CHECK (remembered IN (0, 1))
    );

    CREATE INDEX IF NOT EXISTS idx_spaced_rep_reviews_user_time
      ON spaced_repetition_reviews (user_id, reviewed_at);

    CREATE TABLE IF NOT EXISTS recommendation_engagement (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL DEFAULT '',
      plan_date TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      event TEXT NOT NULL CHECK (event IN ('shown', 'opened', 'completed')),
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_rec_eng_user_date
      ON recommendation_engagement (user_id, plan_date);

    CREATE TABLE IF NOT EXISTS writing_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      word_count INTEGER NOT NULL DEFAULT 0,
      submitted_at INTEGER,
      draft INTEGER NOT NULL DEFAULT 1 CHECK (draft IN (0, 1)),
      category TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_writing_entries_user_created
      ON writing_entries (user_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_writing_entries_user_submitted
      ON writing_entries (user_id, submitted_at DESC);

    CREATE INDEX IF NOT EXISTS idx_writing_entries_user_category
      ON writing_entries (user_id, category);

    CREATE TABLE IF NOT EXISTS writing_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      entry_id INTEGER NOT NULL,
      overall_score INTEGER NOT NULL,
      grammar_score INTEGER NOT NULL,
      vocab_score INTEGER NOT NULL,
      pronunciation_score INTEGER NOT NULL,
      fluency_score INTEGER NOT NULL,
      cecr TEXT NOT NULL DEFAULT '',
      ai_provider TEXT NOT NULL DEFAULT '',
      scored_at INTEGER NOT NULL,
      FOREIGN KEY (entry_id) REFERENCES writing_entries (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_writing_scores_entry_scored
      ON writing_scores (entry_id, scored_at DESC);

    CREATE TABLE IF NOT EXISTS writing_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      score_id INTEGER NOT NULL,
      feedback_text TEXT NOT NULL DEFAULT '',
      error_examples_json TEXT NOT NULL DEFAULT '[]',
      suggestions_json TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (score_id) REFERENCES writing_scores (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_writing_feedback_score
      ON writing_feedback (score_id);
  `)

  await ensureTefPrepProgressTable(db)
  await ensureWritingJournalCloudColumns(db)

  await seedIfEmpty()
}

async function ensureTefPrepProgressTable(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tef_prep_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL DEFAULT '',
      tef_unit INTEGER NOT NULL,
      skill TEXT NOT NULL CHECK (skill IN ('listening', 'reading', 'writing', 'speaking')),
      listening_catalog_id TEXT NOT NULL DEFAULT '',
      score_percent INTEGER NOT NULL,
      correct_count INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      answers_json TEXT NOT NULL DEFAULT '[]',
      time_spent_ms INTEGER NOT NULL DEFAULT 0,
      cefr_estimate TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tef_prep_user_unit_skill
      ON tef_prep_progress (user_id, tef_unit, skill, created_at DESC);
  `)
}

/** Supabase row id (UUID) for cloud draft sync — added after initial schema. */
async function ensureWritingJournalCloudColumns(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    await db.execAsync('ALTER TABLE writing_entries ADD COLUMN remote_id TEXT;')
  } catch {
    /* column already exists */
  }
}

async function seedIfEmpty(): Promise<void> {
  const db = await getDb()
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM units')
  const count = Number(result?.count ?? 0)
  if (count > 0) return

  await db.withTransactionAsync(async () => {
    for (const unit of UNIT_SEED_DATA) {
      await db.runAsync(
        'INSERT INTO units (id, level, title, order_index) VALUES (?, ?, ?, ?)',
        unit.id,
        unit.level,
        unit.title,
        unit.orderIndex,
      )

      const status: ProgressStatus = unit.id === 'a1-u1' ? 'available' : 'locked'
      await db.runAsync(
        'INSERT INTO user_progress (unit_id, status, score) VALUES (?, ?, ?)',
        unit.id,
        status,
        0,
      )
    }
  })
}

/** Persist one AI scorer result (mirrors Supabase user_score_events for local analytics). */
export async function recordScoreEvent(row: {
  userId?: string | null
  ts: number
  score: number
  cecr: string
  provider: string
}): Promise<void> {
  const db = await getDb()
  await db.runAsync(
    'INSERT INTO user_score_events (user_id, ts, score, cecr, provider) VALUES (?, ?, ?, ?, ?)',
    row.userId ?? null,
    row.ts,
    row.score,
    row.cecr,
    row.provider,
  )
}

