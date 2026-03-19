import { useEffect, useState } from 'react'
import { initializeDatabase } from './database'

type UseDatabaseState = {
  isReady: boolean
  isLoading: boolean
  error: Error | null
}

export function useDatabase(): UseDatabaseState {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    async function run() {
      try {
        await initializeDatabase()
        if (!mounted) return
        setIsReady(true)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    }

    void run()
    return () => {
      mounted = false
    }
  }, [])

  return { isReady, isLoading, error }
}

