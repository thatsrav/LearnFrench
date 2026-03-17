require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

function buildPrompt(frenchText) {
  return `You are a strict but helpful French teacher.

Task: Grade the student's French writing on a 0-100 scale.

Return ONLY valid JSON with exactly these keys:
- score (number, 0-100)
- cecr (string, one of: A1, A2, B1, B2, C1, C2)
- strengths (array of 2-5 short bullet strings)
- improvements (array of 2-5 short bullet strings)
- corrected_version (string: corrected French text)

Rules:
- Be concise.
- Do not add any extra keys.
- If the text is not French, still score it and explain in improvements.

Student text:
${frenchText.trim()}`;
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

app.post("/api/score", async (req, res) => {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in backend env." });
    }

    const text = (req.body && req.body.text ? String(req.body.text) : "").trim();
    if (!text) {
      return res.status(400).json({ error: "Missing 'text'." });
    }

    const prompt = buildPrompt(text);

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const raw = await resp.text();
    if (!resp.ok) {
      return res.status(resp.status).json({ error: `Gemini HTTP ${resp.status}`, details: raw });
    }

    const parsed = JSON.parse(raw);
    const modelText =
      parsed?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "";

    const jsonText = extractFirstJsonObject(modelText);
    const scoreObj = JSON.parse(jsonText);

    return res.json({ result: scoreObj });
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

