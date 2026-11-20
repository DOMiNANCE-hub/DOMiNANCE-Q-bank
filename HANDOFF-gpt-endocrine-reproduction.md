# Hand-off: Endocrine + Reproduction Physiology Originals (ChatGPT's share)

This is the complete brief for building **DOMiNANCE Originals** for two Physiology
systems. Claude is concurrently building Respiratory, Renal, GI/Digestive and
Special senses. **You own Endocrine and Reproduction end to end.** Do not touch
any other system's data files.

---

## 0. The golden rules (read first)

1. **One agent edits the repo at a time. `git pull` immediately before every
   push.** Claude also pushes to `main`. If a push is rejected, `git pull --no-edit`,
   re-apply, push again.
2. **No caps.** Do not stop at a round number per topic. Cover *all* the content
   in the slides, plus anything in the KNUST physiology syllabus that the slides
   miss. Breadth and depth until the topic is genuinely, comprehensively covered —
   with **no repetition or overlap** between questions.
3. **Mainly SBA** (single-best-answer, 5 options A–E). Physiology is SBA; you do
   not need the biochem Assertion-Reason / K-type machinery here.
4. **Quality standard (non-negotiable):** every option must be a plausible, highly
   effective distractor of the same or comparable length, so a student cannot guess
   and the correct answer is **not obvious before reading the stem** (e.g. not by
   being the longest or the only detailed option). The correct answer must blend in.
5. **No duplication of past questions.** Your Originals must not restate anything in
   the system's past-question file (see §4). Check every stem against the past file
   and against your own set.

---

## 1. Repo & deploy

- Repo: `DOMiNANCE-hub/DOMiNANCE-Q-bank` (branch `main` auto-deploys to Vercel at
  https://dominance-q-bank.vercel.app).
- Deploy = `git add -A && git commit && git pull --no-edit && git push origin main`.
- Deploy **per system** when it's done (endocrine, then reproduction) rather than
  one giant push, so regressions are easy to trace.
- Use your own commit attribution; do not copy Claude's `Co-Authored-By` lines.

---

## 2. What you build

| System | New curated file to create | ID prefix |
|---|---|---|
| Endocrine | `data/physiology/endocrine-curated.json` | `dq-phys-endo-###` |
| Reproduction | `data/physiology/repro-curated.json` | `dq-phys-repro-###` |

Each curated file is **one JSON object** (not an array):

```json
{
  "id": "dq-phys-endocrine",
  "title": "Endocrine physiology — DOMiNANCE Originals",
  "source": "KNUST Physiology lecture slides + syllabus",
  "questions": [ /* question objects, see §3 */ ]
}
```

---

## 3. Question schema (SBA)

```json
{
  "id": "dq-phys-endo-001",
  "type": "single-best",
  "stem": "….",
  "options": [
    {"label":"A","text":"…"},
    {"label":"B","text":"…"},
    {"label":"C","text":"…"},
    {"label":"D","text":"…"},
    {"label":"E","text":"…"}
  ],
  "correctAnswer": "B",
  "why": "One or two sentences explaining why the key is right.",
  "topicId": "endo-thyroid",
  "subtopic": "Thyroid hormone synthesis",
  "difficulty": "easy | medium | hard"
}
```

- The runtime **shuffles options** for SBA, so a student never sees a fixed A–E
  order. Still, **rotate the `correctAnswer` across A–E** as you author (don't let
  the key sit on one letter) and keep options comparable in length.
- `topicId` is how a question attaches to its tile — it **must** be one of the
  exact IDs in §5. `subtopic` is free text shown as a sub-label.

### Self-check each question against these (the same checks Claude's builders run)
- **Answer-not-longest:** the correct option must not be conspicuously longer than
  the others. Rule of thumb: flag if `len(correct) > max(len(others)) + max(5,
  0.25 × max(len(others)))`. If flagged, trim the key or lengthen distractors with
  *real, plausible* terms (never padding).
- **No short outlier:** no option much shorter than the rest.
- **No duplicate options** within a question.
- **No duplicate stems** vs the past file, vs your own set, across both systems.

---

## 4. Dedup sources (don't repeat these)

- Endocrine past questions: `data/physiology/endocrine-past.json` (53 Qs, topics
  endo-general / endo-thyroid / endo-calcium / endo-adrenal / endo-pancreas).
- Reproduction past questions: `data/physiology/repro-past.json` (22 Qs, topics
  repro-male / repro-female / repro-preg / repro-fetal).

Normalise (lowercase, strip punctuation) and compare stems; also avoid *testing the
same fact with a cosmetically different stem*.

---

## 5. Topic IDs (use these exactly)

**Endocrine** (`data/physiology/endocrine-topics.json`):
- `endo-general` — Hormones, hypothalamus and pituitary
- `endo-thyroid` — Thyroid gland
- `endo-calcium` — Calcium regulation and parathyroids
- `endo-adrenal` — Adrenal cortex and medulla
- `endo-pancreas` — Endocrine pancreas and diabetes

**Reproduction** (`data/physiology/repro-topics.json`):
- `repro-male` — Male reproductive physiology
- `repro-female` — Female reproductive cycle
- `repro-preg` — Fertilization, pregnancy and lactation
- `repro-fetal` — Fetal and neonatal physiology

---

## 6. Source slides to feed yourself (upload these into ChatGPT)

These live in the user's uploads for the Claude chat; the user must upload them to
you. Map:

**Endocrine**
- `Endocrinology_Lecture_Proper_1A_3.pdf` → endo-general (hormones, pituitary, feedback)
- `Thyroid_Hormones_Proper_1.pdf` → endo-thyroid
- `Calcium_metabolism_.pdf` → endo-calcium
- `Adrenals_4.pdf` → endo-adrenal
- `insulin.pdf` → endo-pancreas (plus diabetes from syllabus)

**Reproduction**
- `male_reproductive_system.pptx` → repro-male
- `female_reproductive_system.pptx` → repro-female
- `sexual_response.pptx` → repro-male / repro-female (sexual response)

**Syllabus gaps to fill (likely NOT in the slides above):** pregnancy hormones,
parturition and lactation, and **fetal/neonatal physiology** (repro-preg,
repro-fetal) may be thin or absent in the decks. Pull these from the KNUST SMS/SMD
physiology course outline (`SMS_handbook_2024_1.pdf`) and standard physiology
(Guyton/Ganong) so the two tiles are fully covered. The existing reproduction past
questions already touch hCG, oxytocin, fetal Hb and neonatal physiology — build
Originals that complement, not repeat, them.

---

## 7. Wire it up (after each curated file is written)

1. **Catalog** `data/catalog.json` → HB2 → physiology → systems: set the `curated`
   array for the system:
   - endocrine: `"curated": ["data/physiology/endocrine-curated.json"]`
   - repro: `"curated": ["data/physiology/repro-curated.json"]`
2. **Service worker** `sw.js`:
   - add the new file path(s) to the precache `DATA` list, and
   - bump `const CACHE = 'dq-vNN'` to the next number.
   - ⚠️ `sw.js` and `catalog.json` are shared with Claude. **Pull before push**; if
     the cache number collides, just bump to the next free one.
3. Validate JSON (`python3 -c "import json;json.load(open(...))"`), load the site,
   open the Endocrine and Reproduction tiles, confirm the DOMiNANCE Originals
   collection shows and questions render with no console errors.

---

## 8. Done = 

Both tiles show a DOMiNANCE Originals collection that covers every slide concept and
every syllabus concept for that system, with no repeats of the past questions, no
internal overlap, and every item meeting the quality standard in §0.4.
