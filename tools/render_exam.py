#!/usr/bin/env python3
"""Build and render timed ISTQB CTFL mock exams from question-bank/bank.json.

Usage:
    python tools/render_exam.py new                      # pick today's exam from the bank, write session json + HTML
    python tools/render_exam.py new --count 40 --duration 75 --pass-mark 65
    python tools/render_exam.py question-bank/exams/2026-08-16-01.json   # re-render one session's HTML
    python tools/render_exam.py                            # re-render every session under question-bank/exams/

The exam session JSON (question-bank/exams/<id>.json) is a denormalized snapshot of the
questions used in that sitting — a portable, self-contained record independent of later
changes to bank.json. The HTML is fully self-contained (CSS/JS inlined from tools/assets/exam.*)
so it works offline, opened directly from disk, with no server or build step.

No question text is revealed until the candidate clicks "Start Exam" in the browser — the
exam data is embedded as a JS variable but the UI gates on it, matching how a real exam
proctoring tool would gate the *view*, not the underlying file. See question-bank/README.md
for the full workflow (generation -> attempt -> export results -> scoring).

Requires: no third-party dependencies (stdlib only).
"""
from __future__ import annotations

import html
import json
import random
import sys
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = Path(__file__).resolve().parent / "assets"
CSS_PATH = ASSETS_DIR / "exam.css"
JS_PATH = ASSETS_DIR / "exam.js"
BANK_PATH = REPO_ROOT / "question-bank" / "bank.json"
EXAMS_DIR = REPO_ROOT / "question-bank" / "exams"

DEFAULT_COUNT = 40
DEFAULT_DURATION = 75
DEFAULT_PASS_MARK = 65

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — ISTQB Mock Exam</title>
<meta name="generator" content="tools/render_exam.py — do not hand-edit, regenerate from the session .json instead">
<style>
{css}
</style>
</head>
<body>
<div id="app"></div>
<script>
window.__EXAM__ = {exam_json};
</script>
<script>
{js}
</script>
</body>
</html>
"""


def load_bank(bank_path: Path) -> list[dict]:
    data = json.loads(bank_path.read_text(encoding="utf-8"))
    return data["questions"]


def next_exam_id(exams_dir: Path, on_date: date) -> str:
    base = on_date.isoformat()
    existing = sorted(p.stem for p in exams_dir.glob(f"{base}-*.json"))
    seq = len(existing) + 1
    return f"{base}-{seq:02d}"


def build_session(count: int, duration: int, pass_mark: int, bank_path: Path, seed: str | None) -> dict:
    questions = load_bank(bank_path)
    if count < len(questions):
        rng = random.Random(seed or date.today().isoformat())
        chosen = rng.sample(questions, count)
    else:
        chosen = list(questions)
        rng = random.Random(seed or date.today().isoformat())
        rng.shuffle(chosen)

    exam_id = next_exam_id(EXAMS_DIR, date.today())
    session = {
        "exam_id": exam_id,
        "title": "ISTQB CTFL v4.0.1 — Mock Exam",
        "generated": date.today().isoformat(),
        "duration_minutes": duration,
        "pass_mark_pct": pass_mark,
        "bank_version": 1,
        "questions": chosen,
    }
    return session


def session_to_exam_payload(session: dict) -> dict:
    """Strip the session down to exactly what the browser needs (no internal-only fields)."""
    return {
        "examId": session["exam_id"],
        "title": session["title"],
        "generated": session["generated"],
        "durationMinutes": session["duration_minutes"],
        "passMarkPct": session["pass_mark_pct"],
        "bankVersion": session.get("bank_version", 1),
        "questions": [
            {
                "id": q["id"],
                "chapter": q["chapter"],
                "topic": q["topic"],
                "type": q["type"],
                "difficulty": q["difficulty"],
                "question": q["question"],
                "options": q["options"],
                "correct": q["correct"],
                "why_correct": q["why_correct"],
                "option_notes": q.get("option_notes", {}),
                "distractor_note": q.get("distractor_note"),
                "alt_wording": q.get("alt_wording"),
            }
            for q in session["questions"]
        ],
    }


def render_session_file(session_path: Path, css: str, js: str) -> Path:
    session = json.loads(session_path.read_text(encoding="utf-8"))
    exam_payload = session_to_exam_payload(session)
    page = TEMPLATE.format(
        title=html.escape(session["title"]),
        css=css,
        js=js,
        exam_json=json.dumps(exam_payload),
    )
    out_path = session_path.with_suffix(".html")
    out_path.write_text(page, encoding="utf-8")
    return out_path


def cmd_new(args: list[str]) -> None:
    count = DEFAULT_COUNT
    duration = DEFAULT_DURATION
    pass_mark = DEFAULT_PASS_MARK
    seed = None
    bank_path = BANK_PATH
    i = 0
    while i < len(args):
        if args[i] == "--count":
            count = int(args[i + 1]); i += 2
        elif args[i] == "--duration":
            duration = int(args[i + 1]); i += 2
        elif args[i] == "--pass-mark":
            pass_mark = int(args[i + 1]); i += 2
        elif args[i] == "--seed":
            seed = args[i + 1]; i += 2
        elif args[i] == "--bank":
            bank_path = REPO_ROOT / args[i + 1]; i += 2
        else:
            sys.exit(f"Unknown option: {args[i]}")

    EXAMS_DIR.mkdir(parents=True, exist_ok=True)
    session = build_session(count, duration, pass_mark, bank_path, seed)
    session_path = EXAMS_DIR / f"{session['exam_id']}.json"
    session_path.write_text(json.dumps(session, indent=2), encoding="utf-8")

    css = CSS_PATH.read_text(encoding="utf-8")
    js = JS_PATH.read_text(encoding="utf-8")
    out_path = render_session_file(session_path, css, js)

    print(f"Wrote session: {session_path.resolve().relative_to(REPO_ROOT)}")
    print(f"Rendered exam: {out_path.resolve().relative_to(REPO_ROOT)}")
    print(f"{len(session['questions'])} questions, {session['duration_minutes']} minutes, pass mark {session['pass_mark_pct']}%.")


def cmd_render(args: list[str]) -> None:
    css = CSS_PATH.read_text(encoding="utf-8")
    js = JS_PATH.read_text(encoding="utf-8")
    if not args:
        targets = sorted(EXAMS_DIR.glob("*.json")) if EXAMS_DIR.is_dir() else []
        if not targets:
            print("No exam sessions found under question-bank/exams/.")
            return
    else:
        targets = [Path(a) for a in args]
    for session_path in targets:
        if not session_path.is_file():
            print(f"Skipping (not found): {session_path}", file=sys.stderr)
            continue
        out = render_session_file(session_path, css, js)
        print(f"Rendered {out.resolve().relative_to(REPO_ROOT)}")


def main() -> None:
    argv = sys.argv[1:]
    if argv and argv[0] == "new":
        cmd_new(argv[1:])
    else:
        cmd_render(argv)


if __name__ == "__main__":
    main()
