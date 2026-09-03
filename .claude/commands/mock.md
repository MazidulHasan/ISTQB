---
description: Generate today's real, timed, full-syllabus HTML mock exam, including hard variant, or score a completed one
---

Follow the "Mock Exam Workflow" section of [AGENTS.md](../../AGENTS.md), the question quality bar in [prompts/question-coach.md](../../prompts/question-coach.md), and the full system reference in [question-bank/README.md](../../question-bank/README.md).

If the user is starting a new exam: grow `question-bank/bank.json` as needed (grounded in studied chapters' `concepts.md` where available, and in `resources/istqb-ctfl-syllabus-v4.0.1.extracted.txt` directly for chapters not yet studied — the mock exam always covers the full syllabus), then run `python tools/render_exam.py new` and hand the user the generated HTML file path to open and take in a browser.

If the user asks for `mock hard`, `/mock hard`, or a harder/trickier timed mock: grow `question-bank/bank.json` with fresh `difficulty: "red"` questions only, using closer ISTQB concept-pair distractors, subtler BEST/MOST/NOT wording, fair multi-statement traps, and demanding calculation or coverage variants. Then run `python tools/render_exam.py new --variant hard` and hand the user the generated `question-bank/exams/{date}-hard-{seq}.html` file path.

If the user is reporting back with an exported results file: read it, update `bank.json` and `syllabus/progress.md`, explain every incorrect answer with mistake-pattern analysis, and append a dated entry with a personalized revision plan to `revision/final-revision.md`, then run `python tools/render_html.py revision/final-revision.md`.
