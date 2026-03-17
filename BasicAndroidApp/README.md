# French Scorer (Android + Gemini)

Basic Android app that scores a French text using the Google Gemini API.

## Setup

### 1) Open the project

Open the folder `BasicAndroidApp/` in Android Studio.

### 2) Add your Gemini API key (recommended for local dev only)

Add this line to `BasicAndroidApp/local.properties`:

```properties
GEMINI_API_KEY=YOUR_KEY_HERE
```

Then sync Gradle. The app reads it into `BuildConfig.GEMINI_API_KEY`.

Notes:
- `local.properties` is meant to be local-only (don’t commit it).
- If you ship an API key inside an APK, it can be extracted. For production, put the key behind your own backend.

### 3) Run

Press **Run** in Android Studio on an emulator or device.

## What it does

- Paste French text
- Tap **Score my French**
- Gemini returns a JSON score, CECR level, strengths, improvements, and a corrected version

