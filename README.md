# French Scorer (Web)

This repo contains:
- `french-scorer-api/` (Express backend): holds your AI API keys and scores French writing (overall + grammar/vocab/pronunciation/fluency breakdown)
- `french-scorer-web/` (Vite + React frontend): **FrenchLearn** landing page, curriculum units (Figma-style), and AI Scorer

## Setup

### 1) Backend

```bash
cd french-scorer-api
cp .env.example .env
```

Edit `.env` and set:

```bash
GEMINI_API_KEY=YOUR_KEY_HERE
GEMINI_MODEL=models/gemini-2.5-flash
GROQ_API_KEY=YOUR_KEY_HERE
GROQ_MODEL=llama-3.1-70b-versatile
OPENAI_API_KEY=YOUR_KEY_HERE
OPENAI_MODEL=gpt-4o-mini
CLAUDE_API_KEY=YOUR_KEY_HERE
CLAUDE_MODEL=claude-3-5-sonnet-20241022
PORT=8787
```

Install + run:

```bash
npm install
npm run dev
```

Backend will run on `http://localhost:8787`.

### 2) Frontend

```bash
cd french-scorer-web
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Notes

- **Key safety**: the API key stays in the backend `.env`. Don’t put keys in frontend code.
- If you deploy, lock down CORS and consider auth + rate limits.

## Providers

The API supports:
- **Gemini**
- **Groq**
- **OpenAI**
- **Claude**
- **Auto** (tries Gemini first, falls back to Groq on 429/5xx)

Special rule:
- If request includes `level: "C1"` and provider is `auto`, backend tries **OpenAI first**, then **Claude** on retryable failure.

Frontend can send `provider: "auto" | "gemini" | "groq" | "openai" | "claude"` to `/api/score`.

The `/api/score` JSON `result` includes **`grammar`**, **`vocabulary`**, **`pronunciation`**, and **`fluency`** (0–100 each), normalized on the server if the model omits them.

### Web routes (FrenchLearn)

- `/` — Landing (hero, syllabus grid, CTA)
- `/scorer` — AI French Scorer (text/voice demo tab, gradient breakdown, strengths/suggestions)
- `/unit/:moduleId` — Unit overview (progress card, topics, lesson list with Review/Start/Locked)
- `/lesson/:unitId` — Quiz lesson (optional `?module=` for back navigation)
- `/reading`, `/speaking`, `/leaderboard` — Practice extras

## Deploy notes (fixing 404 online)

Local dev uses Vite’s proxy for `/api` to `http://localhost:8787`.

For production, set a frontend environment variable (on Vercel/Netlify/etc):

```bash
VITE_API_BASE_URL=https://YOUR_BACKEND_HOST
```

Example:

```bash
VITE_API_BASE_URL=https://your-api.onrender.com
```

If you forget to set `VITE_API_BASE_URL`, the frontend falls back to
`https://learnfrench-0vkn.onrender.com` (non-localhost only).

## Expo mobile (`expo-mobile/`)

The Expo app includes the same practice areas as the web app:

- **Home / AI Scorer** — calls `POST /api/score`; **Text / Voice (demo)** tabs; **grammar / vocabulary / pronunciation / fluency** breakdown bars; providers Auto–Claude; C1 essay hint; streak + history (`AsyncStorage`).
- **Courses** (tab) — **FrenchLearn** module grid (same six units as the web). **View unit** opens the **unit overview** (progress, topics, lesson list with Review / Start / Locked / Soon). Lessons with a `contentUnitId` open the existing **quiz** screen; `goBack` returns to the unit.
- **Reading room** — level-tagged passages.
- **Speaking coach** — prompts + placeholder feedback (no microphone API yet).
- **Leaderboard** — top scores from this device’s Writing Lab history.

Optional: point the app at a local API with Expo env (create `.env` in `expo-mobile`):

```bash
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:8787
```

If unset, the app defaults to `https://learnfrench-0vkn.onrender.com` (see `src/lib/config.ts`).

Run:

```bash
cd expo-mobile
npx expo start
```

