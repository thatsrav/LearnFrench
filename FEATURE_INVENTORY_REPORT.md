# 🇫🇷 French Learning App - Comprehensive Feature Inventory
**Report Date:** March 22, 2026  
**Workspace:** /Users/thats_rav/Documents/French  
**Apps Analyzed:** expo-mobile (mobile), french-scorer-web (web), french-scorer-api (backend), supabase (database)

---

## EXECUTIVE SUMMARY

This French learning app is **50% complete** with solid foundational features in place:
- ✅ Core learning flows working (lessons, quizzes, writing feedback)
- ✅ AI scoring and speaking coach fully functional
- ✅ Spaced repetition system ready
- ✅ Conjugation Codex game (advanced grammar practice)
- ✅ Writing Journal with error analysis
- ❌ Gamification missing (achievements, daily challenges)
- ❌ Mobile listening practice incomplete
- ❌ Advanced personalization features not built

**Critical path to MVP+1:** Implement the 20 missing features in priority order.

---

## 1. FULLY IMPLEMENTED FEATURES ✅ (22 items)

### A. CORE APPLICATIONS
| Component | Status | Details |
|-----------|--------|---------|
| **expo-mobile (React Native)** | ✅ | Main mobile app, 14 screens |
| **french-scorer-web (React)** | ✅ | Web companion, 14 pages |
| **french-scorer-api (Node.js)** | ✅ | AI scoring backend, Whisper transcription |
| **Supabase DB** | ✅ | Cloud sync, auth, data persistence |

### B. AUTHENTICATION & SYNC
| Feature | Screens | Status |
|---------|---------|--------|
| **Email/Google Auth** | AccountScreen (mobile), AccountPage (web) | ✅ Full |
| **Bidirectional Cloud Sync** | Automatic + manual buttons | ✅ Full |
| **Local SQLite Cache** | All data stores locally first | ✅ Full |
| **RLS Policies** | Supabase | ✅ Secure |

### C. LEARNING CONTENT (MOBILE)
| Screen | Content | Status |
|--------|---------|--------|
| **SyllabusScreen** | 10 seed units (A1-A2) | ✅ Full |
| **LessonScreen** | Grammar + vocab + MCQ quiz | ✅ Full |
| **ReadingRoomScreen** | 5 passages (A1-C1) | ✅ Full |
| **UnitOverviewScreen** | Lesson grid per module | ✅ Full |
| **TefPrepHubScreen** | 10 A1 prep units | ✅ Full |
| **TefPrepUnitScreen** | 4 skill rooms selector | ✅ Full |
| **TefPrepActivityScreen** | Reading/Writing/Listening/Speaking tasks | ✅ Full (listening uses web player) |

### D. WRITING PRACTICE (FULLY IMPLEMENTED)
| Screen | Feature | Status |
|--------|---------|--------|
| **Home/WritingArea** | Text + voice input | ✅ Full |
| **AI Scoring** | Grammar/vocab/pronunciation/fluency breakdown | ✅ Full |
| **Multiple Providers** | Auto/Gemini/Groq/OpenAI/Claude with routing | ✅ Full |
| **WritingJournalScreen** | Compose, My Entries, Insights tabs | ✅ Full |
| **Error Analysis** | Recurring mistake detection | ✅ Full |
| **Score Trends** | 30-day chart visualization | ✅ Full |
| **JournalEntryDetailScreen** | Full entry + feedback display | ✅ Full |

### E. SPEAKING PRACTICE (REAL IMPLEMENTATION)
| Feature | Details | Status |
|---------|---------|--------|
| **Voice Recording** | expo-av (works offline) | ✅ Full |
| **Transcription** | Groq Whisper + OpenAI fallback | ✅ Full |
| **AI Analysis** | Grammar, pronunciation, fluency, liaison feedback | ✅ Full |
| **TEF Scoring** | Predicted CLB band | ✅ Full |
| **4 Rotating Prompts** | A1-C1 difficulty levels | ✅ Full |
| **SpeakingCoachScreen** | Complete flow with results display | ✅ Full |

### F. GAMIFICATION (PARTIAL)
| Feature | Status | Details |
|---------|--------|---------|
| **Writing Score Tracking** | ✅ Full | All submissions logged with CECR |
| **Leaderboard (Basic)** | ✅ Full | Top 10 scores on LeaderboardScreen |
| **Unit Unlocking** | ✅ Full | 80% score requirement + sequential progression |
| **Daily Streaks** | ✅ Full | Computed from score events |
| **CECR Level Mapping** | ✅ Full | A1-C1 from scores |

### G. SPACED REPETITION
| Component | Status | Details |
|-----------|--------|---------|
| **SM2 Algorithm** | ✅ Full | Complete implementation in lib/spacedRepetition.ts |
| **SQLite Storage** | ✅ Full | spaced_repetition_items table |
| **SpacedReviewScreen** | ✅ Full | Flip cards, mark as remembered/forgot |
| **Next Review Calculation** | ✅ Full | Based on quality (1-5) |
| **Database Integration** | ✅ Full | Sync with Supabase |

### H. GRAMMAR GAMES - CONJUGATION CODEX
| Phase | Features | Status |
|-------|----------|--------|
| **Phase 1: Discovery** | Pattern discovery through dialogues | ✅ Full |
| **Phase 2: Rule Master** | Context questions (narrative + fill blank) | ✅ Full |
| **Phase 3: Master's Guild** | SRS-based daily reviews | ✅ Full |
| **Admin Interface** | Edit conjugations, add verbs/questions | ✅ Full |
| **Data Bundle** | conjugations.json with 900+ questions | ✅ Full |

### I. LISTENING (WEB ONLY)
| Feature | Component | Status |
|---------|-----------|--------|
| **Audio Player** | WebListeningAudioPlayer.tsx | ✅ Full (web only) |
| **Answer Gating** | After audio plays only | ✅ Full |
| **Speed Control** | 0.8x, 1.0x, 1.2x | ✅ Full |
| **Transcript Toggle** | Show/hide text | ✅ Full |
| **TEF Practice** | TefPrepActivityPage listening tasks | ✅ Full |

### J. SERVICES IMPLEMENTED
| Service | Location | Features | Status |
|---------|----------|----------|--------|
| **WritingJournalService** | database/ | CRUD, filters, score trends | ✅ Full |
| **ErrorPatternAnalyzer** | services/ | Error categorization, pattern detection | ✅ Full |
| **WeakAreaDetection** | services/ | Performance analysis by topic | ✅ Full |
| **SpacedRepetition** | lib/ | SM2 scheduling | ✅ Full |
| **RecommendationEngine** | services/ | Lesson suggestions | ✅ Full |
| **SyllabusService** | database/ | Unit management | ✅ Full |
| **SoundEffects** | services/ | Correct/incorrect feedback audio | ✅ Full |

### K. UI/UX COMPONENTS
| Component | Technology | Status |
|-----------|------------|--------|
| **NativeWind** | Tailwind for React Native | ✅ Full |
| **Icons** | Expo vector icons + Lucide | ✅ Full |
| **Animations** | React Native Animated | ✅ Full |
| **Gesture Handlers** | Swipeable cards | ✅ Full |

### L. DATABASE SCHEMA
| Table | Status | Fully Modeled |
|-------|--------|---------------|
| `writing_entries` | ✅ | title, content, created_at, draft, category |
| `writing_scores` | ✅ | overall, grammar, vocab, pronunciation, fluency, CECR, provider |
| `writing_feedback` | ✅ | feedback_text, error_examples, suggestions |
| `spaced_repetition_items` | ✅ | next_review, ease_factor, interval, repetitions |
| `user_unit_progress` | ✅ | status, score, synced to cloud |

---

## 2. PARTIALLY IMPLEMENTED FEATURES ⚠️ (5 items)

### A. LESSON FLOW MODERNIZATION
**Status:** 40% complete
- ✅ Current state: Basic grammar text + vocabulary list + MCQ quiz
- ❌ Missing: Multi-step lesson flow
  - No VocabIntroStep (swipeable flashcards)
  - No DialogueStep (chat bubble scenes)
  - No GrammarTipStep (focused rule explanation)
  - No PracticeStep with exercise types (match pairs, fill blank, word order)
  - No inline spaced repetition after lesson completion

**Location:** expo-mobile/src/screens/LessonScreen.tsx (89 lines, needs refactoring)

**Documentation:** CURSOR_PROMPTS.md Prompts B2-B5 describe desired implementation

### B. LESSON CONTENT SCHEMA
**Status:** 30% complete
- ✅ Current: Old schema (grammar_rule_text, vocab_list array, quiz MCQ)
- ❌ Missing: New Busuu-style schema with:
  - `steps[]` array (vocab_intro, dialogue, grammar_tip, practice)
  - Vocabulary cards with examples
  - Dialogue turns with translations
  - Grammar tips with examples
  - Practice exercises (match, fill blank, word order, MCQ)

**Files Needing Rewrite:**
- expo-mobile/assets/syllabus/a1_u1.json through a1_u10.json
- french-scorer-web/src/content/syllabus/a1_u1.json through a1_u10.json

**Example New Schema:** CURSOR_PROMPTS.md Prompts B7-B8

### C. LISTENING SUPPORT (MOBILE)
**Status:** 20% complete
- ✅ Current: Web has WebListeningAudioPlayer (web only)
- ❌ Missing: Mobile listening player
  - No expo-av audio player component
  - No progress tracking with audio segments
  - TEF listening not accessible on mobile
  - TefPrepActivityScreen doesn't handle audio playback

**Location:** expo-mobile/src/screens/TefPrepActivityScreen.tsx (needs audio player)

**Documentation:** CURSOR_PROMPTS.md Prompts 3.2-3.3

### D. VOICE JOURNAL FEATURE
**Status:** 5% complete
- ✅ Current: SpeakingCoachScreen records + analyzes one-off
- ❌ Missing:
  - No persistent voice recording storage
  - No voice clip history
  - No replay of past recordings
  - No voice journal screen
  - No voice entry metadata (prompt used, score)

**Documentation:** CURSOR_PROMPTS.md Prompt 7.2

### E. TEF PREP PROGRESS TRACKING
**Status:** 50% complete
- ✅ Current: Database table exists, scores saved
- ❌ Missing:
  - Advanced analytics per skill
  - Performance breakdown visualization
  - Recommendation for weak areas
  - Mock exam simulation

**Database:** TefPrepProgressService exists but minimal

---

## 3. NOT IMPLEMENTED FEATURES ❌ (23 items)

### QUICK WINS - CRITICAL ENGAGEMENT DRIVERS

#### 1. Daily Challenges ⭐⭐⭐
**Priority:** CRITICAL (drives daily engagement)
**Documentation:** CURSOR_PROMPTS.md Prompt 4.1
**What's needed:**
- Vocabulary quiz (5 words, 60 seconds)
- Writing prompt (1-2 sentences, 2 minutes)
- Listening snippet (30 seconds, MCQ, 1 minute)
- Streak tracking (refresh daily at 12 AM user timezone)
- Points/rewards (3-day = 10 pts, 7-day = 50 pts)
- Push notification at 9 AM
- **DailyChallengesCard on HomeScreen**

**Effort:** ~40 hours (service + component + notifications)

#### 2. Achievement Badges ⭐⭐⭐
**Priority:** CRITICAL (motivation)
**Documentation:** CURSOR_PROMPTS.md Prompt 4.2
**Badges to implement (10+):**
- Grammar Master: 5 lessons ≥90%
- Fluency Sprint: 3 consecutive lessons ≥80%
- Reading Racer: 5 reading practices in 1 week
- Speaking Star: 10 speaking attempts
- Writing Warrior: 10 journal entries
- 7-Day Streak: Maintain streak
- Century: Score 100 on writing
- Polyglot: Reach B1
- Perfect Week: ≥80% on all week's lessons
- Consistency: 30-day login streak

**Database table:** achievements (id, badge_id, user_id, earned_at)

**Components:**
- UserAchievementsScreen (grid of earned/locked badges)
- Achievement progress tracking
- Trophy icon next to username

**Effort:** ~30 hours (badges + database + UI)

#### 3. Enhanced Leaderboard ⭐⭐⭐
**Priority:** HIGH (social engagement)
**Documentation:** CURSOR_PROMPTS.md Prompt 4.3
**Features:**
- All-time rankings
- Weekly rankings (auto-reset Monday)
- Monthly rankings
- Categories: Score Leaders, Most Active, Best Streak, Fastest Learner, Lesson Master
- User rank + percentile
- Friend comparisons (requires friend list)

**Components:**
- Multi-tab LeaderboardScreen
- Dropdown for category switching
- Period selector (all-time, this week, this month)

**Effort:** ~20 hours (service + UI + caching)

### PRIORITY 1: ADAPTIVE LEARNING

#### 4. Weak Area Detection UI Integration
**Status:** Service exists (services/weakAreaDetection.ts), UI missing
**What's needed:**
- HomeScreen card: "Your weak areas" with top 3 topics
- Clickable link to target lesson for each weak area
- Refresh button to recalculate
- Visual score indicator per topic

**Effort:** ~10 hours (UI only, logic exists)

#### 5. Spaced Repetition Daily Scheduler
**Status:** Library exists, daily UI missing
**What's needed:**
- HomeScreen card: "Daily Review: 3 items due today"
- Quick link to SpacedReviewScreen
- Notification at recommended time
- Due count badge on tab

**Effort:** ~8 hours

#### 6. Personalized Lesson Recommendations UI
**Status:** Service exists (services/recommendationEngine.ts), UI missing
**What's needed:**
- HomeScreen: "Daily Lesson Plan" section
- Top 3 recommended lessons with rationale
- "Why recommended" explanation
- Click-through to lesson

**Effort:** ~12 hours

### PRIORITY 2: WRITING JOURNAL ENHANCEMENTS

#### 7. Error Pattern Visualization
**Status:** Analyzer implemented, display missing
**What's needed:**
- WritingJournalScreen Insights tab enhancement
- Error frequency histogram
- Link each error type to relevant lesson
- "Clear improvement" highlighting

**Effort:** ~12 hours

#### 8. Writing Feedback Display
**Status:** Feedback table exists, rendering missing
**What's needed:**
- JournalEntryDetailScreen: Show detailed feedback
- Highlight grammar errors in text
- Display suggestions inline
- AI-provided examples of corrections

**Effort:** ~15 hours

### PRIORITY 3: LISTENING & AUDIO

#### 9. Mobile Audio Player ⭐⭐
**Status:** 0% (web has it, mobile needs native)
**What's needed:**
- Expo-av wrapper component for React Native
- Play/pause/replay buttons
- Progress bar
- Speed adjustment (0.8x-1.2x)
- Transcript reveal toggle
- Answer gating (disable submit until audio plays)

**Components:**
- AudioPlayer.tsx (mobile)
- Integrate with TefPrepActivityScreen for listening tasks

**Effort:** ~25 hours

#### 10. Listening Practice Screen (Mobile)
**Status:** 0% (web works, mobile missing)
**What's needed:**
- Mobile version of listening practice page
- Load audio from listeningContent.ts
- AudioPlayer component
- Question area with radio buttons
- Submit/next question flow
- Score display on completion

**Effort:** ~20 hours (using AudioPlayer component)

#### 11. Real Audio Content
**Status:** Placeholder URLs only
**What's needed:**
- Actual MP3/OGG files for TEF listening units
- Host on CDN
- Update URLs in listeningContent.ts
- Include speaker info (Quebec/France/Belgium accents)
- Transcripts for review

**Effort:** ~40 hours (recording, transcription, hosting)

### ADVANCED FEATURES

#### 12. Conversation Simulator ⭐
**Documentation:** CURSOR_PROMPTS.md Prompt 5.1
**What's needed:**
- 4 scenario templates (Restaurant, Job Interview, Travel, Casual Chat)
- AI-generated scenario prompts
- Turn-based dialogue (max 8 turns)
- Feedback per turn (grammar, vocab, pronunciation, fluency)
- Conversation transcript + summary score
- Grade based on success criteria

**Technology:** Claude/OpenAI for turn-by-turn analysis

**Effort:** ~45 hours

#### 13. Mock Exam (Full TEF Simulation) ⭐
**Documentation:** CURSOR_PROMPTS.md Prompt 5.2
**What's needed:**
- Full-length practice test (165 min total)
- Reading (50 min), Writing (60 min), Listening (40 min), Speaking (15 min)
- Section-by-section scoring
- CLB band prediction
- Weakness analysis
- Percentile ranking
- Report generation

**Effort:** ~60 hours

#### 14. Voice Journal
**Documentation:** CURSOR_PROMPTS.md Prompt 7.2
**What's needed:**
- VoiceJournalScreen with tabs:
  - Record new entry
  - My Recordings (history)
  - Progress tracking
- Persistent storage of voice clips
- Transcription + scoring
- Compare pronunciation over time

**Effort:** ~35 hours

#### 15. Offline Content Packs
**Documentation:** CURSOR_PROMPTS.md Prompt 7.3
**What's needed:**
- Select lessons to download
- Bundle content + assets
- Offline storage management
- Sync progress when back online
- Conflict resolution (offline edits vs cloud)

**Effort:** ~40 hours

#### 16. Live Tutoring Backend
**Documentation:** CURSOR_PROMPTS.md Prompt 5.3
**What's needed:**
- Tutor marketplace UI
- Availability calendar
- Stripe payment integration
- Twilio/Jitsi video calling setup
- Session recording
- Review/rating system

**Effort:** ~80 hours (complex)

#### 17. Admin CMS
**Documentation:** CURSOR_PROMPTS.md Prompt 6.2
**What's needed:**
- Admin dashboard (french-scorer-web/src/admin/)
- Lesson CRUD (grammar, vocabulary, quiz)
- Content upload (passages, audio, images)
- User management
- A/B testing setup
- Audit logging

**Effort:** ~70 hours

#### 18. User Analytics Dashboard
**Documentation:** CURSOR_PROMPTS.md Prompt 6.1
**What's needed:**
- Analytics table (event_type, user_id, timestamp)
- Cohort analysis reports
- Churn detection (users inactive N+ days)
- Learning trend visualization
- Feature adoption metrics

**Effort:** ~40 hours

### MOBILE-SPECIFIC FEATURES

#### 19. Home Screen Widgets ⭐
**Documentation:** CURSOR_PROMPTS.md Prompt 7.1
**Widgets needed:**
- Streak counter (🔥 7-day)
- Daily lesson preview
- Writing score sparkline
- Quick vocab quiz (MCQ on widget)
- Achievement progress (2/5 towards badge)

**Tech:** react-native-home-screen-widgets or Expo integration

**Effort:** ~35 hours

#### 20. Pronunciation Guide
**Documentation:** PRONUNCIATION_AND_SOUND_EFFECTS_PROMPT.md
**What's needed:**
- Record user pronunciation
- Compare waveform to native speaker
- Phonetic breakdown (liaisons, nasal vowels)
- Detailed feedback per sound
- Progress tracking

**Effort:** ~50 hours

#### 21. Sound Effects & Gamification Audio
**Status:** 50% done (soundEffects service exists)
**What's needed:**
- Correct answer SFX (branch logic to sounds)
- Incorrect answer SFX
- Achievement unlock sound
- Level-up sound
- Daily challenge complete sound
- Mute/unmute toggle in settings

**Effort:** ~8 hours

#### 22. Visual Syllabus Path (Busuu-style)
**Documentation:** CURSOR_PROMPTS.md Prompt B6
**What's needed:**
- Replace flat list with zigzag path visualization
- Circular nodes (completed/available/locked states)
- Vertical connected line
- Pulse animation on available node
- Level badges between units
- XP summary at top

**Effort:** ~20 hours

#### 23. Lesson Step Navigation Components
**Documentation:** CURSOR_PROMPTS.md Prompts B2-B5
**Components needed:**
- VocabIntroStep (swipeable cards)
- DialogueStep (chat bubbles)
- GrammarTipStep (focused rule)
- PracticeStep container (sequences exercises)
- MatchPairsExercise (matching game)
- FillBlankExercise (conjugation/vocab fill)
- WordOrderExercise (word reordering)

**Effort:** ~50 hours

---

## 4. MISSING FEATURES (Not documented) 🚫

### User Experience (5 features)
1. **Progress Dashboard** - Skill radar (Reading/Writing/Listening/Speaking/Grammar)
2. **Notification System** - Push/in-app for achievements, challenges, streaks
3. **Mobile App Icon Badge** - Dynamic streak counter on app icon
4. **Dark Mode** - Theme preference
5. **Accessibility** - Dyslexia-friendly font, text-to-speech, high contrast

### Community & Social (4 features)
6. **User Profiles** - Bio, study goals, learning milestones
7. **Discussion Forums** - Q&A, grammar corrections, resource sharing
8. **Study Groups** - Collaborative learning, peer review
9. **Friend System** - Friend list for leaderboard comparison

### Content Enhancement (6 features)
10. **Idiom Collections** - Common expressions by context
11. **False Friends** - Confused English-French word pairs
12. **Grammar Exception Reference** - Irregular verbs, special cases
13. **Cultural Notes** - Québec vs European French distinctions
14. **Interactive Flashcards** - Anki-style deck management
15. **Curated Resources** - Links to external learning materials

### Personalization (4 features)
16. **Learning Style Preferences** - Visual/auditory/kinesthetic settings
17. **Study Pace Control** - Adjustable spacing, difficulty ramping
18. **Interest-Based Content** - Topic selection (food, travel, business)
19. **Target Exam Selection** - TEF, DELF, TCF specific prep

### Advanced Analytics (4 features)
20. **Learning Curve Analysis** - Rate of improvement tracking
21. **Study Session Metrics** - Time spent, focus patterns
22. **Vocabulary Retention Metrics** - Items known/forgotten over time
23. **Comparative Analytics** - How user ranks vs similar learners

---

## 5. PRIORITY RANKED IMPLEMENTATION ROADMAP

### **WEEK 1: CRITICAL ENGAGEMENT** (Parallel work)
```
Sprint 1.1: Daily Challenges (40 hrs)
├─ dailyChallengeService.ts
├─ DailyChallengesCard component
├─ HomeScreen integration
└─ Push notifications setup

Sprint 1.2: Achievement Badges (30 hrs)
├─ Database table + migration
├─ Badge definitions library
├─ UserAchievementsScreen
└─ Progress tracking logic

Sprint 1.3: Enhanced Leaderboard (20 hrs)
├─ leaderboardService.ts (period, categories)
├─ Multi-tab LeaderboardScreen
├─ Weekly ranking cache
└─ Friend comparison data
```
**Outcome:** User opens app daily, has motivation to return, sees progress

---

### **WEEK 2: CORE LEARNING EXPERIENCE** (Sequential)
```
Sprint 2.1: Listening Player (Mobile) (25 hrs)
├─ AudioPlayer.tsx (React Native)
├─ TefPrepActivityScreen listening integration
├─ Answer gating logic
└─ Transcript toggle

Sprint 2.2: Error Pattern UI (12 hrs)
├─ WritingJournalScreen Insights enhancement
├─ Error frequency chart
├─ Link to remedial lessons

Sprint 2.3: Weak Area Display (10 hrs)
├─ HomeScreen "Your Weak Areas" card
├─ Link to recommendation engine
└─ Quick action buttons
```
**Outcome:** Users see what they're struggling with and how to fix it

---

### **WEEK 3: CONTENT REWRITE** (Sequential)
```
Sprint 3.1: Lesson Schema Redesign (30 hrs)
├─ Define new JSON schema (vocab_intro, dialogue, grammar_tip, practice)
├─ Design exercise types (match, fill, word order, MCQ)
├─ Create TypeScript types
└─ Migration guide for A2-C1

Sprint 3.2: VocabIntroStep & DialogueStep (25 hrs)
├─ Swipeable vocab cards component
├─ Chat bubble dialogue renderer
├─ Review card marking

Sprint 3.3: A1 Content Rewrite (30 hrs)
├─ Rewrite all 10 A1 units to new schema
├─ Add 6-10 vocab cards per unit
├─ Write 1 authentic dialogue per unit
├─ Create 4 exercise types per unit
```
**Outcome:** Lessons are engaging, multi-sensory, retention improved

---

### **WEEK 4: PERSONALIZATION** (Parallel work)
```
Sprint 4.1: Spaced Repetition UI (8 hrs)
├─ HomeScreen "Daily Review" card
├─ Due count notification
└─ Quick link to review screen

Sprint 4.2: Lesson Recommendations (12 hrs)
├─ HomeScreen "Daily Lesson Plan" section
├─ Top 3 recommended lessons
├─ Explanation per recommendation

Sprint 4.3: Voice Journal (35 hrs)
├─ VoiceJournalScreen
├─ Persistent recording storage
├─ Transcription + analysis
└─ Progress tracking
```
**Outcome:** App feels personalized, learns from user behavior

---

### **WEEK 5+: ADVANCED FEATURES**
```
Priority 5: Conversation Simulator (45 hrs) - Advanced practice
Priority 6: Mock Exam (60 hrs) - Test prep
Priority 7: Offline Packs (40 hrs) - Flexibility
Priority 8: Admin CMS (70 hrs) - Content management
Priority 9: Tutorials/Setup (25 hrs) - First-time UX
Priority 10: Analytics Dashboard (40 hrs) - Insights
```

**Total Effort:** ~600 hours (~3.5 months solo, or 6 weeks with team of 2-3)

---

## 6. DATABASE MIGRATION CHECKLIST

### New Tables Needed
```sql
-- Daily challenges
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  challenge_type TEXT ('vocabulary' | 'writing' | 'listening'),
  challenge_id TEXT,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  badge_id TEXT,
  earned_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  user_id UUID,
  event_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tutor sessions (for future)
CREATE TABLE tutor_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tutor_id UUID,
  scheduled_at TIMESTAMP,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'pending'
);
```

---

## 7. QUICK WINS CHECKLIST (Low effort, high impact)

- [ ] **Weak Areas Card** (8 hrs) - Service exists, just display
- [ ] **Spaced Review Card** (6 hrs) - Show due count on HomeScreen
- [ ] **Recommendations Card** (10 hrs) - Display suggestions from service
- [ ] **Error Pattern Chart** (12 hrs) - Visualize analyzer data
- [ ] **Sound Effects Toggle** (4 hrs) - Mute/unmute button
- [ ] **Achievement Unlock Notification** (6 hrs) - Toast when earned
- [ ] **Reading Completion Animation** (5 hrs) - Celebrate lesson finish
- [ ] **Streak Fire Icon** (3 hrs) - Visual emphasis on HomeScreen

**Total:** ~54 hours (1.5 weeks) for visible, user-facing improvements

---

## 8. RISK ASSESSMENT

### Critical Risks
1. **Audio Content Gap** - Missing listening files will block TEF users
   - *Mitigation:* Use TTS placeholder first, plan real recordings
2. **Mobile Listening Player** - Major feature gap vs web version
   - *Mitigation:* Build AudioPlayer ASAP (high ROI)
3. **Content Schema Transition** - Breaking change for A1+ units
   - *Mitigation:* Plan migration path, version JSON schema

### Medium Risks
4. **Database Performance** - Large score histories, query optimization
   - *Mitigation:* Add indexes, implement pagination, cache trendy queries
5. **Offline Sync Conflicts** - Edits made offline + online
   - *Mitigation:* Last-write-wins strategy, conflict markers
6. **Sound Effects Upload** - App bundle size increase
   - *Mitigation:* Optimize audio (mono, lower bitrate), lazy load

### Low Risks
7. **Type Safety** - Some loose `any` types in existing code
   - *Mitigation:* Gradual TypeScript tightening
8. **Documentation** - Some services lack JSDoc
   - *Mitigation:* Standard documentation template

---

## 9. SUCCESS METRICS

### Engagement (tracked via analytics events)
- Daily Active Users (DAU)
- Days with >3 lessons completed
- Streak maintenance (% of users 7+ day streaks)
- Feature adoption (% using each screen)

### Learning Outcomes
- Average writing score progression (0-30 day cohort)
- Lesson completion rates (% ≥80%)
- Vocabulary retention (SM2 algorithm feedback)
- Speaking fluency improvement (score deltas)

### Retention
- D1 retention (% returning next day)
- D7 retention (% returning after 7 days)
- D30 retention (% active after 30 days)
- Churn detection (users >7 days inactive)

---

## 10. APPENDIX: FILE STRUCTURE

### Key Directories
```
expo-mobile/src/
├─ screens/               (14 screens)
├─ services/              (5 services: journal, errors, weak areas, recommendations, notifications)
├─ database/              (SQLiteDatabase.ts + services)
├─ lib/                   (spacedRepetition.ts, curriculum.ts, etc.)
├─ components/            (UI components, lesson-steps/)
├─ contexts/              (AuthContext, etc.)
└─ assets/                (syllabus JSON, audio placeholders)

french-scorer-web/src/
├─ pages/                 (14 pages)
├─ games/ConjugationCodex/ (3 phases + admin)
├─ components/            (lesson, writing, listening, TEF prep)
├─ services/              (soundEffects.ts)
├─ content/               (lesson content, TEF prep)
└─ lib/                   (curriculum, scoring, etc.)

french-scorer-api/
├─ server.js              (Express routing)
├─ /api/score-french      (AI scoring endpoint)
├─ /api/oral/analyze      (Speech analysis with Whisper)
└─ provider-specific logic (OpenAI, Claude, Gemini, Groq routing)

supabase/migrations/
├─ 001_user_progress.sql
├─ 002_writing_journal.sql
├─ 003_tef_prep.sql
└─ 004_profiles_cefr.sql
```

---

## 11. CONCLUSION

**Current State:** 50% complete, strong foundation
- ✅ Core learning flows working
- ✅ AI scoring + speaking practice functional
- ✅ Spaced repetition ready
- ✅ Writing journal comprehensive
- ❌ Engagement drivers missing (achievements, challenges)
- ❌ Listening incomplete on mobile
- ❌ Advanced personalization not built

**Path Forward:** Focus on quick wins first (achievements, leaderboard enhancements), then tackle learning experience modernization (lesson steps, audio), then advanced features (conversation simulator, mock exam).

**Recommended Next Step:** Sprint 1 implementation (Daily Challenges + Achievements) will unlock daily engagement and motivation, setting foundation for retention-based metrics.

