# Mashle Verse

An interactive fan encyclopedia, part of [Anime Verse](https://rith-1437.github.io/anime-verse/). Static HTML, CSS and JavaScript: no build step, works from a web server or straight from the file system.

## Pages
`index.html` (dashboard) is the only page in the site root. Every other page lives in `html/`:

| Page | What it shows |
| --- | --- |
| `html/archive.html` | Characters, Easton Magic Academy, villains & organizations, magical creatures, houses (`#characters`, `#academy`, `#villains`, `#creatures`, `#orgs`) |
| `html/visionaries.html` | Divine Visionary ranking and everyone's standing |
| `html/magic.html` | Magic classification explorer |
| `html/marks.html` | Magic Mark gallery |
| `html/compare.html` | Facts-only comparison (`?a=<id>&b=<id>`) |
| `html/network.html` | Relationship map (`?focus=<id>`) |
| `html/timeline.html` | Story timeline (`#<event-id>`, `#arc-<arc-id>`) |

Any page also opens a profile with `?view=<record-id>`.

## Contents
37 characters (31 anime-safe), all 8 Divine Visionaries, 33 magics (27 anime-safe), 4 creatures, 9 houses and groups, 48 relationships (42 anime-safe) and 23 timeline events (19 anime-safe), from Mash's childhood through Innocent Zero's attack on the selection exam, plus sealed manga material: Innocent Zero's other sons, Walkis Magic Academy, the Tri-Magic-Athalon and the final battle.

## Spoilers
Anime-safe by default: Seasons 1 and 2 (episodes 1-24, through the Divine Visionary Selection Exam and Innocent Zero's attack on it). The **Manga spoilers** switch reveals later material. Manga-only records are marked `sp: "m"`; manga-only details live in fields ending in `M` (`bioM`, `statusM`, `parentsM`…). Sealed text is not put in the page until it is revealed. Details still being verified carry `canon: "check"` and show a **Needs check** badge.

Season 2 itself reveals that Innocent Zero is Mash's father, so that link is anime-safe. Innocent Zero's other sons (Doom, Famin, Epidem, Delisaster, Domina) are not named until the manga, so they are sealed. Season 3 (the Tri-Magic-Athalon) had not aired when this was written; when it does, move its records out of the spoiler set.

## Layout
- `index.html`: the dashboard, at the root.
- `html/*.html`: every other page. They load `../css/`, `../js/` and `../assets/`, and carry `<body data-root="../">` (`index.html` has `data-root=""`). Never edit these by hand: they are generated.
- `js/config.js`: everything specific to this universe (record types, ranks, relation kinds, profile rows, filters, page settings). Page links in it go through `go("page.html")`, which reads `data-root` so the same link works from the root and from `html/`. `site.root` and `site.pages` tell the engine the same thing.
- `js/data/characters.js`, `js/data/world.js`: the records (magic, creatures, organizations, arcs, relationships, timeline).
- `js/engine/`: the shared Verse engine (core, shell, viewer and one script per page type). The same engine runs the other new universe, so fixes are made there and copied across; do not edit it for this site only.
- `css/engine.css` (shared layout) and `css/theme.css` (this site's look, focus rings, reduced-motion and high-contrast rules).
- `tools/build_pages.py`: rebuilds the HTML pages from `tools/site.json`. `"pageDir": "html"` sends every page except `index.html` into `html/` and removes stale copies from the root.
- `tools/check_site.py`: checks that only `index.html` is in the root, that every local `href`/`src` resolves from the page's own folder, that `data-root` is right, and that artwork matches the media index.

After editing `tools/site.json` or `tools/build_pages.py`:

```
python tools/build_pages.py
python tools/check_site.py
```

## Adding artwork
No artwork ships yet; every record shows a generated sigil. To add art, save it as `assets/<folder>/<record-id>.webp` (folders: characters/, magic/, creatures/, academy/, backgrounds/), then run:

```
python tools/build_media_index.py
python tools/check_site.py
```
