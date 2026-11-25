"""Build the static HTML pages from tools/site.json.

Every page shares one skeleton (head, nav slot, scripts) and one of the
engine's page layouts: home, archive, roster, explorer, tree, compare,
network, timeline. Edit tools/site.json and rerun:

    python tools/build_pages.py
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = json.loads((ROOT / "tools" / "site.json").read_text(encoding="utf-8"))
E = html.escape


def head(page, title, desc):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="{SITE['themeColor']}">
<link rel="icon" href="assets/cover/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{SITE['fonts']}">
<link rel="stylesheet" href="css/engine.css">
<link rel="stylesheet" href="css/theme.css">
</head>"""


def page_head(p):
    return f"""<section class="page-head"><div class="wrap">
    <p class="kicker">{E(p['kicker'])}</p>
    <h1 class="section-title">{p['h1']}</h1>
    <p class="lead">{E(p['lead'])}</p>
  </div></section>"""


SEARCH_ICO = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'


def body_home(p):
    return f"""{SITE['hero']}
  <section class="section"><div class="wrap">
    <div class="section-head"><div><p class="kicker">{E(p['featuredKicker'])}</p><h2 class="section-title">{p['featuredTitle']}</h2></div>
      <a class="btn" href="archive.html">Open the archive →</a></div>
    <div class="grid-cards" id="featured">{loading()}</div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><div><p class="kicker">Explore</p><h2 class="section-title">{p['sectionsTitle']}</h2></div></div>
    <div class="sections" id="sections"></div>
  </div></section>
  <section class="section"><div class="wrap spotlight" id="spotlight"></div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><div><p class="kicker">Story</p><h2 class="section-title">{p['arcsTitle']}</h2></div><a class="btn" href="timeline.html">Full timeline →</a></div>
    <div class="arcs" id="arcs"></div>
  </div></section>"""


def loading(text="Loading records…"):
    return f'<div class="state loading"><span class="loader"></span><p>{E(text)}</p></div>'


def body_archive(p):
    return f"""<section class="page-head"><div class="wrap">
    <p class="kicker" id="tab-kicker">Archive</p>
    <h1 class="section-title" id="tab-title">Archive</h1>
    <p class="lead" id="tab-sub"></p>
  </div></section>
  <section class="section" style="padding-top:28px"><div class="wrap">
    <div class="tabs" id="tabs" role="tablist" aria-label="Collections"></div>
    <div class="filters panel">
      <div class="facet"><label class="label" for="q">Search this collection</label>
        <div class="field"><span class="ico">{SEARCH_ICO}</span><input class="input" id="q" type="search" autocomplete="off" placeholder="{E(p['searchHint'])}"></div></div>
      <div class="facet"><label class="label" for="sort">Sort by</label><select class="select" id="sort"></select></div>
      <div class="facet"><span class="label">Content</span><div class="chip-row" id="content-chips">
        <button type="button" class="chip active" data-content="all">All</button>
        <button type="button" class="chip" data-content="anime">Anime</button>
        <button type="button" class="chip" data-content="source">{E(p['sourceChip'])}</button></div></div>
      <div class="f-facets" id="facets"></div>
    </div>
    <div class="result-bar"><span id="count" aria-live="polite"></span><span class="soft">Tip: ← → change page · click a card for its profile</span></div>
    <div class="grid-cards" id="grid" aria-busy="true">{loading()}</div>
    <div id="empty" hidden></div>
    <nav class="pager" id="pager" aria-label="Pages"></nav>
  </div></section>"""


def body_roster(p):
    return f"""{page_head(p)}
  <section class="section" style="padding-top:28px"><div class="wrap">
    <div class="roster-top">
      <div class="panel"><div class="panel-head">{E(p['tiersTitle'])}</div><div class="tiers" id="tiers"></div></div>
      <div><p class="kicker">{E(p['spotlightKicker'])}</p><div class="grid-cards" id="spotlight">{loading()}</div></div>
    </div>
    <div class="roster-tools panel" id="roster-tools"></div>
    <div class="result-bar"><span id="roster-count" aria-live="polite"></span><span class="soft">Click a column to sort · click a row for the profile</span></div>
    <div class="table-wrap"><table class="rtable"><caption class="sr-only">{E(p['tableCaption'])}</caption><thead id="roster-head"></thead><tbody id="roster-body"></tbody></table></div>
    <div id="roster-empty" hidden></div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><div><p class="kicker">{E(p['groupsKicker'])}</p><h2 class="section-title">{p['groupsTitle']}</h2></div></div>
    <div class="groups" id="groups"></div>
  </div></section>"""


def body_explorer(p):
    return f"""{page_head(p)}
  <section class="section" style="padding-top:28px"><div class="wrap">
    <div class="x-intro" id="x-intro"></div>
    <div class="x-tools">
      <div class="field"><span class="ico">{SEARCH_ICO}</span><input class="input" id="x-q" type="search" autocomplete="off" placeholder="{E(p['searchHint'])}" aria-label="Search"></div>
      <div class="chip-row" id="x-chips" aria-label="Filter"></div>
      <span class="soft" id="x-count" aria-live="polite"></span>
    </div>
    <div class="x-layout">
      <div><div class="x-grid" id="x-grid">{loading()}</div><div id="x-empty" hidden></div></div>
      <aside class="x-detail panel" id="x-detail" aria-live="polite"></aside>
    </div>
  </div></section>"""


def body_tree(p):
    extra = ""
    if p.get("orgsLink"):
        extra = f'<div class="v-actions" style="margin-top:22px"><a class="btn" href="{p["orgsLink"]}">Every clan and organization →</a></div>'
    return f"""{page_head(p)}
  <section class="section" style="padding-top:28px"><div class="wrap">
    <div class="trees" id="trees">{loading()}</div>{extra}
  </div></section>"""


def body_compare(p):
    return f"""{page_head(p)}
  <section class="section" style="padding-top:28px"><div class="wrap">
    <div class="cmp-pickers panel">
      <div class="facet"><label class="label" for="pick-a">First</label><select class="select" id="pick-a"></select></div>
      <button type="button" class="btn" id="swap" aria-label="Swap the two">⇄ Swap</button>
      <div class="facet"><label class="label" for="pick-b">Second</label><select class="select" id="pick-b"></select></div>
    </div>
    <div id="cmp">{loading()}</div>
  </div></section>"""


def body_network(p):
    return f"""<h1 class="sr-only">{E(p['title'])}</h1>
  <div class="net-shell">
    <div class="net-bar">
      <div><span class="label">Connections</span><div class="chip-row" id="layers"></div></div>
      <div><span class="label">Show</span><div class="chip-row" id="types"></div></div>
      <div class="net-find"><label class="label" for="find">Find</label>
        <div class="field"><span class="ico">{SEARCH_ICO}</span><input class="input" id="find" type="search" autocomplete="off" placeholder="Jump to a record…"></div>
        <div class="find-results panel" id="find-results" role="listbox" hidden></div></div>
      <span class="net-count" id="net-count"></span>
    </div>
    <div class="net-stage" id="stage">
      <svg id="net" role="group" aria-label="Relationship graph"></svg>
      <div class="net-loading" id="net-loading"><span class="loader"></span><p>Mapping connections…</p></div>
      <div class="net-empty" id="net-empty" hidden><div class="state"><h3>Nothing to show</h3><p>Turn a record type back on.</p></div></div>
      <div class="net-zoom panel"><button type="button" class="btn sm icon" id="zoom-in" aria-label="Zoom in">+</button><button type="button" class="btn sm icon" id="zoom-out" aria-label="Zoom out">−</button><button type="button" class="btn sm icon" id="zoom-fit" aria-label="Fit everything">⤢</button></div>
      <div class="net-legend panel" id="legend"></div>
      <aside class="net-panel panel" id="panel" hidden aria-live="polite"></aside>
    </div>
  </div>"""


def body_timeline(p):
    return f"""{page_head(p)}
  <section class="section" style="padding-top:28px"><div class="wrap">
    <div class="tl-filters panel">
      <div><span class="label">Show</span><div class="chip-row" id="kinds"></div></div>
      <div><span class="label">Jump to arc</span><div class="chip-row" id="arc-jump"></div></div>
    </div>
    <div class="timeline" id="timeline">{loading("Loading the timeline…")}</div>
  </div></section>"""


SCRIPT_OF = {"home": "home", "archive": "archive", "roster": "roster", "explorer": "explorer", "tree": "tree",
             "compare": "compare", "network": "network", "timeline": "timeline"}
BODY = {"home": body_home, "archive": body_archive, "roster": body_roster, "explorer": body_explorer, "tree": body_tree,
        "compare": body_compare, "network": body_network, "timeline": body_timeline}


def build(file, p):
    kind = p["kind"]
    attrs = f' data-page="{kind}"' + (f' data-collection="{p["collection"]}"' if p.get("collection") else "")
    if p.get("nav"):
        attrs += f' data-nav="{p["nav"]}"'
    scripts = ["js/config.js", *[f"js/data/{d}" for d in SITE["data"]], "js/media-index.js",
               "js/engine/core.js", "js/engine/shell.js", "js/engine/viewer.js", f"js/engine/{SCRIPT_OF[kind]}.js"]
    foot = "" if kind == "network" else f"""
<footer class="site-foot"><div class="wrap">
  <a href="{SITE['hub']}">← Anime Verse</a>
  <span>{E(SITE['footNote'])}</span>
</div></footer>"""
    out = f"""{head(kind, p['title'], p['desc'])}
<body{attrs}>
<a class="skip" href="#main">Skip to content</a>
<header id="nav"></header>
<main id="main">
  {BODY[kind](p)}
</main>{foot}
<noscript><p class="wrap" style="padding:20px 0">This encyclopedia needs JavaScript to load its records.</p></noscript>
{chr(10).join(f'<script src="{s}"></script>' for s in scripts)}
</body>
</html>
"""
    (ROOT / file).write_text(out, encoding="utf-8", newline="\n")
    print("wrote", file)


if __name__ == "__main__":
    for file, p in SITE["pages"].items():
        build(file, p)
