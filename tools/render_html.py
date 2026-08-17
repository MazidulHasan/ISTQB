#!/usr/bin/env python3
"""Render a study-notes Markdown file into a self-contained, annotatable HTML page.

Usage:
    python tools/render_html.py chapters/1.1/concepts.md chapters/1.1/questions.md
    python tools/render_html.py chapters/1.1                 # renders every .md in that folder
    python tools/render_html.py                               # renders all chapters/**/*.md and revision/*.md

Each <input>.md gets a sibling <input>.html written next to it. The HTML is fully
self-contained (CSS/JS inlined from tools/assets/) so it works offline, opened
directly from disk, with no build step or server required.

Highlights and inline notes the reader adds in the browser are stored in the
browser's localStorage, keyed by this file's repo-relative path — NOT written
into the HTML file. That means re-running this script after the underlying .md
changes (e.g. after `/clarify`) does not erase a reader's annotations on any
paragraph whose text is unchanged; see tools/assets/study-page.js for how.

Requires: pip install -r tools/requirements.txt
"""
from __future__ import annotations

import hashlib
import html
import json
import re
import sys
from pathlib import Path

try:
    import markdown as md_lib
except ImportError:
    sys.exit("Missing dependency 'markdown'. Run: pip install -r tools/requirements.txt")

try:
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("Missing dependency 'beautifulsoup4'. Run: pip install -r tools/requirements.txt")

REPO_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = Path(__file__).resolve().parent / "assets"
CSS_PATH = ASSETS_DIR / "study-page.css"
JS_PATH = ASSETS_DIR / "study-page.js"

BLOCK_TAGS = {"p", "li", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6"}
QUESTION_HEADING_RE = re.compile(r"^Question\s+\d+\b", re.IGNORECASE)
OPTION_LINE_RE = re.compile(r"^([A-D])\.\s+(.+)$")


def render_markdown_to_soup(md_text: str) -> BeautifulSoup:
    html_fragment = md_lib.markdown(
        md_text,
        extensions=["extra", "sane_lists", "toc"],
        extension_configs={"toc": {"permalink": False}},
    )
    return BeautifulSoup(html_fragment, "html.parser")


def assign_block_ids(soup: BeautifulSoup) -> None:
    """Tag every text-bearing block element with a stable data-bid, derived from
    its own text content, so annotations survive regeneration as long as that
    specific block's text hasn't changed (see module docstring)."""
    seen: dict[str, int] = {}
    for el in soup.find_all(list(BLOCK_TAGS)):
        text = el.get_text(strip=True)
        digest = hashlib.sha1(f"{el.name}::{text}".encode("utf-8")).hexdigest()[:10]
        seen[digest] = seen.get(digest, 0) + 1
        bid = digest if seen[digest] == 1 else f"{digest}-{seen[digest]}"
        el["data-bid"] = bid


def wrap_tables(soup: BeautifulSoup) -> None:
    for table in soup.find_all("table"):
        wrapper = soup.new_tag("div", **{"class": "table-wrap"})
        table.insert_before(wrapper)
        wrapper.append(table.extract())


def _replace_text_with_badges(soup: BeautifulSoup, node) -> None:
    text = str(node)
    if not re.search(r"\bK[123]\b", text):
        return
    parts = re.split(r"(\bK[123]\b)", text)
    if len(parts) == 1:
        return
    for part in parts:
        if not part:
            continue
        if re.fullmatch(r"K[123]", part):
            badge = soup.new_tag("span", **{"class": f"k-badge k-{part.lower()}"})
            badge.string = part
            node.insert_before(badge)
        else:
            node.insert_before(part)
    node.extract()


def enhance_concept_page(soup: BeautifulSoup) -> None:
    """Add scan-friendly styling hooks for concept notes without changing the
    Markdown source. The content remains the source of truth; these classes only
    make generated study pages easier to read."""
    for text_node in list(soup.find_all(string=True)):
        parent = text_node.parent
        if parent and parent.name not in {"script", "style", "code", "pre"}:
            _replace_text_with_badges(soup, text_node)

    for p in soup.find_all("p"):
        text = p.get_text(" ", strip=True).lower()
        if text.startswith(("synonyms", "synonyms / exam wording", "alternative wording", "exam wording")):
            p["class"] = p.get("class", []) + ["synonyms-callout"]
        elif text.startswith(("real-world example", "example", "easy analogy")):
            p["class"] = p.get("class", []) + ["example-callout"]
        elif text.startswith(("level:", "k-level:", "learning objective")):
            p["class"] = p.get("class", []) + ["k-level-callout"]
        elif text.startswith(("common misunderstanding", "common exam trap", "exam trap")):
            p["class"] = p.get("class", []) + ["trap-callout"]


def convert_option_paragraphs(soup: BeautifulSoup) -> None:
    for p in list(soup.find_all("p")):
        lines = [line.strip() for line in p.get_text("\n", strip=True).splitlines() if line.strip()]
        parsed: list[tuple[str, str]] = []
        for line in lines:
            match = OPTION_LINE_RE.match(line)
            if match:
                parsed.append((match.group(1), match.group(2)))
        if len(parsed) < 2 or len(parsed) != len(lines):
            continue

        options = soup.new_tag("div", **{"class": "practice-options"})
        for letter, option_text in parsed:
            row = soup.new_tag("div", **{"class": "practice-option-row"})
            mark = soup.new_tag("span", **{"class": "option-letter"})
            mark.string = f"{letter}."
            body = soup.new_tag("span", **{"class": "option-text"})
            body.string = option_text
            row.append(mark)
            row.append(body)
            options.append(row)
        p.replace_with(options)


def mark_question_text_blocks(soup: BeautifulSoup) -> None:
    for p in soup.find_all("p"):
        text = p.get_text(" ", strip=True).lower()
        if text.startswith("question:"):
            p["class"] = p.get("class", []) + ["practice-question-text"]
        elif text.startswith("difficulty:"):
            p["class"] = p.get("class", []) + ["practice-meta"]


def enhance_question_page(soup: BeautifulSoup) -> None:
    """Convert Markdown question sections into exam-like self-paced cards.

    The original Markdown keeps full answers inline for revision. The generated
    HTML groups each answer/explanation inside a collapsible details block so the
    page behaves like untimed practice, not a timed mock exam.
    """
    convert_option_paragraphs(soup)
    mark_question_text_blocks(soup)

    for h3 in list(soup.find_all("h3")):
        if not QUESTION_HEADING_RE.match(h3.get_text(" ", strip=True)):
            continue

        card = soup.new_tag("section", **{"class": "practice-card"})
        front = soup.new_tag("div", **{"class": "practice-front"})
        details = soup.new_tag("details", **{"class": "practice-solution"})
        summary = soup.new_tag("summary")
        summary.string = "Show answer and explanation"
        details.append(summary)

        h3.insert_before(card)
        card.append(h3.extract())
        card.append(front)

        in_solution = False
        node = card.next_sibling
        while node is not None:
            next_node = node.next_sibling
            if getattr(node, "name", None) in {"h2", "h3"}:
                break
            if getattr(node, "name", None) == "hr":
                node.extract()
                break
            text = node.get_text(" ", strip=True).lower() if getattr(node, "get_text", None) else ""
            if getattr(node, "name", None) == "p" and text == "result":
                in_solution = True
                node.extract()
                node = next_node
                continue
            if getattr(node, "name", None):
                if in_solution:
                    details.append(node.extract())
                else:
                    front.append(node.extract())
            node = next_node

        if len(details.contents) > 1:
            card.append(details)
        else:
            details.decompose()


def extract_title(md_text: str, fallback: str) -> str:
    for line in md_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()
    return fallback


def breadcrumb_for(rel_path: Path) -> str:
    parts = rel_path.parts
    stem = rel_path.stem
    kind = stem.replace("-", " ").replace("_", " ").title()
    if parts[0] == "chapters" and len(parts) >= 2:
        return f"Chapter {parts[1]} › {kind}"
    if parts[0] == "revision":
        return f"Revision › {kind}"
    return kind


def render_file(md_path: Path, css: str, js: str) -> Path:
    md_text = md_path.read_text(encoding="utf-8")
    soup = render_markdown_to_soup(md_text)
    doc_kind = md_path.stem.lower()
    if doc_kind == "questions":
        enhance_question_page(soup)
    elif doc_kind == "concepts":
        enhance_concept_page(soup)
    assign_block_ids(soup)
    wrap_tables(soup)
    content_html = str(soup)

    rel_path = md_path.resolve().relative_to(REPO_ROOT)
    doc_id = rel_path.as_posix()
    title = extract_title(md_text, md_path.stem.replace("-", " ").title())
    crumb = breadcrumb_for(rel_path)

    page = TEMPLATE.format(
        title=html.escape(title),
        crumb=html.escape(crumb),
        content=content_html,
        css=css,
        js=js,
        doc_id_json=json.dumps(doc_id),
        title_json=json.dumps(title),
        body_class=html.escape(f"{doc_kind}-page"),
    )

    out_path = md_path.with_suffix(".html")
    out_path.write_text(page, encoding="utf-8")
    return out_path


TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — ISTQB Study Notes</title>
<meta name="generator" content="tools/render_html.py — do not hand-edit, regenerate from the source .md instead">
<style>
{css}
</style>
</head>
<body class="{body_class}">
<header class="study-header">
  <button class="icon-btn" id="tocToggle" title="Table of contents">☰</button>
  <div class="crumb">{crumb}</div>
  <div class="spacer"></div>
  <span class="save-indicator" id="saveIndicator">Saved</span>
  <button class="icon-btn has-count" id="notesToggle" title="Notes &amp; highlights">\U0001F4DD<span class="count" id="notesCount">0</span></button>
  <button class="icon-btn" id="themeToggle" title="Toggle light/dark">\U0001F319</button>
</header>

<div class="orphan-banner" id="orphanBanner"></div>

<div class="study-layout">
  <nav class="study-toc" id="studyToc"></nav>
  <main class="study-main">
    <div class="study-content" id="studyContent">
{content}
    </div>
  </main>
</div>

<div class="sel-toolbar" id="selToolbar">
  <button class="swatch yellow" data-color="yellow" title="Highlight yellow"></button>
  <button class="swatch green" data-color="green" title="Highlight green"></button>
  <button class="swatch blue" data-color="blue" title="Highlight blue"></button>
  <button class="swatch pink" data-color="pink" title="Highlight pink"></button>
  <button class="swatch orange" data-color="orange" title="Highlight orange"></button>
  <div class="divider"></div>
  <button class="action note" id="selNoteBtn">\U0001F4DD Note</button>
  <button class="action remove hidden" id="selRemoveBtn">✕ Remove</button>
</div>

<div class="note-popover" id="notePopover"></div>

<aside class="notes-panel" id="notesPanel">
  <div class="panel-head">
    <h3>Notes &amp; Highlights</h3>
    <button class="icon-btn" id="notesPanelClose">✕</button>
  </div>
  <div class="panel-body" id="notesPanelBody"></div>
  <div class="panel-foot">
    <button id="exportBtn">⬇ Export</button>
    <button id="importBtn">⬆ Import</button>
    <input type="file" id="importFile" accept="application/json">
  </div>
</aside>

<script>
window.__DOC_ID__ = {doc_id_json};
window.__DOC_TITLE__ = {title_json};
</script>
<script>
{js}
</script>
</body>
</html>
"""


def default_targets() -> list[Path]:
    targets: list[Path] = []
    for base in ("chapters", "revision"):
        base_dir = REPO_ROOT / base
        if base_dir.is_dir():
            targets.extend(sorted(base_dir.rglob("*.md")))
    return [p for p in targets if p.name.lower() != "readme.md"]


def collect_targets(args: list[str]) -> list[Path]:
    if not args:
        return default_targets()
    out: list[Path] = []
    for arg in args:
        p = Path(arg)
        if p.is_dir():
            out.extend(sorted(q for q in p.rglob("*.md") if q.name.lower() != "readme.md"))
        elif p.is_file():
            out.append(p)
        else:
            print(f"Skipping (not found): {arg}", file=sys.stderr)
    return out


def main() -> None:
    css = CSS_PATH.read_text(encoding="utf-8")
    js = JS_PATH.read_text(encoding="utf-8")
    targets = collect_targets(sys.argv[1:])
    if not targets:
        print("No Markdown files found to render.")
        return
    for md_path in targets:
        out = render_file(md_path, css, js)
        print(f"Rendered {out.resolve().relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
