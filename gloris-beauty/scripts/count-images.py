#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"
exts = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico"}
files = [f for f in ROOT.rglob("*") if f.suffix.lower() in exts]
print(f"image files: {len(files)}")
for f in sorted(files)[:50]:
    print(f.relative_to(ROOT))
