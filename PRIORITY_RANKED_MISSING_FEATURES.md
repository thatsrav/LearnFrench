# 🎯 PRIORITY RANKED MISSING FEATURES
## Single Ranked List for Implementation

**Format:** `[Rank]. [Feature] | Effort (hrs) | Impact | Category`

---

## 🔥 CRITICAL (Week 1) - Foundation for engagement

1. **Daily Challenges** | 40 hrs | ⭐⭐⭐⭐ | Engagement
   - 3 daily micro-challenges (vocab quiz, writing, listening)
   - Streak tracking & rewards (3-day = 10pts, 7-day = 50pts)
   - Push notifications at 9 AM
   - HomeScreen integration

2. **Achievement Badges** | 30 hrs | ⭐⭐⭐⭐ | Motivation
   - 10+ badge types (Grammar Master, Fluency Sprint, etc.)
   - Progress tracking toward unlocked badges
   - UserAchievementsScreen
   - Trophy icon next to username

3. **Enhanced Leaderboard** | 20 hrs | ⭐⭐⭐ | Social
   - Weekly/monthly rankings
   - Category views (Score Leaders, Most Active, Best Streak)
   - User percentile ranking
   - Friend comparison support

---

## 📱 HIGH (Week 2) - Core experience gaps

4. **Mobile Audio Player** | 25 hrs | ⭐⭐⭐⭐ | Learning
   - React Native audio component (expo-av)
   - Play/pause/replay, progress bar, speed control
   - Answer gating (disable submit until audio plays)
   - Transcript reveal toggle

5. **Mobile Listening Practice Screen** | 20 hrs | ⭐⭐⭐⭐ | Learning
   - Integrate AudioPlayer with TefPrepActivityScreen
   - Question display, answer submission
   - Score display & review
   - Makes TEF listening available on mobile

6. **Lesson Step Navigation (LessonScreen Modernization)** | 40 hrs | ⭐⭐⭐⭐ | UX
   - Multi-step lesson flow (vocab → dialogue → grammar → practice)
   - VocabIntroStep (swipeable flashcards)
   - DialogueStep (chat bubble scenes)
   - GrammarTipStep (focused rule explanation)
   - PracticeStep container with exercise types

7. **Practice Exercise Components** | 50 hrs | ⭐⭐⭐⭐ | UX
   - MatchPairsExercise (drag pairs)
   - FillBlankExercise (conjugation fill)
   - WordOrderExercise (reorder words)
   - Inline feedback & hints
   - Score calculation

8. **Weak Area Display (UI for existing service)** | 10 hrs | ⭐⭐⭐ | Personalization
   - HomeScreen card: "Your Weak Areas" (top 3 topics)
   - Click-through to recommended lesson
   - Sync with weakAreaDetection service

9. **Spaced Repetition Daily Card (UI for existing library)** | 8 hrs | ⭐⭐⭐ | Personalization
   - HomeScreen: "Daily Review: 3 items due"
   - Due count badge on SpacedReviewScreen tab
   - Get items from existing getReviewItems()

10. **Error Pattern Visualization** | 12 hrs | ⭐⭐⭐ | Learning
    - WritingJournalScreen Insights: Error frequency chart
    - Link each error to relevant lesson
    - "Top repeated errors" ranked list

---

## 🎨 MEDIUM (Week 3) - Content & UX polish

11. **A1 Content Rewrite (New JSON Schema)** | 30 hrs | ⭐⭐⭐ | Content
    - Rewrite all 10 A1 units to new step-based schema
    - 6-10 vocab cards per unit (with examples)
    - 1 authentic dialogue per unit (3-5 turns)
    - 1 grammar tip per unit
    - 4 exercise types per unit (match, fill, word order, MCQ)
    - Production task (writing/speaking prompt)

12. **Lesson Recommendations UI (for existing service)** | 12 hrs | ⭐⭐⭐ | Personalization
    - HomeScreen "Daily Lesson Plan" (top 3 recommendations)
    - Rationale for each: "Targets your weak area in verb tenses"
    - Click to start lesson

13. **Voice Journal** | 35 hrs | ⭐⭐⭐ | Speaking
    - VoiceJournalScreen tabs: Record, History, Progress
    - Persistent storage of voice recordings
    - Transcription + AI analysis
    - Progress tracking (score trending)
    - Compare pronunciation over time

14. **Offline Content Packs** | 40 hrs | ⭐⭐⭐ | Accessibility
    - Select lessons to download as bundles
    - Local storage management
    - Download progress tracking
    - Offline lesson playback
    - Sync when back online

15. **Real Audio Content for TEF** | 40 hrs | ⭐⭐⭐ | Content
    - Record/source actual MP3/OGG files
    - CDN hosting
    - Update listeningContent.ts URLs
    - Include speaker info & transcripts
    - Multiple accent options (Quebec, France, Belgium)

16. **Visual Syllabus Path (Busuu-style)** | 20 hrs | ⭐⭐ | UX
    - Zigzag path visualization (nodes left/right alternating)
    - Circular nodes: completed (green ✓), available (blue pulse), locked (grey 🔒)
    - Vertical connecting line
    - Level badges between units (A1, A2, B1)
    - XP summary at top

17. **Writing Feedback Display** | 15 hrs | ⭐⭐ | Learning
    - JournalEntryDetailScreen: Show detailed feedback text
    - Highlight grammar errors in composition
    - Display AI suggestions inline
    - Show error categories with corrections

---

## 🚀 ADVANCED (Week 4+) - Feature expansion

18. **Conversation Simulator** | 45 hrs | ⭐⭐⭐ | Speaking
    - 4 scenario templates (Restaurant, Job Interview, Travel, Casual Chat)
    - Turn-based dialogue (max 8 turns)
    - AI-generated scenario prompts
    - Feedback per turn (grammar, vocab, pronunciation, fluency)
    - Transcript + summary score

19. **Mock Exam (Full TEF Simulation)** | 60 hrs | ⭐⭐⭐ | Test Prep
    - Full-length practice (165 min = Reading 50 + Writing 60 + Listening 40 + Speaking 15)
    - Section-by-section scoring
    - CLB band prediction
    - Weakness analysis per section
    - Percentile ranking
    - Detailed report generation

20. **Sound Effects & Gamification Audio** | 8 hrs | ⭐⭐ | Engagement
    - Correct answer sound
    - Incorrect answer sound
    - Achievement unlock sound
    - Level-up sound
    - Daily challenge complete sound
    - Mute/unmute toggle in settings

21. **Home Screen Widgets** | 35 hrs | ⭐⭐⭐ | Accessibility
    - Streak counter widget (🔥 7-day streak)
    - Daily lesson preview (clickable to lesson)
    - Writing score sparkline (↑ +8 pts this week)
    - Quick vocab quiz (MCQ answer on widget)
    - Achievement progress (2/5 toward badge)

22. **Admin CMS Interface** | 70 hrs | ⭐⭐⭐ | Operations
    - Admin-only dashboard (french-scorer-web/admin/)
    - Lesson CRUD (grammar, vocab, quiz creation)
    - Content upload (passages, images, audio)
    - User management & analytics view
    - A/B testing setup
    - Audit logging

23. **User Analytics Dashboard** | 40 hrs | ⭐⭐⭐ | Insights
    - Analytics events table
    - Cohort analysis reports
    - Churn detection (users inactive N+ days)
    - Learning trend visualization
    - Feature adoption metrics
    - Actionable insights per user

24. **Live Tutoring Marketplace Backend** | 80 hrs | ⭐⭐ | Premium
    - Tutor profile system
    - Availability calendar
    - Stripe payment integration
    - Twilio/Jitsi video setup
    - Session recording & storage
    - Review/rating system

25. **Pronunciation Guide** | 50 hrs | ⭐⭐⭐ | Speaking
    - Record user pronunciation
    - Compare waveform to native speaker
    - Phonetic breakdown (liaisons, nasal vowel feedback)
    - Word-by-word scoring
    - Progress tracking

---

## 💎 NICE-TO-HAVE (Polish & beyond)

26. **Accessibility Features** | 20 hrs | ⭐⭐
    - Dark mode theme
    - Dyslexia-friendly font (OpenDyslexic option)
    - Text-to-speech for lessons
    - High contrast mode

27. **User Profiles & Social** | 40 hrs | ⭐⭐
    - Public profile (bio, study goals, milestones)
    - Friend system
    - Discussion forums
    - Study group creation

28. **Content Enhancement** | 25 hrs | ⭐⭐
    - Idiom collections by context
    - False friends (confused word pairs)
    - Irregular verb reference
    - Grammar exception guide
    - Québec vs European French notes

29. **Personalization Settings** | 15 hrs | ⭐⭐
    - Learning style preference (visual/auditory/kinesthetic)
    - Study pace adjustment
    - Interest-based content (topics: food, travel, business)
    - Target exam selection (TEF, DELF, TCF)

30. **Advanced Analytics** | 25 hrs | ⭐⭐
    - Learning curve analysis (improvement rate)
    - Study session patterns (focus time, best time of day)
    - Vocabulary retention metrics (items known/forgotten)
    - Comparative leaderboard (vs similar learners)

---

## 📊 EFFORT SUMMARY

| Category | Hours | % of Total |
|----------|-------|-----------|
| Critical (1-3) | 90 | 10% |
| High (4-10) | 235 | 26% |
| Medium (11-17) | 285 | 32% |
| Advanced (18-25) | 513 | 57% |
| Nice-to-have (26-30) | 130 | 15% |
| **TOTAL** | **1253** | **100%** |

**Timeline:**
- **Week 1 (40 hrs):** Daily Challenges, Achievements, Enhanced Leaderboard
- **Week 2 (80 hrs):** Mobile listening, weak areas, lesson modernization
- **Week 3 (90 hrs):** Content rewrite, voice journal, offline packs
- **Week 4 (100 hrs):** Advanced features (simulator, mock exam)
- **Ongoing:** Polish, analytics, widgets, CMS

**Team Estimate:**
- Solo developer: 6-8 months
- 2-person team: 3-4 months
- 3-person team: 2-3 months

---

## ✅ QUICK WINS (1-2 days each)

Skip the big features? Try these 30-min to 4-hour tasks for immediate user value:

1. Weak Areas display (8 hrs) - service exists, just UI
2. Spaced review due count (6 hrs) - badge on HomeScreen
3. Error chart (10 hrs) - visualize existing analyzer data
4. Achievement unlock toast (4 hrs) - notification popup
5. Sound effects toggle (4 hrs) - mute/unmute in settings
6. Lesson completion animation (5 hrs) - celebrate finish
7. Streak fire icon emphasis (3 hrs) - visual polish
8. Reading passage difficulty labels (2 hrs) - UX clarity

**Total:** ~52 hours = **1 week** of visible improvements with zero new complexity

---

## 🎯 RECOMMENDED EXECUTION STRATEGY

### Phase 1: Quick Wins → Validation Loop (Week 1)
- Implement critical trio: Achievements + Daily Challenges + Leaderboard
- Measure engagement: DAU, retention, feature adoption
- Gather user feedback

### Phase 2: Learning Experience (Week 2-3)
- Mobile audio + listening practice
- Lesson step navigation + exercises
- A1 content rewrite
- **Validation:** Writing quality, lesson completion rates, retention

### Phase 3: Personalization (Week 4)
- Voice journal + offline packs
- Recommendations UI
- Weak area targeting
- **Validation:** Feature adoption, learning outcome improvement

### Phase 4: Advanced (Week 5+)
- Conversation simulator + mock exams
- Admin CMS
- Analytics dashboards
- **Validation:** TEF test score improvements, user satisfaction

---

## 🚨 BLOCKERS & GOTCHAS

1. **Audio files missing** → Kills listening feature
   - *Action:* Record/source immediately or release with TTS placeholder

2. **Mobile listening player not in roadmap** → Users can't use on mobile
   - *Action:* Prioritize AudioPlayer (high ROI, 25 hrs)

3. **Lesson schema breaking change** → Content migration needed for A2-C1
   - *Action:* Version schema, support both formats initially, plan migration

4. **Database performance** → Large score histories slow queries
   - *Action:* Index user_id + timestamps, implement pagination, cache hotspots

5. **Offline sync conflicts** → Edited offline + online = merge needed
   - *Action:* Last-write-wins strategy, or timestamp-based conflict marker

---

## 📋 RECOMMENDED NEXT STEPS

**THIS WEEK:**
- [ ] Review report with team
- [ ] Pick Week 1 features (Challenges, Badges, Leaderboard)
- [ ] Estimate story points per feature
- [ ] Set up sprint board

**NEXT WEEK:**
- [ ] Sprint 1 kickoff: Challenges + Badges (parallel tracks)
- [ ] Record demo requirements for each feature
- [ ] Plan Week 2 audio work (parallel preparation)

**ONGOING:**
- [ ] Weekly engagement metrics review
- [ ] User feedback surveys
- [ ] Technical debt assessment
- [ ] Capacity adjustment based on team velocity

