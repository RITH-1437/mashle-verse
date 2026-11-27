"""Static checks:
- the site root holds only index.html; every other page is in html/;
- every local href/src in every page exists, resolved from the page's own folder;
- every page carries the right data-root ("" at the root, "../" in html/);
- every path in the media index exists, and every image under assets/ is
  named after a record."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
bad = []
pages = [ROOT / "index.html", *sorted((ROOT / "html").glob("*.html"))]
for stray in sorted(ROOT.glob("*.html")):
    if stray.name != "index.html":
        bad.append(f"{stray.name}: pages other than index.html belong in html/")
for page in pages:
    if not page.exists():
        bad.append(f"missing page {page.relative_to(ROOT).as_posix()}")
        continue
    name = page.relative_to(ROOT).as_posix()
    text = page.read_text(encoding="utf-8")
    want = "../" * name.count("/")
    m = re.search(r'<body[^>]*\bdata-root="([^"]*)"', text)
    if not m or m.group(1) != want:
        bad.append(f'{name}: <body data-root> should be "{want}"')
    for ref in re.findall(r'(?:href|src)="([^"#?]+)', text):
        if ref.startswith(("http://", "https://", "mailto:", "data:")):
            continue
        if not (page.parent / ref).resolve().exists():
            bad.append(f"{name}: missing {ref}")
index = (ROOT / "js" / "media-index.js").read_text(encoding="utf-8")
paths = re.findall(r'"(assets/[^"]+)"', index)
for p in paths:
    if not (ROOT / p).exists():
        bad.append(f"media-index: missing {p}")
data = "".join(p.read_text(encoding="utf-8") for p in (ROOT / "js" / "data").glob("*.js"))
ids = set(re.findall(r'\bid: "([^"]+)"', data))
for p in paths:
    if Path(p).stem not in ids:
        bad.append(f"asset {p} does not match any record id")
print("\n".join(bad) or f"OK: {len(pages)} pages (index.html + {len(pages) - 1} in html/), {len(paths)} indexed images, {len(ids)} record ids")
sys.exit(1 if bad else 0)
