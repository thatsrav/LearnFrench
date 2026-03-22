# 📋 FEATURE STATUS AT-A-GLANCE

## Quick Reference Matrix

### ✅ FULLY IMPLEMENTED (22 features)

```
MOBILE (expo-mobile)
├─ HomeScreen .......................... ✅ AI Writing Scorer, voice input
├─ SyllabusScreen ...................... ✅ 10 units, unlock system
├─ LessonScreen ........................ ✅ Grammar + vocab + MCQ
├─ ReadingRoomScreen ................... ✅ 5 passages (A1-C1)
├─ SpeakingCoachScreen ................. ✅ Voice recording + real AI feedback
├─ WritingJournalScreen ................ ✅ Compose, history, insights tabs
├─ JournalEntryDetailScreen ............ ✅ Full entry + feedback
├─ SpacedReviewScreen .................. ✅ SM2 flashcard review
├─ LeaderboardScreen ................... ✅ Top 10 writing scores
├─ TefPrepHubScreen .................... ✅ 10 A1 exam units
├─ TefPrepUnitScreen ................... ✅ 4 skill rooms
├─ TefPrepActivityScreen ............... ✅ Reading/Writing/Listening/Speaking
├─ AccountScreen ....................... ✅ Auth + sync controls
└─ UnitOverviewScreen .................. ✅ Lesson grid

API & BACKEND
├─ French Scorer AI (Node.js) .......... ✅ OpenAI, Claude, Gemini, Groq
├─ Whisper Transcription ............... ✅ Speech-to-text
├─ Spaced Repetition SM2 ............... ✅ Complete algorithm
├─ Writing Journal Service ............. ✅ CRUD, filtering, trends
├─ Error Pattern Analyzer .............. ✅ Categorize, detect patterns
└─ Weak Area Detection Service ......... ✅ Topic performance analysis

WEB (french-scorer-web)
├─ 14 pages (Dashboard, Lesson, Reading, Leaderboard, etc.) ... ✅
├─ Conjugation Codex Game .............  ✅ 3 phases (Discovery, Rule Master, Guild)
└─ WebListeningAudioPlayer ............ ✅ Play/pause, speed, answer gating

DATABASE & STORAGE
├─ SQLite (mobile) ..................... ✅ Local caching
├─ Supabase (cloud) .................... ✅ User, progress, scores, writing entries
├─ Writing entries, scores, feedback .. ✅ Full schema
└─ Spaced repetition items ............ ✅ SM2 scheduling
```

---

### ⚠️ PARTIALLY IMPLEMENTED (5 features)

| Feature | % Done | Missing | Priority |
|---------|--------|---------|----------|
| **Lesson Flow** | 40% | Multi-step UI (vocab → dialogue → grammar → exercises) | HIGH |
| **Lesson Content Schema** | 30% | Busuu-style rewrite with steps[] and exercises | HIGH |
| **Listening (Mobile)** | 20% | Audio player for expo-mobile | CRITICAL |
| **Voice Journal** | 5% | Persistent storage, history, progress tracking | MEDIUM |
| **TEF Progress Tracking** | 50% | Advanced analytics, visualization | MEDIUM |

---

### ❌ NOT IMPLEMENTED (23 features)

#### Critical Engagement Features (Drivers of daily return)
- [ ] Daily Challenges (3 daily micro-activities)
- [ ] Achievement Badges (10+ badge types)
- [ ] Enhanced Leaderboard (weekly, categories, friends)

#### Learning Experience (Core functionality gaps)
- [ ] Mobile Audio Player
- [ ] Mobile Listening Practice
- [ ] Lesson Step Navigation (vocab → dialogue → grammar → practice)
- [ ] Practice Exercise Components (match, fill blank, word order)
- [ ] Real Audio Content for Listening
- [ ] Error Pattern UI Display
- [ ] Writing Feedback Visualization

#### Personalization (Smart recommendations)
- [ ] Weak Area Display (service exists, UI missing)
- [ ] Spaced Repetition Daily UI (service exists, UI missing)
- [ ] Lesson Recommendations UI (service exists, UI missing)

#### Content & Mobile Features
- [ ] A1 Content Rewrite (new JSON schema)
- [ ] Voice Journal (recording + history)
- [ ] Offline Content Packs
- [ ] Home Screen Widgets
- [ ] Pronunciation Guide (audio comparison)
- [ ] Sound Effects Integration

#### Advanced Features
- [ ] Conversation Simulator (AI role-play)
- [ ] Mock Exam (full TEF simulation)
- [ ] Admin CMS (content management)
- [ ] User Analytics Dashboard
- [ ] Live Tutoring Marketplace

---

### 🚫 MISSING (Not documented, useful)

- User profiles & social features
- Community forums
- Progress visualization (skill radar)
- Notification system (push/in-app)
- Accessibility (dark mode, TTS, dyslexia font)
- Learning analytics (retention curves, cohort analysis)
- Content guides (idioms, false friends, cultural notes)

---

## IMPLEMENTATION STATUS BY AREA

### 🎓 CURRICULUM & LESSONS
| Item | Status | Coverage |
|------|--------|----------|
| Syllabus structure | ✅ | A1 (10 units), A2 (5 units) |
| Lesson JSON schema | ⚠️ | Old format works; new Busuu format needed |
| Grammar content | ✅ | Rules + vocab + MCQ quiz |
| Vocabulary cards | ✅ | Embedded in JSON |
| Quiz questions | ✅ | MCQ format with explanations |
| Dialogues | ❌ | Not in lessons yet |
| Grammar tips | ❌ | Not structured as separate steps |
| Practice exercises | ❌ | No match pairs, fill blank, word order |
| A2-C1 lessons | ⚠️ | Skeleton exists, needs content fill |
| Real audio | ❌ | Placeholder URLs only |

### 📝 WRITING PRACTICE
| Item | Status | Coverage |
|------|--------|----------|
| Text input | ✅ | HomeScreen + WritingAreaPage |
| Voice input | ✅ (placeholder) | UI exists, TTS not real speech-to-text |
| AI scoring | ✅ | Grammar, vocab, pronunciation, fluency |
| Multiple providers | ✅ | Auto/Gemini/Groq/OpenAI/Claude |
| Score history | ✅ | Tracked with CECR levels |
| Error detection | ✅ | Service analyzes patterns |
| Error visualization | ❌ | Analyzer exists, no chart display |
| Feedback display | ⚠️ | Stored, not well-rendered |
| Writing journal | ✅ | Full CRUD with drafts/submissions |
| Score trends | ✅ | 30-day chart |

### 🗣️ SPEAKING PRACTICE
| Item | Status | Coverage |
|------|--------|----------|
| Prompts | ✅ | 4 rotating prompts (A1-C1) |
| Voice recording | ✅ | Real expo-av recording |
| Transcription | ✅ | Groq Whisper + OpenAI |
| AI analysis | ✅ | Grammar, pronunciation, fluency |
| TEF scoring | ✅ | Predicted CLB band |
| Feedback UI | ✅ | Strengths, improvements, specific feedback |
| Voice journal | ❌ | No persistent storage of recordings |
| Pronunciation comparison | ❌ | No waveform analysis vs native |

### 👂 LISTENING PRACTICE
| Item | Status | Desktop | Mobile |
|------|--------|---------|--------|
| Audio player | ✅ (web) | ✅ Fully featured | ❌ Missing |
| Play/pause/replay | ✅ | ✅ | ❌ |
| Progress bar | ✅ | ✅ | ❌ |
| Speed adjustment | ✅ | ✅ | ❌ |
| Transcript toggle | ✅ | ✅ | ❌ |
| Answer gating | ✅ | ✅ | ❌ |
| Questions + MCQ | ✅ | ✅ | ❌ |
| TEF listening content | ⚠️ | Structure ready, empty URLs |
| Real audio files | ❌ | Placeholder URLs only |
| Content playback | ✅ | Only on web, not mobile |

### 🎮 GRAMMAR GAMES
| Game | Phase | Status | Details |
|------|-------|--------|---------|
| **Conjugation Codex** | 1: Discovery | ✅ | Pattern recognition via dialogues |
| | 2: Rule Master | ✅ | Context game with fill-in blanks |
| | 3: Master's Guild | ✅ | SRS flashcard reviews |
| **Agreement Challenge** | — | ❌ | Planned, not started |
| **Syntax Shuffle** | — | ❌ | Planned, not started |
| **Mood & Mode Lab** | — | ❌ | In development |

### 🏆 GAMIFICATION & ENGAGEMENT
| Feature | Status | Details |
|---------|--------|---------|
| Scoring + CECR | ✅ | A1-C1 mapping |
| Leaderboard | ⚠️ | Top 10 only; needs weekly/categories |
| Achievements | ❌ | 10+ badges designed, zero implementation |
| Daily challenges | ❌ | 3 challenge types designed, zero implementation |
| Streaks | ✅ | Computed from score events |
| Unit unlocking | ✅ | 80% requirement, sequential |
| Progress bars | ✅ | Many screens show progress |
| Daily notifications | ❌ | Prompts designed, not implemented |

### 🔄 SPACED REPETITION & PERSONALIZATION
| Feature | Status | Details |
|---------|--------|---------|
| SM2 algorithm | ✅ | Library complete, tested |
| Review scheduling | ✅ | Calculates next review dates correctly |
| Flashcard UI | ✅ | SpacedReviewScreen done |
| Daily review reminder | ⚠️ | Service ready, UI notification missing |
| Integration to lessons | ❌ | No inline review at lesson end |
| Vocab card marking | ⚠️ | VocabIntroStep marks for review, but not fully tested |
| Weak area alerts | ⚠️ | Service analyzes, no HomeScreen display |
| Lesson recommendations | ⚠️ | Service suggests, no UI integration |

### ☁️ CLOUD SYNC & OFFLINE
| Feature | Status | Details |
|---------|--------|---------|
| Local SQLite cache | ✅ | All data stored locally first |
| Cloud upload | ✅ | Progress, scores, entries sync to Supabase |
| Cloud download | ✅ | Pull data on first login |
| Manual sync buttons | ✅ | AccountScreen controls |
| Auto-sync after action | ✅ | Silent sync after writing submission |
| Offline reading | ✅ | Content loads from local cache |
| Offline lessons | ✅ | As long as JSON is local |
| Offline writing | ✅ | Can save drafts, submit on reconnect |
| Offline packs | ❌ | Can't download lesson bundles |
| Conflict resolution | ❌ | No handling of offline edits + cloud changes |

### 🛠️ ADMIN & OPERATIONS
| Feature | Status | Coverage |
|---------|--------|----------|
| Admin interface | ❌ | Not started |
| Lesson CRUD | ❌ | Must edit JSON directly |
| Content upload | ❌ | No UI for adding audio/images |
| User management | ❌ | No admin panel |
| Analytics viewing | ❌ | Data not aggregated |
| A/B testing | ❌ | No variant assignment |
| Audit logging | ❌ | Changes not tracked |

---

## EFFORT vs IMPACT MATRIX

```
HIGH IMPACT (Dev prioritizes these)
├─ Mobile Listening Player ........... 25 hrs ... ⭐⭐⭐⭐
├─ Daily Challenges .................. 40 hrs ... ⭐⭐⭐⭐
├─ Achievement Badges ................ 30 hrs ... ⭐⭐⭐⭐
├─ Lesson Step Navigation ............ 40 hrs ... ⭐⭐⭐⭐
├─ Weak Area Display ................. 10 hrs ... ⭐⭐⭐
└─ Practice Exercises ................. 50 hrs ... ⭐⭐⭐

MEDIUM IMPACT
├─ Voice Journal ..................... 35 hrs ... ⭐⭐⭐
├─ Offline Packs ..................... 40 hrs ... ⭐⭐⭐
├─ A1 Content Rewrite ................ 30 hrs ... ⭐⭐⭐
├─ Enhanced Leaderboard .............. 20 hrs ... ⭐⭐⭐
└─ Real Audio Files .................. 40 hrs ... ⭐⭐⭐

LOWER IMPACT (Nice-to-have)
├─ Home Widgets ...................... 35 hrs ... ⭐⭐
├─ Conversation Simulator ............ 45 hrs ... ⭐⭐⭐ (advanced)
├─ Admin CMS ......................... 70 hrs ... ⭐⭐
└─ Analytics Dashboard ............... 40 hrs ... ⭐⭐
```

---

## DECISION TREE: WHAT TO BUILD NEXT?

```
START HERE
    ↓
Is engagement your top priority?
├─ YES → Build Daily Challenges + Achievements (70 hrs, massive ROI)
└─ NO → See below

Need mobile audio capability?
├─ YES → Build Mobile Audio Player + Listening Screen (45 hrs, unblocks TEF mobile)
└─ NO → See below

Want modern lesson UX?
├─ YES → Build Step Navigation + Exercises (90 hrs, learning quality)
└─ NO → See below

Need user personalization?
├─ YES → Build Weak Areas Display + Recommendations UI (22 hrs, personalization)
└─ NO → See below

Building for advanced learners?
├─ YES → Build Conversation Simulator + Mock Exam (105 hrs, test prep)
└─ NO → Quick wins only (~52 hrs)
```

---

## SUMMARY SCORECARD

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Core Learning** | 7/10 | Solid foundation, needs modern UX (steps, exercises) |
| **Engagement** | 4/10 | Missing achievements, daily challenges, notifications |
| **Personalization** | 5/10 | Services built, UI missing for recommendations |
| **Speaking Practice** | 9/10 | Real recording + feedback, just missing voice journal |
| **Writing Practice** | 8/10 | Complete except feedback visualization |
| **Listening Practice** | 3/10 | Desktop only, no mobile, no real audio |
| **Content Breadth** | 5/10 | A1 solid, A2-C1 skeleton, needs expansion |
| **Gamification** | 4/10 | Scoring works, no badges, streaks, challenges |
| **Mobile Experience** | 6/10 | Many screens, but UX needs modernization |
| **Admin Operations** | 2/10 | No CMS, manual JSON editing required |
| **OVERALL** | 5.3/10 | **50% Complete** - strong foundation, needs polish + engagement |

