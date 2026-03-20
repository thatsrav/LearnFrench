# A1 curriculum designer units (`a1_u1.json` … `a1_u10.json`)

Standalone JSON files (one unit per file) aligned with the in-app lesson shape:

- `id`, `grammar_rule_text`, `vocab_list`, `quiz` (multiple choice) — same as `a1.json` lesson objects.
- Extra metadata: `level`, `unit_index`, `phase`, `theme`, `lexical_density` (×1.1 per unit from 1.0).
- `production_task`: `null` (units 1–3) or an object with writing prompts (units 4–10). The current **Lesson** screen only renders `quiz`; wire `production_task` when you add free-text tasks.

## Integration options

1. **Merge into `a1.json`**  
   Append each file’s content as one array element (strip outer wrapper keys not in the original schema if you want strict parity).

2. **Dynamic import**  
   Load `a1_u${n}.json` in a new track without replacing legacy `a1-u1` … ids (note: ids here are `a1-u1` … `a1-u10` — resolve conflicts with existing `a1.json` ids before merging).

3. **AI / CMS pipeline**  
   Use these as the source of truth for Gemini or an authoring tool.

## Difficulty curve (summary)

| Units | Phase           | Focus |
|-------|-----------------|--------|
| 1–3   | Ultra-beginner  | Recognition, greetings, numbers, *Je suis* / *Je m’appelle* |
| 4–7   | Developing A1 | *manger / aller / travailler*, *ne … pas*, routines |
| 8–10  | Solid A1        | Passé composé, mini-story, capstone mini-TEF-style (20–30 words) |
