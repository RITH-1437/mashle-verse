"""Static checks: every local href/src in the HTML exists, every path in the
media index exists, and every image under assets/ is named after a record."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
bad = []
for page in sorted(ROOT.glob("*.html")):
    text = page.read_text(encoding="utf-8")
    for ref in re.findall(r'(?:href|src)="([^"#?]+)', text):
        if ref.startswith(("http://", "https://", "mailto:", "data:")):
            continue
        if not (ROOT / ref).exists():
            bad.append(f"{page.name}: missing {ref}")
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
print("\n".join(bad) or f"OK: {len(list(ROOT.glob('*.html')))} pages, {len(paths)} indexed images, {len(ids)} record ids")
sys.exit(1 if bad else 0)
