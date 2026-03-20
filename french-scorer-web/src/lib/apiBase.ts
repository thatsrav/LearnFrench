/** Same resolution as AIScorerPage — dev proxy `/api` vs production API host. */
export function getApiBaseUrl(): string {
  return (
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
    (typeof location !== 'undefined' && location.hostname === 'localhost' ? '' : 'https://learnfrench-0vkn.onrender.com')
  )
}
