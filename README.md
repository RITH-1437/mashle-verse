# Mashle Verse

An interactive fan encyclopedia, part of [Anime Verse](https://rith-1437.github.io/anime-verse/). Static HTML, CSS and JavaScript: no build step, works from a web server or straight from the file system.

## Pages
index (dashboard), archive (characters, Easton Magic Academy, villains & organizations, magical creatures, houses), visionaries (Divine Visionary ranking), magic (magic classification explorer), marks (Magic Mark gallery), compare (facts-only comparison), network (relationship map), timeline.

## Spoilers
Anime-safe by default: Seasons 1 and 2 (through the Divine Visionary Selection Exam). The **Manga spoilers** switch reveals later material. Manga-only records are marked `sp: "m"`; manga-only details live in fields ending in `M` (`bioM`, `statusM`, `parentsM`…). Sealed text is not put in the page until it is revealed. Details still being verified carry `canon: "check"` and show a **Needs check** badge.

## Layout
- `js/config.js`: everything specific to this universe (record types, ranks, relation kinds, profile rows, filters, page settings).
- `js/data/*.js`: the records.
- `js/engine/`: the shared Verse engine (core, shell, viewer and one script per page type). The same engine runs the other new universe, so fixes can be copied across.
- `css/engine.css` (shared layout) and `css/theme.css` (this site's look).
- `tools/build_pages.py`: rebuilds the HTML pages from `tools/site.json`.

## Adding artwork
No artwork ships yet; every record shows a generated sigil. To add art, save it as `assets/<folder>/<record-id>.webp` (folders: characters/, magic/, creatures/, academy/, backgrounds/), then run:

```
python tools/build_media_index.py
python tools/check_site.py
```
