# ISTQB CTFL v4.0.1 Study Project

A personal, continuously-improving study notebook for the **ISTQB Certified Tester Foundation Level (CTFL) v4.0.1** exam, built for use with an AI coding agent (Codex CLI, Claude Code, etc.).

The core idea: give the agent a chapter number, get two Markdown study outputs (concept notes + practice questions) that live in this repo permanently, each paired with a styled, offline HTML reading page you can highlight and add notes on. Ask for clarification any time and the notes themselves get smarter — so revision later never depends on remembering the original chat.

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
│       ├── concepts.html     # ← open this one to actually study — see "Study Pages" below
│       ├── questions.md
│       ├── questions.html
│       └── clarifications.md (+ .html once it exists)
│
├── revision/
│   ├── weak-concepts.md      # concepts you keep getting wrong, across all chapters
│   ├── common-confusions.md  # concept pairs you keep mixing up
│   └── final-revision.md     # condensed pre-exam cheat sheet + mock exam log
│                              # (+ matching .html files, same as chapters/)
│
├── tools/
│   ├── render_html.py        # turns any study .md into its paired .html
│   ├── requirements.txt      # pip install -r tools/requirements.txt
│   └── assets/                # CSS/JS inlined into every generated page
│
└── .claude/commands/        # /study /clarify /practice /review /mock (Claude Code)
```

## Study Pages (highlight, annotate, auto-save)

Every `concepts.md` / `questions.md` (and `clarifications.md`, and everything in `revision/`) has a matching `.html` file, generated automatically at the end of every `/study`, `/clarify`, `/practice`, `/review`, and `/mock` run. **Open the `.html` file, not the `.md`, to actually study** — it's the same content, styled for comfortable long-form reading (serif body text, a jump-to sidebar, light/dark mode), with these built into the page itself:

- **Highlight in 5 colors**: select any text, a small toolbar appears with color swatches — click one to highlight it.
- **Add notes anywhere**: select text and choose "📝 Note" in that same toolbar to attach a comment to it; click the marker it leaves behind to reopen, edit, or delete it. A "Notes" panel (pencil icon, top right) lists every note on the page for quick review.
- **Auto-saves as you go, and survives closing the file**: every highlight and note is saved to the browser's local storage the moment you make it — no save button, and it's still there next time you open the file, even after fully closing the browser. Use the Export/Import buttons in the Notes panel to back annotations up to a JSON file (e.g. before clearing browser data, or to move them to another machine).
- **Works fully offline**: it's a single self-contained HTML file — no server, no internet connection, no build step. Just double-click it.

Because annotations live in the browser (not inside the HTML file), regenerating a page after a `/clarify` edit does **not** erase your highlights — only the specific paragraph that actually changed loses its anchor, and even then the highlight/note isn't deleted, just flagged as unresolved and still viewable in the Notes panel. See "HTML Study Pages" in [AGENTS.md](AGENTS.md) for exactly how that works.

**Setup:** the render script needs Python with two small packages: `pip install -r tools/requirements.txt` (installs `markdown`, `beautifulsoup4`; `pypdf` is also listed there, used for the `resources/` PDF text extraction). The agent runs `python tools/render_html.py ...` automatically as the last step of every workflow — you generally never need to run it by hand, except if you want to force-regenerate everything: `python tools/render_html.py` with no arguments does the whole repo.

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

1. **Study a chapter**: `/study 1.1` → open `chapters/1.1/concepts.html` in your browser and read/highlight/annotate it (the `.md` is the same content, plain).
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
