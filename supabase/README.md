# Supabase (auth + cloud progress)

## 1. Create a project

1. [supabase.com](https://supabase.com) → New project  
2. Copy **Project URL** and **anon public** key (Settings → API).

## 2. Run the migration

In **SQL Editor**, paste and run `migrations/001_user_progress_and_auth.sql`.

## 3. Auth providers

### Email

Enable **Email** under Authentication → Providers (default on).

### Google (Gmail)

1. [Google Cloud Console](https://console.cloud.google.com/) → OAuth 2.0 Client IDs  
   - Application type: **Web** for Supabase redirect  
   - Authorized redirect URIs:  
     `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
2. Copy **Client ID** and **Client Secret** into Supabase → Authentication → Google.

### Redirect URLs (mobile + web)

Authentication → URL configuration:

**Redirect URLs** (add each):

- `frenchlearn://auth/callback` (Expo dev / production app scheme)
- `exp://127.0.0.1:8081/--/auth/callback` (Expo Go local; adjust port if needed)
- `http://localhost:5173/auth/callback` (Vite dev)
- Your production web URL + `/auth/callback`

**Site URL**: your main web origin (e.g. `http://localhost:5173` for dev).

**Production (Vercel, etc.)**  
Add your real site + callback, for example:

- `https://your-app.vercel.app`
- `https://your-app.vercel.app/auth/callback`

Each preview URL (`*.vercel.app`) only works if you add that exact callback URL, or use a stable production domain.

## 4. App environment variables

### `expo-mobile/.env`

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Restart Metro with `npx expo start --clear` after changing `.env`.

### `french-scorer-web/.env`

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Vercel:** set the same names under **Project → Settings → Environment Variables** (Production + Preview if needed), then **redeploy**. Vite reads `VITE_*` only when the site is **built** — a missing key on Vercel means the live site has no Supabase config.

The repo includes **`french-scorer-web/vercel.json`** so routes like `/account` and `/auth/callback` load the app (SPA fallback). Without that, Google OAuth can return **404** on `/auth/callback`.

## 5. Tables (summary)

| Table                 | Purpose                                      |
|-----------------------|----------------------------------------------|
| `profiles`            | User row linked to `auth.users`              |
| `user_unit_progress`  | Per-unit status + score (syncs SQLite / web) |
| `user_score_events`   | AI scorer attempts                           |
| `writing_entries`     | Journal drafts & essays (per user)           |
| `writing_scores`      | Per scoring run (overall + subscores)      |
| `writing_feedback`    | AI feedback text + JSON suggestions          |

RLS: users can only read/write their own rows.
