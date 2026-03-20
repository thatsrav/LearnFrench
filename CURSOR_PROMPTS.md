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
