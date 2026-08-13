# ISTQB CTFL v4.0.1 Study Project

A personal, continuously-improving study notebook for the **ISTQB Certified Tester Foundation Level (CTFL) v4.0.1** exam, built for use with an AI coding agent (Codex CLI, Claude Code, etc.).

The core idea: give the agent a chapter number, get two Markdown study outputs (concept notes + practice questions) that live in this repo permanently. Ask for clarification any time and the notes themselves get smarter — so revision later never depends on remembering the original chat.

## How It Works

All behavior is defined in [AGENTS.md](AGENTS.md) — the agent reads this file to know what to do. `CLAUDE.md` just points Claude Code at it, and `.claude/commands/` wraps the same workflows as real slash commands for Claude Code users. Codex (or any other agent) can use the same commands as plain instructions, since `AGENTS.md` is the shared source of truth.

```
├── AGENTS.md              # main instructions the agent follows (source of truth)
├── CLAUDE.md               # points Claude Code at AGENTS.md
├── README.md
│
├── prompts/
│   ├── concept-teacher.md  # master prompt → chapters/{chapter}/concepts.md
│   └── question-coach.md   # master prompt → chapters/{chapter}/questions.md
│
├── resources/
│   ├── ISTQB_CTFL_Syllabus_v4.0.1.pdf                # official syllabus (source of truth)
│   ├── istqb-ctfl-syllabus-v4.0.1.extracted.txt       # plain-text extraction (PDF rendering needs poppler; this doesn't)
│   ├── syllabus-outline.md                            # curated outline: chapters, LOs, K-levels, keywords, exam weight
│   ├── Foundations-of-software-testing---ISTQB-Certification.pdf  # supplementary book (older edition — practice Qs, examples)
│   └── foundations-of-software-testing.extracted.txt  # plain-text extraction of the book
│
├── syllabus/
│   └── progress.md         # progress tracker across the whole CTFL v4.0.1 syllabus
│
├── chapters/
│   └── {chapter}/           # created on first /study, e.g. 1.1, 2.3
│       ├── concepts.md
│       ├── questions.md
│       └── clarifications.md
│
├── revision/
│   ├── weak-concepts.md      # concepts you keep getting wrong, across all chapters
│   ├── common-confusions.md  # concept pairs you keep mixing up
│   └── final-revision.md     # condensed pre-exam cheat sheet + mock exam log
│
└── .claude/commands/        # /study /clarify /practice /review /mock (Claude Code)
```

## Commands

These work as slash commands in Claude Code, or as plain natural-language requests in Codex/any agent that reads `AGENTS.md`:

| Command | What it does |
|---|---|
| `/study 1.1` | Generate (or improve) `concepts.md` and `questions.md` for chapter 1.1 |
| `/clarify 1.1 <your question>` | Get an answer, and have it merged permanently into chapter 1.1's notes |
| `/practice 1.1 tricky` | Add new practice questions (`easy`, `medium`, `tricky`, `scenario`, `mixed`, or a technique like `calculation`) |
| `/review 1.1` | Quick recap of a chapter without necessarily rewriting files |
| `/review weak` | Rebuild the consolidated weak-areas sheet in `revision/` from every chapter |
| `/mock` | Full mixed mock exam across everything studied so far, scored and analyzed |

## Suggested Workflow

1. **Study a chapter**: `/study 1.1` → read `chapters/1.1/concepts.md`.
2. **Ask questions as you read**: `/clarify 1.1 explain verification vs validation with a healthcare example` → the answer is folded into your notes automatically.
3. **Practice**: `/practice 1.1 tricky` → answer questions in chat; wrong answers get explained option-by-option and logged as weak areas.
4. **Move to the next chapter**, repeating 1–3. Chapter numbers in [syllabus/progress.md](syllabus/progress.md) follow the official CTFL v4.0.1 structure, as detailed in [resources/syllabus-outline.md](resources/syllabus-outline.md).
5. **Periodically run** `/review weak` to keep `revision/final-revision.md` current.
6. **Before the exam**: run `/mock` for full mixed practice exams, and do a final read of `revision/final-revision.md`.

## Source Material

`resources/` holds the two PDFs you provided plus plain-text extractions of each (see [AGENTS.md](AGENTS.md) for why the extractions exist and how they're used):

- **`ISTQB_CTFL_Syllabus_v4.0.1.pdf`** — the official syllabus. This is the authoritative source for chapter structure, learning objectives, and exam scope. [resources/syllabus-outline.md](resources/syllabus-outline.md) is a curated summary of it (all 6 chapters, every learning objective with its K-level, keywords, and exam time weighting) — start there.
- **`Foundations-of-software-testing---ISTQB-Certification.pdf`** — a supplementary textbook (Graham/van Veenendaal/Evans/Black) with extra explanations, examples, and sample exam questions. It targets an older syllabus edition, so its structure doesn't line up 1:1 with v4.0.1 — it's used only for supplementary content, never for scope or structure.

## Notes

- Nothing here is ever silently overwritten — see the "File Safety Rule" in `AGENTS.md`. Re-running `/study` on a chapter you've already done reviews and improves the existing notes rather than replacing them.
- PDF rendering (the `Read` tool's built-in PDF support) requires a `poppler` install that isn't present in this environment — that's why the `.extracted.txt` files exist alongside each PDF in `resources/`. If poppler ever becomes available, the PDFs remain readable directly too.
- This repo is meant to be pushed to GitHub as a private study log. Run `git init` (already done, see below) and add a remote whenever you're ready.
