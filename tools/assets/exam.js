// ISTQB CTFL Mock Exam engine — self-contained, inlined by tools/render_exam.py.
// No questions are rendered into the visible DOM until the candidate clicks "Start Exam".
(function () {
  "use strict";

  var EXAM = window.__EXAM__;
  var STORAGE_KEY = "istqb-exam-state:" + EXAM.examId;
  var THEME_KEY = "istqb-exam-theme";
  var root = document.getElementById("app");
  var timerInterval = null;
  // Set once startOrResume() runs during THIS page load. Reloading the file always lands
  // back on the start/resume gate first — it never silently drops the candidate back into
  // a question — even if an earlier browser session had already clicked Start.
  var resumedThisSession = false;

  // ---------------------------------------------------------------- state
  function freshState() {
    return {
      phase: "not_started", // not_started | in_progress | submitted
      answers: {},          // { questionId: "A" }
      flags: {},             // { questionId: true }
      currentIndex: 0,
      deadline: null,        // ms epoch timestamp — remaining time is derived from this, not decremented,
      startedAt: null,       // so the clock keeps real wall-clock time even if the tab is closed and reopened
      submittedAt: null,
      timeUsedSeconds: null
    };
  }

  // Remaining seconds, computed from the stored deadline so it reflects real elapsed time
  // even across a closed tab / reloaded file, matching how a real proctored exam timer behaves.
  function computeRemaining() {
    if (!state.deadline) return EXAM.durationMinutes * 60;
    return Math.round((state.deadline - Date.now()) / 1000);
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      var parsed = JSON.parse(raw);
      return Object.assign(freshState(), parsed);
    } catch (e) {
      return freshState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* storage full / disabled — degrade silently */ }
  }

  var state = loadState();

  // ---------------------------------------------------------------- theme
  function applyTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  }
  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme");
    var next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  }
  applyTheme();

  // ---------------------------------------------------------------- utils
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (attrs[k] === null || attrs[k] === undefined) return; // omit — do not stringify to "null"
      if (k === "class") node.className = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function formatTime(totalSeconds) {
    var s = Math.max(0, totalSeconds);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }

  function chapterNum(chapterCode) {
    return chapterCode.split(".")[0];
  }

  var CHAPTER_NAMES = {
    "1": "Fundamentals of Testing",
    "2": "Testing Throughout the SDLC",
    "3": "Static Testing",
    "4": "Test Analysis and Design",
    "5": "Managing the Test Activities",
    "6": "Test Tools"
  };

  function answeredCount() { return Object.keys(state.answers).length; }
  function flaggedCount() { return Object.keys(state.flags).filter(function (k) { return state.flags[k]; }).length; }

  // ---------------------------------------------------------------- render dispatch
  function render() {
    root.innerHTML = "";
    if (state.phase === "submitted") { renderResults(); return; }
    if (state.phase === "in_progress" && resumedThisSession) { renderExam(); return; }
    renderStart(); // covers not_started, and in_progress before the candidate has clicked Resume
  }

  // ---------------------------------------------------------------- start screen
  function renderStart() {
    stopTimer();
    var inProgress = state.phase === "in_progress";

    var shell = el("div", { class: "center-shell" });
    var card = el("div", { class: "card" });

    if (inProgress) {
      card.appendChild(el("div", { class: "resume-banner" }, [
        "An exam is already in progress (" + answeredCount() + "/" + EXAM.questions.length + " answered, " +
        formatTime(computeRemaining()) + " remaining). Starting over will discard that progress."
      ]));
    }

    card.appendChild(el("h1", { class: "start-title" }, [EXAM.title]));
    card.appendChild(el("p", { class: "start-sub" }, [
      "Generated " + EXAM.generated + " · Question bank v" + (EXAM.bankVersion || 1)
    ]));

    var meta = el("div", { class: "meta-grid" }, [
      metaTile(String(EXAM.questions.length), "Questions"),
      metaTile(EXAM.durationMinutes + " min", "Time Limit"),
      metaTile(EXAM.passMarkPct + "%", "Pass Mark"),
      metaTile(Math.round(EXAM.questions.length * EXAM.passMarkPct / 100) + "/" + EXAM.questions.length, "To Pass")
    ]);
    card.appendChild(meta);

    var rules = el("ul", { class: "rules-list" }, [
      el("li", {}, ["Every question has a single best answer. No answers or explanations are shown until you submit."]),
      el("li", {}, ["A countdown timer starts the moment you click Start and cannot be paused. The exam auto-submits at 00:00."]),
      el("li", {}, ["Use the question navigator to jump to any question in any order, and flag questions to revisit."]),
      el("li", {}, ["Your progress is saved in this browser automatically — closing the tab and reopening this file will resume where you left off."]),
      el("li", {}, ["After submitting, you can review the full solutions with explanations and export your results as a file."])
    ]);
    card.appendChild(rules);

    card.appendChild(el("button", {
      class: "big-btn", onclick: function () { startOrResume(inProgress); }
    }, [inProgress ? "Resume Exam" : "Start Exam"]));

    if (inProgress) {
      card.appendChild(el("button", {
        class: "big-btn secondary", style: "margin-top:10px;", onclick: function () {
          if (confirm("Discard your in-progress exam and start a fresh attempt?")) {
            state = freshState();
            saveState();
            render();
          }
        }
      }, ["Start Over Instead"]));
    }

    shell.appendChild(card);
    root.appendChild(topbar(false));
    root.appendChild(shell);
  }

  function metaTile(num, label) {
    return el("div", { class: "meta-tile" }, [
      el("span", { class: "num" }, [num]),
      el("span", { class: "label" }, [label])
    ]);
  }

  function startOrResume(wasInProgress) {
    if (!wasInProgress) {
      state = freshState();
      state.phase = "in_progress";
      state.startedAt = Date.now();
      state.deadline = state.startedAt + EXAM.durationMinutes * 60000;
    }
    resumedThisSession = true;
    saveState();
    render();
  }

  // ---------------------------------------------------------------- top bar
  function topbar(showTimer) {
    var bar = el("div", { class: "exam-topbar" }, [
      el("span", { class: "exam-title" }, [EXAM.title])
    ]);
    bar.appendChild(el("span", { class: "spacer" }));
    if (showTimer) {
      bar.appendChild(el("span", { class: "q-counter", id: "qCounter" }, [
        "Question " + (state.currentIndex + 1) + " of " + EXAM.questions.length
      ]));
      bar.appendChild(el("span", { class: "timer", id: "timerEl" }, [formatTime(computeRemaining())]));
    }
    bar.appendChild(el("button", { class: "icon-btn", title: "Toggle theme", onclick: toggleTheme }, ["\u{1F319}"]));
    return bar;
  }

  // ---------------------------------------------------------------- exam screen
  function renderExam() {
    var q = EXAM.questions[state.currentIndex];

    var layout = el("div", { class: "exam-layout" });
    layout.appendChild(renderNavigator());

    var main = el("div", { class: "exam-main" });
    var pct = ((state.currentIndex + 1) / EXAM.questions.length) * 100;
    main.appendChild(el("div", { class: "q-progress-bar" }, [
      el("div", { class: "q-progress-fill", style: "width:" + pct + "%" })
    ]));

    var headerRow = el("div", { class: "q-header-row" }, [
      el("span", { class: "q-num-badge" }, ["Q" + (state.currentIndex + 1)])
    ]);
    var isFlagged = !!state.flags[q.id];
    headerRow.appendChild(el("button", {
      class: "flag-btn" + (isFlagged ? " active" : ""),
      onclick: function () {
        if (state.flags[q.id]) delete state.flags[q.id];
        else state.flags[q.id] = true;
        saveState();
        render();
      }
    }, [(isFlagged ? "\u{1F6A9} Flagged" : "\u{1F6A9} Flag for review")]));
    main.appendChild(headerRow);

    main.appendChild(el("p", { class: "q-text" }, [q.question]));

    var optionsWrap = el("div", { class: "options" });
    ["A", "B", "C", "D"].forEach(function (letter) {
      if (!q.options[letter]) return;
      var selected = state.answers[q.id] === letter;
      var row = el("label", { class: "option-row" + (selected ? " selected" : "") }, [
        el("input", {
          type: "radio", name: "q_" + q.id, checked: selected ? "checked" : null,
          onchange: function () {
            state.answers[q.id] = letter;
            saveState();
            render();
          }
        }),
        el("span", { class: "option-letter" }, [letter + "."]),
        el("span", { class: "option-text" }, [q.options[letter]])
      ]);
      optionsWrap.appendChild(row);
    });
    main.appendChild(optionsWrap);
    layout.appendChild(main);

    var footer = el("div", { class: "exam-footer" }, [
      el("button", {
        class: "nav-action-btn", disabled: state.currentIndex === 0 ? "disabled" : null,
        onclick: function () { state.currentIndex = Math.max(0, state.currentIndex - 1); saveState(); render(); }
      }, ["← Previous"]),
      el("button", {
        class: "nav-action-btn", disabled: state.currentIndex === EXAM.questions.length - 1 ? "disabled" : null,
        onclick: function () { state.currentIndex = Math.min(EXAM.questions.length - 1, state.currentIndex + 1); saveState(); render(); }
      }, ["Next →"]),
      el("button", { class: "submit-btn", onclick: openSubmitModal }, ["Submit Exam"])
    ]);

    root.appendChild(topbar(true));
    root.appendChild(layout);
    root.appendChild(footer);
    startTimer();
    updateTimerDisplay();
  }

  function renderNavigator() {
    var nav = el("div", { class: "navigator" });
    nav.appendChild(el("h4", {}, ["Questions"]));
    var grid = el("div", { class: "nav-grid" });
    EXAM.questions.forEach(function (q, i) {
      var classes = ["nav-btn"];
      if (state.answers[q.id]) classes.push("answered");
      if (state.flags[q.id]) classes.push("flagged");
      if (i === state.currentIndex) classes.push("current");
      grid.appendChild(el("button", {
        class: classes.join(" "),
        onclick: function () { state.currentIndex = i; saveState(); render(); }
      }, [String(i + 1)]));
    });
    nav.appendChild(grid);
    nav.appendChild(el("div", { class: "nav-legend" }, [
      el("div", {}, [el("span", { class: "dot answered" }), "Answered"]),
      el("div", {}, [el("span", { class: "dot flagged" }), "Flagged"]),
      el("div", {}, [el("span", { class: "dot unanswered" }), "Unanswered"])
    ]));
    return nav;
  }

  // ---------------------------------------------------------------- timer
  function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(function () {
      if (computeRemaining() <= 0) {
        submitExam(true);
        return;
      }
      updateTimerDisplay();
    }, 1000);
  }
  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }
  function updateTimerDisplay() {
    var timerEl = document.getElementById("timerEl");
    if (!timerEl) return;
    var remaining = computeRemaining();
    timerEl.textContent = formatTime(remaining);
    timerEl.classList.remove("warn", "critical");
    if (remaining <= 300) timerEl.classList.add("critical");
    else if (remaining <= 600) timerEl.classList.add("warn");
    var counter = document.getElementById("qCounter");
    if (counter) counter.textContent = "Question " + (state.currentIndex + 1) + " of " + EXAM.questions.length;
  }

  // ---------------------------------------------------------------- submit
  function openSubmitModal() {
    var total = EXAM.questions.length;
    var answered = answeredCount();
    var unanswered = total - answered;
    var flagged = flaggedCount();

    var overlay = el("div", { class: "modal-overlay", onclick: function (e) { if (e.target === overlay) overlay.remove(); } });
    var modal = el("div", { class: "modal" }, [
      el("h3", {}, ["Submit exam?"]),
      el("p", {}, ["Once submitted, the timer stops and you cannot change any answers."]),
      el("div", { class: "modal-stats" }, [
        modalStat(String(answered), "Answered"),
        modalStat(String(unanswered), "Unanswered"),
        modalStat(String(flagged), "Flagged")
      ]),
      el("div", { class: "modal-actions" }, [
        el("button", { class: "nav-action-btn", onclick: function () { overlay.remove(); } }, ["Keep Working"]),
        el("button", { class: "submit-btn", onclick: function () { overlay.remove(); submitExam(false); } }, ["Submit Now"])
      ])
    ]);
    overlay.appendChild(modal);
    root.appendChild(overlay);
  }
  function modalStat(n, l) {
    return el("div", { class: "modal-stat" }, [el("span", { class: "n" }, [n]), el("span", { class: "l" }, [l])]);
  }

  function submitExam(auto) {
    stopTimer();
    state.phase = "submitted";
    state.submittedAt = Date.now();
    var maxSeconds = EXAM.durationMinutes * 60;
    var usedSeconds = state.startedAt ? Math.round((state.submittedAt - state.startedAt) / 1000) : maxSeconds;
    state.timeUsedSeconds = Math.min(maxSeconds, Math.max(0, usedSeconds));
    saveState();
    render();
    if (auto) {
      setTimeout(function () { alert("Time's up — your exam was submitted automatically."); }, 50);
    }
  }

  // ---------------------------------------------------------------- results
  function scoreExam() {
    var total = EXAM.questions.length;
    var correct = 0;
    var byChapter = {};
    EXAM.questions.forEach(function (q) {
      var cn = chapterNum(q.chapter);
      if (!byChapter[cn]) byChapter[cn] = { correct: 0, total: 0 };
      byChapter[cn].total += 1;
      var isCorrect = state.answers[q.id] === q.correct;
      if (isCorrect) { correct += 1; byChapter[cn].correct += 1; }
    });
    return { total: total, correct: correct, pct: Math.round((correct / total) * 1000) / 10, byChapter: byChapter };
  }

  function renderResults() {
    stopTimer();
    var score = scoreExam();
    var pass = score.pct >= EXAM.passMarkPct;

    var shell = el("div", { class: "center-shell" });
    var card = el("div", { class: "card" });

    card.appendChild(el("div", { class: "score-circle " + (pass ? "pass" : "fail") }, [
      el("span", { class: "pct" }, [score.pct + "%"]),
      el("span", { class: "frac" }, [score.correct + " / " + score.total])
    ]));
    var wrap = el("div", {});
    wrap.appendChild(el("div", { class: "pass-banner " + (pass ? "pass" : "fail") }, [pass ? "PASS" : "FAIL"]));
    wrap.appendChild(el("div", { class: "pass-mark-note" }, [
      "Pass mark: " + EXAM.passMarkPct + "% (" + Math.round(score.total * EXAM.passMarkPct / 100) + "/" + score.total + "). " +
      "Time used: " + (state.timeUsedSeconds !== null ? formatTime(state.timeUsedSeconds) : "—") + " of " + EXAM.durationMinutes + ":00."
    ]));
    card.appendChild(wrap);

    var table = el("table", { class: "breakdown-table" });
    table.appendChild(el("tr", {}, [
      el("th", {}, ["Chapter"]), el("th", {}, ["Score"]), el("th", {}, [""])
    ]));
    Object.keys(score.byChapter).sort().forEach(function (cn) {
      var row = score.byChapter[cn];
      var rowPct = (row.correct / row.total) * 100;
      table.appendChild(el("tr", {}, [
        el("td", {}, [cn + ". " + (CHAPTER_NAMES[cn] || "")]),
        el("td", {}, [row.correct + "/" + row.total]),
        el("td", {}, [el("div", { class: "mini-bar-track" }, [el("div", { class: "mini-bar-fill", style: "width:" + rowPct + "%" })])])
      ]));
    });
    card.appendChild(table);

    var actions = el("div", { class: "results-actions" }, [
      el("button", { class: "big-btn", onclick: function () { renderSolutionsScreen(score); } }, ["View Full Solutions"]),
      el("button", { class: "big-btn secondary", onclick: exportResults }, ["Export Results (JSON)"])
    ]);
    card.appendChild(actions);

    if (flaggedCount() > 0) {
      var flaggedIds = Object.keys(state.flags).filter(function (k) { return state.flags[k]; });
      card.appendChild(el("p", { class: "footer-note" }, [
        flaggedIds.length + " question(s) were flagged for review during the exam — see the solutions view for details."
      ]));
    }

    shell.appendChild(card);
    root.appendChild(topbar(false));
    root.appendChild(shell);
  }

  function exportResults() {
    var score = scoreExam();
    var payload = {
      examId: EXAM.examId,
      title: EXAM.title,
      generated: EXAM.generated,
      completedAt: new Date(state.submittedAt || Date.now()).toISOString(),
      durationMinutes: EXAM.durationMinutes,
      timeUsedSeconds: state.timeUsedSeconds,
      passMarkPct: EXAM.passMarkPct,
      score: score.correct,
      total: score.total,
      pct: score.pct,
      pass: score.pct >= EXAM.passMarkPct,
      answers: EXAM.questions.map(function (q) {
        return {
          id: q.id,
          chapter: q.chapter,
          topic: q.topic,
          chosen: state.answers[q.id] || null,
          correct: q.correct,
          isCorrect: state.answers[q.id] === q.correct,
          flagged: !!state.flags[q.id]
        };
      })
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = EXAM.examId + "-results.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  // ---------------------------------------------------------------- solutions
  function renderSolutionsScreen(score) {
    root.innerHTML = "";
    root.appendChild(topbar(false));
    var wrap = el("div", { class: "solutions-wrap" });

    wrap.appendChild(el("button", {
      class: "nav-action-btn", style: "margin-bottom:18px;", onclick: function () { render(); }
    }, ["← Back to Results"]));

    wrap.appendChild(el("h2", {}, ["Full Solutions"]));
    wrap.appendChild(el("p", { class: "start-sub" }, [
      "Score: " + score.correct + "/" + score.total + " (" + score.pct + "%). Your answer is marked when wrong; the correct answer is always highlighted green."
    ]));

    var jumpNav = el("div", { class: "jump-nav" });
    EXAM.questions.forEach(function (q, i) {
      var isCorrect = state.answers[q.id] === q.correct;
      jumpNav.appendChild(el("a", { href: "#sol-" + q.id, class: isCorrect ? "correct" : "incorrect" }, [String(i + 1)]));
    });
    wrap.appendChild(jumpNav);

    EXAM.questions.forEach(function (q, i) {
      var chosen = state.answers[q.id] || null;
      var isCorrect = chosen === q.correct;
      var status = chosen === null ? "unanswered" : (isCorrect ? "correct" : "incorrect");

      var item = el("div", { class: "sol-item " + status, id: "sol-" + q.id });
      var head = el("div", { class: "sol-head" }, [
        el("span", { class: "sol-badge " + status }, [status === "unanswered" ? "Unanswered" : (isCorrect ? "Correct" : "Incorrect")]),
        el("span", { class: "sol-tag" }, ["Chapter " + q.chapter + " · " + q.topic])
      ]);
      item.appendChild(head);
      item.appendChild(el("p", { class: "sol-q" }, ["Q" + (i + 1) + ". " + q.question]));

      ["A", "B", "C", "D"].forEach(function (letter) {
        if (!q.options[letter]) return;
        var cls = "sol-option";
        var mark = "";
        if (letter === q.correct) { cls += " is-correct"; mark = "✓"; }
        else if (letter === chosen) { cls += " is-your-wrong"; mark = "✗"; }
        var suffix = letter === chosen && letter !== q.correct ? " (your answer)" : (letter === q.correct ? " (correct answer)" : "");
        item.appendChild(el("div", { class: cls }, [
          el("span", { class: "sol-option-mark" }, [mark || "  "]),
          el("span", {}, [letter + ". " + q.options[letter] + suffix])
        ]));
      });

      var block = el("div", { class: "sol-block" });
      block.appendChild(el("h5", {}, ["Why the correct answer is correct"]));
      block.appendChild(el("p", {}, [q.why_correct]));
      block.appendChild(el("h5", {}, ["Option-by-option"]));
      ["A", "B", "C", "D"].forEach(function (letter) {
        if (!q.option_notes || !q.option_notes[letter]) return;
        block.appendChild(el("p", {}, [letter + ": " + q.option_notes[letter]]));
      });
      if (q.distractor_note) {
        block.appendChild(el("h5", {}, ["Distractor analysis"]));
        block.appendChild(el("p", {}, [q.distractor_note]));
      }
      if (q.alt_wording) {
        block.appendChild(el("h5", {}, ["How this could be asked differently"]));
        block.appendChild(el("p", {}, [q.alt_wording]));
      }
      item.appendChild(block);
      wrap.appendChild(item);
    });

    root.appendChild(wrap);
  }

  // ---------------------------------------------------------------- boot
  // If time already expired while the tab was closed, submit immediately rather than
  // showing a resume screen for a dead clock.
  if (state.phase === "in_progress" && computeRemaining() <= 0) {
    submitExam(true);
  } else {
    render();
  }
})();
