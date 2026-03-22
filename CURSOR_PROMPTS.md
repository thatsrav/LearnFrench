# Cursor Prompts for French Learning App Features

## 🔴 PRIORITY 1: ADAPTIVE LEARNING ENGINE

### Prompt 1.1: Weak Area Detection System
```
Context: We have a French learning app (expo-mobile) with SQLite database tracking user_unit_progress 
and user_score_events. We need to identify weak areas to personalize recommendations.

Task:
1. Create a new service file: src/services/weakAreaDetection.ts
2. Implement these functions:
   - analyzePerformanceByTopic(userId: string) → returns { topic: string, avgScore: number, attemptCount: number }[]
   - getWeakTopics(userId: string, threshold: number = 70) → returns topics below threshold, sorted by score (lowest first)
   - getCategoryStrength(userId: string) → returns grammar vs vocab vs pronunciation performance breakdown
3. Query patterns:
   - Read from user_score_events table (scores, cecr levels, timestamps)
   - Read from user_unit_progress table (status, scores per unit)
   - Calculate: total attempts, average score, last attempt date per topic
4. Return data structure optimized for React components to display weak areas
5. Include error handling for users with <5 attempts

Implementation should follow the existing database patterns in src/database/useDatabase.ts
```

### Prompt 1.2: Spaced Repetition Scheduler
```
Context: We have vocabulary and grammar content in our lesson system. We need to implement 
spaced repetition (SM2 algorithm or similar) to improve retention.

Task:
1. Create src/lib/spacedRepetition.ts with:
   - SM2Algorithm class implementing the classic spaced repetition formula
   - calculateNextReviewDate(lastReview: Date, easeFactor: number, interval: number) → Date
   - updateEaseFactor(currentEase: number, quality: 0-5) → newEase: number
   - getReviewItems(userId: string, today: Date) → items due for review
2. Extend database schema:
   - Add to a new spaced_repetition_items table: item_id, user_id, last_review, next_review, 
     ease_factor, interval, repetitions
3. When user scores ≥80% on a lesson, create spaced repetition entry
4. Fetch daily review items in HomeScreen to suggest "Review 5 vocabulary words today"
5. Track review history (did user complete the review? did they remember?)

Reference the existing useDatabase pattern for adding new tables.
```

### Prompt 1.3: Personalized Lesson Recommendations
```
Context: We have user progress data and weak area detection. Now create a smart recommendation engine.

Task:
1. Create src/services/recommendationEngine.ts with:
   - getRecommendedNextLesson(userId: string) → { lessonId, reason: string, difficulty }
   - generateDailyLessonPlan(userId: string) → today's recommended lessons with rationale
   - suggestReviewContent(userId: string) → content focusing on weak areas
2. Logic:
   - If user is <80% on current level, recommend retry or foundational review
   - If user completed level, recommend next level
   - If user has weak grammar topic, recommend targeted lesson on that topic
   - Factor in user's learning streak (don't recommend >2 hours if streak is new)
3. Return recommendations ranked by impact (high impact = addresses multiple weak areas)
4. Add a "Daily Plan" section to HomeScreen showing top 3 recommended lessons
5. Track recommendation engagement (did user take the recommended lesson?)

Pull from weakAreaDetection service and existing progress data.
```

---

## 🟠 PRIORITY 2: COMPREHENSIVE WRITING JOURNAL

### Prompt 2.1: Writing Journal Data Model & Storage
```
Context: We have user_score_events table tracking individual scores. We need a dedicated 
writing journal to track essays, feedback, and improvement over time.

Task:
1. Create src/database/WritingJournalService.ts
2. Add database tables (via Supabase migration):
   - writing_entries: id, user_id, title, content (French text), created_at, word_count, 
     submitted_at, draft (boolean), category
   - writing_scores: id, entry_id, overall_score, grammar_score, vocab_score, 
     pronunciation_score, fluency_score, ai_provider, scored_at
   - writing_feedback: id, score_id, feedback_text, error_examples[], suggestions[]
3. Implement CRUD operations:
   - saveWritingDraft(userId, title, content) → saves as draft
   - submitForScoring(entryId, aiProvider) → calls existing scorer API
   - getJournalEntries(userId, filters?: {dateRange, category, minScore}) → paginated list
   - getEntryWithFeedback(entryId) → full article + all feedback history
   - deleteEntry(entryId)
4. Add timestamp indexing for "progress over time" queries
5. Connect to existing scoreFrench.ts API in src/api/

Make it compatible with expo-mobile/src/database/useDatabase.ts patterns.
```

### Prompt 2.2: Error Pattern Analyzer
```
Context: We're storing writing feedback with AI scores. Now extract patterns 
from errors to help users identify recurring mistakes.

Task:
1. Create src/services/errorPatternAnalyzer.ts
2. Implement:
   - analyzeErrorPatterns(userId: string, timeRange?: 'week' | 'month' | 'all') 
     → { errorType, frequency, examples[], suggestions }[]
   - categorizeErrors(feedbackText: string) → errorType: 'grammar' | 'verb-tense' | 
     'adjective-agreement' | 'vocabulary' | 'syntax'
   - getRecurringMistakes(userId: string) → top 5 repeated errors sorted by frequency
   - generatePersonalizedTips(errorPatterns) → tips targeting user's specific mistakes
3. Parse feedback from feedback table using NLP or keyword matching:
   - Look for patterns like "verb agreement", "subject-verb", "past tense", etc.
   - Count frequency across all user entries
   - Link errors to lesson topics that cover that grammar point
4. Create WeakAreasCard component for SyllabusScreen:
   - "Your top mistakes: verb tenses (4×), gender agreement (3×)"
   - Link to relevant lessons to practice
5. Include confidence scoring (is this error pattern real or noise?)

Use regex/string matching if NLP not available.
```

### Prompt 2.3: Writing Journal UI Component
```
Context: We have writing data stored and error patterns analyzed. 
Build the UI component for browsing, writing, and learning from journal.

Task:
1. Create screens/WritingJournalScreen.tsx with tabs:
   Tab 1 - "New Entry": text input, category dropdown (Daily Life, Travel, Work, Opinion), save/submit buttons
   Tab 2 - "My Entries": list of all journal entries with:
     - Title, date, word count, overall score
     - Filter by: date range, category, score range
     - Swipe to delete or view full entry
   Tab 3 - "Insights": Show error patterns and improvement over time
     - Chart: score trend over past 30 days
     - List: top repeated errors with examples
     - Suggested lessons based on recurring errors
2. Detail view for each entry (click to open):
   - Full text with grammar error highlighting (show errors from feedback)
   - Score breakdown (grammar %, vocab %, etc.)
   - AI feedback text
   - Option to resubmit for re-scoring or edit and resubmit
3. Button flow:
   - New Entry → Write text → Save as draft or Submit → Get scores/feedback → View in My Entries
   - View entry → See feedback → Link to lesson fixing that grammar point
4. Loading states for API calls to scoreFrench.ts
5. Sync draft entries to cloud

Connect to WritingJournalService and scoreFrench.ts API.
```

---

## 🟡 PRIORITY 3: LISTENING COMPREHENSION (Complete TEF Structure)

### Prompt 3.1: Audio Assets & Metadata
```
Context: We have TEF prep structure in tefPrepA1.ts but listening content is placeholder. 
Set up audio infrastructure.

Task:
1. Create src/content/listeningContent.ts
2. Structure for each of 10 TEF units:
   - unit ID, level (A1), skill: "listening"
   - audioUrl: string (hosted on CDN or asset)
   - questionSet: { questionId, question (French), options: [A, B, C, D], correctAnswer, audioSegmentStart, audioSegmentEnd }
   - metadata: { duration, accent ('quebec' | 'france' | 'belgium'), speaker, speed: 0.8-1.2 }
   - transcript: full text (for review)
3. For now, create placeholder entries pointing to:
   - URLs (ready for real audio files later)
   - Sample questions formatted like TEF
   - Proper question ordering
4. Format example:
   {
     unitId: 'tef-a1-listening-1',
     audioUrl: 'https://cdn.example.com/tef-a1-listening-unit-1.mp3',
     questions: [{ questionId: 'q1', question: 'Quel est le sujet...', options: ['A: ...', 'B: ...', ...], correctAnswer: 'A' }],
     metadata: { duration: 180, accent: 'quebec', transcript: '...' }
   }
5. Ensure it follows same schema as tefPrepA1.ts
```

### Prompt 3.2: Audio Player Component with Playback Controls
```
Context: We have audio files and questions. Build an interactive player for 
listening practice matching TEF format.

Task:
1. Create components/AudioPlayer.tsx with features:
   - Play/Pause/Replay buttons
   - Progress bar with time display (current / total)
   - Speed adjustment (0.8x, 1.0x, 1.2x) for learners
   - Volume control
   - "Reveal Transcript" button (toggles between hidden and visible)
   - Auto-scroll transcript highlighting (show current position)
2. Controls behavior:
   - Can only answer questions while listening or from memory (TEF format)
   - Disable answer submission until question is shown (strict TEF mode option)
   - Allow replay unlimited times
   - Timer shows when answer window closes (if applicable)
3. Use react-native-sound or expo-av for audio playback
4. Handle errors: network timeout, missing file, corrupted audio
5. Persist playback position if user exits and returns

Make it reusable for future audio content (podcasts, etc.)
```

### Prompt 3.3: Listening Practice Screen Integration
```
Context: We have player component and audio content. 
Integrate into TEF prep and create full listening practice screen.

Task:
1. Create/update screens/TefPrepActivityScreen.tsx for skill === 'listening':
   - Load audio content from listeningContent.ts
   - Show: "Unit 1: Listening Practice - Duration 2:45"
   - AudioPlayer component at top
   - Below: Question area
     - "Question 1 of 6"
     - Question text (in French)
     - 4 radio buttons (A, B, C, D) - initially disabled until audio starts
     - "Submit Answer" button
     - Progress bar: 1/6 questions answered
2. Flow:
   - Play audio → Questions appear
   - User selects answer → Click submit
   - Show result: Correct/Incorrect + explanation
   - "Next Question" button
   - On completion: Show score (5/6 correct) + summary
3. Track data:
   - Save to tefPrepProgress table: unit_id, score, answers_per_question, time_spent
   - Calculate CECR level from score
4. Add score breakdown:
   - "You got 83% - Strong listening comprehension"
   - Link to weak areas (if <80%)
5. Add "Review Transcript" option after unit completion
```

---

## 🟢 QUICK WINS

### Prompt 4.1: Daily Challenges System
```
Context: We have lessons, vocabulary, and user progress. 
Create a daily challenge system to drive daily engagement.

Task:
1. Create src/services/dailyChallengeService.ts
2. Generate 3 daily challenges (refresh daily at 12 AM user timezone):
   - Challenge 1: "Vocabulary Quiz" - 5 random vocab words from random lesson (target: 60 seconds)
   - Challenge 2: "Writing Prompt" - one sentence prompt (target: 2 minutes)
   - Challenge 3: "Listening Snippet" - 30-second audio clip + MCQ (target: 1 minute)
3. Implement:
   - generateDailyChallenge(type) → challenge object with question, options, time limit
   - completeChallenge(userId, challengeId, answer) → validates, awards points
   - getStreakCount(userId) → consecutive days completed
   - getChallengeRewards(userId, streakCount) → bonus points for streaks (3-day = 10 pts, 7-day = 50 pts)
4. Add daily_challenges table: user_id, challenge_id, type, completed (boolean), score, timestamp
5. Create DailyChallengesCard on HomeScreen:
   - "Today's Challenges: 1/3 completed"
   - Show streak (🔥 7 day streak!)
   - Quick action buttons to start each challenge
   - Reward display (earned 25 points today)
6. Send push notification at 9am: "Your daily challenges are ready!"

Use existing lesson/vocab data as challenge source.
```

### Prompt 4.2: Achievement Badges System
```
Context: We track user progress and scores. 
Create a badge/achievement system for motivation and gamification.

Task:
1. Create src/lib/achievements.ts with badge definitions:
   - Grammar Master: Complete 5 lessons scoring ≥90%
   - Fluency Sprint: Score ≥80% on 3 consecutive lessons
   - Reading Racer: Complete reading practice 5 times in one week
   - Speaking Star: Submit 10 speaking practice attempts
   - Writing Warrior: Write 10 journal entries
   - 7-Day Streak: Maintain 7 day learning streak
   - Century: Score 100 on any writing submission
   - Polyglot: Reach Level B1 proficiency
   - Perfect Week: Score ≥80% on all lessons attempted this week
   - Consistency: 30 days of logging in
2. Create achievement table: id, badge_id, title, description, icon (emoji), user_id, earned_at
   - Add trigger/check when user completes qualifying action
3. Create UserAchievementsScreen showing:
   - Grid of earned badges with unlock date
   - "Locked" badges showing progress toward unlock (3/5 lessons ≥90%)
   - Encouragement message for next badge
   - Sort: recently earned first
4. Add small trophy icon next to username if user has ≥5 badges
5. Share badge on leaderboard: "Sarah just earned Grammar Master! 🏆"

Track achievement engagement (social proof increases motivation).
```

### Prompt 4.3: Enhanced Leaderboard (Weekly + Categories)
```
Context: We have a basic leaderboard showing top 10 scores. 
Extend it with weekly rankings, categories, and friend comparisons.

Task:
1. Create src/services/leaderboardService.ts with functions:
   - getTopScores(period: 'all-time' | 'this-week' | 'this-month') → returns top 10 with rank
   - getLeaderboardByCategory(category: 'score-leaders' | 'most-active' | 'best-streak') → top 10
   - getUserRank(userId: string, period: string) → {rank, score, percentile}
   - compareWithFriends(userId: string) → friend rankings relative to user
2. Categories:
   - Score Leaders: highest single writing score
   - Most Active: most attempts/submissions in period
   - Best Streak: longest current streak
   - Fastest Learner: reached latest level quickest
   - Lesson Master: most lessons completed
3. Modify leaderboard table:
   - Add period column (all-time, weekly_yyyy_ww, monthly_yyyy_mm)
   - Query by period for weekly reset functionality
4. Create multi-tab LeaderboardScreen:
   - Tab 1: Score Leaders (all-time) - show top 10
   - Tab 2: This Week - top 10 by week
   - Tab 3: Categories - dropdown to switch between categories
   - Tab 4: Friends - show rank relative to friends (requires friend list feature)
5. For each user shown: rank #, name, score, level, progress bar
6. Highlight: "You are in top 10% 🎉"
7. Add "See More" to expand beyond top 10

Keep performance optimized (cache weekly leaderboard).
```

---

## 💎 ADVANCED FEATURES

### Prompt 5.1: Conversation Simulator (AI Role-Play)
```
Context: We have AI scoring via multiple providers (OpenAI, Claude, Groq). 
Create an interactive conversation practice simulator.

Task:
1. Create src/services/conversationSimulator.ts
2. Define scenario templates with context:
   - Scenario 1: "At a Restaurant" - order food, ask about ingredients, make reservation
   - Scenario 2: "Job Interview" - introduce yourself, answer questions, ask about salary
   - Scenario 3: "Traveling" - ask directions, book hotel, negotiate price
   - Scenario 4: "Casual Chat" - talk about hobbies, family, weekend plans
3. For each scenario:
   - System prompt (AI playing role of restaurant staff, interviewer, etc.)
   - Initial AI message (AI starts conversation)
   - Success criteria (demonstrate 5 key phrases, ask 3 questions, etc.)
   - Difficulty level (A1-C1)
4. Implement turn-based conversation:
   - AI sends message (French) with English transcription available
   - User records voice or types response
   - Send to AI (Claude/OpenAI) for analysis:
     * Grammar check
     * Vocabulary appropriateness
     * Pronunciation feedback (word by word)
     * Fluency suggestions
     * Did it answer the question asked?
   - AI responds with next turn
   - Max 8 turns per conversation
5. Record conversation and allow replay
6. At end: show transcript + overall score + vocabulary learned + grammar issues

Use existing API infrastructure from scoreFrench.ts but for multi-turn dialogue.
```

### Prompt 5.2: Mock Exam - Full TEF Simulation
```
Context: User has practiced individual skills (reading, writing, listening, speaking). 
Create full-length practice tests with scoring and feedback.

Task:
1. Create src/services/mockExamService.ts
2. Structure full exam:
   - Reading: 3 documents × MCQ format = 50 minutes
   - Writing: 2 prompts (task 1: 150-200 words, task 2: 200-250 words) = 60 minutes
   - Listening: 4 sections, questions spread across audio = 40 minutes
   - Speaking: 4 tasks (introduction, monologue, discussion, presentation) = 15 minutes
   - Total duration: ~165 minutes
3. Implement:
   - startMockExam(userId, level: 'A1'|'A2'|'B1'|'B2'|'C1') → exam session
   - trackExamProgress(sessionId) → time remaining, completion %
   - submitExamResponse(section, responseData) → scores immediately
   - generateExamReport(sessionId) → detailed breakdown
4. Exam report includes:
   - Overall score (0-100)
   - Section breakdown (Reading: 75%, Writing: 82%, Listening: 68%, Speaking: 79%)
   - CLB band prediction
   - Weak areas (reading comprehension, verb tenses, etc.)
   - Time management analysis
   - Percentile ranking (top X% of test takers)
   - Actionable recommendations (review topic X, practice skill Y)
5. Save exam history:
   - exam_attempts table: user_id, exam_id, score, sections_scores, timestamp, report
   - Track improvement over multiple attempts
6. Compare to real TEF scoring rubric

Use existing lesson/TEF content for exam.
```

### Prompt 5.3: Live Tutoring Integration (Backend Setup)
```
Context: We want to offer live tutoring sessions with native speakers.
Set up the infrastructure (payment, scheduling, video call).

Task:
1. Create src/services/tutorService.ts for scheduling/management:
   - listAvailableTutors(specialization?: 'conversation' | 'grammar' | 'writing') 
     → tutors with availability
   - tutorProfile(tutorId) → name, rate, hourly_rate, bio, reviews, language_pair, 
     availability_schedule
   - scheduleSession(userId, tutorId, dateTime, minutes) → creates session record
   - completeSession(sessionId, rating, feedback) → marks complete, allows user review
2. Database tables:
   - tutors: id, name, rate_per_hour, specialization, bio, availability_calendar
   - tutor_sessions: id, user_id, tutor_id, scheduled_at, duration, status (pending/active/completed)
   - session_reviews: session_id, rating (1-5), feedback_text
   - session_recordings: session_id, video_url (for user review)
3. Feature prerequisites (not fully implementing, just setup):
   - Stripe integration for payment processing
   - Twilio/Jitsi for video calling (API endpoints ready)
   - Email notifications for scheduled sessions
   - Session recording (save to cloud storage)
4. Create TutorMarketplaceScreen:
   - List of available tutors with profiles
   - Filter: by specialty, availability, rating
   - Click to book → select date/time → payment → confirmation
5. Active session management:
   - StartSessionScreen → load video call, chat, document sharing
   - Post-session: rate tutor, request follow-up
6. For now, add skeleton components and database prep
   - Real payment/video integration can come later

Focus on data model and UI structure.
```

---

## 📊 INFRASTRUCTURE FEATURES

### Prompt 6.1: User Analytics Dashboard (Backend)
```
Context: We track many user events. Build analytics to understand user behavior patterns.

Task:
1. Create src/services/analyticsService.ts
2. Aggregate metrics for each user:
   - Daily active users (DAU), monthly active (MAU)
   - Features used (lessons, writing journal, speaking coach, etc.)
   - Time spent per feature
   - Retention: % of users active on day 7, 30, 90
   - Learning velocity: lessons completed per day
   - Weak topic identification (grammar topics users struggle most with)
   - Feature adoption: % of users using each feature
3. Implement:
   - getUserAnalytics(userId) → comprehensive stats about one user
   - getCohortAnalytics(startDate, endDate) → aggregate for cohort
   - identifyChurn(daysInactive: int) → users inactive N+ days
   - getLearningTrend(userId) → lesson performance trend over time
4. Create analytics table: event_type, user_id, timestamp, duration, metadata
   - Events: lesson_started, lesson_completed, writing_submitted, speaking_attempted, streak_broken, etc.
5. Focus on actionable insights:
   - User X improved 15% after practicing weak topics
   - Users in streak >3 days have 40% higher lesson completion rate
   - Most abandoned feature: speaking coach (44% of users)
6. Avoid tracking: PII beyond email, sensitive auth data

Design with privacy-by-default (GDPR compliant).
```

### Prompt 6.2: Admin CMS for Content Management
```
Context: We have hardcoded lesson content in JSON files. 
Build an admin interface to add/edit lessons without code changes.

Task:
1. Create admin dashboard (separate from expo-mobile, use web):
   - Location: french-scorer-web/src/admin/ (if using that project)
   - Access control: only admin@frenchlearn.com can access
2. Admin features:
   - Lesson Management: Create/Edit/Delete lessons with fields:
     * Level (A1-C1), module (which of 6), lesson title
     * Grammar rules (rich text editor)
     * Vocabulary list (word, translation, example sentence)
     * Quiz MCQ items (question, options, correct answer, explanation)
     * Estimated time to complete
     * Learning objectives
   - Publish/Unpublish control
   - Preview lesson as student before publishing
3. Reading/Writing/Listening content management:
   - Upload passage/prompt/audio files
   - Add metadata (difficulty, topic tags, CECR level)
   - Schedule content (publish on specific date)
4. User management:
   - View user progress
   - Reset user progress if needed
   - Send messages/notifications to user
   - View analytics charts
5. A/B Testing setup:
   - Create variants of lesson
   - Assign users to variant group
   - Compare outcomes
6. Audit trail: log all changes (who changed what, when)

Use React + TypeScript + existing Supabase connection.
```

---

## 🎨 MOBILE-SPECIFIC FEATURES

### Prompt 7.1: Home Screen Widgets
```
Context: Users open app daily. Surface key info without fully opening app.

Task:
1. Create iOS/Android widgets (native, using Expo):
   - Widget 1: Streak Counter
     * Shows 🔥 7-day streak
     * "Back tomorrow for day 8!"
     * Tap to open app to today's challenges
   - Widget 2: Daily Lesson Preview
     * Shows next recommended lesson (from recommendationEngine)
     * "Grammar: Passé Composé - 12 min"
     * Tap to open that lesson directly
   - Widget 3: Writing Score Trend
     * Last 7 scores as mini sparkline chart
     * "↑ +8 pts this week"
     * Tap to open writing journal
   - Widget 4: Quick Vocabulary Quiz
     * Show 1 word with options (A, B, C, D)
     * Tap answer directly → quick feedback
     * Next widget shows next word
     - Widget 5: Achievement Progress
     * "2/5 towards Grammar Master badge"
     * Progress bar
     * Tap to open achievements screen
2. Refresh frequency: 4 times/day or on manual refresh
3. Make widgets tap through to relevant screens
4. Small, glanceable design (widgets = 2 lines max)

Use react-native-home-screen-widgets or similar Expo package.
```

### Prompt 7.2: Voice Journal Practice
```
Context: User practices speaking, but we don't have persistent voice journal.
Build voice recording + feedback system.

Task:
1. Create src/services/voiceJournalService.ts
2. Features:
   - Record 30-120 second voice clips responding to prompts
   - Prompts: "Introduce yourself", "Describe your day", "Why do you study French?"
   - Store recordings with metadata: user_id, created_at, duration, prompt_id, transcript
3. Implement:
   - startRecording() → records audio
   - stopRecording() → saves audio file to device
   - uploadToCloud(recordingId) → sends to Supabase storage
   - getTranscript(audioFile) → calls speech-to-text API (Groq Whisper or OpenAI)
   - scoreRecording(transcriptText) → calls scoreFrench.ts for feedback
4. Create screens/VoiceJournalScreen.tsx:
   - Tab 1: Record new entry
     * Show prompt
     * Record button (countdown timer)
     * Playback controls (listen to your voice)
     * Submit button
   - Tab 2: My Recordings
     * List all recordings with date, duration, score
     * Play any recording
     * Show transcript + feedback
     * Track improvement (side-by-side score comparison past 30 days)
   - Feedback shows: grammar errors in transcript, pronunciation issues, fluency suggestions
5. Add "Daily Voice Challenge" to daily challenges
6. Privacy: user can delete recordings anytime

Use expo-av for audio recording, Groq Whisper for transcription.
```

### Prompt 7.3: Offline Course Packs
```
Context: Users want to learn without internet (flight, subway, etc.).
Create downloadable lesson packs with assets.

Task:
1. Create src/services/offlineContentService.ts
2. Package definition: "Course Pack"
   - Select lessons/units to download
   - Include: lesson content (JSON), audio assets, quiz, explanations
   - Size estimate shown before download
3. Implement:
   - createOfflinePack(lessonIds: string[]) → bundles lessons with assets
   - downloadPack(packId) → downloads to device storage
   - getOfflineContent(unitId) → loads from offline storage if available
   - syncOfflineProgress() → when back online, sync quiz scores and progress
4. Behavior when offline:
   - App detects no internet (via connectivity plugin)
   - Load all content from local storage
   - User can complete lessons, quizzes normally
   - Save progress locally (SQLite)
   - When connection returns: auto-sync progress to cloud
5. Create OfflineModeScreen:
   - Downloaded packs list with size and lesson count
   - "Download New Pack" button → shows lessons available for download
   - Storage usage indicator (show total storage used)
   - Delete pack option to free space
6. Add indicator in unit card: 📱 (means available offline)

Monitor sync for data conflicts (completed lesson offline + online = merge).
```

---

## 📝 IMPLEMENTATION PRIORITY MATRIX

**Start with these (foundation):**
1. Weak Area Detection (enables personalization)
2. Writing Journal Data Model (stores user work)
3. Daily Challenges (drives engagement)
4. Achievement Badges (motivation)

**Then add:**
5. Error Pattern Analyzer (learns from user mistakes)
6. Spaced Repetition (retention)
7. Listening Module (completes TEF)
8. Enhanced Leaderboard (social engagement)

**Polish with:**
9. Home Screen Widgets (convenience)
10. Voice Journal (speaking practice)
11. Analytics Dashboard (understanding users)
12. Conversation Simulator (advanced practice)

---

## 🚀 QUICK COPY-PASTE PROMPTS

Use these directly in Cursor without modification:

**For Weak Area Detection:**
```
Create an adaptive learning service that analyzes user quiz performance by topic and 
recommends lessons targeting weak areas. Track scores in user_score_events table, 
calculate average score per topic, identify topics <70%, and expose weak topics 
sorted by score (lowest first). Return data for UI components to display 
"You scored 55% on verb tenses - review this lesson."
```

**For Writing Journal:**
```
Build a writing journal feature where users write French essays, submit them for AI 
scoring, and track improvement over time. Create tables for entries and feedback. 
Implement CRUD operations (save draft, submit, view history). Add error pattern 
detection to show "You commonly make subject-verb agreement errors (4×)". Create 
UI with tabs for compose, my entries, and insights showing score trends.
```

**For Daily Challenges:**
```
Implement a daily challenge system generating 3 micro-practice activities daily 
(vocabulary quiz 60s, writing prompt 2min, listening 1min). Track completion, 
calculate streaks (bonus points for 3/7 day streaks), and send notifications. 
Show daily challenge card on home screen with streak counter and reward display.
```

**For Achievements:**
```
Create a badge achievement system with predefined badges (Grammar Master: 5 lessons 
≥90%, Fluency Sprint, Reading Racer, etc.). Add checks after user completes 
qualifying actions. Store achievement earn history. Display achievement screen 
with earned/locked badges showing progress toward unlock. Show trophy icon next 
to username for users with ≥5 badges.
```

---

Feel free to copy any prompt above directly into Cursor!

---

## 🇫🇷 BUSUU-STYLE OFFLINE LEARNING (NEW PRIORITY)

> **Goal:** Upgrade the lesson experience from flat MCQ quizzes to a Busuu-style step-by-step lesson flow with vocab cards, dialogues, grammar tips, and mixed exercises — all bundled offline-first in JSON.

---

### Prompt B1: Redesign Unit JSON Schema (Content Layer)
```
Context: Our current unit JSON files (expo-mobile/assets/syllabus/a1_u*.json) contain only
grammar_rule_text, a flat vocab_list (bare words, no translations), 5 MCQ questions, and
production_task: null. This is too thin for a real lesson. We need a Busuu-style multi-step
format bundled in JSON so lessons work 100% offline.

Task: Rewrite all 10 A1 unit JSON files (a1_u1.json → a1_u10.json) using this new schema:

{
  "id": "a1-u1",
  "level": "A1",
  "unit_index": 1,
  "theme": "Greetings & Meeting People",
  "estimated_minutes": 12,
  "steps": [
    {
      "type": "vocab_intro",
      "cards": [
        {
          "word": "bonjour",
          "translation": "hello / good morning",
          "example": "Bonjour, je m'appelle Marie.",
          "example_translation": "Hello, my name is Marie.",
          "audio_key": "bonjour"
        }
        // 6–10 cards total per unit
      ]
    },
    {
      "type": "dialogue",
      "scene": "Two students meeting at school",
      "turns": [
        { "speaker": "A", "text": "Bonjour! Tu t'appelles comment?", "translation": "Hello! What is your name?" },
        { "speaker": "B", "text": "Je m'appelle Léa. Et toi?",       "translation": "My name is Léa. And you?" },
        { "speaker": "A", "text": "Moi, c'est Marc. Enchanté!",       "translation": "I'm Marc. Nice to meet you!" }
      ]
    },
    {
      "type": "grammar_tip",
      "rule": "To say your name: 'Je m'appelle ___'",
      "examples": [
        { "fr": "Je m'appelle Sophie.", "en": "My name is Sophie." },
        { "fr": "Tu t'appelles comment?", "en": "What's your name?" }
      ]
    },
    {
      "type": "practice",
      "exercises": [
        {
          "type": "match_pairs",
          "instruction": "Match each French word to its meaning",
          "pairs": [
            { "left": "bonjour",       "right": "hello" },
            { "left": "merci",         "right": "thank you" },
            { "left": "au revoir",     "right": "goodbye" },
            { "left": "s'il vous plaît","right": "please" }
          ]
        },
        {
          "type": "fill_blank",
          "sentence": "___, je m'appelle Paul.",
          "answer": "Bonjour",
          "options": ["Bonsoir", "Bonjour", "Merci", "Au revoir"],
          "hint": "daytime greeting"
        },
        {
          "type": "word_order",
          "words": ["appelle", "Marie", "m'", "Je"],
          "correct_order": [3, 2, 0, 1],
          "translation": "My name is Marie."
        },
        {
          "type": "mcq",
          "question": "How do you say 'nice to meet you' in French?",
          "options": ["merci", "au revoir", "enchanté", "bonjour"],
          "answer_index": 2,
          "explanation": "'Enchanté(e)' is the standard French expression when meeting someone."
        }
      ]
    }
  ],
  "production_task": {
    "prompt": "Write 2 sentences: introduce yourself and say goodbye.",
    "example": "Bonjour! Je m'appelle [votre nom]. Au revoir!",
    "skill": "writing"
  }
}

Unit themes for all 10:
U1: Greetings & Meeting People
U2: Numbers & Telling Time
U3: Family Members
U4: Food & Ordering at a Café
U5: Colors & Clothes Shopping
U6: Home & Describing Rooms
U7: Daily Routine & Verbs
U8: Transport & Directions
U9: Weather & Seasons
U10: Hobbies & Free Time

Requirements per unit:
- 6–10 vocab cards, each with: word, translation, example sentence, example_translation
- 1 dialogue with 3–5 turns (realistic conversational French, not textbook dry)
- 1 grammar_tip covering the unit's single most important rule
- 4 exercises: 1 match_pairs + 1 fill_blank + 1 word_order + 1 mcq (with explanation)
- 1 production_task (writing or speaking prompt)

Keep all content authentic Canadian/Québec-aware French where relevant.
```

---

### Prompt B2: LessonScreen Step Navigator
```
Context: expo-mobile/src/screens/LessonScreen.tsx currently renders grammar_rule_text and
loops through a flat quiz array. We need to replace it with a step-by-step navigator that
reads our new multi-step JSON schema (steps[]) and renders the correct component per step.

Task: Refactor LessonScreen.tsx to:

1. Load unit data from the new JSON schema (steps[] array).
   - Import the JSON directly (bundled, offline-first) OR from SQLite if pre-seeded.

2. Implement a step state machine:
   - currentStepIndex: number
   - stepProgress: percentage for the top progress bar
   - Advance with a "Continue" button (or auto-advance on vocab swipe)

3. Render the correct component for each step type:
   - "vocab_intro"   → <VocabIntroStep cards={step.cards} />
   - "dialogue"      → <DialogueStep turns={step.turns} scene={step.scene} />
   - "grammar_tip"   → <GrammarTipStep rule={step.rule} examples={step.examples} />
   - "practice"      → <PracticeStep exercises={step.exercises} onComplete={advance} />

4. Progress bar at the top: shows step index / total steps (e.g. "3 / 7").

5. On final step completion:
   - Calculate score (correct exercises / total exercises × 100)
   - Call existing unlockNextUnit(unitId, score) from SyllabusService.ts
   - Show completion modal with score, XP earned, and "Continue" button
   - If score ≥ 80, trigger inline spaced repetition review (see Prompt B5)

6. Handle back navigation: warn user "Progress will be lost" if mid-lesson.

Keep the existing navigation params (unitId, module) compatible so SyllabusScreen
deep-links still work. Do not break the existing unlockNextUnit / getSyllabusData flow.
```

---

### Prompt B3: VocabIntroStep & DialogueStep Components
```
Context: We need two new lesson step components for expo-mobile/src/components/lesson/:
VocabIntroStep (swipeable vocab flashcards) and DialogueStep (chat bubble scene).

Task 1 — Create src/components/lesson/VocabIntroStep.tsx:
- Props: cards: { word, translation, example, example_translation, audio_key? }[]
- Render a swipeable card stack (use react-native-reanimated or FlatList with paging)
- Card front: large French word centered, smaller audio icon (if audio_key present)
- Card back (tap to flip): translation in bold, example sentence below, example_translation in grey
- Bottom: dot indicators showing position (card 2 of 8)
- "Got it" / "Review again" buttons on back face — mark card for spaced repetition later
- After all cards swiped: show "Vocab done! You learned X words" → auto-advance

Task 2 — Create src/components/lesson/DialogueStep.tsx:
- Props: scene: string, turns: { speaker: 'A' | 'B', text: string, translation: string }[]
- Render as chat bubbles: speaker A on left (grey), speaker B on right (blue)
- Each bubble starts showing French text only
- Tap any bubble to toggle translation visibility (show/hide inline)
- "Scene: [scene description]" header at top in italics
- "Continue" button enabled after user has tapped at least one bubble (shows they engaged)
- Animate bubbles appearing one by one with a 300ms stagger on mount

Both components must work offline (no network calls). Use NativeWind / existing theme colors.
```

---

### Prompt B4: PracticeStep Exercise Components
```
Context: We need four exercise types for expo-mobile/src/components/lesson/exercises/:
MatchPairsExercise, FillBlankExercise, WordOrderExercise, and the existing MCQ (reuse).
These are rendered inside a PracticeStep that sequences exercises within the "practice" step.

Task 1 — Create src/components/lesson/exercises/MatchPairsExercise.tsx:
- Props: pairs: { left: string, right: string }[], instruction: string
- Render two columns: left words, right meanings — all shuffled
- User taps one item from each column to form a pair
- Highlight selected item in blue; when matched correctly → turn green and lock
- Wrong match → shake animation + red flash for 500ms → deselect
- Complete when all pairs matched → show "✓ Perfect!" banner + call onComplete(true)
- Score: 100 if all correct on first try, -10 per wrong attempt

Task 2 — Create src/components/lesson/exercises/FillBlankExercise.tsx:
- Props: sentence: string (contains "___"), answer: string, options: string[], hint?: string
- Render sentence with a raised blank slot in the middle
- Below: row of 4 word chips (the options)
- Tap a chip → it fills the blank slot
- "Check" button appears after selection
- Correct: green highlight, explanation if provided, "Continue" button
- Wrong: red shake, chip returns to options row, try again
- After 2 wrong attempts: reveal hint text below the sentence

Task 3 — Create src/components/lesson/exercises/WordOrderExercise.tsx:
- Props: words: string[], correct_order: number[], translation: string
- Render shuffled word chips in a "bank" at the bottom
- Tap chips to build the sentence in an answer tray at the top
- Tap a placed chip to return it to the bank
- "Check" button when tray has same word count as correct_order
- Correct → green tray + show translation underneath + "Continue"
- Wrong → red tray shake + keep chips placed for user to fix

Task 4 — Create src/components/lesson/PracticeStep.tsx:
- Props: exercises: Exercise[], onComplete: (score: number) => void
- Sequences exercises in order using an internal index
- Shows "Exercise 2 of 4" counter
- Tracks correct/incorrect per exercise, computes final score on completion
- Transitions between exercises with a simple fade

All components: NativeWind styling, no external animation libraries beyond what Expo SDK provides.
```

---

### Prompt B5: Inline Spaced Repetition at Lesson End
```
Context: We already have spaced_repetition_items table in SQLite and SpacedReviewScreen.tsx
in expo-mobile/src/screens/. The problem: users never navigate there voluntarily. We need
spaced repetition to appear automatically inline at the end of each completed lesson,
Busuu-style — no separate screen redirect.

Task: Modify the lesson completion flow in LessonScreen.tsx:

1. After final step completes and score ≥ 80:
   - Before showing the "Lesson Complete" modal, query spaced_repetition_items for this user
     WHERE next_review <= today AND unit_id = currentUnitId LIMIT 3
   - Also add the just-learned vocab cards as new SR items (if not already seeded)
     using the existing insertSpacedRepetitionItem() pattern

2. If there are ≥ 1 items due for review:
   - Show an inline "Quick Review" panel (NOT a navigation push) inside LessonScreen
   - Title: "Before you go — review 3 words from this unit"
   - Show each word as a simple flashcard: French front, tap to reveal translation
   - Buttons: "Remembered ✓" (quality: 4) and "Forgot ✗" (quality: 1)
   - Call updateSpacedRepetitionItem(itemId, quality) for each response
   - After all 3 reviewed: show the full completion modal

3. If no items due: skip the review panel, show completion modal directly.

4. If score < 80: skip inline review entirely, show "Try again" prompt instead.

This must reuse the existing SM2 algorithm from src/lib/spacedRepetition.ts and the
existing database functions — no new tables needed.
```

---

### Prompt B6: Visual Lesson Path (Syllabus Map)
```
Context: expo-mobile/src/screens/SyllabusScreen.tsx currently renders a flat list of
units. We want a Busuu/Duolingo-style visual path where unit nodes are connected by a
vertical line, alternate left/right, and locked units are greyed out. No data change
needed — status comes from existing getSyllabusData() which returns 'locked' | 'available'
| 'completed' per unit.

Task: Refactor SyllabusScreen.tsx:

1. Replace the FlatList with a ScrollView containing a path layout:
   - Units rendered as circular nodes connected by a vertical dashed line
   - Alternate positioning: odd units offset left, even units offset right (zigzag path)
   - Node size: 72px circle

2. Node appearance by status:
   - "completed":  filled green circle, white checkmark ✓, unit theme emoji above
   - "available":  filled blue/primary circle, white unit number, subtle pulse animation
   - "locked":     grey circle, lock icon 🔒, dimmed text

3. Below each node: unit theme label (2–3 words, e.g. "Greetings") and "X min" estimate

4. Tapping "available" → navigate to existing LessonScreen with unitId param
   Tapping "completed" → navigate to LessonScreen with a "review mode" param (allow replay)
   Tapping "locked"   → show a small tooltip "Complete the previous unit to unlock"

5. Level header banners between levels: e.g. "── A1 Beginner ──" as a wide badge
   separating A1 units from A2 units in the scroll.

6. XP / progress summary at the very top:
   - "A1: 4 / 10 units complete"
   - Linear progress bar

Use react-native Animated for the pulse on the current available node.
No new libraries. Reuse existing theme colors and NativeWind classes.
```

---

### Prompt B7: A1 Content Rewrite — Units U1–U5 (JSON Files)
```
Context: Rewrite the first 5 A1 unit JSON files using the new multi-step schema
(defined in Prompt B1). Files to create/overwrite:
  expo-mobile/assets/syllabus/a1_u1.json
  expo-mobile/assets/syllabus/a1_u2.json
  expo-mobile/assets/syllabus/a1_u3.json
  expo-mobile/assets/syllabus/a1_u4.json
  expo-mobile/assets/syllabus/a1_u5.json

Content specifications:

U1 — Greetings & Meeting People (estimated_minutes: 10)
  Vocab: bonjour, bonsoir, salut, au revoir, merci, s'il vous plaît, enchanté/e,
         de rien, bonne nuit, à bientôt, pardon, excusez-moi
  Dialogue scene: Two classmates meeting on the first day of school
  Grammar tip: "Je m'appelle ___" for introductions
  Exercises: match greetings to time of day | fill "Bonjour, je ___ Marc" | word order "m'appelle Marie Je" | MCQ

U2 — Numbers & Telling Time (estimated_minutes: 12)
  Vocab: un–vingt + vingt-et-un, trente, quarante, cinquante, cent
         heure, demi, quart, matin, midi, minuit, après-midi, soir
  Dialogue scene: Asking what time the train leaves at a station
  Grammar tip: "Il est [heure] heure(s)" — telling time with est
  Exercises: match number to digit | fill "Il est ___ heures" | word order "heures Il sept est" | MCQ

U3 — Family Members (estimated_minutes: 11)
  Vocab: père, mère, frère, sœur, fils, fille, grand-père, grand-mère,
         oncle, tante, cousin/e, mari, femme, enfant, famille
  Dialogue scene: Showing a family photo to a new friend
  Grammar tip: Possessive adjectives mon/ma/mes, ton/ta/tes
  Exercises: match family member to English | fill "C'est ___ frère" | word order | MCQ

U4 — Food & Ordering at a Café (estimated_minutes: 13)
  Vocab: café, thé, eau, jus, pain, croissant, baguette, fromage,
         salade, sandwich, menu, addition, s'il vous plaît, commander, avoir faim/soif
  Dialogue scene: Ordering breakfast at a Parisian café
  Grammar tip: "Je voudrais ___" for polite ordering (conditionnel de politesse)
  Exercises: match food item to image word | fill blank | word order | MCQ

U5 — Colors & Clothes Shopping (estimated_minutes: 12)
  Vocab: rouge, bleu/e, vert/e, jaune, blanc/he, noir/e, gris/e, rose, orange
         robe, pantalon, chemise, pull, veste, chaussures, taille, essayer, coûter, cher
  Dialogue scene: Trying on a jacket in a clothing store
  Grammar tip: Adjective agreement — add -e for feminine (blanc → blanche)
  Exercises: match color to French | fill blank | word order | MCQ

Write complete valid JSON for all 5 files. Keep French authentic, natural, and Canadian-friendly.
```

---

### Prompt B8: A1 Content Rewrite — Units U6–U10 (JSON Files)
```
Context: Rewrite the second 5 A1 unit JSON files using the same multi-step schema.
Files to create/overwrite:
  expo-mobile/assets/syllabus/a1_u6.json
  expo-mobile/assets/syllabus/a1_u7.json
  expo-mobile/assets/syllabus/a1_u8.json
  expo-mobile/assets/syllabus/a1_u9.json
  expo-mobile/assets/syllabus/a1_u10.json

Content specifications:

U6 — Home & Describing Rooms (estimated_minutes: 11)
  Vocab: maison, appartement, chambre, salon, cuisine, salle de bain, bureau,
         jardin, balcon, fenêtre, porte, table, chaise, lit, armoire, habiter, louer
  Dialogue scene: Describing your new apartment to a friend
  Grammar tip: "Il y a ___" to describe what exists in a place
  Exercises: match room to French | fill blank | word order | MCQ

U7 — Daily Routine & Regular Verbs (estimated_minutes: 14)
  Vocab: se lever, se coucher, travailler, manger, partir, arriver, commencer,
         finir, rentrer, dormir, matin, soir, tous les jours, d'abord, ensuite, enfin
  Dialogue scene: Two colleagues comparing their morning routines
  Grammar tip: Regular -ER verb present tense conjugation (je parle, tu parles…)
  Exercises: match verb to English | fill blank with correct conjugation | word order | MCQ

U8 — Transport & Directions (estimated_minutes: 13)
  Vocab: bus, métro, train, taxi, vélo, voiture, à pied, station, arrêt,
         gauche, droite, tout droit, prendre, descendre, traverser, près de, loin de
  Dialogue scene: Asking a stranger for directions to the train station
  Grammar tip: Imperative mood for directions — "Tournez à gauche", "Prenez le bus"
  Exercises: match transport to English | fill blank | word order | MCQ

U9 — Weather & Seasons (estimated_minutes: 10)
  Vocab: soleil, pluie, neige, nuage, vent, chaud, froid, temps, météo,
         printemps, été, automne, hiver, aujourd'hui, demain, il fait, il y a
  Dialogue scene: Small talk about the weather in Montréal in winter
  Grammar tip: Weather expressions with "Il fait ___" and "Il y a ___"
  Exercises: match weather word to English | fill blank | word order | MCQ

U10 — Hobbies & Free Time (estimated_minutes: 12)
  Vocab: aimer, adorer, détester, préférer, jouer, lire, regarder, écouter,
         sport, musique, cinéma, lecture, cuisine, voyage, weekend, temps libre, loisir
  Dialogue scene: Two friends planning a weekend activity
  Grammar tip: "J'aime + infinitive" — expressing likes and dislikes
  Production task: "Write 3 sentences about your hobbies using j'aime, j'adore, je déteste."
  Exercises: match hobby to English | fill blank | word order | MCQ

Write complete valid JSON for all 5 files. Each vocab card must have word, translation,
example sentence (French), and example_translation (English).
```

---

### Prompt B9: Mobile Voice Recording → Whisper → AI Feedback (SpeakingCoachScreen)
```
Context: expo-mobile/src/screens/SpeakingCoachScreen.tsx is currently a stub — it shows 4
static prompts and a "Check speaking" button that returns hardcoded text. There is NO
microphone recording, NO Whisper transcription, and NO real AI feedback on mobile.

The backend already has all required endpoints:
  POST /api/oral/daily-speaking-prompt  → { promptFr, promptEn, topicLine }
  POST /api/oral/whisper                → accepts raw audio/webm binary → { transcript }
  POST /api/oral/analyze-transcript     → { transcript, level, promptFr } → full analysis

The web app (french-scorer-web) has a complete working pipeline in:
  src/components/VoiceRecorder.tsx      (MediaRecorder — web only, NOT reusable on mobile)
  src/pages/SpeakingLab.tsx             (full pipeline — web only)

Task: Rebuild SpeakingCoachScreen.tsx using expo-av Audio.Recording to replicate the
same pipeline on mobile.

---

## Step 1 — Permissions & Recording Setup

1. On screen mount, call Audio.requestPermissionsAsync() (expo-av).
   - If denied: show a permissions-denied state with a "Open Settings" button
     that calls Linking.openSettings().
   - If granted: show the main recording UI.

2. Configure audio mode before recording:
   Audio.setAudioModeAsync({
     allowsRecordingIOS: true,
     playsInSilentModeIOS: true,
   })

3. Recording options — use HIGH_QUALITY preset:
   Audio.RecordingOptionsPresets.HIGH_QUALITY
   - This produces .m4a/AAC on iOS and .webm/opus on Android.
   - Acceptable by OpenAI Whisper (supports m4a, mp4, webm, wav, etc.).

---

## Step 2 — Fetch AI-Generated Prompt

On screen mount (after permissions granted):
  - Call POST /api/oral/daily-speaking-prompt with { level: userLevel || 'A1' }
  - Display: promptFr (large, French, centered) + promptEn (smaller, grey, below)
  - topicLine shown as a subtitle badge (e.g. "Topic: Daily Life")
  - If API fails: fall back to the 4 existing static SPEAKING_PROMPTS strings.

---

## Step 3 — Record Button UI & State Machine

States: idle → recording → processing → result → idle (new prompt)

idle state:
  - Large circular red microphone button (centered)
  - Label: "Hold to speak" text below button
  - Min 5s / Max 90s recording enforced

recording state:
  - Button turns pulsing red with animated ring (use React Native Animated, no libraries)
  - Live duration timer: "0:12" counting up
  - "Release to stop" label
  - Auto-stop at 90 seconds

On stop:
  - recording.stopAndUnloadAsync() → get URI
  - Reset audio mode (allowsRecordingIOS: false)
  - Transition to processing state

processing state:
  - Show spinner + "Transcribing your French…" message

---

## Step 4 — Upload to Whisper

1. Read the recorded file:
   const response = await fetch(recordingUri)
   const audioBlob = await response.blob()

2. POST to /api/oral/whisper:
   - Method: POST
   - Headers: { 'Content-Type': 'audio/webm' }   (use 'audio/m4a' if iOS .m4a)
   - Body: raw binary (the blob / arrayBuffer)
   - Base URL: EXPO_PUBLIC_API_BASE_URL environment variable

3. On success: receive { transcript: string }
4. On failure: show retry button with error message "Transcription failed — try again"

Detect file extension from URI to set Content-Type correctly:
  uri.endsWith('.m4a') → 'audio/m4a'
  uri.endsWith('.webm') → 'audio/webm'
  default → 'audio/webm'

---

## Step 5 — Analyze Transcript

After Whisper returns transcript:
  - Update spinner message: "Analyzing your French…"
  - POST to /api/oral/analyze-transcript:
    {
      transcript: string,        // from Whisper
      level: userLevel,          // 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
      promptFr: string           // the prompt the user was responding to
    }
  - Response: SpeechAnalysisResult {
      tef_score: number,         // 0–900 scale
      fluency: string,           // e.g. "Moderate — some hesitations"
      pronunciation: string,     // e.g. "Good — clear vowels"
      liaisons: string,          // liaison feedback
      nasal_vowels: string,      // nasal vowel feedback
      strengths: string[],       // e.g. ["Good sentence structure", "Correct verb tense"]
      improvements: string[]     // e.g. ["Work on liaison in 'les amis'"]
    }

---

## Step 6 — Result Screen (inline, same screen)

Transition to result state — show a scrollable results card:

  ┌─────────────────────────────────────────┐
  │  Your Response:                         │
  │  "[transcript text here]"               │
  ├─────────────────────────────────────────┤
  │  TEF Score Estimate    [ 420 / 900 ]    │
  │  ████████░░░░░░░░  (progress bar)       │
  ├─────────────────────────────────────────┤
  │  Fluency          Moderate              │
  │  Pronunciation    Good                  │
  │  Liaisons         Needs practice        │
  │  Nasal Vowels     Good                  │
  ├─────────────────────────────────────────┤
  │  ✅ Strengths                           │
  │  • Good sentence structure              │
  │  • Correct verb tense usage             │
  ├─────────────────────────────────────────┤
  │  🔧 Improvements                       │
  │  • Work on liaison in "les amis"        │
  │  • Slow down on complex sentences       │
  ├─────────────────────────────────────────┤
  │  [ 🎙 Try Another Prompt ]              │
  └─────────────────────────────────────────┘

- "Try Another Prompt" resets to idle and fetches a new prompt from the API.
- TEF progress bar: map 0–900 to 0–100% width.
- Color code TEF score: <300 red, 300–599 amber, ≥600 green.

---

## Step 7 — Persist Attempt to SQLite

After successful analysis, save to existing user_score_events table:
  INSERT INTO user_score_events (
    user_id, score, cecr_level, provider, scored_at, skill
  ) VALUES (
    userId,
    Math.round(result.tef_score / 9),  -- normalize 0–900 → 0–100
    userLevel,
    'whisper+gemini',
    now(),
    'speaking'
  )

Use the existing database insert pattern from src/database/database.ts.
Do NOT create a new table — user_score_events already tracks all skill scores.

---

## Step 8 — User Level Selector

Add a small level pill row at the top of the screen (below the topic badge):
  [ A1 ] [ A2 ] [ B1 ] [ B2 ] [ C1 ]
  - Tapping selects the active level (highlight in primary color)
  - Default: read from existing user progress (highest completed level) or A1
  - Selected level is passed to both /api/oral/daily-speaking-prompt and /api/oral/analyze-transcript

---

## Technical Requirements

- Use only expo-av (already installed) for recording — no new audio packages
- Use fetch() for all API calls — no axios
- All API calls use EXPO_PUBLIC_API_BASE_URL base URL
- NativeWind for all styling — no StyleSheet.create()
- Handle network errors gracefully: show retry buttons, never crash
- Clean up recording on unmount: if (recording) recording.stopAndUnloadAsync()
- TypeScript throughout — define SpeechAnalysisResult interface in the file
- Keep existing navigation structure intact (screen is already registered in the navigator)
```

---

### Prompt B10: Reading Room — TTS Dictation + Interleaved Paragraph Format
```
Context: The Reading Room has two problems on both mobile and web:

PROBLEM 1 — No dictation (TTS):
   Mobile: ReadingRoomScreen.tsx never calls frenchExpoTts.ts — there is NO "listen" button.
   Web:    ReadingRoom.tsx has an "Écouter la page" button but it requires a real audioUrl from
               the story payload. If audioUrl is null (common), it only runs a fake mock timer with
               no actual speech.

PROBLEM 2 — Wrong layout:
   Mobile: Passages have only French text — no English translation at all. No toggle exists.
   Web:    Translation toggle exists but shows ALL French sentences in one block, then ALL
               English sentences in a separate block below (two separate panels). User wants:
               1 French paragraph → 1 English paragraph (interleaved), English only visible when
               the translation toggle is ON.

---

## Part A — Mobile: Update readingPassages.ts data structure

Extend the ReadingPassage type and update PASSAGES data to support:
1. Multi-paragraph passages (each level gets 2–3 passages, each 2–3 paragraphs long)
2. Each paragraph has both fr and en text

New type:
```ts
export type ReadingParagraph = {
   fr: string   // French paragraph text (2–4 sentences)
   en: string   // English translation of that paragraph
}

export type ReadingPassage = {
   title: string
   paragraphs: ReadingParagraph[]   // ← replaces the old flat `text: string`
   question: string
   answer: string
}
```

Rewrite PASSAGES with fuller content — each level should have at least 2 passages,
each passage at least 2 paragraphs:

A1 examples:
- "Au café": 2 paragraphs (ordering, paying) — natural, simple French
- "À l'école": 2 paragraphs (arriving, meeting classmates)

A2 examples:
- "Une journée de travail": 2 paragraphs
- "Le weekend": 2 paragraphs

B1–C1: 2–3 paragraphs each, increasing complexity.

Keep Canadian/Québec-friendly French. Write real paragraphs (not 1-sentence stubs).

---

## Part B — Mobile: Refactor ReadingRoomScreen.tsx

1. Replace the current text rendering with interleaved paragraph layout:

    For each paragraph in passage.paragraphs:
    ┌─────────────────────────────────┐
    │  [French paragraph text]        │  ← always visible, text-slate-900
    │                                 │
    │  [English paragraph text]       │  ← only visible when translationOn === true
    │  (italic, text-slate-500)       │     hidden (opacity-0 / display:none) when off
    └─────────────────────────────────┘
    Separator line between paragraphs (border-b border-slate-100)

2. Add a translation toggle button in the header row:
    - Label: "Translation" (same style as other header pills)
    - State: translationOn (boolean, default false)
    - When OFF: English paragraphs are hidden
    - When ON: English paragraphs appear below each French paragraph

3. Add a "Listen" / TTS button:
    - Appears in the header next to the Translation toggle
    - Icon: speaker / headphones emoji or Ionicons icon
    - On press:
       a. Concatenate all French paragraphs: passage.paragraphs.map(p => p.fr).join(' ')
       b. Check isFrenchCloudTtsConfigured() from src/lib/frenchExpoTts.ts
            - If configured: call speakFrenchListening(fullText)
            - If NOT configured: show a Toast/Alert: "TTS not available — set EXPO_PUBLIC_API_BASE_URL"
       c. While speaking: button shows "Stop" — pressing it calls stopFrenchExpoTts()
       d. Button returns to "Listen" when audio finishes
    - Disable the button while audio is loading (show a small ActivityIndicator)

4. Keep the existing level selector (A1/A2/B1/B2/C1) pills at the top — no change.

5. Keep the comprehension Q&A card below the passage — no change.

6. State to manage:
    - translationOn: boolean (default false)
    - isSpeaking: boolean (for button toggle)
    - isTtsLoading: boolean (for spinner while fetching TTS)

7. Cleanup on unmount or when level changes: call stopFrenchExpoTts() to cancel any
    in-flight audio.

---

## Part C — Web: Fix ReadingRoom.tsx interleaved layout

The web story uses sentences[] (not paragraphs) with { fr: string, en: string }.
Group sentences into visual paragraphs by inserting a paragraph break every 3 sentences.

Change the story text rendering from two separate blocks:
   [Block 1: all French sentences]
   [Block 2: all English sentences — opacity 25% when translationOn is false]

To interleaved pairs — one group per 3 sentences:
   ┌─────────────────────────────────┐
   │  [French sentence 1]            │
   │  [French sentence 2]            │
   │  [French sentence 3]            │
   ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤  ← only visible when translationOn
   │  [English sentence 1]           │
   │  [English sentence 2]           │
   │  [English sentence 3]           │
   └─────────────────────────────────┘
   [next group of 3...]

Implementation:
1. Group story.sentences into chunks of 3:
    const chunks = chunk(story.sentences, 3)   // write a simple chunk() helper

2. For each chunk, render:
    - French sentences (always visible) — keep existing click-to-select + grammar marker behavior
    - English sentences block below (only rendered/visible when translationOn === true)
       shown with: italic text-slate-500, border-l-2 border-indigo-200 pl-3

3. When translationOn toggles:
    - English blocks animate in/out with a CSS transition (opacity + max-height)
    - Do NOT simply toggle opacity to 25% — fully hide/show them so they don't take up space
       when translation is off. Use: translationOn ? 'block' : 'hidden' (Tailwind class)

4. The audio player bar at the bottom of the English panel stays in its current position.
    Sentence highlighting still works (highlightIdx tracks the active sentence globally).
    Active French sentence: bg-sky-100 ring
    Active English sentence: font-semibold italic text-indigo-700

5. Keep both the "Écouter la page" header button AND the bottom player bar.
    When audioUrl is null (no real audio file), the "Écouter la page" button should
    call the TTS API as a fallback:
       - POST to /api/tts/french with { text: story.sentences.map(s => s.fr).join(' ') }
       - Play the returned MP3 via an Audio() element
       - Show "Chargement…" on the button while fetching
    This gives real dictation even on stories without pre-recorded audio.

---

## Summary of files to modify

Mobile:
   expo-mobile/src/content/readingPassages.ts   ← new type + fuller passage data
   expo-mobile/src/screens/ReadingRoomScreen.tsx ← interleaved layout + TTS button

Web:
   french-scorer-web/src/components/reading/ReadingRoom.tsx ← chunk layout + TTS fallback

Do NOT change the story data source (StoryMatcher / loadDailyStoryForUserLevel) for web —
only change how sentences are grouped and rendered in the UI.
```
