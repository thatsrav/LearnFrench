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

## 5. Tables (summary)

| Table                 | Purpose                                      |
|-----------------------|----------------------------------------------|
| `profiles`            | User row linked to `auth.users`              |
| `user_unit_progress`  | Per-unit status + score (syncs SQLite / web) |
| `user_score_events`   | AI scorer attempts                           |

RLS: users can only read/write their own rows.
