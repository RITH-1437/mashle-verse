/* ==========================================================================
   VERSE ENGINE: ranked roster (grade database / ranking pages)
   config.roster: { type, tiersTitle, spotlight, groups, columns, filters }.
   Tier bars per rank (click to filter), a spotlight of the top tier across
   record types, a sortable table with search and selects, group cards.
   ========================================================================== */
(() => {
  "use strict";
  const V = window.V;
  if (!V || !V.ready || document.body.dataset.page !== "roster") return;
  const C = V.config, R = C.roster, SP = C.spoiler;
  const { $, esc, norm } = V.util;
  const state = { rank: "all", q: "", sel: {}, sort: { key: "rank", dir: -1 } };
  const people = () => V.all.filter((e) => [].concat(R.type).includes(e._type) && (!R.filter || R.filter(e)));

  function tiers() {
    const list = people().filter(V.visible);
    const ranks = (C.ranks || []).filter((r) => !R.tierRanks || R.tierRanks.includes(r.id));
    const max = Math.max(1, ...ranks.map((r) => list.filter((e) => V.rankOf(e).id === r.id).length));
    const hidden = people().length - list.length;
    $("#tiers").innerHTML = ranks.map((r) => {
      const n = list.filter((e) => V.rankOf(e).id === r.id).length;
      return `<button type="button" class="tier" data-rank="${r.id}" aria-pressed="${state.rank === r.id}" style="--c:${r.color}">
        <span class="rank" style="--c:${r.color}">${esc(r.short)}</span>
        <span class="tier-mid"><span class="tier-name">${esc(r.label)}</span><span class="tier-bar"><span style="width:${(n / max) * 100}%"></span></span>${r.note ? `<span class="tier-note">${esc(r.note)}</span>` : ""}</span>
        <span class="tier-n">${n}</span></button>`;
    }).join("") + (hidden ? `<p class="tier-hidden"><span class="badge spoiler">${hidden} hidden by spoiler mode</span></p>` : "");
  }
  function spotlight() {
    if (!R.spotlight || !$("#spotlight")) return;
    const list = R.spotlight.ids().map(V.get).filter(Boolean);
    $("#spotlight").innerHTML = list.length ? list.map((e, i) => V.cardHTML(e, i)).join("") : V.stateHTML("empty", "Nothing here yet", "No records match this spotlight.");
  }
  function filters() {
    $("#roster-tools").innerHTML = `<div class="facet grow"><label class="label" for="rq">Search</label><div class="field"><span class="ico">${V.ICON.search}</span><input id="rq" class="input" type="search" autocomplete="off" placeholder="${esc(R.searchHint || "Name, group, technique…")}"></div></div>`
      + (R.filters || []).map(([k, label, get]) => {
        const vals = [...new Set(people().filter(V.visible).flatMap((e) => [].concat(get(e) || [])))].filter(Boolean).sort();
        return `<div class="facet"><label class="label" for="rf-${k}">${esc(label)}</label><select id="rf-${k}" class="select" data-sel="${k}"><option value="all">All</option>${vals.map((v) => `<option value="${esc(v)}">${esc((V.get(v) && V.show.name(V.get(v))) || v)}</option>`).join("")}</select></div>`;
      }).join("");
    $("#rq").value = state.q;
    Object.entries(state.sel).forEach(([k, v]) => { const s = $(`[data-sel="${k}"]`); if (s && [...s.options].some((o) => o.value === v)) s.value = v; else state.sel[k] = "all"; });
  }
  function rows() {
    const terms = norm(state.q).split(/\s+/).filter(Boolean);
    const list = people().filter((e) => V.visible(e)
      && (state.rank === "all" || V.rankOf(e).id === state.rank)
      && (!terms.length || terms.every((t) => e._hay.includes(t)))
      && (R.filters || []).every(([k, , get]) => !state.sel[k] || state.sel[k] === "all" || [].concat(get(e) || []).includes(state.sel[k])));
    const col = R.columns.find((c) => c[0] === state.sort.key) || R.columns[0];
    list.sort((a, b) => {
      const x = col[3] ? col[3](a) : col[2](a), y = col[3] ? col[3](b) : col[2](b);
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * state.sort.dir || a._order - b._order;
    });
    $("#roster-head").innerHTML = `<tr>${R.columns.map(([k, label]) => `<th scope="col" ${state.sort.key === k ? `aria-sort="${state.sort.dir > 0 ? "ascending" : "descending"}"` : ""}><button type="button" data-sort="${k}">${esc(label)}</button></th>`).join("")}</tr>`;
    $("#roster-body").innerHTML = list.map((e) => `<tr data-id="${e.id}" tabindex="0" style="--c:${V.colorOf(e)}">${R.columns.map(([k, , fn]) =>
      k === "name" ? `<td><span class="who">${V.artHTML(e)}<span><b>${esc(V.show.name(e))}</b><small>${esc(V.show.subtitle(e))}</small></span></span></td>` : `<td>${fn(e, V.h)}</td>`).join("")}</tr>`).join("");
    $("#roster-empty").hidden = list.length > 0;
    if (!list.length) $("#roster-empty").innerHTML = V.stateHTML("empty", "No one matches", "Try another grade, filter or search.", '<button type="button" class="btn" data-clear>Clear filters</button>');
    $("#roster-count").textContent = `${list.length} of ${people().filter(V.visible).length} shown`;
  }
  function groups() {
    if (!R.groups || !$("#groups")) return;
    const list = R.groups().filter(V.visible);
    $("#groups").innerHTML = list.map((g) => {
      const members = V.relations(g.id).filter((r) => r.t === "member").map((r) => V.get(r.id));
      return `<article class="group panel reveal" style="--c:${V.colorOf(g)}"><div class="group-head">${V.artHTML(g)}<div><h3>${esc(V.show.name(g))}</h3><small>${esc(V.show.subtitle(g))}</small></div></div>
        <p>${esc(g.note || g.bio || "")}</p>
        <div class="members">${members.map((m) => `<button type="button" class="badge link" data-open="${m.id}" style="--c:${V.colorOf(m)}">${esc(V.show.name(m))}</button>`).join("") || '<span class="soft">No members recorded.</span>'}</div>
        <button type="button" class="btn sm" data-open="${g.id}">Open record</button></article>`;
    }).join("");
  }
  function renderAll() { tiers(); spotlight(); filters(); rows(); groups(); V.observeReveals(); }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-rank]");
    if (t && t.closest("#tiers")) { state.rank = state.rank === t.dataset.rank ? "all" : t.dataset.rank; tiers(); rows(); return; }
    const s = e.target.closest("[data-sort]");
    if (s) { const k = s.dataset.sort; state.sort = { key: k, dir: state.sort.key === k ? -state.sort.dir : (k === "rank" ? -1 : 1) }; rows(); return; }
    if (e.target.closest("[data-clear]")) { state.rank = "all"; state.q = ""; state.sel = {}; renderAll(); return; }
    const row = e.target.closest("#roster-body tr[data-id]");
    if (row) V.viewer.open(row.dataset.id, { list: [...document.querySelectorAll("#roster-body tr[data-id]")].map((r) => r.dataset.id) });
    /* [data-open] buttons in group cards are handled by the shell */
  });
  document.addEventListener("keydown", (e) => {
    const row = e.target.closest && e.target.closest("#roster-body tr[data-id]");
    if (row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); row.click(); }
  });
  document.addEventListener("input", (e) => { if (e.target.id === "rq") { state.q = e.target.value; rows(); } });
  document.addEventListener("change", (e) => { const s = e.target.closest("[data-sel]"); if (s) { state.sel[s.dataset.sel] = s.value; rows(); } });
  V.spoilers.onChange(renderAll);
  renderAll();
})();
