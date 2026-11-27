/* ==========================================================================
   VERSE ENGINE: explorer (gallery pages)
   <body data-page="explorer" data-collection="<key>"> renders
   config.explorer[key]: a filterable gallery of large cards with a sticky
   detail panel. Selection is kept in the hash (#<id>) so it can be linked.
   ========================================================================== */
(() => {
  "use strict";
  const V = window.V;
  if (!V || !V.ready || document.body.dataset.page !== "explorer") return;
  const C = V.config, SP = C.spoiler;
  const X = C.explorer[document.body.dataset.collection];
  const { $, esc, norm } = V.util;
  const state = { f: "all", q: "", sel: null };
  const base = () => (X.items ? X.items() : V.ofType(X.type)).filter((e) => !X.filter || X.filter(e));

  function chips() {
    const vals = new Map();
    base().filter(V.visible).forEach((e) => [].concat(X.facet[2](e) || []).forEach((v) => v && vals.set(v, (vals.get(v) || 0) + 1)));
    const order = X.facetOrder || [...vals.keys()].sort();
    $("#x-chips").innerHTML = `<button type="button" class="chip${state.f === "all" ? " active" : ""}" data-f="all">All <i>${base().filter(V.visible).length}</i></button>`
      + order.filter((v) => vals.has(v)).map((v) => `<button type="button" class="chip${state.f === v ? " active" : ""}" data-f="${esc(v)}">${esc(v)} <i>${vals.get(v)}</i></button>`).join("");
  }
  function list() {
    const terms = norm(state.q).split(/\s+/).filter(Boolean);
    return base().filter((e) => {
      if (!V.visible(e)) return !terms.length && state.f === "all";
      return (state.f === "all" || [].concat(X.facet[2](e) || []).includes(state.f)) && (!terms.length || terms.every((t) => e._hay.includes(t)));
    }).sort((a, b) => (V.visible(b) - V.visible(a)) || (X.sort ? X.sort(a, b) : a._order - b._order));
  }
  function tile(e, i) {
    const locked = !V.visible(e), col = V.colorOf(e);
    return `<button type="button" class="x-tile${locked ? " locked" : ""}${state.sel === e.id ? " active" : ""}" data-x="${esc(V.pub(e))}" style="--c:${col};--i:${i}" aria-pressed="${state.sel === e.id}">
      ${V.artHTML(e)}<span class="x-veil"></span>
      <span class="x-copy"><span class="kicker">${esc(locked ? SP.locked : X.tag(e))}</span><span class="x-name">${esc(V.show.name(e))}</span>
      <span class="x-sub">${esc(locked ? "Turn on spoilers to see this record" : V.show.subtitle(e))}</span></span></button>`;
  }
  function detail() {
    const e = V.get(state.sel), el = $("#x-detail");
    if (!e) { el.innerHTML = V.stateHTML("empty", X.pickTitle || "Pick a record", X.pickText || "Select a card to see its details here."); return; }
    if (!V.visible(e)) {
      el.innerHTML = `<div class="locked-note"><span class="badge spoiler">${esc(SP.locked)}</span><h2>Classified record</h2><p class="soft">Beyond the anime (${esc(SP.coverage)}).</p>
        <button type="button" class="btn primary" data-unlock>Reveal ${esc(SP.full.toLowerCase())} spoilers</button></div>`;
      return;
    }
    el.style.setProperty("--c", V.colorOf(e));
    el.innerHTML = `<div class="xd-art">${V.artHTML(e, { eager: true })}</div>
      <p class="kicker">${esc(X.tag(e))}</p><h2 class="xd-name">${esc(V.show.name(e))}${e.jp ? ` <span class="v-jp" lang="ja">${esc(e.jp)}</span>` : ""}</h2>
      ${X.detail(e, V.h)}
      ${e.bioM ? V.spoilerBlock(`<p style="margin:0">${esc(e.bioM)}</p>`) : ""}
      <div class="v-actions"><button type="button" class="btn primary" data-full="${e.id}">Full profile</button>${!V.onMap || V.onMap(e) ? `<a class="btn" href="${V.url.network(e.id)}">On the map</a>` : ""}</div>`;
  }
  function render() {
    const items = list();
    if (state.sel && !items.some((e) => e.id === state.sel)) state.sel = null;
    if (!state.sel) { const first = items.find(V.visible); state.sel = first ? first.id : null; }
    $("#x-grid").innerHTML = items.map(tile).join("");
    $("#x-empty").hidden = items.length > 0;
    if (!items.length) $("#x-empty").innerHTML = V.stateHTML("empty", "Nothing found", base().length ? "No record matches this filter." : (X.emptyText || "No records yet."), '<button type="button" class="btn" data-x-reset>Show everything</button>');
    $("#x-count").textContent = `${items.filter(V.visible).length} shown${items.some((e) => !V.visible(e)) ? ` · ${items.filter((e) => !V.visible(e)).length} sealed` : ""}`;
    detail();
  }
  function select(id, { scroll = false } = {}) {
    const e = V.get(id);
    if (!e) return;
    state.sel = e.id;
    document.querySelectorAll("#x-grid [data-x]").forEach((b) => { const on = b.dataset.x === id; b.classList.toggle("active", on); b.setAttribute("aria-pressed", String(on)); });
    detail();
    try { history.replaceState(history.state, "", location.pathname + location.search + "#" + V.pub(e)); } catch (err) { /* cosmetic */ }
    if (scroll && matchMedia("(max-width: 980px)").matches) $("#x-detail").scrollIntoView({ behavior: V.util.reducedMotion() ? "auto" : "smooth", block: "start" });
  }

  $("#x-intro").innerHTML = X.intro ? X.intro() : "";
  $("#x-chips").addEventListener("click", (e) => { const c = e.target.closest("[data-f]"); if (!c) return; state.f = c.dataset.f; chips(); render(); });
  $("#x-q").addEventListener("input", V.util.debounce((e) => { state.q = e.target.value; render(); }, 120));
  $("#x-grid").addEventListener("click", (e) => { const t = e.target.closest("[data-x]"); if (t) select(t.dataset.x, { scroll: true }); });
  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-full]"); if (f) V.viewer.open(f.dataset.full, { list: list().filter(V.visible).map((x) => x.id) });
    if (e.target.closest("[data-x-reset]")) { state.f = "all"; state.q = ""; $("#x-q").value = ""; chips(); render(); }
    if (e.target.closest("#x-detail [data-unlock]")) V.spoilers.set(true);
  });
  V.spoilers.onChange(() => { chips(); render(); });
  const h = decodeURIComponent(location.hash.slice(1));
  if (h && V.get(h)) state.sel = V.get(h).id;
  chips(); render();
})();
