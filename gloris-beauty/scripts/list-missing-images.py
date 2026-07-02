#!/usr/bin/env python3
"""Find every image URL referenced in old-site and report missing files."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".bmp", ".avif"}

PATTERNS = [
    re.compile(r"url\(\s*['\"]?([^'\"\)]+)['\"]?\s*\)", re.I),
    re.compile(r"""['"](\./images/[^'"]+)['"]""", re.I),
    re.compile(r"""['"](\./images/[^'"]+)['"]""", re.I),
    re.compile(r"(images/[A-Za-z0-9_\-./%]+)", re.I),
]


def clean(raw: str) -> str | None:
    raw = raw.strip().strip("'\"")
    if not raw or raw.startswith(("data:", "http://", "https://", "#")):
        return None
    raw = raw.split("?", 1)[0]
    while raw.startswith("./"):
        raw = raw[2:]
    raw = re.sub(r"^(?:\.\./)+", "", raw)
    if not raw.startswith("images/"):
        if raw.startswith("components/") and Path(raw).suffix.lower() in IMAGE_EXT:
            return raw
        return None
    if Path(raw).suffix.lower() not in IMAGE_EXT:
        return None
    return raw


def main() -> None:
    refs: set[str] = set()
    for file in ROOT.rglob("*"):
        if file.suffix.lower() not in {".html", ".css", ".js"}:
            continue
        text = file.read_text(encoding="utf-8", errors="ignore")
        for pat in PATTERNS:
            for match in pat.finditer(text):
                path = clean(match.group(1))
                if path:
                    refs.add(path)

    missing = sorted(r for r in refs if not (ROOT / r).is_file())
    print(f"refs={len(refs)} missing={len(missing)}")
    for r in missing:
        print(r)


if __name__ == "__main__":
    main()
