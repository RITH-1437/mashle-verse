/* ==========================================================================
   VERSE ENGINE: page shell
   --------------------------------------------------------------------------
   Shared navigation (built from config.nav), the command-palette search
   (Ctrl/⌘+K or "/"), the spoiler switch, toasts, scroll reveals, the
   ambient particle layer, back-to-top, the shared record card and
   `?view=<id>` deep links (opened by viewer.js).
   ========================================================================== */
(() => {
  "use strict";
  const V = window.V;
  if (!V || !V.util) return;
  const C = V.config, SP = C.spoiler;
  const { $, esc } = V.util;
  const page = document.body.dataset.nav || document.body.dataset.page || "";

  const ICON = {
    search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    menu: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    alert: '<svg class="state-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/></svg>',
    empty: '<svg class="state-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M8 12h8"/></svg>'
  };
  V.ICON = ICON;

  /* ------------------------------------------------------------------ nav */
  function currentKey() {
    const hit = C.nav.find(([, href]) => {
      const [file, hash] = href.split("#");
      return file === (location.pathname.split("/").pop() || "index.html") && hash && location.hash.startsWith("#" + hash);
    });
    return hit ? hit[0] : page;
  }
  function buildNav() {
    const nav = $("#nav");
    if (!nav) return;
    nav.className = "nav";
    nav.innerHTML = `
      <div class="wrap nav-inner">
        <a class="brand" href="index.html" aria-label="${esc(C.site.name)} home">${C.site.mark}
          <span class="brand-text"><span class="bt-full">${esc(C.site.brand)}</span><span class="bt-short">${esc(C.site.short)}</span> <em>Verse</em></span></a>
        <nav class="nav-links" id="nav-links" aria-label="Main">
          ${C.nav.map(([k, href, label]) => `<a href="${href}" data-key="${k}">${esc(label)}</a>`).join("")}
        </nav>
        <div class="nav-tools">
          <button type="button" class="btn sm nav-search" id="open-search" aria-label="Search (Ctrl+K)">${ICON.search}<span class="lbl">Search</span><kbd>Ctrl K</kbd></button>
          <label class="switch spoiler-switch" title="${esc(SP.tip)}">
            <input type="checkbox" id="spoiler-toggle" ${V.spoilers.on ? "checked" : ""}>
            <span class="track"></span><span class="lbl-long">${esc(SP.toggle)}</span><span class="lbl-short">Spoilers</span>
          </label>
          <button type="button" class="btn sm icon nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-links">${ICON.menu}</button>
        </div>
      </div>`;
    markCurrent();
    $("#open-search").addEventListener("click", () => openPalette());
    $("#spoiler-toggle").addEventListener("change", (e) => {
      V.spoilers.set(e.target.checked);
      notify(e.target.checked ? SP.onText : SP.offText, { title: e.target.checked ? "Spoilers revealed" : "Spoilers sealed" });
    });
    const tog = $("#nav-toggle");
    tog.addEventListener("click", () => {
      const open = !nav.classList.contains("open");
      nav.classList.toggle("open", open); tog.setAttribute("aria-expanded", String(open));
    });
    $("#nav-links").addEventListener("click", (e) => {
      if (e.target.closest("a")) { nav.classList.remove("open"); tog.setAttribute("aria-expanded", "false"); }
    });
    window.addEventListener("hashchange", markCurrent);
  }
  function markCurrent() {
    const key = currentKey();
    document.querySelectorAll("#nav-links a").forEach((a) => {
      if (a.dataset.key === key) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  V.spoilers.onChange((on) => { const t = $("#spoiler-toggle"); if (t) t.checked = on; });

  /* --------------------------------------------------------------- toasts */
  let toastBox;
  function notify(text, { title = "Notice", kind = "", ms = 3600 } = {}) {
    if (!toastBox) { toastBox = document.createElement("div"); toastBox.className = "toasts"; toastBox.setAttribute("aria-live", "polite"); document.body.appendChild(toastBox); }
    const t = document.createElement("div");
    t.className = `toast panel ${kind}`;
    t.innerHTML = `<div class="panel-head">${esc(title)}</div><p>${esc(text)}</p>`;
    toastBox.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 320); }, ms);
  }
  V.notify = notify;
  let errShown = false;
  window.addEventListener("error", (e) => {
    if (errShown || !e.message) return;
    errShown = true;
    notify("Something went wrong rendering this page. Try reloading.", { title: "Error", kind: "error", ms: 6000 });
  });

  V.stateHTML = (kind, title, text, action = "") =>
    `<div class="state ${kind}">${kind === "error" ? ICON.alert : ICON.empty}<h3>${esc(title)}</h3><p>${esc(text)}</p>${action}</div>`;
  V.loadingHTML = (text = "Loading records…") => `<div class="state loading"><span class="loader"></span><p>${esc(text)}</p></div>`;

  /* ---------------------------------------------------------- record card */
  /* One card for every record type. Spoiler records render locked. */
  V.cardHTML = (e, i = 0) => {
    const S = V.show, col = V.colorOf(e), locked = !V.visible(e);
    const r = e.rank ? V.rankOf(e) : null;
    const tags = [];
    if (!locked) {
      (C.cardTags && C.cardTags(e) || []).forEach(([label, c]) => tags.push(`<span class="badge" style="--c:${c || col}">${esc(label)}</span>`));
      if (e.sp === "m") tags.push(`<span class="badge spoiler">${esc(SP.badge)}</span>`);
      if (e.canon === "check") tags.push('<span class="badge check">Needs check</span>');
    }
    return `<button type="button" class="card${locked ? " locked" : ""}" data-id="${esc(e.id)}" style="--c:${col};--i:${i}"
        aria-label="${esc(locked ? SP.locked + " entry" : S.name(e))}: open profile">
      ${V.artHTML(e)}
      ${locked ? `<span class="lock">${ICON.lock}${esc(SP.locked)}<br><small>Click to unlock</small></span>` : ""}
      ${r && r.short && !locked ? `<span class="rank" style="--c:${r.color}" title="${esc(r.label)}">${esc(r.short)}</span>` : ""}
      <span class="card-body">
        <span class="card-type">${esc(locked ? (C.types[e._type] || {}).label : S.typeLabel(e))}</span>
        <span class="card-name">${esc(S.name(e))}</span>
        <span class="card-sub">${esc(S.subtitle(e))}</span>
        ${tags.length ? `<span class="card-tags">${tags.join("")}</span>` : ""}
      </span>
    </button>`;
  };
  /* Delegated: any [data-open] button outside the viewer opens that record;
     prev/next walks its sibling buttons. */
  document.addEventListener("click", (ev) => {
    const o = ev.target.closest("[data-open]");
    if (!o || o.closest(".viewer, .lightbox") || !V.viewer) return;
    const box = o.closest("[data-open-group]") || o.parentElement;
    V.viewer.open(o.dataset.open, { list: [...box.querySelectorAll("[data-open]")].map((x) => x.dataset.open).filter((v, i, a) => a.indexOf(v) === i) });
  });
  /* Delegated: any [data-id] card on any page opens the viewer. */
  document.addEventListener("click", (ev) => {
    const card = ev.target.closest(".card[data-id]");
    if (!card || card.closest(".viewer") || !V.viewer) return;
    const grid = card.parentElement;
    /* prev/next in the viewer walks the cards around this one */
    const list = grid ? [...grid.querySelectorAll(".card[data-id]")].map((c) => c.dataset.id) : [];
    V.viewer.open(card.dataset.id, { list: (V.listFor && V.listFor(card)) || list });
  });

  /* ------------------------------------------------------ command palette */
  let pal = null, palSel = 0, palItems = [], lastFocus = null;
  function openPalette(prefill = "") {
    if (pal) return;
    lastFocus = document.activeElement;
    const scrim = document.createElement("div"); scrim.className = "palette-scrim";
    const box = document.createElement("div");
    box.className = "palette panel"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Search");
    box.innerHTML = `
      <div class="panel-head">Search the ${esc(C.site.brand)} archive</div>
      <div class="field"><span class="ico">${ICON.search}</span>
        <input class="input" id="pal-q" type="search" autocomplete="off" spellcheck="false" placeholder="${esc(C.site.searchHint)}" aria-controls="pal-results"></div>
      <div class="palette-results" id="pal-results" role="listbox" aria-label="Results"></div>
      <div class="palette-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>`;
    document.body.append(scrim, box);
    pal = { scrim, box };
    document.documentElement.style.overflow = "hidden";
    const q = $("#pal-q", box);
    q.value = prefill;
    q.addEventListener("input", () => { palSel = 0; renderPalette(q.value); });
    q.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); movePal(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); movePal(-1); }
      else if (e.key === "Enter") { e.preventDefault(); const it = palItems[palSel]; if (it) choose(it); }
    });
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pi]");
      if (b) choose(palItems[Number(b.dataset.pi)]);
      if (e.target.closest("[data-unlock]")) { V.spoilers.set(true); renderPalette(q.value); }
    });
    scrim.addEventListener("click", closePalette);
    renderPalette(prefill);
    q.focus();
  }
  function closePalette() {
    if (!pal) return;
    pal.scrim.remove(); pal.box.remove(); pal = null;
    if (!document.querySelector(".viewer")) document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function movePal(d) {
    if (!palItems.length) return;
    palSel = (palSel + d + palItems.length) % palItems.length;
    pal.box.querySelectorAll("[data-pi]").forEach((b, i) => b.setAttribute("aria-selected", String(i === palSel)));
    const cur = pal.box.querySelector(`[data-pi="${palSel}"]`);
    if (cur) cur.scrollIntoView({ block: "nearest" });
  }
  function choose(it) {
    if (!it) return;
    closePalette();
    if (it.href) { location.href = it.href; return; }
    if (V.viewer) V.viewer.open(it.id, { list: palItems.filter((x) => x.id).map((x) => x.id) });
  }
  function renderPalette(text) {
    const out = $("#pal-results", pal.box);
    if (!text.trim()) {
      palItems = C.quick.map(([href, name, sub]) => ({ href, name, sub }));
      out.innerHTML = `<div class="palette-label">Jump to</div>` + palItems.map((it, i) => `<button type="button" class="pr-item" role="option" data-pi="${i}" aria-selected="${i === palSel}">
          <span><span class="pr-name">${esc(it.name)}</span><br><span class="pr-sub">${esc(it.sub)}</span></span></button>`).join("");
      return;
    }
    const { results, hidden } = V.search(text, { limit: 40 });
    palItems = results.map((e) => ({ id: e.id, e }));
    const hiddenNote = hidden ? `<div class="palette-note">${hidden} more result${hidden > 1 ? "s are" : " is"} hidden as ${esc(SP.full.toLowerCase())} spoilers.<br>
      <button type="button" class="btn sm" data-unlock>Reveal spoilers</button></div>` : "";
    if (!palItems.length) {
      out.innerHTML = (hidden ? "" : `<div class="palette-note">Nothing matches “${esc(text)}”. Try a name, grade, technique or group.</div>`) + hiddenNote;
      return;
    }
    out.innerHTML = palItems.map(({ e }, i) => `<button type="button" class="pr-item" role="option" data-pi="${i}" aria-selected="${i === palSel}" style="--c:${V.colorOf(e)}">
        ${V.artHTML(e)}<span style="min-width:0"><span class="pr-name">${esc(V.show.name(e))}</span><br><span class="pr-sub">${esc(V.show.subtitle(e))}</span></span>
        <span class="badge pr-type" style="--c:${V.colorOf(e)}">${esc(V.show.typeLabel(e))}</span></button>`).join("") + hiddenNote;
  }
  V.openSearch = openPalette;
  document.addEventListener("keydown", (e) => {
    const inField = e.target.closest && e.target.closest("input, select, textarea, [contenteditable]");
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal ? closePalette() : openPalette(); return; }
    if (e.key === "Escape" && pal) { e.preventDefault(); e.stopImmediatePropagation(); closePalette(); return; }
    if (!inField && e.key === "/" && !pal && !document.querySelector(".viewer, .lightbox")) { e.preventDefault(); openPalette(); }
  }, true);

  /* ------------------------------------------------ reveals + back to top */
  V.observeReveals = (root = document) => {
    const els = root.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  };
  function backToTop() {
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn icon to-top panel"; b.hidden = true; b.setAttribute("aria-label", "Back to top"); b.textContent = "↑";
    document.body.appendChild(b);
    const on = () => { b.hidden = window.scrollY < 900; };
    window.addEventListener("scroll", on, { passive: true }); on();
    b.addEventListener("click", () => window.scrollTo({ top: 0, behavior: V.util.reducedMotion() ? "auto" : "smooth" }));
  }

  /* --------------------------------------------------- ambient particles */
  /* config.fx: { kind: "wisps" | "sparkles", colors: [...] }. Paused when the
     tab is hidden; skipped entirely for reduced motion. */
  function ambient() {
    const fx = C.fx;
    if (!fx || V.util.reducedMotion() || document.body.dataset.fx === "off") return;
    const cv = document.createElement("canvas");
    cv.className = "fx-layer"; cv.setAttribute("aria-hidden", "true");
    document.body.prepend(cv);
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, dpr = 1, parts = [], raf = 0;
    const N = () => Math.min(90, Math.round((innerWidth * innerHeight) / 22000));
    const spawn = (y) => ({
      x: Math.random() * W, y: y ?? Math.random() * H, r: (fx.kind === "sparkles" ? 0.6 + Math.random() * 1.6 : 1.5 + Math.random() * 3.5) * dpr,
      vy: -(0.15 + Math.random() * 0.45) * dpr, vx: (Math.random() - 0.5) * 0.25 * dpr, life: Math.random(), col: fx.colors[Math.floor(Math.random() * fx.colors.length)], ph: Math.random() * 6.28
    });
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
      parts = Array.from({ length: N() }, () => spawn());
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y += p.vy; p.x += p.vx + Math.sin(t / 1400 + p.ph) * 0.18 * dpr; p.life += 0.0016;
        if (p.y < -20 || p.life > 1) Object.assign(p, spawn(H + 10), { life: 0 });
        const a = Math.sin(p.life * Math.PI);
        ctx.globalAlpha = a * (fx.kind === "sparkles" ? 0.9 : 0.35);
        ctx.fillStyle = p.col;
        if (fx.kind === "sparkles") {
          const s = p.r * (1 + Math.sin(t / 300 + p.ph) * 0.4);
          ctx.beginPath(); ctx.moveTo(p.x, p.y - s * 2.2); ctx.lineTo(p.x + s * .5, p.y); ctx.lineTo(p.x, p.y + s * 2.2); ctx.lineTo(p.x - s * .5, p.y); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.moveTo(p.x - s * 2.2, p.y); ctx.lineTo(p.x, p.y + s * .5); ctx.lineTo(p.x + s * 2.2, p.y); ctx.lineTo(p.x, p.y - s * .5); ctx.closePath(); ctx.fill();
        } else {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          g.addColorStop(0, p.col); g.addColorStop(1, "transparent");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, 6.283); ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    }
    size(); addEventListener("resize", V.util.debounce(size, 200));
    document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(draw); });
    raf = requestAnimationFrame(draw);
  }

  /* ----------------------------------------------------------------- boot */
  function boot() {
    buildNav(); backToTop(); ambient();
    if (!V.ready) {
      const main = document.querySelector("main");
      if (main) main.innerHTML = `<div class="wrap">${V.stateHTML("error", "Archive offline", "The data files in js/data/ could not be loaded. Check that the folder is complete and reload the page.")}</div>`;
      return;
    }
    V.observeReveals();
    const view = new URLSearchParams(location.search).get("view");
    if (view && V.viewer) {
      if (V.get(view)) requestAnimationFrame(() => V.viewer.open(view));
      else notify(`No record has the id "${view}".`, { title: "Record not found", kind: "error" });
    }
  }
  V.boot = boot;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
