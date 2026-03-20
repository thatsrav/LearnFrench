# Oral daily content (America / Edmonton)

The **FrenchLearn** web client sends `contentDateKey` (YYYY-MM-DD in `America/Edmonton`) with:

- `POST /api/oral/daily-listening`
- `POST /api/oral/daily-speaking-prompt`

Gemini uses this date in the prompt so **all users share the same “day”** for oral missions, rolling over at **midnight Edmonton** (Cold Lake aligns with Alberta).

## Per-level generation

Each request is for **one CEFR band** (A1–C1). To pre-warm all five levels at ~00:05 Edmonton, you can cron five HTTP calls (example):

```bash
KEY="your-server-cron-secret-if-any"
for L in A1 A2 B1 B2 C1; do
  curl -sS -X POST "$API/api/oral/daily-listening" -H "Content-Type: application/json" \
    -d "{\"level\":\"$L\",\"contentDateKey\":\"$(TZ=America/Edmonton date +%F)\"}" -o /dev/null
done
```

The API does **not** persist generated payloads server-side; the **browser caches** the response in `localStorage` until the next Edmonton date key.

## ElevenLabs

- Model: `eleven_multilingual_v2` (override with `ELEVENLABS_MODEL`).
- Speaking rate is **adjusted by level** (slower A1–A2, faster B2–C1) via `voice_settings.speed`.
