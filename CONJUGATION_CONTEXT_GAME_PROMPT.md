# Conjugation Context Game — Complete Implementation Prompt

## Current State: What's Missing

The Conjugation Codex game has **3 phases**, but only **Phase 1 is fully implemented**:
- ✅ **Phase 1: Discovery** — Fully implemented (interactive conjugation table + reflection)
- ⚠️ **Phase 2: Rule Master** — **PLACEHOLDER** (needs context game UI)
- ⚠️ **Phase 3: Master's Guild** — **PLACEHOLDER** (needs SRS daily reviews)

### What Exists But Is Unused
1. **Context Question Data**:
   - TypeScript types: `ContextQuestion` in `phase2RuleMasterData.ts` (line 38-47)
   - Example questions: `PHASE2_CONTEXT_QUESTIONS` in `phase2RuleMasterData.ts` (line 99)
   - Large JSON dataset: `conjugations.json` contains 40+ context questions with real conjugation scenarios

2. **Hooks & State Management** (ready to use):
   - `useConjugationState()` — Access `addXp`, `bumpStreakIfNeeded`, `recordReview`, `showFeedback`
   - `useConjugationFeedback()` — For modal feedback display
   - State persists locally + syncs to cloud via `pushConjugationCodexProgressToCloud()`

---

## PRIORITY 1: Phase 2 — Rule Master (Context Game UI)

### Goal
Transform **Phase2_RuleMaster.tsx** from a placeholder into a working context game where users read a narrative, fill in a conjugated verb form, and get immediate feedback.

### Requirements

#### A. Load Context Questions
- Load a shuffled/rotated set of 5-10 context questions from `conjugations.json`
- Start with **aller** verb questions (easiest), optionally expand to other verbs
- On page load or when advancing: fetch fresh questions from the JSON file
- Store current question index in local state

#### B. Context Question Card UI
Single card layout with these zones:

```
┌─────────────────────────────────────────────────────┐
│ PHASE 2                                             │
│ Rule Master                                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📖 Narrative (italic, slate-600, smaller)         │
│  "Le prof demande qui est disponible."             │
│                                                     │
│  Sentence with blank (larger, bold):               │
│  "— Moi, je ____ libre après 16h."                │
│                                                     │
│  [Text input field]  [Submit Button]               │
│                                                     │
│  Optional hint (collapsed, clickable):             │
│  "Futur proche pattern: elle + present of aller…" │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Styling**:
- Card: `rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-sm`
- Narrative: `text-sm italic text-slate-600 mb-4`
- Sentence with blank: `text-base md:text-lg font-semibold text-slate-800`
- Use `<input type="text" className="..." placeholder="Type conjugated form..." />`
- Blank underline effect: render as `____ ` with consistent visual styling
- Submit button: `rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700`

#### C. Answer Validation & Feedback Flow

1. **On submit**:
   - Normalize user input (lowercase, trim whitespace)
   - Check if input matches any acceptable form in `question.accepted` array
   - If correct:
     - `bumpStreakIfNeeded()`
     - `addXp(10)` (higher XP for context difficulty vs. fill-in-blank)
     - `recordReview(true)` (for SRS tracking)
     - `showFeedback('correct', 'Excellent!', explanation text)`
     - After 2s delay: advance to next question
   - If incorrect:
     - `addXp(2)` (participation credit)
     - `recordReview(false)` 
     - `showFeedback('incorrect', 'Close, try again', wrongHint + optionalHint)`
     - Allow user to retry same question (no penalty)

2. **Input normalization**:
   - Strip accents for lenient matching (e.g., "êtes" == "etes")
   - Handle common typos (optional: Levenshtein distance ~1)
   - Reference: Check how Phase 1 validates (if any existing answer checker)

#### D. Hint System
- "Hint" button (text only, slate-500 hover, toggles hint visibility)
- Hint text from `question.optionalHint` (stored in `ContextQuestion` type)
- Example: *"Futur proche pattern: elle + present of aller + infinitive"*
- Only show after user attempts answer or clicks hint button

#### E. Question Advancement
- After correct answer (or after 3 incorrect attempts), auto-advance to next question
- Show progress: "Question 3 of 10" or similar badge
- When all questions completed for session:
  - Show a completion card: "Phase 2 Complete! You mastered context practice. Ready for Phase 3?"
  - Button: "Next Phase: Master's Guild (SRS Reviews)"
  - Unlock Phase 3 (call `advanceToNextPhase()` or mark complete)

#### F. Data Structure Integration
Query questions from conjugations.json like this:
```typescript
interface ContextQuestion {
  id: string
  verb_id?: string
  tense?: string
  pronoun?: string
  context: string              // Narrative
  sentence: string             // "— Moi, je ____ libre après 16h."
  english?: string             // Translation help
  accepted: string[]           // ["vais"]
  explanation: string          // "Je → vais."
  wrongHint: string           // Feedback on mistakes
  optionalHint?: string       // Extra grammar tip
  difficulty?: 'easy' | 'medium' | 'hard'
}
```

---

## PRIORITY 2: Phase 3 — Master's Guild (SRS Daily Reviews)

### Goal
Replace Phase 3 placeholder with a **spaced repetition system** for daily conjugation drills. Users review conjugation flashcards daily, with scheduling based on retrieval difficulty.

### Requirements

#### A. SRS Hook / Data Loading
- **Placeholder**: Phase 3 already has stub access to `useSRS()` (mentioned in comments)
- **Implementation**: Create or refactor `useSRS()` hook that:
  1. Loads due cards for today from `MASTERS_GUILD_CARDS` (hardcoded SRS subset, ~20 cards)
  2. Filters by due date/ease factor
  3. Returns current card + "due count" badge
  4. On review (correct/incorrect), reschedules card:
     - **Correct**: Increase ease factor, push due date forward (e.g., +7 days)
     - **Incorrect**: Reset ease factor lower, due tomorrow
  5. Persists scheduling to localStorage (card history + next due dates)

#### B. Card Review Interface
Single card on screen:

```
┌─────────────────────────────────────────────────┐
│ PHASE 3 — Master's Guild                        │
│ Daily SRS Reviews                               │
│ 📋 4 cards due today                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Verb:    AVOIR                                 │
│  Pronoun: TU                                    │
│  Tense:   PRÉSENT                              │
│                                                 │
│  Recall the conjugation without thinking too   │
│  hard — just let the form come to you.         │
│                                                 │
│  [Hidden answer button]                        │
│  [Text input for recall attempt]   [Check]    │
│                                                 │
│ 3 remaining for today                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### C. Card Recall Flow

1. **Display**:
   - Badge: "Verb: AVOIR | Pronoun: TU | Tense: PRÉSENT"
   - Prompt: "What is the conjugation?" (centered, italics)
   - Input field: `<input type="text" placeholder="Type answer..." />`
   - Two buttons:
     - "Reveal Answer" (text link) → shows `answers[]` in green
     - "Check" / "Submit" (primary button) → validates & schedules

2. **Input validation** (same as Phase 2):
   - Normalize lowercase, trim, strip accents
   - Match against `card.answers` array
   - If match: correct path (see below)
   - If no match: show `wrongHint`, allow retry (no XP penalty first attempt, then -2 XP)

#### D. Feedback & Scheduling

**On Correct Recall**:
- `addXp(8)` (SRS is prime learning)
- `bumpStreakIfNeeded()`
- `recordReview(true)`
- Show feedback: "✓ Well recalled! Added to long-term memory."
- Update card ease/due date (e.g., next due = today + 7 days)
- Auto-advance to next due card (1s delay)

**On Incorrect Recall**:
- `addXp(3)` (participation credit)
- `recordReview(false)`
- Show feedback: "Getting stronger. You'll see this again soon."
- Reschedule: next due = tomorrow
- Allow 2 retries before forcing advance

**Session End** (all due cards reviewed):
- Show summary: "Daily review complete! +25 XP, 4/4 correct"
- Button: "Return to Phases" (back to main game hub)

#### E. Due Card Logic
- Load from `MASTERS_GUILD_CARDS` (provide list in file)
- Each card has scheduling metadata (ease factor, interval, next due)
- Store in localStorage under key: `ccx:srs:cards`
- On mount: filter cards where `nextDue <= today`
- If <5 cards due: auto-generate new cards from conjugations.json (random subset)

#### F. Data Structure for SRS Scheduling
```typescript
interface SRSCard {
  id: string                    // from MASTERS_GUILD_CARDS
  verb: string                  // AVOIR, ÊTRE, ALLER, etc.
  pronoun: string               // JE, TU, etc.
  tense: string                 // PRÉSENT, PASSÉ COMPOSÉ, etc.
  answers: string[]             // ["ai"]
  
  // Scheduling (SM-2 algorithm simplified):
  easeFactor: number            // 1.3-2.5, starts 2.0
  interval: number              // Days until next review
  nextDue: string               // ISO date "2025-03-22"
  timesReviewedTotal: number
  timesCorrect: number
}
```

---

## Implementation Checklist

### Phase 2 Tasks
- [ ] Create loader function to fetch context questions from conjugations.json
- [ ] Implement card UI (narrative, sentence with blank, input, submit)
- [ ] Wire up answer validation (normalize input, check against `accepted`)
- [ ] Integrate `useConjugationState()` hooks (XP, feedback, streak)
- [ ] Add hint system with `optionalHint` display
- [ ] Implement question advancement (next question after correct or 3 failures)
- [ ] Add session completion state ("All questions done → unlock Phase 3")
- [ ] Test with various accent combinations (êtes/etes)
- [ ] Optional: Add timer/stats indicator in header

### Phase 3 Tasks
- [ ] Create `useSRS()` hook for card scheduling (localStorage + SM-2 logic)
- [ ] Create card review UI (verb/pronoun/tense badge, input, submit)
- [ ] Implement answer validation (same as Phase 2)
- [ ] Wire up scheduling on review (correct → +7 days, incorrect → tomorrow)
- [ ] Implement session tracking ("4 due today" badge, counter on complete)
- [ ] Add "Reveal Answer" link (show correct forms)
- [ ] Session end state with summary
- [ ] Persist to localStorage on every review action

---

## Key Files to Modify / Create

1. **Phase 2**: `/src/games/ConjugationCodex/phases/Phase2_RuleMaster.tsx`
   - Current: Placeholder with demo buttons
   - Goal: Full context game UI + logic

2. **Phase 3**: `/src/games/ConjugationCodex/phases/Phase3_MastersGuild.tsx`
   - Current: Placeholder with demo buttons
   - Goal: SRS daily review interface

3. **New Hook**: `/src/games/ConjugationCodex/hooks/useSRS.ts` (if not exists)
   - Manage SRS card state, scheduling, localStorage persistence

4. **Data**: `/src/games/ConjugationCodex/data/conjugations.json`
   - Already has context questions; use as-is
   - Filter by `type: "context"` for Phase 2

5. **Helper**: Optional new file for answer validation + normalization
   - `normalizeAnswer(input: string): string`
   - `isAnswerCorrect(input: string, acceptedForms: string[]): boolean`

---

## Design Notes

### Colors & Styling
- Primary: Indigo (600/700) for buttons & accents
- Feedback: Green (correct), Red/Slate (errors)
- Cards: White bg, subtle borders (slate-200/90)
- Text: Slate-600 for help text, slate-800 for content

### Accessibility
- Input fields have clear `placeholder` & `aria-label`
- Buttons have readable labels
- Flashcard should announce verb/pronoun/tense to screen readers

### UX Polish
- Auto-focus input field on card load
- Tab to submit (or Enter key to submit)
- Disable submit while loading/validating
- Show skeleton/spinner while fetching questions
- Persist session state (don't lose progress on refresh)

---

## Testing Checklist
- [ ] Load 10 context questions without errors
- [ ] Submit correct answer → XP, feedback, advance
- [ ] Submit wrong answer → hint, allow retry
- [ ] All questions completed → unlock Phase 3
- [ ] SRS card due filter works (only show cards due today)
- [ ] Correct review → reschedule +7 days
- [ ] Incorrect review → reschedule to tomorrow
- [ ] localStorage persists SRS state across page reloads
- [ ] Hint button toggles visibility
- [ ] Accent handling (êtes == etes)

---

## Example Context Questions (from conjugations.json)

```json
{
  "id": "aller_ctx_01",
  "context": "Le prof demande qui est disponible.",
  "sentence": "— Moi, je ____ libre après 16h.",
  "accepted": ["vais"],
  "explanation": "Je → vais."
}

{
  "id": "aller_ctx_02",
  "context": "Tu parles à un ami.",
  "sentence": "Tu ____ sûr de ton choix?",
  "accepted": ["vas"],
  "explanation": "Tu → vas."
}
```

Use these as reference for UI rendering + validation.

---

## Done! 🎉

Once Phase 2 + Phase 3 are implemented:
- Users progress: Discovery (conjugation table) → Rule Master (context sentences) → Master's Guild (daily SRS)
- Full learning path with spaced repetition
- Progress persists locally + syncs to cloud for signed-in users
