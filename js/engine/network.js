/* ==========================================================================
   VERSE ENGINE: relationship map (network.html)
   Force-directed SVG of every visible record of config.network.types and
   their connections. Layer toggles per relation type, record-type filters,
   find box, focus mode (click a node: neighbours stay lit, the rest dims),
   details panel, pan / zoom (drag, wheel, pinch, buttons, keyboard).
   ?focus=<id> opens focused on that record.
   ========================================================================== */
(() => {
  "use strict";
  const V = window.V;
  if (!V || !V.ready || document.body.dataset.page !== "network") return;
  const C = V.config, N = C.network, REL = C.relations;
  const { $, esc, norm } = V.util;
  const NS = "http://www.w3.org/2000/svg";
  const svg = $("#net"), stage = $("#stage");
  const state = { layers: new Set(Object.keys(REL).filter((t) => REL[t].layer !== false && REL[t].on !== false)), types: new Set(N.types), focus: null, view: { x: 0, y: 0, k: 1 } };
  let nodes = [], edges = [], byId = new Map();

  /* ----------------------------------------------------------- graph data */
  function build() {
    const list = V.all.filter((e) => N.types.includes(e._type) && state.types.has(e._type) && V.visible(e));
    byId = new Map();
    const r = V.util.rng(7);
    nodes = list.map((e, i) => {
      const a = (i / list.length) * Math.PI * 2;
      const n = { id: e.id, e, x: Math.cos(a) * 300 + r() * 40, y: Math.sin(a) * 300 + r() * 40, vx: 0, vy: 0, deg: 0 };
      byId.set(e.id, n); return n;
    });
    const seen = new Set();
    edges = [];
    nodes.forEach((n) => V.relations(n.id).forEach((rel) => {
      if (!byId.has(rel.id) || !REL[rel.t] || REL[rel.t].layer === false) return;
      const key = [n.id, rel.id].sort().join("|") + "|" + rel.t;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ a: byId.get(n.id), b: byId.get(rel.id), t: rel.t, label: rel.label });
    }));
    edges.forEach((ed) => { ed.a.deg++; ed.b.deg++; });
    simulate();
  }
  /* Small deterministic force simulation: repulsion, springs, gravity. */
  function simulate() {
    const live = edges.filter((e) => state.layers.has(e.t));
    for (let it = 0; it < 320; it++) {
      const alpha = 1 - it / 320;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy || 0.01;
          const f = 16000 / d2;
          const d = Math.sqrt(d2); dx /= d; dy /= d;
          a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
        }
      }
      live.forEach(({ a, b }) => {
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - 150) * 0.01;
        a.vx += (dx / d) * f; a.vy += (dy / d) * f; b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
      });
      nodes.forEach((n) => {
        n.vx -= n.x * 0.0022; n.vy -= n.y * 0.0022;
        const sp = Math.hypot(n.vx, n.vy), max = 30 * alpha + 1;
        if (sp > max) { n.vx = (n.vx / sp) * max; n.vy = (n.vy / sp) * max; }
        n.x += n.vx; n.y += n.vy; n.vx *= 0.6; n.vy *= 0.6;
      });
    }
  }

  /* --------------------------------------------------------------- render */
  const el = (tag, attrs, parent) => { const x = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => x.setAttribute(k, v)); if (parent) parent.appendChild(x); return x; };
  function draw() {
    svg.innerHTML = "";
    const world = el("g", { id: "world" }, svg);
    const ge = el("g", { class: "edges" }, world), gn = el("g", { class: "nodes" }, world);
    edges.forEach((ed) => {
      const d = REL[ed.t];
      ed.el = el("line", { x1: ed.a.x, y1: ed.a.y, x2: ed.b.x, y2: ed.b.y, class: "edge" + (state.layers.has(ed.t) ? "" : " off"), stroke: d.color, "stroke-dasharray": d.dash || "" }, ge);
      el("title", {}, ed.el).textContent = `${V.show.name(ed.a.e)} and ${V.show.name(ed.b.e)}: ${ed.label || d.label}`;
    });
    nodes.forEach((n) => {
      const r = 14 + Math.min(16, n.deg * 1.4), col = V.colorOf(n.e);
      const g = el("g", { class: "node", transform: `translate(${n.x},${n.y})`, tabindex: "0", role: "button", "aria-label": `${V.show.name(n.e)}, ${V.show.typeLabel(n.e)}`, "data-node": n.id, style: `--c:${col}` }, gn);
      el("circle", { r: r + 4, class: "halo" }, g);
      const cid = "c-" + n.id;
      const clip = el("clipPath", { id: cid }, g); el("circle", { r }, clip);
      const art = V.media.art(n.e);
      el("circle", { r, class: "disc" }, g);
      if (art) el("image", { href: art, x: -r, y: -r, width: r * 2, height: r * 2, "clip-path": `url(#${cid})`, preserveAspectRatio: n.e._type === "org" ? "xMidYMid meet" : "xMidYMid slice" }, g);
      else { const t = el("text", { class: "mono", "text-anchor": "middle", dy: "0.35em", "font-size": r * 0.75 }, g); t.textContent = V.util.initials(V.show.name(n.e)); }
      const lab = el("text", { class: "label", y: r + 15, "text-anchor": "middle" }, g);
      lab.textContent = V.show.name(n.e);
      n.g = g; n.r = r;
    });
    applyView(); highlight();
    $("#net-count").textContent = `${nodes.length} records · ${edges.filter((e) => state.layers.has(e.t)).length} connections`;
    $("#net-empty").hidden = nodes.length > 0;
  }
  function neighbours(id) {
    const s = new Set([id]);
    edges.forEach((e) => { if (!e.el || !state.layers.has(e.t)) return; if (e.a.id === id) s.add(e.b.id); if (e.b.id === id) s.add(e.a.id); });
    return s;
  }
  function highlight() {
    const near = state.focus ? neighbours(state.focus) : null;
    nodes.forEach((n) => n.g && n.g.classList.toggle("dim", !!near && !near.has(n.id)));
    nodes.forEach((n) => n.g && n.g.classList.toggle("focus", n.id === state.focus));
    edges.forEach((e) => { if (!e.el) return; e.el.classList.toggle("off", !state.layers.has(e.t)); e.el.classList.toggle("dim", !!near && !(e.a.id === state.focus || e.b.id === state.focus)); });
  }

  /* ---------------------------------------------------------- pan / zoom */
  function applyView() { const w = $("#world"); if (w) w.setAttribute("transform", `translate(${state.view.x},${state.view.y}) scale(${state.view.k})`); }
  function fit() {
    if (!nodes.length) return;
    const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs) - 60, maxX = Math.max(...xs) + 60, minY = Math.min(...ys) - 60, maxY = Math.max(...ys) + 60;
    const W = stage.clientWidth, H = stage.clientHeight;
    const k = Math.min(W / (maxX - minX), H / (maxY - minY), 1.6);
    state.view = { k, x: W / 2 - ((minX + maxX) / 2) * k, y: H / 2 - ((minY + maxY) / 2) * k };
    applyView();
  }
  function zoom(f, cx = stage.clientWidth / 2, cy = stage.clientHeight / 2) {
    const v = state.view, k = Math.min(4, Math.max(0.2, v.k * f));
    v.x = cx - ((cx - v.x) * k) / v.k; v.y = cy - ((cy - v.y) * k) / v.k; v.k = k; applyView();
  }
  function centreOn(n) {
    const v = state.view; v.k = Math.max(v.k, 1.1);
    v.x = stage.clientWidth / 2 - n.x * v.k; v.y = stage.clientHeight / 2 - n.y * v.k; applyView();
  }
  let drag = null; const pts = new Map();
  stage.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".net-panel, .net-zoom, .net-legend")) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    drag = { x: e.clientX, y: e.clientY, vx: state.view.x, vy: state.view.y, moved: false, dist: null };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!drag || !pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      const [p, q] = [...pts.values()], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (drag.dist) zoom(d / drag.dist, (p.x + q.x) / 2 - stage.getBoundingClientRect().left, (p.y + q.y) / 2 - stage.getBoundingClientRect().top);
      drag.dist = d; drag.moved = true; return;
    }
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    state.view.x = drag.vx + dx; state.view.y = drag.vy + dy; applyView();
  });
  const end = (e) => {
    pts.delete(e.pointerId);
    if (!pts.size) {
      if (drag && !drag.moved) { const g = document.elementFromPoint(e.clientX, e.clientY); const n = g && g.closest && g.closest("[data-node]"); if (n) focus(n.dataset.node); else if (e.target.closest && e.target.closest("svg")) focus(null); }
      drag = null;
    }
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", (e) => { pts.delete(e.pointerId); drag = null; });
  stage.addEventListener("wheel", (e) => { e.preventDefault(); const r = stage.getBoundingClientRect(); zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  $("#zoom-in").addEventListener("click", () => zoom(1.25));
  $("#zoom-out").addEventListener("click", () => zoom(0.8));
  $("#zoom-fit").addEventListener("click", () => { focus(null); fit(); });
  svg.addEventListener("keydown", (e) => {
    const n = e.target.closest && e.target.closest("[data-node]");
    if (n && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); focus(n.dataset.node); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea") || V.viewer.isOpen()) return;
    if (e.key === "+" || e.key === "=") zoom(1.2); else if (e.key === "-") zoom(0.83); else if (e.key === "0") fit();
    else if (e.key === "Escape" && state.focus) focus(null);
  });

  /* ---------------------------------------------------------------- focus */
  function focus(id) {
    state.focus = id && byId.has(id) ? id : null;
    highlight();
    const p = $("#panel");
    if (!state.focus) { p.hidden = true; return; }
    const n = byId.get(state.focus), e = n.e;
    const rels = V.relations(e.id).filter((r) => byId.has(r.id) && REL[r.t] && state.layers.has(r.t));
    p.hidden = false;
    p.style.setProperty("--c", V.colorOf(e));
    p.innerHTML = `<div class="panel-head">${esc(V.show.typeLabel(e))}<button type="button" class="btn sm icon" data-panel-close aria-label="Close details">✕</button></div>
      <div class="np-top">${V.artHTML(e)}<div><h3>${esc(V.show.name(e))}</h3><p>${esc(V.show.subtitle(e))}</p></div></div>
      <p class="np-bio">${esc((e.bio || e.note || "").slice(0, 220))}${(e.bio || e.note || "").length > 220 ? "…" : ""}</p>
      <p class="label">${rels.length} visible connection${rels.length === 1 ? "" : "s"}</p>
      <div class="np-rels" data-open-group>${rels.map((r) => `<button type="button" class="np-rel" data-goto="${r.id}" style="--c:${REL[r.t].color}"><span>${esc(V.show.name(V.get(r.id)))}</span><small>${esc(r.label || REL[r.t].label)}</small></button>`).join("")}</div>
      <div class="v-actions"><button type="button" class="btn primary sm" data-open="${e.id}">Open profile</button></div>`;
    centreOn(n);
    try { const u = new URL(location.href); u.searchParams.set("focus", state.focus); history.replaceState(null, "", u.pathname + u.search); } catch (err) { /* cosmetic */ }
  }
  $("#panel").addEventListener("click", (e) => {
    if (e.target.closest("[data-panel-close]")) focus(null);
    const g = e.target.closest("[data-goto]"); if (g) focus(g.dataset.goto);
  });

  /* ------------------------------------------------------- controls / UI */
  function controls() {
    /* only relation kinds that can connect two of the mapped record types */
    const present = new Set(edges.map((e) => e.t));
    $("#layers").innerHTML = Object.entries(REL).filter(([t, d]) => d.layer !== false && present.has(t)).map(([t, d]) =>
      `<button type="button" class="chip${state.layers.has(t) ? " active" : ""}" data-layer="${t}" aria-pressed="${state.layers.has(t)}" style="--c:${d.color}"><i class="swatch" style="background:${d.color}"></i>${esc(d.group || d.label)}</button>`).join("");
    $("#types").innerHTML = N.types.map((t) => `<button type="button" class="chip${state.types.has(t) ? " active" : ""}" data-type="${t}" aria-pressed="${state.types.has(t)}">${esc(C.types[t].plural)}</button>`).join("");
  }
  $("#layers").addEventListener("click", (e) => {
    const b = e.target.closest("[data-layer]"); if (!b) return;
    const t = b.dataset.layer; state.layers.has(t) ? state.layers.delete(t) : state.layers.add(t);
    controls(); highlight(); $("#net-count").textContent = `${nodes.length} records · ${edges.filter((x) => state.layers.has(x.t)).length} connections`;
  });
  $("#types").addEventListener("click", (e) => {
    const b = e.target.closest("[data-type]"); if (!b) return;
    const t = b.dataset.type;
    if (state.types.has(t) && state.types.size === 1) return;
    state.types.has(t) ? state.types.delete(t) : state.types.add(t);
    rebuild(); controls();
  });
  const find = $("#find"), res = $("#find-results");
  find.addEventListener("input", () => {
    const q = norm(find.value.trim());
    if (!q) { res.hidden = true; return; }
    const hits = nodes.filter((n) => n.e._name.includes(q)).slice(0, 8);
    res.hidden = false;
    res.innerHTML = hits.length ? hits.map((n) => `<button type="button" role="option" data-goto="${n.id}">${esc(V.show.name(n.e))} <small>${esc(V.show.typeLabel(n.e))}</small></button>`).join("") : '<p class="soft">No visible record matches.</p>';
  });
  find.addEventListener("keydown", (e) => { if (e.key === "Enter") { const b = res.querySelector("[data-goto]"); if (b) { e.preventDefault(); b.click(); } } if (e.key === "Escape") { res.hidden = true; } });
  res.addEventListener("click", (e) => { const b = e.target.closest("[data-goto]"); if (b) { focus(b.dataset.goto); res.hidden = true; find.value = ""; } });
  function legend() {
    $("#legend").innerHTML = N.types.map((t) => `<span><i style="background:${C.types[t].color}"></i>${esc(C.types[t].plural)}</span>`).join("");
  }
  function rebuild() {
    const keep = state.focus;
    build(); draw(); fit();
    if (keep && byId.has(keep)) focus(keep); else focus(null);
  }
  V.spoilers.onChange(() => { rebuild(); controls(); });
  addEventListener("resize", V.util.debounce(fit, 200));

  legend();
  requestAnimationFrame(() => {
    build(); controls(); draw(); fit();
    $("#net-loading").hidden = true;
    const f = new URLSearchParams(location.search).get("focus");
    if (f) { if (byId.has(f)) focus(f); else if (V.get(f)) V.notify(`${V.show.name(V.get(f))} isn't on the map with the current filters or spoiler mode.`, { title: "Not on the map" }); }
  });
})();
