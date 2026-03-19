/**
 * API base for the French scorer backend (same contract as the web app).
 * Set EXPO_PUBLIC_API_BASE_URL in `.env` or `app.config` to point at a local server.
 */
const DEFAULT_REMOTE_API = 'https://learnfrench-0vkn.onrender.com'

export function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().replace(/\/$/, '')
  }
  return DEFAULT_REMOTE_API
}
