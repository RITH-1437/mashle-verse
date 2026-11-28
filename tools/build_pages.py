"""Build the static HTML pages from tools/site.json.

Every page shares one skeleton (head, nav slot, scripts) and one of the
engine's page layouts: home, archive, roster, explorer, tree, compare,
network, timeline. index.html is written to the site root; every other page
goes into the folder named by site.json "pageDir" (html/), with ../ in front
of its css/, js/ and assets/ references and data-root="../" on <body> so the
engine and js/config.js can build links that work from either place.
Stale copies of those pages left in the root are removed. Edit
tools/site.json and rerun:

    python tools/build_pages.py
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = json.loads((ROOT / "tools" / "site.json").read_text(encoding="utf-8"))
E = html.escape


PAGE_DIR = SITE.get("pageDir", "").strip("/")


def out_path(file):
    """Where a page is written, relative to the site root."""
    return file if file == "index.html" or not PAGE_DIR else f"{PAGE_DIR}/{file}"


def rel_root(file):
    """Prefix that leads from the page back to the site root."""
    return "../" * out_path(file).count("/")


def href(target, from_file):
    """Link from one page to another page; keeps any ?query or #hash."""
    i = min([k for k in (target.find("?"), target.find("#")) if k >= 0] or [len(target)])
    return rel_root(from_file) + out_path(target[:i]) + target[i:]


def head(page, title, desc, up=""):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="{SITE['themeColor']}">
<link rel="icon" href="{up}assets/cover/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{SITE['fonts']}">
<link rel="stylesheet" href="{up}css/engine.min.css">
<link rel="stylesheet" href="{up}css/theme.min.css">
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
      <a class="btn" href="{href('archive.html', 'index.html')}">Open the archive →</a></div>
    <div class="grid-cards" id="featured">{loading()}</div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><div><p class="kicker">Explore</p><h2 class="section-title">{p['sectionsTitle']}</h2></div></div>
    <div class="sections" id="sections"></div>
  </div></section>
  <section class="section"><div class="wrap spotlight" id="spotlight"></div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><div><p class="kicker">Story</p><h2 class="section-title">{p['arcsTitle']}</h2></div><a class="btn" href="{href('timeline.html', 'index.html')}">Full timeline →</a></div>
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
        extra = f'<div class="v-actions" style="margin-top:22px"><a class="btn" href="{href(p["orgsLink"], "tree.html")}">Every clan and organization →</a></div>'
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
    return f"""<section class="page-head"><div class="wrap">
    <p class="kicker">{E(p.get('kicker', 'Relationships'))}</p>
    <h1 class="section-title">{p.get('h1', 'Relationship <em>flow</em>')}</h1>
    <p class="lead">{E(p.get('lead', 'Pick anyone to see who they are connected to, grouped by kind of relationship. Click a name to put them in the centre.'))}</p>
  </div></section>
  <section class="section" style="padding-top:24px"><div class="wrap rel-layout">
    <aside class="rel-side panel" aria-label="Choose who to centre">
      <div class="field"><span class="ico">{SEARCH_ICO}</span><input class="input" id="rel-q" type="search" autocomplete="off" placeholder="Find anyone…" aria-label="Find anyone"></div>
      <div class="chip-row" id="rel-types" aria-label="Record types"></div>
      <div class="rel-list" id="rel-list">{loading()}</div>
    </aside>
    <div class="rel-main">
      <div class="rel-top">
        <nav class="rel-trail" id="rel-trail" aria-label="Recently viewed"></nav>
        <div class="chip-row rel-groups" id="rel-groups" aria-label="Relationship kinds"></div>
      </div>
      <div class="flow" id="flow" aria-live="polite">
        <svg class="flow-lines" id="flow-lines" aria-hidden="true"></svg>
        <div class="flow-col" id="flow-left"></div>
        <div class="flow-centre" id="flow-centre"></div>
        <div class="flow-col" id="flow-right"></div>
      </div>
    </div>
  </div></section>"""


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
    up = rel_root(file)
    attrs = f' data-page="{kind}" data-root="{up}"' + (f' data-collection="{p["collection"]}"' if p.get("collection") else "")
    if p.get("nav"):
        attrs += f' data-nav="{p["nav"]}"'
    scripts = [up + s for s in ["js/config.js", *[f"js/data/{d}" for d in SITE["data"]], "js/media-index.js",
               "js/engine/core.js", "js/engine/shell.js", "js/engine/viewer.js", f"js/engine/{SCRIPT_OF[kind]}.js"]]
    foot = f"""
<footer class="site-foot"><div class="wrap">
  <a href="{SITE['hub']}">← Anime Verse</a>
  <span>{E(SITE['footNote'])}</span>
</div></footer>"""
    out = f"""{head(kind, p['title'], p['desc'], up)}
<body{attrs}>
<a class="skip" href="#main">Skip to content</a>
<header id="nav"></header>
<main id="main">
  {BODY[kind](p)}
</main>{foot}
<noscript><p class="wrap" style="padding:20px 0">This encyclopedia needs JavaScript to load its records.</p></noscript>
{chr(10).join(f'<script src="{s[:-3]}.min.js"></script>' for s in scripts)}
</body>
</html>
"""
    target = ROOT / out_path(file)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(out, encoding="utf-8", newline="\n")
    if out_path(file) != file and (ROOT / file).exists():
        (ROOT / file).unlink()
        print("removed stale", file)
    print("wrote", out_path(file))


if __name__ == "__main__":
    for file, p in SITE["pages"].items():
        build(file, p)
