# DOMiNANCE Originals — how to add curated questions (hand-off guide)

This is the spec for adding **DOMiNANCE Originals** (our own written questions) to the Q bank.
Follow it exactly so new questions match the existing set and the build doesn't break.
Any agent (Claude or ChatGPT) with the GitHub repo + Vercel can do this; Vercel auto-deploys `main`.

## Golden rules
- **Past questions are never changed** (only clear spelling fixes, separately). This guide is for *curated* questions.
- **Write only from the lecture digest provided.** Do not invent facts. Where a slide differs from a textbook, follow the slide and say so in the explanation.
- **One agent at a time.** `git pull` before editing, commit + push when done. Don't both edit the repo at once.

## Where curated questions live
Each subject has a curated JSON already wired into `data/catalog.json`:
- Biochemistry → `data/biochem/biochem-curated.json`  (topic ids: `lipids`, `nitrogen`, `ros`)
- Anatomy → `data/anatomy/micro-curated.json`, `data/anatomy/gross-curated.json`
To add questions, **append objects to the `questions` array** of the right file. No catalog change needed if the file is already listed.

## Question JSON schema
Every question is one object in `questions`:
```json
{
  "id": "dq-bio-xxx",              // globally UNIQUE within the file
  "type": "single-best",           // all curated questions use this type
  "stem": "Question text …",
  "options": [ {"label":"A","text":"…"}, … ],   // 5 options (A–E), or 4, or 2 for True/False
  "correctAnswer": "B",            // must match one option label
  "why": "One-line explanation of the answer.",
  "topicId": "nitrogen",           // must be a real topic id for that subject
  "subtopic": "Amino acid reactions",
  "difficulty": "medium",          // easy | medium | hard
  "notes": { "A":"why A is wrong", "C":"…" },    // distractor notes (optional, omit the correct letter)
  "lockOrder": true                // ONLY for Assertion-Reason, I/II/III, True/False (see below)
}
```
The app shuffles option order at runtime **unless** `lockOrder: true`.

## The MCQ quality standard (non-negotiable)
- All options are **plausible** distractors of **comparable length**. The correct answer must **not** be the longest option (never longer than the next option by more than ~3 characters) **nor** a conspicuously short outlier. A student must not be able to guess before reading the stem.
- 5 options for ordinary single-best and EXCEPT items; options all distinct; no "all/none of the above" filler.
- Ground every fact in the digest; keep medical accuracy.

## Exam styles to include (biochem especially)
Biochem exams lean on these — include a healthy mix, not just plain single-best. For the templated styles set `lockOrder: true` and **spread the answer keys across A–E** (don't let one letter dominate):

1. **Plain single-best** — 5 options, shuffled.
2. **Assertion–Reason** — stem is `"Assertion: …\nReason: …"`; the 5 options are fixed:
   `A Both true, correct explanation` · `B Both true, not correct explanation` · `C Assertion true, Reason false` · `D Assertion false, Reason true` · `E Both false`. Vary which key is correct.
3. **Multiple-completion (I/II/III)** — stem lists three statements `I. … II. … III. …`; options are combinations e.g. `A I, II and III` · `B I and II only` · `C II and III only` · `D I and III only` · `E I only`. **Rotate which statement is the false one** (sometimes I, sometimes II, sometimes III) and spread the key.
4. **EXCEPT** — "All of the following … EXCEPT:"; the odd-one-out should be plausible, not absurd. 5 options, shuffled (no lockOrder).
5. **True / False** — stem `"True or false: …"`, two options `A True` / `B False`, `lockOrder: true`. Use sparingly; balance true vs false.

## Don't duplicate what's already written
`nitrogen` already covers (≈75 questions): amino-acid structure, zwitterion/pI, the five side-chain classes, essential vs non-essential & conditionally essential, glucogenic/ketogenic classification, decarboxylation products (histamine/dopamine/serotonin), transamination + PLP, AST/ALT, oxidative deamination + glutamate dehydrogenase, transdeamination, digestion/zymogens. **Write NEW points only.**

## This batch — the three biochem digests
Write `nitrogen` questions from these (skip "amino-acid-metabolism-part-1" — it duplicates the structure/reactions lecture already covered):
- **Transport of ammonia** → urea cycle (5 steps: CPS1→OTC→ASS→ASL→arginase; mitochondrial vs cytosolic steps; N-acetylglutamate activates CPS1; BUN as kidney test, blood ammonia as liver test), glutamine as the main ammonia carrier to kidney, glucose–alanine (alanine) cycle, glutamine synthetase/glutaminase, ammonia toxicity (depletes α-KG, GABA, encephalopathy), ammonotelic/ureotelic/uricotelic, urea-cycle enzyme-defect outcomes (hyperammonaemia). Suggested subtopic: `"Ammonia transport and the urea cycle"`.
- **Carbon-skeleton catabolism** → branched-chain amino acids (Leu ketogenic, Val glucogenic, Ile both; shared BCAA aminotransferase then branched-chain α-keto-acid dehydrogenase), Maple Syrup Urine Disease (α-keto-acid DH defect, maple-syrup odour, thiamine-responsive), isovaleric acidaemia (cheesy odour, leucine), phenylketonuria (phenylalanine hydroxylase, chromosome 12, musty odour), tyrosinaemia types, histidine catabolism. Suggested subtopic: `"Amino acid catabolism and inborn errors"`.
- **Sulfur amino acid catabolism** → read the digest and cover methionine/cysteine/homocysteine, transsulfuration, homocystinuria, etc. Suggested subtopic: `"Sulfur amino acid metabolism"`.

## Build, validate, deploy
1. Append the new objects to `data/biochem/biochem-curated.json`.
2. Validate: file is valid JSON; every `correctAnswer` matches an option label; no duplicate `id`; run the length check (no answer is the longest by >3 chars).
3. Bump the service-worker cache so phones pull the update: in `sw.js`, increment `const CACHE = 'dq-vNN';` (e.g. v34 → v35).
4. `git pull`, commit, `git push origin main`. Vercel builds automatically; confirm the deployment goes green.

## Quick validation snippet
```python
import json
qs = json.load(open('data/biochem/biochem-curated.json'))['questions']
ids = [q['id'] for q in qs]; assert len(ids) == len(set(ids)), 'duplicate id'
for q in qs:
    labs = [o['label'] for o in q['options']]
    assert q['correctAnswer'] in labs, q['id']
    if q.get('lockOrder'): continue
    L = [len(o['text']) for o in q['options']]; a = labs.index(q['correctAnswer'])
    hi = sorted(L)[-2]
    assert not (L[a] == max(L) and L[a] - hi > 3), ('answer is longest: ' + q['id'])
print('ok', len(qs))
```
