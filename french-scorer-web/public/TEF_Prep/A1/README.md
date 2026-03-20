# TEF Canada — A1 Preparation Area (`TEF_Prep/A1`)

**Separate from the main syllabus** (`assets/syllabus/`). Each unit is a **Skill Room** with four files:

| File | Target surface | TEF alignment |
|------|----------------|---------------|
| `reading.json` | Reading Room | Short authentic-style texts: affiche, petite annonce, courriel |
| `writing.json` | Writing area | Section A — *fait divers* (scaled to A1) |
| `listening.json` | Listening area | Annonce / dialogue (transcript + items; audio URI optional) |
| `speaking.json` | Speaking area | Section A — *demander des renseignements* |

## Required fields (all files)

- `tef_task_id` — unique string
- `clb_target` — `1`, `2`, or `3` (A1 band: units 1–3 → 1, 4–7 → 2, 8–10 → 3)
- `strictness_level` — `"low"` | `"medium"` | `"high"` (roughly matches early / mid / late A1)
- `lexical_density` — +10% per unit from `1.0` (unit *n*: × 1.1^(n−1))

## Integration

Load by path, e.g. `TEF_Prep/A1/Unit_3/listening.json`. Do not merge into `a1.json` unless you intentionally bridge content.

## Unit 10

- `writing.json`: mini–Section A, **20–30 words**
- `reading.json`: **TEF-style** stem + multiple-choice cluster (instructions + numbered items)
