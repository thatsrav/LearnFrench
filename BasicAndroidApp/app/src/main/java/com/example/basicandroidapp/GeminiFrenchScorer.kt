package com.example.basicandroidapp

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object GeminiFrenchScorer {
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val httpClient: OkHttpClient by lazy {
        val logger = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }
        OkHttpClient.Builder()
            .addInterceptor(logger)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    fun scoreFrench(frenchText: String): Result<FrenchScore> {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isBlank()) {
            return Result.failure(
                IllegalStateException("Missing GEMINI_API_KEY. Add it to local.properties (see README).")
            )
        }

        val prompt = buildPrompt(frenchText)
        val bodyJson = JSONObject()
            .put(
                "contents",
                JSONArray().put(
                    JSONObject().put(
                        "parts",
                        JSONArray().put(JSONObject().put("text", prompt))
                    )
                )
            )
            .toString()

        val url =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey"

        val request = Request.Builder()
            .url(url)
            .post(bodyJson.toRequestBody(jsonMediaType))
            .build()

        httpClient.newCall(request).execute().use { resp ->
            val raw = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) {
                return Result.failure(IllegalStateException("HTTP ${resp.code}: $raw"))
            }
            return runCatching { parseFrenchScoreFromGemini(raw) }
        }
    }

    private fun buildPrompt(frenchText: String): String {
        return """
You are a strict but helpful French teacher.

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
${frenchText.trim()}
        """.trim()
    }

    private fun parseFrenchScoreFromGemini(responseBody: String): FrenchScore {
        val root = JSONObject(responseBody)
        val candidates = root.getJSONArray("candidates")
        val first = candidates.getJSONObject(0)
        val content = first.getJSONObject("content")
        val parts = content.getJSONArray("parts")
        val text = parts.getJSONObject(0).getString("text")

        val jsonText = extractFirstJsonObject(text)
        val obj = JSONObject(jsonText)

        val score = obj.getDouble("score")
        val cecr = obj.getString("cecr")
        val strengths = obj.getJSONArray("strengths").toStringList()
        val improvements = obj.getJSONArray("improvements").toStringList()
        val corrected = obj.getString("corrected_version")

        return FrenchScore(
            score = score,
            cecr = cecr,
            strengths = strengths,
            improvements = improvements,
            correctedVersion = corrected,
        )
    }

    private fun JSONArray.toStringList(): List<String> =
        (0 until length()).map { idx -> getString(idx) }

    private fun extractFirstJsonObject(text: String): String {
        val start = text.indexOf('{')
        if (start < 0) error("No JSON object found in model response.")
        var depth = 0
        for (i in start until text.length) {
            when (text[i]) {
                '{' -> depth++
                '}' -> {
                    depth--
                    if (depth == 0) return text.substring(start, i + 1)
                }
            }
        }
        error("Unterminated JSON object in model response.")
    }
}

