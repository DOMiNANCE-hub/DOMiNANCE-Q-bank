# DOMiNANCE CVS Question Bank

A responsive study and exam-practice hub for Cardiovascular Physiology.

## Student-facing collections

1. **Past Questions — Compiled from the Net.** Three separately identified sets, 196 original question stems in total, with original numbering, true/false items where relevant, and qualified answer keys.
2. **Mock Questions — Curated by DOMiNANCE.** Three complete exams (Mock 01, 02 and 03), **60 four-option single-best-answer MCQs each, 90 minutes per full mock**, for 180 mock questions total.
3. **Practice by Topic.** Choose among cardiovascular physiology topics aligned to the 27 chapters in DOMiNANCE Breakdowns. On Quiz Setup, choose a **subtopic**, a **question source** (past questions / mocks / both), practice or exam mode, question count, and timer.

The original mock papers are preserved as full-paper sets. Topic practice makes filtered copies in the quiz session and keeps each question's original paper and question number.

## Data layout

- `data/past-questions.json` — earlier cleaned combined past-question sets. Some defective or ambiguous answers are flagged and not automatically counted against students.
- `data/mock-01-60q.json`, `mock-02-60q.json`, `mock-03-60q.json` — the **complete current 60-question mock papers** with correct answers, explanations, topic and subtopic tags, sourced from the November 9, 2026 online editions.
- `data/topics.json` — 27 topic labels and ordering from the DOMiNANCE Breakdowns CVS topic map.

The prior `data/mocks-02-to-04.json` holds **retired 40-question simulations** and is not loaded by the application. The earlier placeholder `data/mocks-01-to-03-60q.json` is also not loaded. Do not re-enable either in the student interface.

## Features

- Student-first mobile design with DOMiNANCE royal blue, deep navy, gold, and white, in light and dark themes
- Paper selection, topic search, subtopic and source filters, customizable quiz setup
- Exam mode hides answers until submission; practice mode offers answer checking
- Timer, navigator, flags, resume from browser storage, scoring and answer review
- Source qualification safeguards and no senior names in student-facing UI

## Running and deployment

This is a static HTML/CSS/JavaScript app. Serve the repository root over HTTP (e.g. `python -m http.server 8000`); do not open `index.html` directly because quiz JSON is fetched with `fetch()`. In Vercel, use the **Other** (no framework) preset, the repository root as output directory, and no build command. Connect the GitHub repository to trigger deployments on changes to `main`.

## Editorial note

The 60-question exam papers and answer guides are imported from the supplied DOMiNANCE online edition PDFs. Mock topic/subtopic tags were added for navigation without changing question text or options. Past-question topic assignments are heuristic and should be reviewed for accuracy as the bank grows.
