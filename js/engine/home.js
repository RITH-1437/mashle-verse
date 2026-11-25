/* ==========================================================================
   VERSE ENGINE: dashboard (index.html)
   Fills the stat strip, featured records, section directory, spotlight and
   the arc track from config.home. The hero markup lives in index.html.
   ========================================================================== */
(() => {
  "use strict";
  const V = window.V;
  if (!V || !V.ready || document.body.dataset.page !== "home") return;
  const C = V.config, H = C.home, SP = C.spoiler;
  const { $, esc } = V.util;
  const reduced = V.util.reducedMotion();

  function countUp(root) {
    root.querySelectorAll("[data-count]").forEach((el) => {
      const end = Number(el.dataset.count);
      if (reduced) { el.textContent = end; return; }
      const t0 = performance.now();
      const tick = (t) => { const p = Math.min(1, (t - t0) / 1000); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  }
  function stats() {
    $("#stats").innerHTML = H.stats.map(([label, fn, href]) => {
      const n = fn();
      return `<a class="stat panel reveal" href="${href || "archive.html"}"><b data-count="${n}">0</b><span>${esc(label)}</span></a>`;
    }).join("");
    countUp($("#stats"));
  }
  function featured() {
    const list = V.all.filter((e) => e.featured && V.visible(e) && (!H.featuredTypes || H.featuredTypes.includes(e._type))).slice(0, H.featuredLimit || 8);
    $("#featured").innerHTML = list.map((e, i) => V.cardHTML(e, i)).join("") || V.stateHTML("empty", "Nothing featured yet", "Mark records with featured: true in js/data.");
  }
  function sections() {
    $("#sections").innerHTML = H.sections.map((s, i) => `<a class="section-card panel reveal" href="${s.href}" style="--i:${i};--c:${s.color || "var(--accent)"}">
      <span class="sc-ico" aria-hidden="true">${s.icon || "◆"}</span>
      <span class="sc-title">${esc(s.title)}</span><span class="sc-text">${esc(s.text)}</span>
      ${s.count ? `<span class="sc-count">${esc(s.count())}</span>` : ""}<span class="sc-go" aria-hidden="true">→</span></a>`).join("");
  }
  function spotlight() {
    const S = H.spotlight;
    if (!S || !$("#spotlight")) return;
    const list = S.ids().map(V.get).filter((e) => e && V.visible(e)).slice(0, 6);
    $("#spotlight").innerHTML = `<div class="spot-copy reveal"><p class="kicker">${esc(S.kicker)}</p><h2 class="section-title">${esc(S.title)}</h2>
      <p class="lead">${esc(S.text)}</p><a class="btn primary" href="${S.href}">${esc(S.cta)} →</a></div>
      <div class="spot-grid grid-cards">${list.map((e, i) => V.cardHTML(e, i)).join("")}</div>`;
  }
  function arcs() {
    const el = $("#arcs");
    if (!el) return;
    const list = V.data.arcs || [];
    el.innerHTML = list.map((a, i) => {
      const n = (V.data.timeline || []).filter((t) => t.arc === a.id).length;
      const locked = a.sp === "m" && !V.spoilers.on;
      return `<a class="arc-step${locked ? " locked" : ""}" href="timeline.html#arc-${a.id}" style="--i:${i}">
        <span class="arc-dot"></span><b>${esc(locked ? SP.locked : a.label)}</b><small>${esc(a.short || "")}${n ? ` · ${n} event${n > 1 ? "s" : ""}` : ""}</small></a>`;
    }).join("");
  }
  function heroSearch() {
    const f = $("#hero-search");
    if (!f) return;
    f.addEventListener("submit", (ev) => { ev.preventDefault(); V.openSearch(f.querySelector("input").value); });
  }
  function renderAll() { stats(); featured(); sections(); spotlight(); arcs(); V.observeReveals(); }
  heroSearch();
  renderAll();
  V.spoilers.onChange(renderAll);
})();
