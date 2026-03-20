// Preserve host-assigned PORT (Render, Fly, etc.) — dotenv must not override it.
const PORT_FROM_PLATFORM = process.env.PORT;
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/** Render (and some proxies) hit `/` for health checks — keep this lightweight. */
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "french-scorer-api" });
});

function buildPrompt(frenchText) {
  return `You are a strict but helpful French teacher.

Task: Grade the student's French writing on a 0-100 scale.

Return ONLY valid JSON with exactly these keys:
- score (number, 0-100) overall writing quality
- cecr (string, one of: A1, A2, B1, B2, C1, C2)
- grammar (number, 0-100) agreement, tense, structure
- vocabulary (number, 0-100) range and precision of word choice
- pronunciation (number, 0-100) for WRITING: infer from spelling, accents, liaison cues in text
- fluency (number, 0-100) cohesion, connectors, paragraph flow
- strengths (array of 2-5 short bullet strings)
- improvements (array of 2-5 short bullet strings)
- corrected_version (string: corrected French text)

Rules:
- Be concise.
- Do not add any extra keys.
- Subscores should be consistent with the overall score (not wildly higher).
- If the text is not French, still score it and explain in improvements.

Student text:
${frenchText.trim()}`;
}

function clamp100(n) {
  const x = Math.round(Number(n));
  if (!Number.isFinite(x)) return null;
  return Math.max(0, Math.min(100, x));
}

/** Ensures new breakdown fields exist for older clients / model slips. */
function normalizeFrenchResult(raw) {
  const score = clamp100(raw?.score) ?? 0;
  const fill = (v) => clamp100(v) ?? score;
  return {
    score,
    cecr: String(raw?.cecr ?? "A1"),
    grammar: fill(raw?.grammar ?? raw?.grammar_score),
    vocabulary: fill(raw?.vocabulary ?? raw?.vocabulary_score),
    pronunciation: fill(raw?.pronunciation ?? raw?.pronunciation_score),
    fluency: fill(raw?.fluency ?? raw?.fluency_score),
    strengths: Array.isArray(raw?.strengths) ? raw.strengths.map((s) => String(s)) : [],
    improvements: Array.isArray(raw?.improvements) ? raw.improvements.map((s) => String(s)) : [],
    corrected_version: String(raw?.corrected_version ?? raw?.correctedVersion ?? ""),
  };
}

function jsonScore(res, providerName, raw) {
  return res.json({ provider: providerName, result: normalizeFrenchResult(raw) });
}

function extractFirstJsonObject(text) {
  const start = text.indexOf("{");
  if (start < 0) throw new Error("No JSON object found in model response.");
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  throw new Error("Unterminated JSON object in model response.");
}

let cachedModelName = "";
let cachedModelAtMs = 0;

async function pickGeminiModel(apiKey) {
  const envModel = (process.env.GEMINI_MODEL || "").trim();
  if (envModel) return envModel;

  const now = Date.now();
  if (cachedModelName && now - cachedModelAtMs < 10 * 60 * 1000) {
    return cachedModelName;
  }

  const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(listUrl, { method: "GET" });
  const raw = await resp.text();
  if (!resp.ok) {
    throw new Error(`ListModels failed (HTTP ${resp.status}): ${raw}`);
  }

  const parsed = JSON.parse(raw);
  const models = Array.isArray(parsed?.models) ? parsed.models : [];

  const supportsGenerateContent = (m) =>
    Array.isArray(m?.supportedGenerationMethods) &&
    m.supportedGenerationMethods.includes("generateContent");

  const available = models
    .filter(supportsGenerateContent)
    .map((m) => String(m.name || "").trim())
    .filter(Boolean);

  // Prefer faster/cheaper "flash" models when available.
  const preferredOrder = [
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-flash-latest",
    "models/gemini-1.5-pro",
    "models/gemini-1.5-pro-latest",
    "models/gemini-2.0-pro",
  ];

  let chosen = "";
  for (const p of preferredOrder) {
    if (available.includes(p)) {
      chosen = p;
      break;
    }
  }
  if (!chosen) chosen = available[0] || "";
  if (!chosen) {
    throw new Error("No generateContent-capable models available for this API key.");
  }

  cachedModelName = chosen;
  cachedModelAtMs = now;
  return chosen;
}

async function scoreWithGemini({ apiKey, text }) {
  const prompt = buildPrompt(text);
  const modelName = await pickGeminiModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    const err = new Error(`Gemini HTTP ${resp.status}`);
    err.status = resp.status;
    err.details = raw;
    throw err;
  }

  const parsed = JSON.parse(raw);
  const modelText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonText = extractFirstJsonObject(modelText);
  return JSON.parse(jsonText);
}

async function scoreWithGroq({ apiKey, text }) {
  const model = (process.env.GROQ_MODEL || "").trim() || "llama-3.1-70b-versatile";
  const prompt = buildPrompt(text);

  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a strict but helpful French teacher. Always output ONLY valid JSON as requested." },
        { role: "user", content: prompt },
      ],
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    const err = new Error(`Groq HTTP ${resp.status}`);
    err.status = resp.status;
    err.details = raw;
    throw err;
  }

  const parsed = JSON.parse(raw);
  const modelText = parsed?.choices?.[0]?.message?.content ?? "";
  const jsonText = extractFirstJsonObject(modelText);
  return JSON.parse(jsonText);
}

async function scoreWithOpenAI({ apiKey, text }) {
  const model = (process.env.OPENAI_MODEL || "").trim() || "gpt-4o-mini";
  const prompt = buildPrompt(text);

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a strict but helpful French teacher. Output ONLY valid JSON as requested." },
        { role: "user", content: prompt },
      ],
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    const err = new Error(`OpenAI HTTP ${resp.status}`);
    err.status = resp.status;
    err.details = raw;
    throw err;
  }

  const parsed = JSON.parse(raw);
  const modelText = parsed?.choices?.[0]?.message?.content ?? "";
  const jsonText = extractFirstJsonObject(modelText);
  return JSON.parse(jsonText);
}

async function scoreWithClaude({ apiKey, text }) {
  const model = (process.env.CLAUDE_MODEL || "").trim() || "claude-3-5-sonnet-20241022";
  const prompt = buildPrompt(text);

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      temperature: 0.2,
      system: "You are a strict but helpful French teacher. Output ONLY valid JSON as requested.",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    const err = new Error(`Claude HTTP ${resp.status}`);
    err.status = resp.status;
    err.details = raw;
    throw err;
  }

  const parsed = JSON.parse(raw);
  const modelText = Array.isArray(parsed?.content)
    ? parsed.content.map((c) => String(c?.text || "")).join("\n")
    : "";
  const jsonText = extractFirstJsonObject(modelText);
  return JSON.parse(jsonText);
}

function isRetryableProviderError(err) {
  const status = Number(err?.status || 0);
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

app.post("/api/score", async (req, res) => {
  try {
    const text = (req.body && req.body.text ? String(req.body.text) : "").trim();
    if (!text) {
      return res.status(400).json({ error: "Missing 'text'." });
    }

    const providerRaw = String(req.body?.provider || "").trim().toLowerCase();
    const provider = providerRaw || "auto"; // auto | gemini | groq | openai | claude
    const level = String(req.body?.level || req.body?.targetLevel || req.body?.cefr || "").trim().toUpperCase();
    const isC1Essay = level === "C1";

    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    const groqKey = (process.env.GROQ_API_KEY || "").trim();
    const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
    const claudeKey = (process.env.CLAUDE_API_KEY || "").trim();

    const canGemini = Boolean(geminiKey);
    const canGroq = Boolean(groqKey);
    const canOpenAI = Boolean(openaiKey);
    const canClaude = Boolean(claudeKey);

    if (!canGemini && !canGroq && !canOpenAI && !canClaude) {
      return res.status(500).json({ error: "No model provider keys configured in backend env." });
    }

    const runGemini = () => scoreWithGemini({ apiKey: geminiKey, text });
    const runGroq = () => scoreWithGroq({ apiKey: groqKey, text });
    const runOpenAI = () => scoreWithOpenAI({ apiKey: openaiKey, text });
    const runClaude = () => scoreWithClaude({ apiKey: claudeKey, text });

    if (provider === "gemini") {
      if (!canGemini) return res.status(500).json({ error: "Missing GEMINI_API_KEY in backend env." });
      const result = await runGemini();
      return jsonScore(res, "gemini", result);
    }

    if (provider === "groq") {
      if (!canGroq) return res.status(500).json({ error: "Missing GROQ_API_KEY in backend env." });
      const result = await runGroq();
      return jsonScore(res, "groq", result);
    }

    if (provider === "openai") {
      if (!canOpenAI) return res.status(500).json({ error: "Missing OPENAI_API_KEY in backend env." });
      const result = await runOpenAI();
      return jsonScore(res, "openai", result);
    }

    if (provider === "claude") {
      if (!canClaude) return res.status(500).json({ error: "Missing CLAUDE_API_KEY in backend env." });
      const result = await runClaude();
      return jsonScore(res, "claude", result);
    }

    // C1 essay fallback preference: OpenAI -> Claude
    if (isC1Essay) {
      if (canOpenAI) {
        try {
          const result = await runOpenAI();
          return jsonScore(res, "openai", result);
        } catch (err) {
          if (!canClaude || !isRetryableProviderError(err)) {
            return res.status(Number(err?.status || 500)).json({ error: err?.message || String(err), details: err?.details });
          }
        }
      }
      if (canClaude) {
        try {
          const result = await runClaude();
          return jsonScore(res, "claude", result);
        } catch (err) {
          return res.status(Number(err?.status || 500)).json({ error: err?.message || String(err), details: err?.details });
        }
      }
    }

    // auto fallback: Gemini first (if configured), then Groq
    if (canGemini) {
      try {
        const result = await runGemini();
        return jsonScore(res, "gemini", result);
      } catch (err) {
        if (!canGroq || !isRetryableProviderError(err)) {
          return res.status(Number(err?.status || 500)).json({ error: err?.message || String(err), details: err?.details });
        }
      }
    }

    if (canGroq) {
      try {
        const result = await runGroq();
        return jsonScore(res, "groq", result);
      } catch (err) {
        return res.status(Number(err?.status || 500)).json({ error: err?.message || String(err), details: err?.details });
      }
    }

    return res.status(500).json({ error: "No providers configured." });
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

const OPENAI_TTS_VOICES = new Set(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]);

/**
 * OpenAI Text-to-Speech (HD) for French listening / practice.
 * Requires OPENAI_API_KEY. Used by french-scorer-web (VITE_API_BASE_URL) and expo-mobile (EXPO_PUBLIC_API_BASE_URL).
 */
app.post("/api/tts/french", async (req, res) => {
  try {
    const text = (req.body && req.body.text ? String(req.body.text) : "").trim();
    if (!text) {
      return res.status(400).json({ error: "Missing 'text'." });
    }
    if (text.length > 4096) {
      return res.status(400).json({ error: "Text too long (max 4096 chars)." });
    }

    const apiKey = (process.env.OPENAI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(503).json({ error: "TTS unavailable: OPENAI_API_KEY not set on server." });
    }

    let voice = String(req.body?.voice || "nova").trim().toLowerCase();
    if (!OPENAI_TTS_VOICES.has(voice)) voice = "nova";

    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        voice,
        input: text,
        response_format: "mp3",
      }),
    });

    if (!r.ok) {
      const err = await r.text().catch(() => "");
      return res.status(502).json({
        error: "OpenAI TTS request failed",
        details: err.slice(0, 800),
      });
    }

    const buffer = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "private, max-age=3600");
    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

const port = Number(PORT_FROM_PLATFORM || process.env.PORT) || 8787;
// Render and other hosts need a public bind; localhost-only fails health checks.
const host = process.env.HOST || "0.0.0.0";
app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
  if (process.env.RENDER && !PORT_FROM_PLATFORM) {
    console.error(
      "[Render] PORT was not set by the platform. Use a Web Service (not a Background Worker), or set PORT in the service Environment tab.",
    );
  }
});

