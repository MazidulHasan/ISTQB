#!/usr/bin/env python3
"""Build and render timed ISTQB CTFL mock exams from question-bank/bank.json.

Usage:
    python tools/render_exam.py new                      # pick today's exam from the bank, write session json + HTML
    python tools/render_exam.py new --count 40 --duration 75 --pass-mark 65
    python tools/render_exam.py new --variant hard       # hard/tricky sitting, named YYYY-MM-DD-hard-01
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
import re
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
SUPPORTED_VARIANTS = {"standard", "hard"}

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


def used_question_ids(exams_dir: Path) -> set[str]:
    """Return question IDs that have already appeared in an exam sitting."""
    used: set[str] = set()
    if not exams_dir.is_dir():
        return used
    for session_path in exams_dir.glob("*.json"):
        try:
            session = json.loads(session_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        for question in session.get("questions", []):
            question_id = question.get("id")
            if question_id:
                used.add(question_id)
    return used


def next_exam_id(exams_dir: Path, on_date: date, variant: str) -> str:
    date_part = on_date.isoformat()
    base = date_part if variant == "standard" else f"{date_part}-{variant}"
    existing = sorted(
        p.stem
        for p in exams_dir.glob(f"{base}-*.json")
        if re.fullmatch(rf"{re.escape(base)}-\d{{2}}", p.stem)
    )
    seq = len(existing) + 1
    return f"{base}-{seq:02d}"


def candidate_questions(questions: list[dict], used_ids: set[str], variant: str) -> list[dict]:
    unused_questions = [q for q in questions if q.get("id") not in used_ids]
    if variant == "hard":
        return [q for q in unused_questions if q.get("difficulty") == "red"]
    return unused_questions


def build_session(count: int, duration: int, pass_mark: int, bank_path: Path, seed: str | None, variant: str) -> dict:
    questions = load_bank(bank_path)
    used_ids = used_question_ids(EXAMS_DIR)
    unused_questions = candidate_questions(questions, used_ids, variant)
    if len(unused_questions) < count:
        missing = count - len(unused_questions)
        variant_note = " red-difficulty" if variant == "hard" else ""
        sys.exit(
            "Not enough fresh questions for a new sitting: "
            f"{len(unused_questions)} never-used{variant_note} question(s) available, {count} requested. "
            f"Add at least {missing} new, non-duplicate{variant_note} question variant(s) "
            "to question-bank/bank.json first."
        )

    rng = random.Random(seed or f"{date.today().isoformat()}:{variant}")
    chosen = rng.sample(unused_questions, count)

    exam_id = next_exam_id(EXAMS_DIR, date.today(), variant)
    title_variant = "Hard Mock Exam" if variant == "hard" else "Mock Exam"
    session = {
        "exam_id": exam_id,
        "title": f"ISTQB CTFL v4.0.1 - {title_variant}",
        "variant": variant,
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
        "variant": session.get("variant", "standard"),
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
    variant = "standard"
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
        elif args[i] == "--variant":
            variant = args[i + 1].lower(); i += 2
        elif args[i].lower() == "hard":
            variant = "hard"; i += 1
        else:
            sys.exit(f"Unknown option: {args[i]}")
    if variant not in SUPPORTED_VARIANTS:
        choices = ", ".join(sorted(SUPPORTED_VARIANTS))
        sys.exit(f"Unknown variant: {variant}. Supported variants: {choices}.")

    EXAMS_DIR.mkdir(parents=True, exist_ok=True)
    session = build_session(count, duration, pass_mark, bank_path, seed, variant)
    session_path = EXAMS_DIR / f"{session['exam_id']}.json"
    session_path.write_text(json.dumps(session, indent=2), encoding="utf-8")

    css = CSS_PATH.read_text(encoding="utf-8")
    js = JS_PATH.read_text(encoding="utf-8")
    out_path = render_session_file(session_path, css, js)

    print(f"Wrote session: {session_path.resolve().relative_to(REPO_ROOT)}")
    print(f"Rendered exam: {out_path.resolve().relative_to(REPO_ROOT)}")
    print(
        f"{len(session['questions'])} questions, {session['duration_minutes']} minutes, "
        f"pass mark {session['pass_mark_pct']}%, variant {session['variant']}."
    )


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
