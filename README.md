# DOMiNANCE Q Bank

A static, mobile-first question bank for KNUST medical students (HB1, HB2 and HB3), with past questions and DOMiNANCE-curated questions sorted by topic.

## Student flow

`Home (choose year) → HB1: semester / HB2, HB3: courses → Course → Past questions or Curated by DOMiNANCE → Topic folders (pick one or more) → Setup → Quiz → Results → Review`

- **Home** shows HB1, HB2 and HB3. Only live years open; others show "Soon". The chosen year is remembered and opens directly on the next visit (with a "Change year" link).
- **Both collections are by topic only.** There are no full papers or subtopic pickers. Collections are never mixed in one quiz.
- **Topic folders** are grouped under system headings (e.g. Cardiovascular). Tap to tick one or more; a bottom bar shows the running total and a Continue button. An "All topics" tile selects everything.
- **Setup** (one screen): question count (All, 10, 20, 50 — only sizes smaller than the pool appear — or Custom), marking (Mark as you go, with "When I tap Check" or "As soon as I tap"; or Submit at the end), timer (Off, Auto at 1 minute per question, or Custom minutes), and the **DMC XPO** tick in the corner.
- **Quiz:** options are shuffled each attempt (statements too for true/false), except questions whose options refer to each other ("all of the above", combinations) or whose explanations need fixed letters (`lockOrder: true` in the data). Explanation letters are remapped to the shuffled order automatically. Navigator, flags, swipe left/right, and A–E/arrow/Enter keys on laptops.
- **Timer:** warning at 1 minute left. In Submit at the end it auto-submits at zero; in Mark as you go it shows "Time's up" and lets the student continue.
- **Exit** opens a dialog with "Save my progress" (ticked by default). Each course keeps one saved quiz, shown as a Resume card on Home, the year page and the course page.
- **Results:** score, correct/wrong/unanswered marks, time, longest streak, a by-topic breakdown, Review answers (filter All/Wrong/Flagged), Retry wrong ones, and Go to Setup / Topics / Home. Recent scores appear on the course page.

## DMC XPO (DOMiNANCE EXPERIENCE)

Optional, on by default, toggled on the setup screen:

- Green pulse on a right answer; card shake (and a short vibration on Android) on a wrong one.
- "🔥 N in a row" streak badge from 3 correct in a row.
- Gold flash and mini confetti for a correct **hard** question; a gentle tease for a wrong **easy** one.
- Floating comments (English and pidgin) for streaks, hard/easy reactions, wrong runs, halfway and the last question, at most about one every three questions, never repeated within a quiz.
- Confetti on results at 80% and above (bigger at 100%).
- Effects respect the device's reduce-motion setting.

Comment lines live in `data/comments.json`, grouped by moment. Edit or add lines there without touching code.

## Data layout

- `data/catalog.json` — years → (semesters for HB1) → courses → systems, with each system's topic file and question files. Set a course's `status` to `live` to show it.
- `data/topics.json` — the 27 CVS topics, their order, and a `short` name shown above each question.
- `data/past-questions.json` — 196 past questions (3 sets).
- `data/mock-01-60q.json`, `mock-02-60q.json`, `mock-03-60q.json` — 180 curated questions used as the **Curated by DOMiNANCE** topic pool (no longer offered as full papers).
- `data/comments.json` — DMC XPO comment lines.
- `editor/question-notes.json` — **editor-only**, not loaded by the app: revision notes, the original full explanations, old review flags and source numbering.

Each question carries only what students need: stem, options, answer, `why` (the key point), `notes` (one reason per wrong option, or per statement for true/false), `topicId`, `subtopic`, `difficulty` (hidden, drives reactions only) and `lockOrder` where options must not be shuffled.

### How explanations show

- Single best answer: **Answer: X**, then **Your pick** (the reason their wrong choice is wrong, only when they picked wrong), then **Why X**, then a folded **Why not the others** list.
- True/false: each statement shows its answer and one-line reason right under it; a short **Key point** appears below when the question has one.

## Browser storage keys

`dq.year`, `dq.theme`, `dq.setup`, `dq.sel.<course>.<collection>` (last ticked topics), `dq.save.<course>` (saved quiz), `dq.hist.<course>` (recent scores). Everything stays on the student's device.

## Running and deployment

Static HTML/CSS/JS with no build step. Serve the repository root over HTTP (e.g. `python -m http.server 8000`); opening `index.html` directly won't work because data is loaded with `fetch()`. On Vercel use the **Other** preset, the repository root as output directory, and no build command.
