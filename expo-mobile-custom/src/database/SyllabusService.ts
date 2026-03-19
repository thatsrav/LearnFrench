import { getDb } from './database'

export type SyllabusRow = {
  id: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  title: string
  orderIndex: number
  status: 'locked' | 'available' | 'completed'
  score: number
}

const LEVEL_ORDER: Record<SyllabusRow['level'], number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
}

type UnitRef = { id: string; level: SyllabusRow['level']; order_index: number }

export async function unlockNextUnit(
  currentUnitId: string,
  score: number,
): Promise<{ completed: boolean; unlockedUnitId: string | null }> {
  try {
    const db = await getDb()

    if (score < 80) {
      return { completed: false, unlockedUnitId: null }
    }

    return await db.withTransactionAsync(async () => {
      try {
        await db.runAsync(
          `
            INSERT INTO user_progress (unit_id, status, score)
            VALUES (?, 'completed', ?)
            ON CONFLICT(unit_id) DO UPDATE SET
              status = 'completed',
              score = excluded.score
          `,
          currentUnitId,
          score,
        )
      } catch (error) {
        throw new Error(`Failed updating current unit progress: ${String(error)}`)
      }

      let currentUnit: UnitRef | null = null
      try {
        currentUnit = await db.getFirstAsync<UnitRef>(
          'SELECT id, level, order_index FROM units WHERE id = ? LIMIT 1',
          currentUnitId,
        )
      } catch (error) {
        throw new Error(`Failed fetching current unit: ${String(error)}`)
      }

      if (!currentUnit) {
        throw new Error(`Unit not found: ${currentUnitId}`)
      }

      let nextUnit: UnitRef | null = null
      try {
        nextUnit = await db.getFirstAsync<UnitRef>(
          `
            SELECT id, level, order_index
            FROM units
            WHERE level = ? AND order_index > ?
            ORDER BY order_index ASC
            LIMIT 1
          `,
          currentUnit.level,
          currentUnit.order_index,
        )
      } catch (error) {
        throw new Error(`Failed fetching next unit in level: ${String(error)}`)
      }

      if (!nextUnit) {
        const nextLevel = (Object.keys(LEVEL_ORDER) as SyllabusRow['level'][]).find(
          (lvl) => LEVEL_ORDER[lvl] > LEVEL_ORDER[currentUnit.level],
        )

        if (nextLevel) {
          try {
            nextUnit = await db.getFirstAsync<UnitRef>(
              `
                SELECT id, level, order_index
                FROM units
                WHERE level = ?
                ORDER BY order_index ASC
                LIMIT 1
              `,
              nextLevel,
            )
          } catch (error) {
            throw new Error(`Failed fetching first unit of next level: ${String(error)}`)
          }
        }
      }

      if (!nextUnit) {
        return { completed: true, unlockedUnitId: null }
      }

      try {
        await db.runAsync(
          `
            INSERT INTO user_progress (unit_id, status, score)
            VALUES (?, 'available', 0)
            ON CONFLICT(unit_id) DO UPDATE SET
              status = CASE
                WHEN user_progress.status = 'locked' THEN 'available'
                ELSE user_progress.status
              END
          `,
          nextUnit.id,
        )
      } catch (error) {
        throw new Error(`Failed unlocking next unit: ${String(error)}`)
      }

      return { completed: true, unlockedUnitId: nextUnit.id }
    })
  } catch (error) {
    throw new Error(`unlockNextUnit failed: ${String(error)}`)
  }
}

export async function getSyllabusData(): Promise<SyllabusRow[]> {
  try {
    const db = await getDb()

    try {
      const rows = await db.getAllAsync<{
        id: string
        level: SyllabusRow['level']
        title: string
        order_index: number
        status: SyllabusRow['status'] | null
        score: number | null
      }>(`
        SELECT
          u.id,
          u.level,
          u.title,
          u.order_index,
          COALESCE(p.status, 'locked') AS status,
          COALESCE(p.score, 0) AS score
        FROM units u
        LEFT JOIN user_progress p ON p.unit_id = u.id
        ORDER BY
          CASE u.level
            WHEN 'A1' THEN 1
            WHEN 'A2' THEN 2
            WHEN 'B1' THEN 3
            WHEN 'B2' THEN 4
            WHEN 'C1' THEN 5
          END ASC,
          u.order_index ASC
      `)

      return rows.map((r) => ({
        id: r.id,
        level: r.level,
        title: r.title,
        orderIndex: r.order_index,
        status: (r.status ?? 'locked') as SyllabusRow['status'],
        score: Number(r.score ?? 0),
      }))
    } catch (error) {
      throw new Error(`Failed reading syllabus rows: ${String(error)}`)
    }
  } catch (error) {
    throw new Error(`getSyllabusData failed: ${String(error)}`)
  }
}

