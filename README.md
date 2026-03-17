# French Scorer (Web)

This repo contains:
- `french-scorer-api/` (Express backend): holds your Gemini API key and calls Gemini
- `french-scorer-web/` (Vite + React frontend): UI that calls the backend

## Setup

### 1) Backend

```bash
cd french-scorer-api
cp .env.example .env
```

Edit `.env` and set:

```bash
GEMINI_API_KEY=YOUR_KEY_HERE
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

