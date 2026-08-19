/* ISTQB study page — highlighting, inline notes, and auto-save.
   Generated pages inline this file. All state lives in the browser's
   localStorage, keyed by the document's repo-relative path, so regenerating
   the underlying .md/.html does not erase annotations on unchanged text. */
(function () {
  "use strict";

  var THEME_KEY = "istqb:theme";
  var docId = window.__DOC_ID__ || location.pathname;
  var storageKey = "istqb:doc:" + docId;

  var els = {};
  var store = { version: 1, annotations: [], practiceNotes: {} };
  var currentRange = null;
  var currentRemoveTarget = null;
  var saveTimer = null;

  var COLORS = ["yellow", "green", "blue", "pink", "orange"];

  /* ---------------- utilities ---------------- */

  function $(id) { return document.getElementById(id); }

  function debounce(fn, wait) {
    var t = null;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  function cssEscape(s) {
    return window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function genId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function formatWhen(iso) {
    try { return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }); }
    catch (e) { return iso; }
  }

  function toast(msg) {
    var t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;left:50%;bottom:26px;transform:translateX(-50%);" +
      "background:var(--text);color:var(--bg);padding:8px 14px;border-radius:8px;" +
      "font:13px -apple-system,Segoe UI,sans-serif;z-index:100;box-shadow:var(--shadow);opacity:0;transition:opacity .2s;";
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = "1"; });
    setTimeout(function () {
      t.style.opacity = "0";
      setTimeout(function () { t.remove(); }, 250);
    }, 2200);
  }

  /* ---------------- theme ---------------- */

  function loadTheme() {
    var t = localStorage.getItem(THEME_KEY);
    if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
    updateThemeBtn();
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    if (!cur) cur = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeBtn();
  }

  function updateThemeBtn() {
    var cur = document.documentElement.getAttribute("data-theme");
    if (!cur) cur = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    els.themeToggle.textContent = cur === "dark" ? "☀️" : "🌙";
  }

  /* ---------------- storage ---------------- */

  function loadStore() {
    try {
      var raw = localStorage.getItem(storageKey);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.annotations)) {
          store = Object.assign({ version: 1, annotations: [], practiceNotes: {} }, parsed);
          if (!store.practiceNotes || typeof store.practiceNotes !== "object" || Array.isArray(store.practiceNotes)) {
            store.practiceNotes = {};
          }
        }
      }
    } catch (e) { /* corrupt storage — start fresh rather than crash the page */ }
  }

  function saveStoreNow() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(store));
      flashSaved();
    } catch (e) {
      toast("Could not save — browser storage may be full or disabled.");
    }
  }

  function saveStore() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveStoreNow, 250);
  }

  function flashSaved() {
    var el = els.saveIndicator;
    el.textContent = "Saved " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    el.classList.add("show");
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(function () { el.classList.remove("show"); }, 1800);
  }

  /* ---------------- DOM path anchoring ---------------- */

  function findBlock(node) {
    var el = node.nodeType === 3 ? node.parentElement : node;
    return el ? el.closest("[data-bid]") : null;
  }

  function getPath(root, node) {
    var path = [];
    var cur = node;
    while (cur !== root) {
      var parent = cur.parentNode;
      if (!parent) return null;
      path.unshift(Array.prototype.indexOf.call(parent.childNodes, cur));
      cur = parent;
    }
    return path;
  }

  function resolvePath(root, path) {
    var cur = root;
    for (var i = 0; i < path.length; i++) {
      if (!cur || !cur.childNodes || !cur.childNodes[path[i]]) return null;
      cur = cur.childNodes[path[i]];
    }
    return cur;
  }

  function firstTextNode(node) {
    if (node.nodeType === 3) return node;
    if (node.nodeType === 1) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var t = firstTextNode(node.childNodes[i]);
        if (t) return t;
      }
    }
    return null;
  }

  function lastTextNode(node) {
    if (node.nodeType === 3) return node;
    if (node.nodeType === 1) {
      for (var i = node.childNodes.length - 1; i >= 0; i--) {
        var t = lastTextNode(node.childNodes[i]);
        if (t) return t;
      }
    }
    return null;
  }

  /** Normalize a Range boundary (which per spec may land on an element with a
   * childNodes offset) down to an actual text node + character offset. */
  function normalizeBoundary(container, offset, isStart) {
    if (container.nodeType === 3) return { node: container, offset: offset };
    var kids = container.childNodes;
    if (isStart) {
      for (var i = offset; i < kids.length; i++) {
        var t = firstTextNode(kids[i]);
        if (t) return { node: t, offset: 0 };
      }
    } else {
      for (var j = offset - 1; j >= 0; j--) {
        var t2 = lastTextNode(kids[j]);
        if (t2) return { node: t2, offset: t2.length };
      }
    }
    return null;
  }

  /* ---------------- wrapping ---------------- */

  function wrapRange(range, rec) {
    var frag = range.extractContents();
    var wrapper = document.createElement(rec.type === "note" ? "span" : "mark");
    if (rec.type === "highlight") {
      wrapper.className = "hl hl-" + rec.color;
      wrapper.dataset.hid = rec.id;
    } else {
      wrapper.className = "note-anchor";
      wrapper.dataset.nid = rec.id;
    }
    wrapper.appendChild(frag);
    range.insertNode(wrapper);
    if (rec.type === "note") {
      var marker = document.createElement("sup");
      marker.className = "note-marker";
      marker.dataset.nid = rec.id;
      marker.textContent = "💬";
      marker.title = "View note";
      wrapper.insertAdjacentElement("afterend", marker);
    }
  }

  function applyStoredAnnotation(rec) {
    var blockEl = document.querySelector("[data-bid=\"" + cssEscape(rec.blockId) + "\"]");
    if (!blockEl) return false;
    var startNode = resolvePath(blockEl, rec.startPath);
    var endNode = resolvePath(blockEl, rec.endPath);
    if (!startNode || !endNode || startNode.nodeType !== 3 || endNode.nodeType !== 3) return false;
    if (rec.startOffset > startNode.length || rec.endOffset > endNode.length) return false;
    var range = document.createRange();
    try {
      range.setStart(startNode, rec.startOffset);
      range.setEnd(endNode, rec.endOffset);
    } catch (e) { return false; }
    if (range.collapsed) return false;
    try { wrapRange(range, rec); } catch (e) { return false; }
    return true;
  }

  function applyAllStored() {
    var orphans = [];
    store.annotations.forEach(function (rec) {
      if (!applyStoredAnnotation(rec)) orphans.push(rec);
    });
    if (orphans.length) showOrphanBanner(orphans);
  }

  function showOrphanBanner(orphans) {
    var banner = els.orphanBanner;
    banner.innerHTML = "<strong>" + orphans.length + " highlight" + (orphans.length === 1 ? "" : "s") +
      "/note" + (orphans.length === 1 ? "" : "s") + " from a previous version of this page could not be re-located</strong> " +
      "(the surrounding text changed). Nothing was deleted — they're still saved and listed in the Notes panel.";
    var ul = document.createElement("ul");
    orphans.slice(0, 6).forEach(function (o) {
      var li = document.createElement("li");
      li.textContent = (o.type === "note" ? "Note: " : "Highlight: ") + "“" + (o.text || "").slice(0, 90) + "”";
      ul.appendChild(li);
    });
    banner.appendChild(ul);
    var btn = document.createElement("button");
    btn.textContent = "Dismiss";
    btn.addEventListener("click", function () { banner.classList.remove("show"); });
    banner.appendChild(btn);
    banner.classList.add("show");
  }

  /* ---------------- creating annotations ---------------- */

  function createAnnotation(type, color, range) {
    var startBlock = findBlock(range.startContainer);
    var endBlock = findBlock(range.endContainer);
    if (!startBlock || !endBlock || startBlock !== endBlock) {
      toast("Select text within a single paragraph, list item, or table cell.");
      return null;
    }
    var startInfo = normalizeBoundary(range.startContainer, range.startOffset, true);
    var endInfo = normalizeBoundary(range.endContainer, range.endOffset, false);
    if (!startInfo || !endInfo) {
      toast("Could not anchor that selection — try selecting plain text.");
      return null;
    }
    var workRange = document.createRange();
    workRange.setStart(startInfo.node, startInfo.offset);
    workRange.setEnd(endInfo.node, endInfo.offset);
    if (workRange.collapsed || !workRange.toString().trim()) {
      toast("Nothing to annotate in that selection.");
      return null;
    }

    var rec = {
      id: genId(),
      type: type,
      blockId: startBlock.dataset.bid,
      startPath: getPath(startBlock, startInfo.node),
      startOffset: startInfo.offset,
      endPath: getPath(startBlock, endInfo.node),
      endOffset: endInfo.offset,
      color: type === "highlight" ? color : undefined,
      text: workRange.toString().slice(0, 240),
      note: "",
      createdAt: new Date().toISOString()
    };

    wrapRange(workRange, rec);
    var liveSel = window.getSelection();
    if (liveSel) liveSel.removeAllRanges();
    store.annotations.push(rec);
    saveStore();
    return rec;
  }

  function removeAnnotationById(id) {
    var idx = store.annotations.findIndex(function (a) { return a.id === id; });
    if (idx === -1) return;
    var rec = store.annotations[idx];
    var sel = rec.type === "highlight"
      ? "mark.hl[data-hid=\"" + cssEscape(id) + "\"]"
      : ".note-anchor[data-nid=\"" + cssEscape(id) + "\"]";
    var el = document.querySelector(sel);
    if (el) el.replaceWith.apply(el, Array.prototype.slice.call(el.childNodes));
    if (rec.type === "note") {
      var marker = document.querySelector(".note-marker[data-nid=\"" + cssEscape(id) + "\"]");
      if (marker) marker.remove();
    }
    store.annotations.splice(idx, 1);
    saveStore();
    refreshNotesUI();
  }

  function changeHighlightColor(id, color) {
    var rec = store.annotations.find(function (a) { return a.id === id; });
    if (!rec) return;
    rec.color = color;
    var el = document.querySelector("mark.hl[data-hid=\"" + cssEscape(id) + "\"]");
    if (el) el.className = "hl hl-" + color;
    saveStore();
  }

  /* ---------------- selection toolbar ---------------- */

  function wireSelectionToolbar() {
    var bar = els.selToolbar;
    bar.addEventListener("mousedown", function (e) { e.preventDefault(); });

    Array.prototype.forEach.call(bar.querySelectorAll(".swatch"), function (btn) {
      btn.addEventListener("click", function () {
        if (!currentRange) return;
        if (currentRemoveTarget) return;
        createAnnotation("highlight", btn.dataset.color, currentRange.cloneRange());
        hideSelToolbar();
        refreshNotesUI();
      });
    });

    els.selNoteBtn.addEventListener("click", function () {
      if (!currentRange) return;
      var rec = createAnnotation("note", null, currentRange.cloneRange());
      hideSelToolbar();
      if (rec) {
        refreshNotesUI();
        var markerEl = document.querySelector(".note-marker[data-nid=\"" + cssEscape(rec.id) + "\"]");
        openNotePopoverForEl(rec.id, markerEl, true);
      }
    });

    els.selRemoveBtn.addEventListener("click", function () {
      if (currentRemoveTarget) removeAnnotationById(currentRemoveTarget);
      hideSelToolbar();
    });

    document.addEventListener("mouseup", handleSelectionChange);
    document.addEventListener("keyup", function (e) {
      if (e.shiftKey || e.key === "Shift") handleSelectionChange();
    });
  }

  function handleSelectionChange(e) {
    if (e && e.target && (els.selToolbar.contains(e.target) || els.notePopover.contains(e.target) || els.notesPanel.contains(e.target))) {
      return; /* a click inside our own UI, not a new text selection */
    }
    setTimeout(function () {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) { hideSelToolbar(); return; }
      var range = sel.getRangeAt(0);
      if (!els.content.contains(range.commonAncestorContainer)) { hideSelToolbar(); return; }
      if (!range.toString().trim()) { hideSelToolbar(); return; }
      showSelToolbar(range);
    }, 5);
  }

  function showSelToolbar(range) {
    var bar = els.selToolbar;
    currentRange = range.cloneRange();

    var startAnc = range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer;
    var endAnc = range.endContainer.nodeType === 3 ? range.endContainer.parentElement : range.endContainer;
    var startAnn = startAnc.closest("mark.hl, .note-anchor");
    var endAnn = endAnc.closest("mark.hl, .note-anchor");
    if (startAnn && startAnn === endAnn) {
      currentRemoveTarget = startAnn.dataset.hid || startAnn.dataset.nid;
      els.selRemoveBtn.classList.remove("hidden");
    } else {
      currentRemoveTarget = null;
      els.selRemoveBtn.classList.add("hidden");
    }

    bar.classList.add("show");
    var rect = range.getBoundingClientRect();
    var top = rect.top + window.scrollY - bar.offsetHeight - 10;
    var left = rect.left + window.scrollX + rect.width / 2 - bar.offsetWidth / 2;
    left = Math.max(8, Math.min(left, document.documentElement.scrollWidth - bar.offsetWidth - 8));
    if (top < window.scrollY + 4) top = rect.bottom + window.scrollY + 10;
    bar.style.top = top + "px";
    bar.style.left = left + "px";
  }

  function hideSelToolbar() {
    els.selToolbar.classList.remove("show");
    currentRange = null;
    currentRemoveTarget = null;
  }

  /* ---------------- popovers (manage a highlight / edit a note) ---------------- */

  function positionPopoverAtRect(pop, rect) {
    pop.classList.add("show");
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var left = rect.left + window.scrollX + rect.width / 2 - w / 2;
    var top = rect.bottom + window.scrollY + 10;
    left = Math.max(8, Math.min(left, document.documentElement.scrollWidth - w - 8));
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function hidePopover() {
    els.notePopover.classList.remove("show");
    els.notePopover.innerHTML = "";
  }

  function openHighlightPopover(id, targetEl) {
    var rec = store.annotations.find(function (a) { return a.id === id; });
    if (!rec) return;
    var pop = els.notePopover;
    pop.innerHTML = "";

    var swRow = document.createElement("div");
    swRow.style.cssText = "display:flex;gap:6px;";
    COLORS.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "swatch " + c;
      b.style.outline = c === rec.color ? "2px solid var(--accent)" : "1px solid rgba(0,0,0,.15)";
      b.addEventListener("mousedown", function (e) { e.preventDefault(); });
      b.addEventListener("click", function () { changeHighlightColor(id, c); hidePopover(); });
      swRow.appendChild(b);
    });

    var row = document.createElement("div");
    row.className = "row";
    var del = document.createElement("button");
    del.className = "delete";
    del.textContent = "🗑 Remove highlight";
    del.addEventListener("click", function () { removeAnnotationById(id); hidePopover(); });
    row.appendChild(del);

    pop.appendChild(swRow);
    pop.appendChild(row);
    positionPopoverAtRect(pop, targetEl.getBoundingClientRect());
  }

  function openNotePopoverForEl(id, markerEl, isNew) {
    var rec = store.annotations.find(function (a) { return a.id === id; });
    if (!rec) return;
    var pop = els.notePopover;
    pop.innerHTML = "";

    var ta = document.createElement("textarea");
    ta.value = rec.note || "";
    ta.placeholder = "Type your note…";
    var meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = rec.updatedAt ? ("Last edited " + formatWhen(rec.updatedAt)) : ("Added " + formatWhen(rec.createdAt));

    var row = document.createElement("div");
    row.className = "row";
    var del = document.createElement("button");
    del.className = "delete";
    del.textContent = "🗑 Delete";
    var close = document.createElement("button");
    close.textContent = "Done";
    row.appendChild(del);
    row.appendChild(close);

    pop.appendChild(ta);
    pop.appendChild(meta);
    pop.appendChild(row);

    var debouncedSave = debounce(function () {
      rec.note = ta.value;
      rec.updatedAt = new Date().toISOString();
      saveStore();
      refreshNotesUI();
      meta.textContent = "Last edited " + formatWhen(rec.updatedAt);
    }, 400);
    ta.addEventListener("input", debouncedSave);
    ta.addEventListener("mousedown", function (e) { e.stopPropagation(); });
    del.addEventListener("click", function () { removeAnnotationById(id); hidePopover(); });
    close.addEventListener("click", function () {
      if (!ta.value.trim() && !rec.note) removeAnnotationById(id);
      hidePopover();
    });

    if (markerEl) {
      positionPopoverAtRect(pop, markerEl.getBoundingClientRect());
    } else {
      pop.classList.add("show");
      pop.style.left = (window.scrollX + window.innerWidth / 2 - pop.offsetWidth / 2) + "px";
      pop.style.top = (window.scrollY + 100) + "px";
    }
    if (isNew) ta.focus();
  }

  /* ---------------- content click delegation ---------------- */

  function wireContentClicks() {
    els.content.addEventListener("click", function (e) {
      var marker = e.target.closest(".note-marker");
      if (marker) {
        e.stopPropagation();
        openNotePopoverForEl(marker.dataset.nid, marker, false);
        return;
      }
      var mark = e.target.closest("mark.hl");
      if (mark && window.getSelection().isCollapsed) {
        e.stopPropagation();
        openHighlightPopover(mark.dataset.hid, mark);
        return;
      }
      var anchor = e.target.closest(".note-anchor");
      if (anchor && window.getSelection().isCollapsed) {
        e.stopPropagation();
        openNotePopoverForEl(anchor.dataset.nid, anchor, false);
      }
    });
  }

  /* ---------------- practice rough notes ---------------- */

  function wirePracticeRoughNotes() {
    var inputs = els.content.querySelectorAll(".practice-rough-input[data-practice-note-key]");
    if (!inputs.length) return;
    if (!store.practiceNotes || typeof store.practiceNotes !== "object" || Array.isArray(store.practiceNotes)) {
      store.practiceNotes = {};
    }
    Array.prototype.forEach.call(inputs, function (input) {
      var key = input.dataset.practiceNoteKey;
      input.value = store.practiceNotes[key] || "";
      input.addEventListener("input", debounce(function () {
        var value = input.value;
        if (value.trim()) store.practiceNotes[key] = value;
        else delete store.practiceNotes[key];
        saveStore();
      }, 250));
      input.addEventListener("mousedown", function (e) { e.stopPropagation(); });
      input.addEventListener("mouseup", function (e) { e.stopPropagation(); });
    });
  }

  /* ---------------- notes panel ---------------- */

  function wireNotesPanel() {
    els.notesToggle.addEventListener("click", function () {
      els.notesPanel.classList.toggle("open");
    });
    els.notesPanelClose.addEventListener("click", function () {
      els.notesPanel.classList.remove("open");
    });
    els.exportBtn.addEventListener("click", exportAnnotations);
    els.importBtn.addEventListener("click", function () { els.importFile.click(); });
    els.importFile.addEventListener("change", importAnnotations);
  }

  function buildNoteCard(rec, markerEl) {
    var card = document.createElement("div");
    card.className = "note-card";
    var snip = document.createElement("div");
    snip.className = "anchor-snip";
    snip.textContent = "“" + (rec.text || "") + "”";
    var txt = document.createElement("div");
    txt.className = "note-text";
    txt.textContent = rec.note || "(empty note)";
    card.appendChild(snip);
    card.appendChild(txt);
    card.addEventListener("click", function () {
      els.notesPanel.classList.remove("open");
      if (markerEl) {
        markerEl.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(function () { openNotePopoverForEl(rec.id, markerEl, false); }, 260);
      } else {
        openNotePopoverForEl(rec.id, null, false);
      }
    });
    return card;
  }

  function refreshNotesUI() {
    var notes = store.annotations.filter(function (a) { return a.type === "note"; });
    var count = els.notesToggle.querySelector(".count");
    count.textContent = notes.length;
    count.classList.toggle("show", notes.length > 0);

    var body = els.notesPanelBody;
    body.innerHTML = "";
    if (!notes.length) {
      body.innerHTML = "<div class=\"empty-msg\">No notes yet. Select any text on the page and choose 📝 Note to add one.</div>";
      return;
    }
    var resolved = [], unresolved = [];
    notes.forEach(function (n) {
      var marker = document.querySelector(".note-marker[data-nid=\"" + cssEscape(n.id) + "\"]");
      if (marker) resolved.push({ n: n, marker: marker }); else unresolved.push(n);
    });
    resolved.sort(function (a, b) {
      return a.marker.getBoundingClientRect().top - b.marker.getBoundingClientRect().top;
    });
    resolved.forEach(function (r) { body.appendChild(buildNoteCard(r.n, r.marker)); });
    if (unresolved.length) {
      var h = document.createElement("div");
      h.className = "toc-title";
      h.style.marginTop = "12px";
      h.textContent = "Unresolved (page content changed)";
      body.appendChild(h);
      unresolved.forEach(function (n) { body.appendChild(buildNoteCard(n, null)); });
    }
  }

  function exportAnnotations() {
    var blob = new Blob([JSON.stringify({
      docId: docId,
      exportedAt: new Date().toISOString(),
      annotations: store.annotations,
      practiceNotes: store.practiceNotes || {}
    }, null, 2)],
      { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    var safeName = docId.replace(/[\\/]/g, "_").replace(/\.md$/, "");
    a.download = safeName + ".notes.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Exported " + store.annotations.length + " item(s).");
  }

  function importAnnotations(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var incoming = Array.isArray(data.annotations) ? data.annotations : [];
        var existingIds = new Set(store.annotations.map(function (a) { return a.id; }));
        var added = 0;
        incoming.forEach(function (rec) {
          if (!existingIds.has(rec.id)) { store.annotations.push(rec); added++; }
        });
        if (data.practiceNotes && typeof data.practiceNotes === "object" && !Array.isArray(data.practiceNotes)) {
          store.practiceNotes = Object.assign({}, store.practiceNotes || {}, data.practiceNotes);
        }
        saveStoreNow();
        toast("Imported " + added + " item(s). Reloading…");
        setTimeout(function () { location.reload(); }, 700);
      } catch (err) {
        toast("Could not read that file — is it a notes export JSON?");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  /* ---------------- table of contents ---------------- */

  function buildTOC() {
    var heads = els.content.querySelectorAll("h2, h3");
    if (!heads.length) { els.toc.classList.add("hidden"); return; }
    var title = document.createElement("div");
    title.className = "toc-title";
    title.textContent = "Contents";
    els.toc.appendChild(title);
    heads.forEach(function (h) {
      if (!h.id) return;
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      if (h.tagName === "H3") a.className = "level-3";
      els.toc.appendChild(a);
    });
  }

  /* ---------------- header wiring ---------------- */

  function wireHeader() {
    els.themeToggle.addEventListener("click", toggleTheme);
    els.tocToggle.addEventListener("click", function () {
      document.body.classList.toggle("toc-open");
      document.body.classList.toggle("toc-hidden");
    });
  }

  function globalDismiss(e) {
    if (!els.selToolbar.contains(e.target)) hideSelToolbar();
    if (!els.notePopover.contains(e.target) && !e.target.closest(".note-marker") &&
        !e.target.closest("mark.hl") && !e.target.closest(".note-anchor")) hidePopover();
    if (!els.notesPanel.contains(e.target) && !els.notesToggle.contains(e.target) &&
        els.notesPanel.classList.contains("open") && window.innerWidth < 980) {
      /* keep the drawer open on wide screens for convenience; only auto-close on narrow ones */
      els.notesPanel.classList.remove("open");
    }
  }

  /* ---------------- init ---------------- */

  function cacheEls() {
    els.content = $("studyContent");
    els.toc = $("studyToc");
    els.orphanBanner = $("orphanBanner");
    els.selToolbar = $("selToolbar");
    els.selNoteBtn = $("selNoteBtn");
    els.selRemoveBtn = $("selRemoveBtn");
    els.notePopover = $("notePopover");
    els.notesPanel = $("notesPanel");
    els.notesPanelBody = $("notesPanelBody");
    els.notesPanelClose = $("notesPanelClose");
    els.notesToggle = $("notesToggle");
    els.exportBtn = $("exportBtn");
    els.importBtn = $("importBtn");
    els.importFile = $("importFile");
    els.themeToggle = $("themeToggle");
    els.tocToggle = $("tocToggle");
    els.saveIndicator = $("saveIndicator");
  }

  function init() {
    cacheEls();
    loadTheme();
    wireHeader();
    wireSelectionToolbar();
    wireContentClicks();
    wireNotesPanel();
    buildTOC();
    loadStore();
    wirePracticeRoughNotes();
    applyAllStored();
    refreshNotesUI();
    document.addEventListener("mousedown", globalDismiss);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
