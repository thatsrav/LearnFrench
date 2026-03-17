package com.example.basicandroidapp

data class FrenchScore(
    val score: Double,
    val cecr: String,
    val strengths: List<String>,
    val improvements: List<String>,
    val correctedVersion: String,
) {
    fun pretty(): String {
        val s = StringBuilder()
        s.append("Score: ").append(score).append("/100").append('\n')
        s.append("CECR: ").append(cecr).append('\n')
        s.append('\n')
        s.append("Strengths:\n")
        strengths.forEach { s.append("- ").append(it).append('\n') }
        s.append('\n')
        s.append("Improvements:\n")
        improvements.forEach { s.append("- ").append(it).append('\n') }
        s.append('\n')
        s.append("Corrected version:\n")
        s.append(correctedVersion)
        return s.toString()
    }
}

