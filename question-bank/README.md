# Question Bank & Mock Exam System

A real, timed, offline ISTQB CTFL v4.0.1 mock exam generator. Every question ever generated
lives permanently in `bank.json`; each day's sitting is a separate, self-contained HTML file
you open and take like a real exam.

## Files

```
question-bank/
    bank.json           # master question bank — append-only, grows every time /mock runs
    README.md           # this file
    exams/
        {date}-{seq}.json   # one exam sitting's snapshot: which 40 questions, in what order, duration/pass mark
        {date}-{seq}.html   # generated — the actual exam you open in a browser and take
    results/
        {date}-{seq}-results.json   # you move the browser-downloaded results file here after finishing
```

## Taking an exam

1. Ask Claude to generate today's exam ("give me today's mock exam", "/mock", "start a mock exam").
   Claude authors/selects 40 fresh questions from `bank.json` (adding new ones grounded in the syllabus
   where needed) and runs `python tools/render_exam.py new` to produce a session JSON + HTML.
2. Open the generated `question-bank/exams/{date}-{seq}.html` file directly in a browser
   (double-click it, or drag it into a browser window — no server needed).
3. Read the instructions on the start screen, then click **Start Exam**. No question text is
   part of the visible page before this click. A 75-minute countdown timer begins immediately
   and cannot be paused; the exam auto-submits at 00:00 even if the tab was closed and reopened
   (the deadline is a real timestamp, not a pausable counter).
4. Answer questions in any order using the question navigator (left sidebar). Flag any question
   for later review. Use the rough-notes box under each question for scratch work, calculations,
   option elimination, or reminders. Progress (answers, flags, rough notes, current question,
   remaining time) is saved to the
   browser's `localStorage` automatically — closing the file and reopening it resumes exactly
   where you left off, after an explicit "Resume Exam" click.
5. Click **Submit Exam** (or let the timer expire) to see your score, pass/fail against the 65%
   pass mark, and a per-chapter breakdown.
6. Click **View Full Solutions** to see every question with your answer, the correct answer, and
   the full explanation (why it's correct, option-by-option analysis, distractor analysis, and
   alternative exam wording).
7. Click **Export Results (JSON)** to download a small results file. Move it into
   `question-bank/results/` and tell Claude ("score my exam", "log my results") — Claude reads it,
   updates `bank.json`'s per-question stats, and appends a dated entry with a personalized
   revision plan to `revision/final-revision.md`, per the Mock Exam Workflow in `AGENTS.md`.

Nothing is scored or logged automatically by the HTML file itself — it's a self-contained static
page with no server, so the results export + hand-back-to-Claude step is what closes the loop.

## Fresh sittings and no-repeat policy

Every new timed mock sitting should contain question IDs that have not appeared in previous
`question-bank/exams/*.json` files. The same concept may be tested again, especially after a weak
result, but it must be authored as a new question with a fresh scenario, stem, wording, data values,
and distractor design.

`tools/render_exam.py new` enforces this by selecting only never-used question IDs. If there are not
enough fresh questions available, it exits with a message telling Claude how many new variants must
be added to `bank.json` before rendering the exam.

## `bank.json` schema

```jsonc
{
  "schema_version": 1,
  "meta": { "description": "...", "pass_mark_pct": 65 },
  "questions": [
    {
      "id": "Q001",                  // stable, never reused even if a question is later retired
      "chapter": "1.1",              // syllabus section — see resources/syllabus-outline.md
      "lo": "FL-1.1.2",              // learning objective code
      "topic": "Testing and Debugging",
      "type": "F",                   // A-I, matches the question-coach.md type taxonomy
      "difficulty": "yellow",        // green | yellow | red (Level 1/2/3)
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct": "B",
      "why_correct": "...",
      "option_notes": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "distractor_note": "...",      // optional — only on questions where a distractor deserves callout
      "alt_wording": "...",
      "created": "2026-08-16"
    }
  ]
}
```

An exam session file (`exams/{id}.json`) has the same question objects denormalized into it
(a snapshot, so it stays valid even if `bank.json` questions are later edited), plus
`exam_id`, `title`, `generated`, `duration_minutes`, `pass_mark_pct`, `bank_version`.

## Growing the bank

Each time a mock exam is generated, Claude should:

1. Read `bank.json` to see what already exists (avoid near-duplicate questions), read previous
   `question-bank/exams/*.json` to count which question IDs have already been used in a sitting,
   and read any files in `question-bank/results/` to see which topics have been getting missed.
2. Check `syllabus/progress.md` — chapters marked `Learning`/`Practicing`/`Completed` etc. have
   real `concepts.md` material to ground new questions in; for chapters not yet studied, ground
   new questions directly in `resources/istqb-ctfl-syllabus-v4.0.1.extracted.txt` instead (the
   full syllabus is in scope for the mock exam even before a chapter's dedicated study notes exist
   — see the "Exam scope" decision in `AGENTS.md`'s Mock Exam Workflow).
3. Author enough new questions (or targeted variants of weak-topic questions using different
   scenarios and wording) so the next sitting has 40 never-used question IDs available. Follow the
   question quality bar in `prompts/question-coach.md`, and append them to `bank.json` with fresh,
   never-reused IDs.
4. Run `python tools/render_exam.py new` to select today's 40 (weighted roughly by the official
   per-chapter exam-time weighting in `resources/syllabus-outline.md`) and render the HTML.

## Regenerating an exam's HTML without changing its questions

If `tools/assets/exam.css`/`exam.js` are updated (engine changes, not new questions), refresh
every existing session's HTML from its already-frozen session JSON without touching question
content or scrambling the order the candidate already saw:

```
python tools/render_exam.py                                   # re-renders every exams/*.json
python tools/render_exam.py question-bank/exams/2026-08-16-01.json   # re-renders just one
```

## Command reference

| Command | Effect |
|---|---|
| `python tools/render_exam.py new` | Select today's exam from never-used questions in `bank.json` (default 40 Q / 75 min / 65% pass mark), write a session JSON, render its HTML |
| `python tools/render_exam.py new --count N --duration M --pass-mark P` | Override the defaults |
| `python tools/render_exam.py <session.json>` | Re-render one session's HTML from its frozen snapshot |
| `python tools/render_exam.py` | Re-render every session under `question-bank/exams/` |
