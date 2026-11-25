/* ==========================================================================
   MASHLE VERSE: configuration
   Spoiler line: the anime (Season 1 and Season 2, the Divine Visionary
   Selection Exam). Manga-only records are sp:"m"; manga-only details sit in
   *M fields. Details still being verified carry canon:"check" and show a
   "Needs check" badge instead of being presented as fact.
   Standing (ranks) is a character's position at Easton or in the
   magic world, not an invented power level.
   ========================================================================== */
window.V = window.V || {};
window.V.data = window.V.data || {};
window.V.config = (() => {
  const V = () => window.V;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const marks = (e) => e.marks == null ? "" : e.marks === 0 ? "None (no magic)" : `${e.marks} line${e.marks > 1 ? "s" : ""}`;

  return {
    site: {
      name: "Mashle Verse", brand: "Mashle", short: "Mashle", storage: "mashlev",
      searchHint: "Search students, Divine Visionaries, magic…",
      mark: `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d38a"/><stop offset="1" stop-color="#9b7bff"/></linearGradient></defs>
        <circle cx="20" cy="20" r="17" fill="none" stroke="url(#bm)" stroke-width="2"/><path d="M13 27V14l7 8 7-8v13" fill="none" stroke="url(#bm)" stroke-width="2.6" stroke-linejoin="round"/><circle cx="20" cy="9" r="2" fill="#f3d38a"/></svg>`
    },
    spoiler: {
      full: "Manga", safe: "Anime", badge: "Manga spoiler", locked: "Manga spoiler", lockedName: "Sealed record",
      coverage: "Seasons 1 and 2, through the Divine Visionary Selection Exam",
      toggle: "Manga spoilers",
      tip: "Off: only what the anime has shown (Seasons 1 and 2). On: the manga through its final chapter.",
      onText: "Manga records and details after Season 2 are now visible.",
      offText: "Only anime events (Seasons 1 and 2) are shown."
    },
    fx: { kind: "sparkles", colors: ["#f3d38a", "#fff4d6", "#9b7bff", "#5aa9ff"] },
    sigil: { base: "#0c0a10" },

    types: {
      character: { data: "characters", label: "Character", plural: "Characters", color: "#f3d38a", folders: ["characters"], emblem: "person" },
      magic: { data: "magic", label: "Magic", plural: "Magic", color: "#9b7bff", folders: ["magic"], emblem: "magic" },
      creature: { data: "creatures", label: "Magical Creature", plural: "Magical Creatures", color: "#5aa9ff", folders: ["creatures"], emblem: "creature" },
      org: { data: "orgs", label: "Organization", plural: "Houses & Organizations", color: "#d9b25f", folders: ["academy", "backgrounds"], emblem: "org" }
    },
    typeLabel: (e) => e.kind || null,
    subtitle: {
      magic: (e) => { const u = V().refs(e, "users").map((id) => V().get(id)).filter((x) => x && V().visible(x)); return u.length ? u.map((x) => V().show.name(x)).join(", ") : e.kind; }
    },

    /* Standing, not power. */
    ranks: [
      { id: "dv", label: "Divine Visionary", short: "DV", n: 4, color: "#f3d38a", note: "The eight greatest mages of the Magic Bureau, each holding a cane." },
      { id: "faculty", label: "Easton faculty", short: "FAC", n: 3, color: "#9b7bff", note: "Teachers and the headmaster of Easton." },
      { id: "student", label: "Easton student", short: "STU", n: 2, color: "#5aa9ff", note: "Students of Easton Magic Academy." }
    ],

    relations: {
      family: { label: "Family", color: "#f3b562" },
      mentor: { label: "Mentor", group: "Mentors & guardians", color: "#4dd0e1" },
      bond: { label: "Bond", group: "Friends", color: "#f48fb1" },
      ally: { label: "Ally", group: "Allies", color: "#66bb6a" },
      rival: { label: "Rival", group: "Rivals", color: "#ffa726" },
      enemy: { label: "Enemy", group: "Enemies", color: "#ef5350" },
      member: { label: "Member", group: "Houses & organizations", color: "#8c9eff" },
      magic: { label: "Magic", group: "Magic", color: "#9b7bff" },
      summon: { label: "Summon", group: "Summons & creatures", color: "#5aa9ff" }
    },
    refs: [
      { type: "magic", field: "users", t: "magic", here: "User", there: "Magic", power: true, powerLabel: "Magic" },
      { type: "creature", field: "users", t: "summon", here: "Summoned by", there: "Summon", power: true, powerLabel: "Summons" }
    ],
    labels: { window: "Easton record", powers: "Magic", forms: "Growth", abilities: "Skills & feats", effect: "Effect", rankSort: "Standing" },

    fields: {
      character: [
        ["Standing", (e, h) => h.rank(e)],
        ["Role", (e) => esc(e.role)],
        ["House / group", (e, h) => h.orgs(e)],
        ["Magic", (e, h) => h.users("magic", e.id)],
        ["Cane", (e) => esc(e.cane)],
        ["Magic marks", (e) => esc(marks(e))]
      ],
      magic: [["Classification", (e) => esc(e.kind)], ["Users", (e, h) => h.refs(e, "users")]],
      creature: [["Kind", (e) => esc(e.kind)], ["Summoner", (e, h) => h.refs(e, "users")]],
      org: [["Kind", (e) => esc(e.kind)], ["Led by", (e, h) => h.refs(e, "lead")], ["Known for", (e) => esc(e.known)]]
    },
    cardTags: (e) => {
      const out = [];
      if (e._type === "character") {
        const o = V().refs(e, "orgs").map((id) => V().get(id)).find((x) => x && V().visible(x) && x.kind !== "School");
        if (o) out.push([o.short || o.name, o.color]);
        if (e.cane) out.push([e.cane]);
      }
      if (e._type === "magic") out.push([e.kind]);
      return out;
    },

    facets: {
      kind: { label: "Category", kind: "chips", get: (e) => e.kind },
      rank: { label: "Standing", kind: "chips", get: (e) => V().rankOf(e).id || "none",
        options: (list) => [...V().config.ranks.filter((r) => list.some((e) => V().visible(e) && V().rankOf(e).id === r.id)).map((r) => [r.id, r.label]),
          ...(list.some((e) => V().visible(e) && !V().rankOf(e).id) ? [["none", "Outside Easton"]] : [])] },
      org: { label: "House / group", kind: "select", get: (e) => V().refs(e, "orgs"),
        options: (list) => { const s = new Set(); list.filter((e) => V().visible(e)).forEach((e) => V().refs(e, "orgs").forEach((o) => V().visible(V().get(o)) && s.add(o))); return [...s].map((id) => [id, V().show.name(V().get(id))]).sort((a, b) => a[1].localeCompare(b[1])); } },
      house: { label: "House", kind: "chips", get: (e) => V().refs(e, "orgs").filter((o) => (V().get(o) || {}).kind === "House"),
        options: (list) => V().ofType("org").filter((o) => o.kind === "House" && list.some((e) => V().visible(e) && V().refs(e, "orgs").includes(o.id))).map((o) => [o.id, o.name]) },
      side: { label: "Side", kind: "chips", get: (e) => e.side }
    },

    archive: {
      tabs: {
        characters: { type: "character", label: "All characters", title: "Character Archive", kicker: "Archive", unit: "characters",
          sub: "Every student, teacher, Divine Visionary and villain. Click any card for the full profile.", facets: ["side", "rank", "org"], sorts: ["order", "name", "rank", "links"] },
        academy: { type: "character", filter: (e) => ["student", "faculty"].includes(e.rank), label: "Easton", title: "Easton Magic Academy", kicker: "Student profiles", unit: "students and staff",
          sub: "The students and staff of Easton Magic Academy, by house. Only houses confirmed for each character are listed.", facets: ["house", "rank"], sorts: ["order", "name", "links"] },
        villains: { type: ["character", "org"], filter: (e) => e.side === "Antagonist" || e.kind === "Antagonist group", label: "Villains", title: "Villains & Organizations", kicker: "Threats", unit: "records",
          sub: "Magia Lupus and Innocent Zero's family.", facets: [], sorts: ["order", "name", "links"] },
        creatures: { type: "creature", label: "Creatures", title: "Magical Creatures", kicker: "Bestiary", unit: "creatures",
          sub: "Summoned and magical creatures. The archive only lists creatures it can source; more will be added as they are verified.",
          emptyText: "No creature entries yet." },
        orgs: { type: "org", label: "Houses & groups", title: "Houses and Organizations", kicker: "Factions", unit: "groups",
          sub: "Easton's houses, the Divine Visionaries and the groups that oppose them.", facets: ["kind"], sorts: ["order", "name", "links"] }
      }
    },

    roster: {
      type: "character",
      filter: (e) => !!e.rank,
      tierRanks: ["dv", "faculty", "student"],
      searchHint: "Name, cane or magic…",
      spotlight: { ids: () => V().ofType("character").filter((e) => e.rank === "dv").map((e) => e.id) },
      filters: [["cane", "Cane", (e) => e.cane], ["org", "House / group", (e) => V().refs(e, "orgs")]],
      columns: [
        ["name", "Name", (e) => V().show.name(e)],
        ["rank", "Standing", (e) => { const r = V().rankOf(e); return `<span class="rank inline" style="--c:${r.color}">${esc(r.short)}</span> ${esc(r.label)}`; }, (e) => V().rankOf(e).n],
        ["cane", "Cane", (e) => esc(e.cane || ""), (e) => e.cane || ""],
        ["magic", "Magic", (e, h) => h.users("magic", e.id) || '<span class="soft">Not stated</span>', () => ""],
        ["summon", "Summon", (e, h) => h.users("creature", e.id) || '<span class="soft">None recorded</span>', () => ""],
        ["status", "Status", (e) => esc(V().show.status(e)), (e) => V().show.status(e)]
      ],
      groups: () => V().ofType("org").filter((g) => g.kind === "House" || g.kind === "Magic Bureau")
    },

    explorer: {
      magic: {
        type: "magic",
        facet: ["kind", "Classification", (e) => e.kind],
        facetOrder: ["Divine Visionary cane", "Student magic", "Antagonist magic", "No magic"],
        tag: (e) => e.kind,
        pickTitle: "Pick a magic",
        detail: (e, h) => `<p>${esc(e.bio)}</p><h4>Users</h4><div class="chip-row">${h.refs(e, "users") || '<span class="soft">No visible user</span>'}</div>
          ${e.canon === "check" ? '<p class="note-check">Some details of this entry still need checking against the source.</p>' : ""}`,
        intro: () => `<p class="lead">In Mashle's world everyone is born with magic, and magic decides your place in society. Divine Visionaries are known by the cane they hold. Mash Burnedead has none at all, and wins with muscle.</p>`
      },
      marks: {
        type: "character",
        filter: (e) => e.marks != null,
        facet: ["marks", "Magic marks", (e) => marks(e)],
        facetOrder: ["None (no magic)", "1 line", "2 lines", "3 lines"],
        sort: (a, b) => b.marks - a.marks,
        tag: (e) => `Magic mark: ${marks(e)}`,
        pickTitle: "Pick a character",
        emptyText: "No confirmed magic marks yet.",
        detail: (e, h) => `<div class="mark-figure" aria-hidden="true">${Array.from({ length: Math.max(e.marks, 0) }, () => "<i></i>").join("") || "<span>no mark</span>"}</div>
          <div class="stat-table"><div class="k">Magic marks</div><div>${esc(marks(e))}</div><div class="k">Magic</div><div>${h.users("magic", e.id) || "Not stated"}</div><div class="k">Standing</div><div>${h.rank(e)}</div></div>
          <p>${esc(e.markNote || e.bio)}</p>`,
        intro: () => `<p class="lead">A magic mark is the line pattern on a mage's face that shows their magical talent. Most mages carry one line; two lines mark rare talent; three lines are almost unheard of. Only marks confirmed in the story are listed here.</p>`
      }
    },

    compare: {
      type: "character",
      defaults: ["mash", "rayne"],
      ladder: ["student", "faculty", "dv"],
      rows: [
        ["Standing", (e, h) => h.rank(e)],
        ["Side", (e) => esc(e.side)],
        ["House / group", (e, h) => h.orgs(e)],
        ["Magic", (e, h) => h.users("magic", e.id)],
        ["Cane", (e) => esc(e.cane || "")],
        ["Magic marks", (e) => esc(marks(e))],
        ["Summons", (e, h) => h.users("creature", e.id)],
        ["Connections", (e) => String(V().relations(e.id).length)],
        ["Status", (e) => esc(V().show.status(e))]
      ],
      note: "This page compares recorded facts only. Mashle gives no official power numbers, so none are invented here."
    },

    network: { types: ["character", "org", "creature"] },

    timelineKinds: {
      event: { label: "Turning point", color: "#f3d38a" },
      battle: { label: "Battle", color: "#ff8a65" },
      reveal: { label: "Revelation", color: "#9b7bff" }
    },

    nav: [
      ["home", "index.html", "Home"],
      ["archive", "archive.html", "Archive"],
      ["roster", "visionaries.html", "Visionaries"],
      ["explorer-magic", "magic.html", "Magic"],
      ["explorer-marks", "marks.html", "Marks"],
      ["compare", "compare.html", "Compare"],
      ["network", "network.html", "Relations"],
      ["timeline", "timeline.html", "Timeline"]
    ],
    quick: [
      ["archive.html#characters", "Character Archive", "Every student, mage and villain"],
      ["archive.html#academy", "Easton Magic Academy", "Student profiles by house"],
      ["visionaries.html", "Divine Visionaries", "The eight canes"],
      ["magic.html", "Magic explorer", "Every magic by classification"],
      ["marks.html", "Magic Mark gallery", "Lines of talent"],
      ["archive.html#villains", "Villains & Organizations", "Magia Lupus, Innocent Zero"],
      ["archive.html#creatures", "Magical Creatures", "Summons and beasts"],
      ["compare.html", "Compare", "Two characters side by side"],
      ["network.html", "Relationship map", "Friends, rivals and family"],
      ["timeline.html", "Story timeline", "From the forest to the exam"]
    ],

    home: {
      stats: [
        ["Characters", () => V().ofType("character").filter((e) => V().visible(e)).length, "archive.html#characters"],
        ["Divine Visionaries", () => V().ofType("character").filter((e) => V().visible(e) && e.rank === "dv").length, "visionaries.html"],
        ["Magic", () => V().ofType("magic").filter((e) => V().visible(e)).length, "magic.html"],
        ["Relationships", () => V().data.links.filter((l) => V().linkVisible(l)).length, "network.html"],
        ["Timeline events", () => V().data.timeline.filter((t) => t.sp !== "m" || V().spoilers.on).length, "timeline.html"]
      ],
      featuredTypes: ["character"],
      featuredLimit: 8,
      sections: [
        { title: "Character Archive", text: "Search, filter and sort every character.", href: "archive.html#characters", icon: "✦", color: "#f3d38a", count: () => `${V().ofType("character").filter((e) => V().visible(e)).length} records` },
        { title: "Easton Magic Academy", text: "Student profiles by house.", href: "archive.html#academy", icon: "⌂", color: "#5aa9ff" },
        { title: "Divine Visionaries", text: "The eight canes of the Magic Bureau.", href: "visionaries.html", icon: "♛", color: "#f3d38a" },
        { title: "Magic Classification", text: "Explore every magic by type and user.", href: "magic.html", icon: "✧", color: "#9b7bff" },
        { title: "Magic Marks", text: "The lines that rank a mage's talent.", href: "marks.html", icon: "≡", color: "#c9a3ff" },
        { title: "Magical Creatures", text: "Summons and beasts.", href: "archive.html#creatures", icon: "❦", color: "#5aa9ff" },
        { title: "Villains & Organizations", text: "Magia Lupus and Innocent Zero's family.", href: "archive.html#villains", icon: "✠", color: "#ef5350" },
        { title: "Compare", text: "Two characters side by side, facts only.", href: "compare.html", icon: "⇄", color: "#66bb6a" },
        { title: "Relationship map", text: "An interactive graph of every bond.", href: "network.html", icon: "❖", color: "#f48fb1" },
        { title: "Story Timeline", text: "From the forest to the selection exam.", href: "timeline.html", icon: "⌛", color: "#4dd0e1" }
      ],
      spotlight: {
        kicker: "Divine Visionaries", title: "The eight canes", cta: "Open the Divine Visionary ranking", href: "visionaries.html",
        text: "The Magic Bureau's greatest mages, each known by a cane. Becoming one is Mash's way to protect his father.",
        ids: () => ["rayne", "orter", "ryoh", "kaldo", "agito", "tsurara"]
      }
    },

    emblems: {
      person: '<path d="M150 128a30 30 0 1 1 0 60a30 30 0 1 1 0-60z" fill-opacity=".85"/><path d="M92 286c6-48 30-74 58-74s52 26 58 74z" fill-opacity=".55"/><path d="M106 112l44-30 44 30" fill="none" stroke-width="5"/>',
      magic: '<path d="M150 110l14 60 60 14-60 14-14 60-14-60-60-14 60-14z" fill-opacity=".85"/><circle cx="150" cy="184" r="70" fill="none" stroke-width="3" stroke-dasharray="6 8"/>',
      creature: '<path d="M90 230c20-60 60-90 110-70 30 12 40 40 30 60-20-10-40-6-50 10-20-20-60-20-90 0z" fill-opacity=".7"/><circle cx="196" cy="186" r="6" fill="#0c0a10"/><path d="M120 176l-30-40M170 160l10-46" stroke-width="5" fill="none" stroke-linecap="round"/>',
      org: '<path d="M100 270V150l50-40 50 40v120z" fill-opacity=".3" stroke-width="5"/><path d="M128 270v-56h44v56M150 110v-30" stroke-width="5" fill="none"/><circle cx="150" cy="168" r="12"/>',
      default: '<circle cx="150" cy="200" r="40"/>'
    }
  };
})();
