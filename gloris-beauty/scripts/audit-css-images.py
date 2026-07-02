#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1] / "old-site"
ext = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".bmp", ".avif"}

for css in sorted((ROOT / "components/com_gridbox/assets/css/storage").glob("style-*.css")):
    text = css.read_text(encoding="utf-8", errors="ignore")
    refs = set()
    for raw in re.findall(r"url\(([^)]+)\)", text):
        raw = raw.strip("'\"")
        raw = re.sub(r"^(?:\.\./)+", "", raw.split("?", 1)[0])
        if Path(raw).suffix.lower() in ext:
            refs.add(raw)
    missing = [r for r in refs if not (ROOT / r).is_file()]
    print(f"{css.name}: {len(refs)} refs, {len(missing)} missing")
    for m in missing[:5]:
        print(f"  - {m}")
