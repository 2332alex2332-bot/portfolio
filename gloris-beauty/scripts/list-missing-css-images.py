#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".bmp", ".avif"}


def clean(raw: str) -> str | None:
    raw = raw.strip().strip("'\"")
    if not raw or raw.startswith(("data:", "http://", "https://", "#")):
        return None
    raw = raw.split("?", 1)[0]
    while raw.startswith("./"):
        raw = raw[2:]
    raw = re.sub(r"^(?:\.\./)+", "", raw)
    if Path(raw).suffix.lower() not in IMAGE_EXT:
        return None
    return raw


refs: set[str] = set()
for css in ROOT.rglob("*.css"):
    text = css.read_text(encoding="utf-8", errors="ignore")
    for m in re.finditer(r"url\(([^)]+)\)", text):
        path = clean(m.group(1))
        if path:
            refs.add(path)

missing = sorted(r for r in refs if not (ROOT / r).is_file())
print(f"css refs={len(refs)} missing={len(missing)}")
for r in missing:
    print(r)
