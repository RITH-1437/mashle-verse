/* ==========================================================================
   VERSE ENGINE: core
   --------------------------------------------------------------------------
   Shared by the Anime Verse encyclopedias. Everything universe-specific lives
   in js/config.js (types, ranks, labels, facets) and js/data/*.js (records),
   so this file never mentions a character or a series.

   Load order on every page:
     js/config.js → js/data/*.js → js/media-index.js → js/engine/core.js → …

   Provides on window.V:
     util        escaping, accent-folding, storage, hashing
     types       entity type registry (from config.types)
     all/get     every record, by id (ids are unique across the universe)
     spoilers    anime-safe vs source-material mode, persisted per browser
     show        spoiler-aware display helpers (name, titles, status, refs)
     relations   connection graph: links + memberships + reference fields
     search      ranked search over an anime-safe or full index
     media       artwork lookup through the generated media index
     sigil       generated artwork for records that have no picture yet
   ========================================================================== */
(() => {
  "use strict";
  const V = window.V;
  if (!V || !V.config) { console.error("[Verse] js/config.js must load before the engine."); return; }
  const C = V.config;
  const D = (V.data = V.data || {});

  /* ------------------------------------------------------------------ util */
  const util = {
    $: (sel, root = document) => root.querySelector(sel),
    $$: (sel, root = document) => [...root.querySelectorAll(sel)],
    esc: (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
    norm: (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[-'’]/g, ""),
    debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; },
    hash(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; },
    rng(seed) { let s = seed || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5, ((s ^ (s >>> 14)) >>> 0) / 4294967296)); },
    store: {
      get(k, d = null) { try { const v = localStorage.getItem(C.site.storage + ":" + k); return v === null ? d : v; } catch (e) { return d; } },
      set(k, v) { try { localStorage.setItem(C.site.storage + ":" + k, v); } catch (e) { /* storage blocked: in-memory only */ } }
    },
    initials(name) {
      const w = String(name).replace(/^The\s+/i, "").replace(/[^\p{L}\p{N} -]/gu, "").split(/[\s-]+/).filter(Boolean);
      return ((w[0] || "?")[0] + (w.length > 1 ? w[w.length - 1][0] : (w[0] || "")[1] || "")).toUpperCase();
    },
    reducedMotion: () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches),
    plural: (n, one, many) => `${n} ${n === 1 ? one : many || one + "s"}`
  };
  V.util = util;
  const { esc, norm } = util;

  /* ------------------------------------------------------------- registry */
  V.types = C.types;
  const all = [], byId = new Map(), problems = [];
  Object.entries(C.types).forEach(([type, T]) => (D[T.data] || []).forEach((e, i) => {
    e._type = type; e._order = i;
    if (byId.has(e.id)) problems.push(`duplicate id "${e.id}"`);
    byId.set(e.id, e); all.push(e);
  }));
  V.all = all;
  V.get = (id) => byId.get(id) || null;
  V.ofType = (type) => all.filter((e) => e._type === type);
  V.ready = all.length > 0;

  /* ------------------------------------------------------------- spoilers */
  const listeners = [];
  V.spoilers = {
    on: util.store.get("spoilers") === "on",
    set(on) {
      this.on = !!on;
      util.store.set("spoilers", on ? "on" : "off");
      document.documentElement.classList.toggle("spoilers-on", this.on);
      listeners.forEach((fn) => { try { fn(this.on); } catch (err) { console.error(err); } });
    },
    onChange(fn) { listeners.push(fn); }
  };
  document.documentElement.classList.toggle("spoilers-on", V.spoilers.on);
  const isSpoiler = (e) => !!e && e.sp === "m";
  const visible = (e) => !!e && (!isSpoiler(e) || V.spoilers.on);
  V.isSpoiler = isSpoiler;
  V.visible = visible;
  V.linkVisible = (l) => l.sp !== "m" || V.spoilers.on;

  /* ---------------------------------------------------------------- ranks */
  const RANKS = C.ranks || [];
  const NO_RANK = { id: "", label: "Unranked", short: "", n: 0, color: "#6b6478" };
  V.rank = (id) => RANKS.find((r) => r.id === id) || NO_RANK;
  /* Rank the viewer may see: `rankM` is a later (spoiler) promotion. */
  V.rankOf = (e) => V.rank((V.spoilers.on && e.rankM) || e.rank);

  /* ------------------------------------------------------- display helpers */
  const arcs = () => D.arcs || [];
  V.arc = (id) => arcs().find((a) => a.id === id) || null;
  /* refs(e, "users") → ids from users plus usersM when spoilers are on */
  const refs = (e, f) => [...(e[f] || []), ...(V.spoilers.on ? e[f + "M"] || [] : [])];
  V.refs = refs;
  V.show = {
    name: (e) => (!e ? "" : !visible(e) ? C.spoiler.lockedName : (!V.spoilers.on && e.nameA) || e.name),
    alt: (e) => (!V.spoilers.on && e.altM) ? [] : (e.alt || []),
    titles: (e) => [...(e.titles || []), ...(V.spoilers.on ? e.titlesM || [] : [])],
    status: (e) => (V.spoilers.on && e.statusM) || e.status || "",
    hasHidden: (e) => !V.spoilers.on && !!(e.bioM || (e.titlesM || []).length || e.statusM || e.rankM ||
      (e.forms || []).some((f) => f.m) || Object.keys(e).some((k) => /M$/.test(k) && Array.isArray(e[k]) && e[k].length && k !== "titlesM")),
    arc: (id) => (V.arc(id) || {}).label || "",
    typeLabel: (e) => (C.typeLabel && C.typeLabel(e)) || (C.types[e._type] || {}).label || "",
    subtitle: (e) => !visible(e) ? C.spoiler.locked : ((C.subtitle && C.subtitle[e._type] && C.subtitle[e._type](e)) || e.role || e.kind || "")
  };
  V.colorOf = (e) => {
    if (!e) return "#8b7cff";
    const r = e.rank ? V.rankOf(e) : null;
    if (r && r.loud) return r.color;
    return e.color || (C.types[e._type] || {}).color || "#8b7cff";
  };

  /* ------------------------------------------------------------ relations */
  /* Every connection of one record: explicit links, memberships (orgs),
     family (parents) and every reference field declared in config.refs. */
  const REL = C.relations || {};
  function relations(id, { includeHidden = false } = {}) {
    const e = V.get(id);
    const out = [];
    const push = (other, t, label, sp) => {
      const o = V.get(other);
      if (!o || other === id) return;
      if (!includeHidden && sp === "m" && !V.spoilers.on) return;
      if (!includeHidden && !visible(o)) return;
      out.push({ id: other, t, label, sp: sp || o.sp || "" });
    };
    const both = (x, f, fn) => { (x[f] || []).forEach((v) => fn(v, "")); (x[f + "M"] || []).forEach((v) => fn(v, "m")); };
    (D.links || []).forEach((l) => {
      if (l.a === id) push(l.b, l.t, l.label || (REL[l.t] || {}).label, l.sp);
      else if (l.b === id) push(l.a, l.t, l.labelB || l.label || (REL[l.t] || {}).label, l.sp);
    });
    if (!e) return out;
    both(e, "orgs", (o, sp) => push(o, "member", "Member", sp));
    both(e, "parents", (p, sp) => push(p, "family", "Parent", sp));
    (C.refs || []).forEach((R) => { if (R.type === e._type) both(e, R.field, (x, sp) => push(x, R.t, R.here, sp)); });
    all.forEach((o) => {
      if (o === e) return;
      if ((o.orgs || []).includes(id)) push(o.id, "member", "Member");
      if ((o.orgsM || []).includes(id)) push(o.id, "member", "Member", "m");
      if ((o.parents || []).includes(id)) push(o.id, "family", "Child");
      if ((o.parentsM || []).includes(id)) push(o.id, "family", "Child", "m");
      (C.refs || []).forEach((R) => {
        if (R.type !== o._type) return;
        if ((o[R.field] || []).includes(id)) push(o.id, R.t, R.there);
        if ((o[R.field + "M"] || []).includes(id)) push(o.id, R.t, R.there, "m");
      });
    });
    const seen = new Set();
    return out.filter((r) => { const k = r.id + "|" + r.t; if (seen.has(k)) return false; seen.add(k); return true; });
  }
  V.relations = relations;
  V.relLabel = (t) => (REL[t] || {}).group || (REL[t] || {}).label || t;
  V.relOrder = Object.keys(REL);

  /* --------------------------------------------------------------- search */
  /* Two indexes per record: full and anime-safe. The anime-safe one leaves
     out source-only names, titles, bios and guilds, so a search can't
     confirm a spoiler on a record that is itself visible. */
  function haystack(e, full) {
    const safe = !full && !isSpoiler(e);
    const orgs = [...(e.orgs || []), ...(safe ? [] : e.orgsM || [])].map((o) => V.get(o)).filter((o) => o && (!safe || !isSpoiler(o)));
    return norm([safe && e.nameA ? "" : e.name, e.nameA, ...(safe && e.altM ? [] : e.alt || []), e.jp, ...(e.titles || []),
      ...(safe ? [] : [...(e.titlesM || []), e.bioM]), e.role, e.type, e.kind, e.rank && V.rank(e.rank).label,
      e.ability, e.effect, e.bio, e.note, ...orgs.map((o) => o.name)].filter(Boolean).join(" "));
  }
  const nameKey = (e, full) => {
    const safe = !full && !isSpoiler(e);
    return norm([safe && e.nameA ? "" : e.name, e.nameA, ...(safe && e.altM ? [] : e.alt || []), e.jp].filter(Boolean).join(" "));
  };
  all.forEach((e) => {
    const hay = { a: haystack(e, false), m: haystack(e, true) }, nm = { a: nameKey(e, false), m: nameKey(e, true) };
    e._hayAll = hay.m;
    Object.defineProperty(e, "_hay", { get: () => (V.spoilers.on ? hay.m : hay.a), configurable: true });
    Object.defineProperty(e, "_name", { get: () => (V.spoilers.on ? nm.m : nm.a), configurable: true });
  });
  const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  /* Returns { results:[record], hidden:Number }; hidden = spoiler matches withheld. */
  V.search = (q, { limit = 30, types = null } = {}) => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return { results: [], hidden: 0 };
    let hidden = 0;
    const scored = [];
    all.forEach((e) => {
      if (types && !types.includes(e._type)) return;
      if (!terms.every((t) => e._hay.includes(t))) { if (terms.every((t) => e._hayAll.includes(t))) hidden++; return; }
      if (!visible(e)) { hidden++; return; }
      let s = 0;
      terms.forEach((t) => {
        if (e._name.startsWith(t)) s += 12;
        else if (new RegExp("(^|\\s)" + escRe(t)).test(e._name)) s += 8;
        else if (e._name.includes(t)) s += 5;
        else s += 1;
      });
      if (e.featured) s += 1.5;
      scored.push([s, e]);
    });
    scored.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name));
    return { results: scored.slice(0, limit).map((x) => x[1]), hidden };
  };

  /* ---------------------------------------------------------------- media */
  const INDEX = Array.isArray(window.MEDIA_INDEX) ? new Set(window.MEDIA_INDEX) : null;
  const EXTS = ["webp", "png", "jpg", "jpeg", "avif"];
  V.media = {
    index: INDEX,
    /* Path of the record's artwork if one exists in assets/, else null. */
    art(e) {
      if (!e) return null;
      if (e.image) return e.image;
      if (!INDEX) return null;
      for (const f of (C.types[e._type] || {}).folders || []) {
        for (const x of EXTS) { const p = `assets/${f}/${e.id}.${x}`; if (INDEX.has(p)) return p; }
      }
      return null;
    }
  };

  /* ---------------------------------------------------------------- sigil */
  /* Generated artwork: an energy field, a rotating seal ring, an emblem for
     the record's type and its monogram. Deterministic per id. Emblem shapes
     come from config.emblems so each universe draws its own symbols. */
  let sigilCount = 0;
  V.sigil = (e, { label = true } = {}) => {
    const col = V.colorOf(e);
    const S2 = C.sigil || {};
    const r = util.rng(util.hash(e.id));
    const uid = "sg" + util.hash(e.id).toString(36) + "-" + (++sigilCount).toString(36);
    const ticks = Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * Math.PI * 2, l = r() > 0.6 ? 14 : 6;
      const x1 = 150 + Math.cos(a) * 118, y1 = 200 + Math.sin(a) * 118, x2 = 150 + Math.cos(a) * (118 - l), y2 = 200 + Math.sin(a) * (118 - l);
      return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }).join("");
    const wisps = Array.from({ length: 6 }, () => {
      const x = 20 + r() * 260, y = 60 + r() * 300, s = 30 + r() * 70;
      return `<path d="M${x.toFixed(0)} ${(y + s).toFixed(0)}c${(-s * .4).toFixed(0)} ${(-s * .5).toFixed(0)} ${(s * .3).toFixed(0)} ${(-s * .7).toFixed(0)} 0 ${(-s).toFixed(0)}" stroke-width="${(2 + r() * 5).toFixed(1)}" opacity="${(0.08 + r() * 0.14).toFixed(2)}"/>`;
    }).join("");
    const dash = `${(4 + r() * 10).toFixed(0)} ${(3 + r() * 8).toFixed(0)}`;
    const shown = visible(e);
    const mono = esc(util.initials(shown ? V.show.name(e) : "??"));
    const emblemKey = (C.types[e._type] || {}).emblem;
    const emblem = shown ? (C.emblems || {})[emblemKey] || (C.emblems || {}).default || "" : '<text x="150" y="230" text-anchor="middle" font-size="96" font-weight="700">?</text>';
    const base = S2.base || "#07060c";
    return `<svg class="sigil" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="${uid}b" cx="50%" cy="46%" r="70%"><stop offset="0" stop-color="${col}" stop-opacity=".55"/><stop offset=".45" stop-color="${col}" stop-opacity=".12"/><stop offset="1" stop-color="${base}" stop-opacity="0"/></radialGradient>
        <linearGradient id="${uid}f" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="${base}" stop-opacity="0"/><stop offset="1" stop-color="${base}" stop-opacity=".92"/></linearGradient>
      </defs>
      <rect width="300" height="400" fill="${base}"/>
      <rect width="300" height="400" fill="url(#${uid}b)"/>
      <g class="sg-wisps" stroke="${col}" fill="none" stroke-linecap="round">${wisps}</g>
      <g class="sg-ring" stroke="${col}" fill="none"><circle cx="150" cy="200" r="124" stroke-opacity=".5" stroke-dasharray="${dash}"/><path d="${ticks}" stroke-opacity=".6"/><circle cx="150" cy="200" r="98" stroke-opacity=".25"/></g>
      <g class="sg-emblem" fill="${col}" stroke="${col}" fill-opacity=".9" stroke-opacity=".9" style="filter:drop-shadow(0 0 10px ${col})">${emblem}</g>
      <rect width="300" height="400" fill="url(#${uid}f)"/>
      ${label ? `<text class="sg-mono" x="22" y="380" fill="${col}" font-size="34" font-weight="700" letter-spacing="3">${mono}</text>` : ""}
    </svg>`;
  };
  /* Artwork markup: real image when indexed, otherwise the sigil. */
  V.artHTML = (e, { cls = "", eager = false } = {}) => {
    const src = visible(e) ? V.media.art(e) : null;
    return `<span class="art ${cls}${src ? " has-img" : ""}" style="--c:${V.colorOf(e)}">${V.sigil(e)}${src
      ? `<img src="${esc(src)}" alt="" decoding="async" ${eager ? "" : 'loading="lazy"'} onload="this.parentNode.classList.add('img-ready')" onerror="this.remove()">` : ""}</span>`;
  };

  /* -------------------------------------------------------------- validate */
  function validate() {
    const need = (id, where) => { if (id && !byId.has(id)) problems.push(`${where} → unknown id "${id}"`); };
    const fields = new Set(["orgs", "parents", ...(C.refs || []).map((R) => R.field)]);
    all.forEach((e) => {
      fields.forEach((f) => [f, f + "M"].forEach((k) => (e[k] || []).forEach((x) => need(x, `${e.id}.${k}`))));
      if (e.arc && !V.arc(e.arc)) problems.push(`${e.id}.arc → unknown arc "${e.arc}"`);
      if (e.rank && !RANKS.some((r) => r.id === e.rank)) problems.push(`${e.id}.rank → unknown rank "${e.rank}"`);
    });
    (D.links || []).forEach((l, i) => { need(l.a, `links[${i}].a`); need(l.b, `links[${i}].b`); if (!REL[l.t]) problems.push(`links[${i}] unknown type "${l.t}"`); });
    (D.timeline || []).forEach((t) => { (t.ids || []).forEach((id) => need(id, t.id + ".ids")); if (t.arc && !V.arc(t.arc)) problems.push(`${t.id}.arc → unknown arc "${t.arc}"`); });
    if (problems.length) console.warn(`[${C.site.name}] data problems:\n` + problems.join("\n"));
    return problems;
  }
  V.validate = validate;
  if (V.ready) validate();

  /* ------------------------------------------------------------------ urls */
  V.url = {
    archive: (tab) => `archive.html#${tab}`,
    network: (id) => `network.html${id ? "?focus=" + encodeURIComponent(id) : ""}`
  };
})();
