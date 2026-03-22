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
const WRITING_CEFR_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1"]);

function normalizeWritingCefrLevel(raw) {
  const u = String(raw || "")
    .trim()
    .toUpperCase();
  if (u.startsWith("A1")) return "A1";
  if (u.startsWith("A2")) return "A2";
  if (u.startsWith("B1")) return "B1";
  if (u.startsWith("B2")) return "B2";
  if (u.startsWith("C1") || u.startsWith("C2")) return "C1";
  return "B1";
}

async function generateDailyWritingTopicGemini({ apiKey, level }) {
  const modelName = await pickGeminiModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const userPrompt = `Generate a French writing prompt for CEFR level ${level}.

Return ONLY valid JSON with exactly these keys (no markdown, no backticks):
- title (string): a short, engaging title for the writing task (can be in French).
- description (string): exactly 2 sentences in English describing what the learner should write.
- grammarFocus (array of exactly 3 objects): each object must have "label" (string, grammar topic name) and "masteryPercent" (integer 45-92) as an illustrative mastery bar value for that focus in this exercise.
- curatorTip (string): one concise tip in English tied to today's grammar focus (mention at least one focus by name).
- tags (array of exactly 2 short French theme tags in caps, e.g. "L'ÉTÉ", "TRAVAIL").

Match vocabulary and task complexity strictly to CEFR ${level} standards.`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `System instruction: You are the FrenchLearn curriculum AI. Output ONLY the JSON object requested by the user.\n\nUser request:\n${userPrompt}`,
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.65, maxOutputTokens: 1024 },
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    const err = new Error(`Gemini daily topic HTTP ${resp.status}`);
    err.status = resp.status;
    err.details = raw;
    throw err;
  }

  const parsed = JSON.parse(raw);
  const modelText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonText = extractFirstJsonObject(modelText);
  const data = JSON.parse(jsonText);

  const title = String(data?.title ?? "").trim();
  const description = String(data?.description ?? "").trim();
  const curatorTip = String(data?.curatorTip ?? "").trim();
  const tags = Array.isArray(data?.tags) ? data.tags.map((t) => String(t).trim()).filter(Boolean) : [];
  let grammarFocus = Array.isArray(data?.grammarFocus) ? data.grammarFocus : [];

  grammarFocus = grammarFocus
    .map((g) => ({
      label: String(g?.label ?? "").trim(),
      masteryPercent: Math.round(Number(g?.masteryPercent)),
    }))
    .filter((g) => g.label.length > 0);

  while (grammarFocus.length < 3) {
    grammarFocus.push({ label: "Structure de phrase", masteryPercent: 70 });
  }
  grammarFocus = grammarFocus.slice(0, 3);

  for (const g of grammarFocus) {
    if (!Number.isFinite(g.masteryPercent)) g.masteryPercent = 70;
    g.masteryPercent = Math.max(40, Math.min(95, g.masteryPercent));
  }

  while (tags.length < 2) tags.push("PRATIQUE");
  const tags2 = tags.slice(0, 2);

  if (!title || !description) {
    throw new Error("Model returned incomplete daily topic JSON.");
  }

  return {
    title,
    description,
    grammarFocus,
    curatorTip: curatorTip || "Relisez votre texte à voix haute pour repérer les accords.",
    tags: tags2,
    level,
  };
}

/**
 * Daily level-matched writing topic (Gemini). Used by french-scorer-web Writing Area.
 * Body: { level?: string } — CEFR band A1–C1 (C2 normalized to C1).
 */
app.post("/api/writing/daily-topic", async (req, res) => {
  try {
    const level = normalizeWritingCefrLevel(req.body?.level ?? req.body?.userLevel ?? "B1");
    if (!WRITING_CEFR_LEVELS.has(level)) {
      return res.status(400).json({ error: "Invalid level (use A1–C1)." });
    }

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured.", code: "NO_GEMINI" });
    }

    const topic = await generateDailyWritingTopicGemini({ apiKey, level });
    return res.json({ topic });
  } catch (err) {
    return res.status(Number(err?.status || 500)).json({
      error: err?.message || String(err),
      details: err?.details ? String(err.details).slice(0, 500) : undefined,
    });
  }
});

const ORAL_CEFR_LEVELS = WRITING_CEFR_LEVELS;
const normalizeOralLevel = normalizeWritingCefrLevel;

async function generateDailyListeningScriptGemini({ apiKey, level, extraUserBlock = "", contentDateKey = "" }) {
  const modelName = await pickGeminiModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const dateLine = contentDateKey
    ? `Official content calendar day (America/Edmonton): ${contentDateKey}. Vary scenario details vs other days.`
    : "";

  const userPrompt = `You create TEF Canada-style French LISTENING practice for CEFR level ${level}.

${dateLine}

Return ONLY valid JSON (no markdown):
- scenarioTitle (string, French): short title for the scenario.
- moduleLabel (string, English): e.g. "Module 03: Professional Discourse".
- scriptFr (string): French audio script only, natural spoken French. **Length requirement (all levels): between 150 and 300 French words inclusive — count every word before returning.** Shorter scripts are invalid. Use a clear scenario (e.g. phone call, service desk, workplace, public announcement). Can be monologue or short dialogue; if dialogue, use labels like "A:" "B:" lines. Vocabulary, sentence length, and discourse complexity MUST match CEFR ${level} (simpler/shorter for A1–A2; richer for B2–C1).
- questions (array of exactly 5 objects): each has "questionEn" (string, English), "options" (array of exactly 4 strings in English), "correctIndex" (integer 0-3), "focus" (string, one of: "tone", "implicit", "key_detail"). Distribute focuses: at least one "tone", one "implicit", one "key_detail"; the other two may repeat. Questions must test inference, tone, speaker intention, implied meaning — not trivial vocabulary from one word heard.

Match vocabulary and complexity to ${level}, but always respect the 150–300 word length for scriptFr.
${extraUserBlock ? `\n${extraUserBlock}` : ""}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `System: Output ONLY the JSON object. User:\n${userPrompt}`,
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    const err = new Error(`Gemini listening HTTP ${resp.status}`);
    err.status = resp.status;
    err.details = raw;
    throw err;
  }

  const parsed = JSON.parse(raw);
  const modelText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonText = extractFirstJsonObject(modelText);
  return JSON.parse(jsonText);
}

async function generateDailyListeningPayloadWithRetry({ apiKey, level, contentDateKey = "" }) {
  let raw = await generateDailyListeningScriptGemini({ apiKey, level, contentDateKey });
  let payload = normalizeListeningPayload(raw, level);
  let n = countFrenchWords(payload.scriptFr);
  if (n >= 150 && n <= 320) return payload;

  const retryHint =
    "Your previous answer was outside the required length. Regenerate scriptFr so it contains AT LEAST 150 French words and AT MOST 300. Reply with full valid JSON again.";
  raw = await generateDailyListeningScriptGemini({ apiKey, level, extraUserBlock: retryHint, contentDateKey });
  payload = normalizeListeningPayload(raw, level);
  n = countFrenchWords(payload.scriptFr);
  if (n < 150) {
    console.warn("[oral] daily-listening scriptFr still short after retry:", n, "words (target 150–300)");
  }
  return payload;
}

async function generateDailySpeakingPromptGemini({ apiKey, level, contentDateKey = "" }) {
  const modelName = await pickGeminiModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const dateLine = contentDateKey
    ? `Content calendar day (America/Edmonton): ${contentDateKey}. Make the task distinct from other days.`
    : "";

  const userPrompt = `Create ONE French speaking task for TEF-style oral practice, CEFR ${level}.

${dateLine}

Return ONLY valid JSON:
- promptFr (string): the instruction to the learner in French (what they should argue/explain/describe, 2-4 sentences appropriate to ${level}).
- promptEn (string): same meaning in English for UI subtitle.
- topicLine (string): very short label in French for the UI chip.`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Output ONLY JSON.\n${userPrompt}` }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: 512 },
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    const err = new Error(`Gemini speaking prompt HTTP ${resp.status}`);
    err.status = resp.status;
    err.details = raw;
    throw err;
  }

  const parsed = JSON.parse(raw);
  const modelText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonText = extractFirstJsonObject(modelText);
  return JSON.parse(jsonText);
}

/** ElevenLabs Multilingual v2 — level-tuned pacing (TEF listening). */
function elevenLabsSpeedForLevel(level) {
  const L = String(level || "B1").toUpperCase();
  if (L.startsWith("A1")) return 0.82;
  if (L.startsWith("A2")) return 0.88;
  if (L.startsWith("B1")) return 0.94;
  if (L.startsWith("B2")) return 1.0;
  return 1.05;
}

/** ElevenLabs multilingual TTS → MP3 buffer. Falls back to null if not configured. */
async function synthesizeElevenLabsMp3(text, level = "B1") {
  const apiKey = (process.env.ELEVENLABS_API_KEY || "").trim();
  const voiceId = (process.env.ELEVENLABS_VOICE_ID || "ErXwobaYiN019PkySvjV").trim(); // Antoni; use Charlotte XB0fDUnXU5powFXDhCwa via env
  if (!apiKey || !text.trim()) return null;

  const modelId = (process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2").trim();
  const speed = elevenLabsSpeedForLevel(level);
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: text.trim().slice(0, 12000),
      model_id: modelId,
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.8,
        style: 0,
        use_speaker_boost: true,
        speed: Math.min(1.2, Math.max(0.7, speed)),
      },
    }),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    const err = new Error(`ElevenLabs HTTP ${r.status}`);
    err.details = t.slice(0, 400);
    throw err;
  }
  return Buffer.from(await r.arrayBuffer());
}

async function synthesizeOpenAiMp3French(text) {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) return null;
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      voice: "nova",
      input: text.trim().slice(0, 4096),
      response_format: "mp3",
    }),
  });
  if (!r.ok) return null;
  return Buffer.from(await r.arrayBuffer());
}

function countFrenchWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function normalizeListeningPayload(raw, level) {
  const scenarioTitle = String(raw?.scenarioTitle ?? "Scénario du jour").trim();
  const moduleLabel = String(raw?.moduleLabel ?? "Daily listening").trim();
  const scriptFr = String(raw?.scriptFr ?? "").trim();
  let questions = Array.isArray(raw?.questions) ? raw.questions : [];
  function normalizeQuestionFocus(f) {
    const x = String(f ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    if (x.includes("tone") || x.includes("attitude") || x.includes("mood")) return "tone";
    if (x.includes("implicit") || x.includes("infer") || x.includes("implied") || x.includes("subtext")) return "implicit";
    if (x === "key_detail" || x.includes("detail") || x.includes("factual")) return "key_detail";
    return "key_detail";
  }
  questions = questions
    .map((q) => {
      const focus = normalizeQuestionFocus(q?.focus);
      return {
        questionEn: String(q?.questionEn ?? "").trim(),
        options: Array.isArray(q?.options) ? q.options.map((o) => String(o).trim()).slice(0, 4) : [],
        correctIndex: Math.max(0, Math.min(3, Math.round(Number(q?.correctIndex)))),
        focus,
      };
    })
    .filter((q) => q.questionEn && q.options.length === 4);

  while (questions.length < 3) {
    questions.push({
      questionEn: "What is the speaker's main goal?",
      options: ["To complain", "To request information", "To end the call", "To sell a product"],
      correctIndex: 1,
      focus: "key_detail",
    });
  }
  return { scenarioTitle, moduleLabel, scriptFr, questions: questions.slice(0, 5), level };
}

/**
 * Daily listening: Gemini script + MCQ + TTS (ElevenLabs if key, else OpenAI).
 * Response: audioBase64 (mp3), questions, scenarioTitle, moduleLabel, scriptFr
 */
app.post("/api/oral/daily-listening", async (req, res) => {
  try {
    const level = normalizeOralLevel(req.body?.level ?? req.body?.userLevel ?? "B1");
    if (!ORAL_CEFR_LEVELS.has(level)) {
      return res.status(400).json({ error: "Invalid level (use A1–C1)." });
    }

    const contentDateKey = String(req.body?.contentDateKey ?? req.body?.edmontonDateKey ?? "").trim();

    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!geminiKey) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured.", code: "NO_GEMINI" });
    }

    const payload = await generateDailyListeningPayloadWithRetry({ apiKey: geminiKey, level, contentDateKey });
    if (!payload.scriptFr) {
      return res.status(500).json({ error: "Model returned empty script." });
    }

    let audioBuf = null;
    try {
      audioBuf = await synthesizeElevenLabsMp3(payload.scriptFr, level);
    } catch (e) {
      console.warn("[oral] ElevenLabs failed, trying OpenAI TTS:", e?.message || e);
    }
    if (!audioBuf) {
      audioBuf = await synthesizeOpenAiMp3French(payload.scriptFr);
    }
    if (!audioBuf) {
      return res.json({
        ...payload,
        audioBase64: null,
        mime: "audio/mpeg",
        ttsWarning: "NO_TTS_CONFIGURED",
      });
    }

    const audioBase64 = audioBuf.toString("base64");
    return res.json({
      ...payload,
      audioBase64,
      mime: "audio/mpeg",
    });
  } catch (err) {
    return res.status(Number(err?.status || 500)).json({
      error: err?.message || String(err),
      details: err?.details ? String(err.details).slice(0, 500) : undefined,
    });
  }
});

app.post("/api/oral/daily-speaking-prompt", async (req, res) => {
  try {
    const level = normalizeOralLevel(req.body?.level ?? "B1");
    if (!ORAL_CEFR_LEVELS.has(level)) {
      return res.status(400).json({ error: "Invalid level." });
    }
    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!geminiKey) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    }
    const contentDateKey = String(req.body?.contentDateKey ?? req.body?.edmontonDateKey ?? "").trim();
    const raw = await generateDailySpeakingPromptGemini({ apiKey: geminiKey, level, contentDateKey });
    const promptFr = String(raw?.promptFr ?? "").trim();
    const promptEn = String(raw?.promptEn ?? "").trim();
    const topicLine = String(raw?.topicLine ?? "Oral").trim();
    if (!promptFr) {
      return res.status(500).json({ error: "Empty prompt from model." });
    }
    return res.json({
      promptFr,
      promptEn: promptEn || promptFr,
      topicLine,
      level,
    });
  } catch (err) {
    return res.status(Number(err?.status || 500)).json({ error: err?.message || String(err) });
  }
});

app.post("/api/oral/whisper", express.raw({ type: "*/*", limit: "20mb" }), async (req, res) => {
  try {
    const apiKey = (process.env.OPENAI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(503).json({ error: "OPENAI_API_KEY required for Whisper." });
    }

    const buf = req.body;
    if (!Buffer.isBuffer(buf) || buf.length < 32) {
      return res.status(400).json({ error: "Missing or empty audio body (raw webm/wav)." });
    }

    const rawCt = String(req.headers["content-type"] || "audio/webm").split(";")[0].trim().toLowerCase();
    const mime =
      rawCt === "audio/m4a" || rawCt === "audio/x-m4a" || rawCt === "audio/mp4" || rawCt === "audio/aac"
        ? "audio/mp4"
        : rawCt === "audio/wav" || rawCt === "audio/x-wav"
          ? "audio/wav"
          : rawCt === "audio/webm" || rawCt === "audio/ogg"
            ? "audio/webm"
            : "audio/webm";
    const ext = mime === "audio/mp4" ? "m4a" : mime === "audio/wav" ? "wav" : "webm";
    const blob = new Blob([buf], { type: mime });
    const form = new FormData();
    form.append("file", blob, `recording.${ext}`);
    form.append("model", "whisper-1");
    form.append("language", "fr");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    const text = await r.text();
    if (!r.ok) {
      return res.status(502).json({ error: "Whisper failed", details: text.slice(0, 600) });
    }
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "Whisper invalid JSON", details: text.slice(0, 200) });
    }
    return res.json({ transcript: String(json.text ?? "").trim() });
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

async function analyzeTranscriptGemini({ apiKey, transcript, level, promptFr }) {
  const modelName = await pickGeminiModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const userPrompt = `You evaluate a French learner's spoken response (transcript from speech-to-text).

CEFR target level: ${level}
Task prompt (French): ${promptFr}

Learner transcript (may have STT errors):
"""
${transcript.trim().slice(0, 8000)}
"""

Return ONLY valid JSON:
- fluency (string): 2-3 sentences on speech rate, pauses, logical flow, discourse connectors (English).
- pronunciation (string): 2-3 sentences — overall French phonology quality inferred from transcript (English).
- liaisonsFeedback (string): 2-4 sentences highlighting probable liaison/linking issues OR correct liaisons (e.g. "les_amis", "est_allé"); cite examples from transcript if possible (English).
- nasalVowelsFeedback (string): 2-4 sentences on nasal vowels /ɑ̃/, /ɛ̃/, /ɔ̃/, /œ̃/ patterns suggested by spelling in transcript; note common confusions (an/in, on/un) (English).
- tefScorePredicted (integer): single integer 0-900 mapping to TEF Canada global scale for this short production (be conservative vs official exam).
- strengths (array of 2-4 short strings, English)
- improvements (array of 2-4 short strings, English)`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Output ONLY JSON.\n${userPrompt}` }] }],
      generationConfig: { temperature: 0.35, maxOutputTokens: 1024 },
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    const err = new Error(`Gemini analyze HTTP ${resp.status}`);
    err.status = resp.status;
    err.details = raw;
    throw err;
  }

  const parsed = JSON.parse(raw);
  const modelText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonText = extractFirstJsonObject(modelText);
  return JSON.parse(jsonText);
}

app.post("/api/oral/analyze-transcript", async (req, res) => {
  try {
    const transcript = String(req.body?.transcript ?? "").trim();
    const promptFr = String(req.body?.promptFr ?? "").trim();
    const level = normalizeOralLevel(req.body?.level ?? "B1");

    if (!transcript) {
      return res.status(400).json({ error: "Missing transcript." });
    }

    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!geminiKey) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    }

    const raw = await analyzeTranscriptGemini({ apiKey: geminiKey, transcript, level, promptFr: promptFr || "Expression orale" });

    const tefScorePredicted = Math.max(0, Math.min(900, Math.round(Number(raw?.tefScorePredicted) || 400)));
    const fluency = String(raw?.fluency ?? "").trim() || "Continue structuring ideas with clear connectors.";
    const pronunciation = String(raw?.pronunciation ?? "").trim() || "Review nasal vowels and final silent consonants.";
    const liaisonsFeedback = String(raw?.liaisonsFeedback ?? "").trim();
    const nasalVowelsFeedback = String(raw?.nasalVowelsFeedback ?? "").trim();
    const strengths = Array.isArray(raw?.strengths) ? raw.strengths.map((s) => String(s)) : [];
    const improvements = Array.isArray(raw?.improvements) ? raw.improvements.map((s) => String(s)) : [];

    return res.json({
      fluency,
      pronunciation,
      liaisonsFeedback,
      nasalVowelsFeedback,
      tefScorePredicted,
      strengths,
      improvements,
    });
  } catch (err) {
    return res.status(Number(err?.status || 500)).json({ error: err?.message || String(err) });
  }
});

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

