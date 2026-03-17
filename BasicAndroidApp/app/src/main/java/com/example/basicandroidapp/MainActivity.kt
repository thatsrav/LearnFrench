package com.example.basicandroidapp

import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.progressindicator.LinearProgressIndicator
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {
    private val job = Job()
    private val uiScope = CoroutineScope(Dispatchers.Main + job)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val input = findViewById<TextInputEditText>(R.id.frenchInput)
        val button = findViewById<MaterialButton>(R.id.scoreButton)
        val progress = findViewById<LinearProgressIndicator>(R.id.progress)
        val result = findViewById<TextView>(R.id.resultText)

        button.setOnClickListener {
            val text = input.text?.toString()?.trim().orEmpty()
            if (text.isBlank()) {
                result.text = "Please paste some French text first."
                return@setOnClickListener
            }

            button.isEnabled = false
            progress.visibility = View.VISIBLE
            result.text = "Scoring…"

            uiScope.launch {
                val outcome = withContext(Dispatchers.IO) {
                    GeminiFrenchScorer.scoreFrench(text)
                }

                button.isEnabled = true
                progress.visibility = View.GONE
                result.text = outcome.fold(
                    onSuccess = { it.pretty() },
                    onFailure = { "Error: ${it.message ?: it.toString()}" },
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        job.cancel()
    }
}

