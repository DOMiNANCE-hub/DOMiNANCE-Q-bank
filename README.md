# DOMiNANCE CVS Question Bank

Cardiovascular Physiology practice hub. Student-facing categories:

- **Past Questions — Compiled from the Net**: three original sets; old numbering and wording retained; contested keys flagged.
- **Mock Questions — Curated by DOMiNANCE**: **three comprehensive mocks, 60 single-best-answer questions each, 90 minutes per full paper** (180 questions in all).

## Source and publication status

The earlier `data/mocks-02-to-04.json` represents retired **40-question/60-minute** simulation drafts. It remains only as a historical source and must not appear in the active quiz selection.

The current app loads only `data/mocks-01-to-03-60q.json`; it requires 60 well-formed questions per mock before enabling that mock. This file currently has an empty placeholder because transferring the complete PDF-only sources was not finished; it must be populated before marking mocks as released.

The latest source papers are `DOMiNANCE_CVS_Mock_01_60Q_Online_Edition.pdf`, `..._02_...`, `..._03_...` (all dated November 9, 2026), each including a separate worked key after Question 60. These supersede the earlier 40-question mocks.

## Application

Static responsive HTML/CSS/JS application; no build command is required. Test over HTTP for JSON loading. Supports practice and exam modes, timed quizzes, question navigation, saved attempts, result grading and review, and light/dark themes.

