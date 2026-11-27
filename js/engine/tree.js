/* ==========================================================================
   VERSE ENGINE: family / clan trees (tree.html)
   config.tree.groups: [{ id, name, note, color, members: [ids], membersM }].
   membersM: members only placed in the tree when spoilers are on (someone
   whose mere presence in a family would be a spoiler).
   Generations come from `parents` (and `parentsM` when spoilers are on);
   spouses from links of type "spouse". Each group is drawn as an SVG with
   elbow edges; nodes open the viewer. Sealed members show as locked nodes.
   ========================================================================== */
(() => {
  "use strict";
  const V = window.V;
  if (!V || !V.ready || document.body.dataset.page !== "tree") return;
  const C = V.config, T = C.tree, SP = C.spoiler;
  const { $, esc } = V.util;
  const NW = 150, NH = 64, GX = 26, GY = 70;

  function layout(group) {
    const ids = [...group.members, ...(V.spoilers.on ? group.membersM || [] : [])].filter((id) => V.get(id));
    const par = (id) => V.refs(V.get(id), "parents").filter((p) => ids.includes(p));
    const depth = {};
    const d = (id, seen = new Set()) => {
      if (depth[id] != null) return depth[id];
      if (seen.has(id)) return 0;
      seen.add(id);
      const ps = par(id);
      return (depth[id] = ps.length ? Math.max(...ps.map((p) => d(p, seen))) + 1 : 0);
    };
    ids.forEach((id) => d(id));
    /* spouses share a generation */
    (V.data.links || []).filter((l) => l.t === "spouse" && V.linkVisible(l) && ids.includes(l.a) && ids.includes(l.b))
      .forEach((l) => { const m = Math.max(depth[l.a], depth[l.b]); depth[l.a] = depth[l.b] = m; });
    const rows = [];
    ids.forEach((id) => (rows[depth[id]] = rows[depth[id]] || []).push(id));
    /* order each row by the average x of its parents to reduce crossings */
    const x = {};
    rows.forEach((row, gen) => {
      if (gen > 0) row.sort((a, b) => avg(a) - avg(b));
      row.forEach((id, i) => (x[id] = i));
      function avg(id) { const ps = par(id); return ps.length ? ps.reduce((s, p) => s + x[p], 0) / ps.length : 99; }
    });
    const width = Math.max(...rows.map((r) => (r || []).length)) * (NW + GX) + GX;
    const pos = {};
    rows.forEach((row, gen) => {
      const w = row.length * (NW + GX) - GX, off = (width - w) / 2;
      row.forEach((id, i) => (pos[id] = { x: off + i * (NW + GX), y: GX + gen * (NH + GY) }));
    });
    return { ids, pos, width, height: rows.length * (NH + GY) - GY + GX * 2, par };
  }
  function node(id, p) {
    const e = V.get(id), shown = V.visible(e), col = V.colorOf(e);
    const name = shown ? V.show.name(e) : SP.locked;
    const sub = shown ? (V.show.status(e) || V.show.subtitle(e)) : "Turn on spoilers";
    return `<g class="t-node${shown ? "" : " locked"}" data-open="${esc(V.pub(e))}" tabindex="0" role="button" aria-label="${esc(name)}" transform="translate(${p.x},${p.y})" style="--c:${col}">
      <rect width="${NW}" height="${NH}" rx="10"/><text class="t-name" x="12" y="26">${esc(name.length > 18 ? name.slice(0, 17) + "…" : name)}</text>
      <text class="t-sub" x="12" y="46">${esc(String(sub).length > 22 ? String(sub).slice(0, 21) + "…" : sub)}</text></g>`;
  }
  function render() {
    $("#trees").innerHTML = T.groups.map((g) => {
      const L = layout(g);
      const edges = L.ids.flatMap((id) => L.par(id).map((p) => {
        const a = L.pos[p], b = L.pos[id], hidden = !V.visible(V.get(id)) || !V.visible(V.get(p));
        const x1 = a.x + NW / 2, y1 = a.y + NH, x2 = b.x + NW / 2, y2 = b.y, my = (y1 + y2) / 2;
        return `<path class="t-edge${hidden ? " dim" : ""}" d="M${x1} ${y1}V${my}H${x2}V${y2}"/>`;
      })).join("");
      const spouses = (V.data.links || []).filter((l) => l.t === "spouse" && V.linkVisible(l) && L.pos[l.a] && L.pos[l.b]).map((l) => {
        const a = L.pos[l.a], b = L.pos[l.b], [l1, r1] = a.x < b.x ? [a, b] : [b, a];
        return `<path class="t-edge spouse" d="M${l1.x + NW} ${l1.y + NH / 2}H${r1.x}"/>`;
      }).join("");
      return `<section class="tree panel reveal" style="--c:${g.color}" id="tree-${g.id}">
        <header><h2>${esc(g.name)}</h2><p>${esc(g.note)}</p></header>
        <div class="tree-scroll" tabindex="0" aria-label="${esc(g.name)} family tree (scrolls sideways)">
          <svg viewBox="0 0 ${L.width} ${L.height}" width="${L.width}" height="${L.height}" role="group" aria-label="${esc(g.name)}">${edges}${spouses}${L.ids.map((id) => node(id, L.pos[id])).join("")}</svg>
        </div></section>`;
    }).join("");
    V.observeReveals($("#trees"));
  }
  document.addEventListener("keydown", (e) => {
    const n = e.target.closest && e.target.closest(".t-node");
    if (n && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); n.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
  });
  V.spoilers.onChange(render);
  render();
})();
