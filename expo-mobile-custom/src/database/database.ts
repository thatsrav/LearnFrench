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
  `)

  await seedIfEmpty()
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

