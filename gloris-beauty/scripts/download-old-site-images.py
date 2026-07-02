#!/usr/bin/env python3
"""Download missing image assets for old-site mirror."""

from __future__ import annotations

import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"
BASE_URL = "https://gloris-lux.ru/"
USER_AGENT = "PortfolioMirror/1.0 (+local demo archive)"
DELAY = 0.08

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".bmp"}

URL_IN_CSS = re.compile(r"""url\(\s*['"]?([^'"\)]+)['"]?\s*\)""", re.I)
URL_IN_ATTR = re.compile(
    r"""(?:src|href|data-src|data-link|content)\s*=\s*['"]([^'"]+)['"]""",
    re.I,
)
STYLE_BG = re.compile(r"""background-image\s*:\s*url\(([^)]+)\)""", re.I)


def normalize_path(raw: str) -> Path | None:
    raw = raw.strip().strip("'\"")
    if not raw or raw.startswith(("data:", "http://", "https://", "#", "javascript:")):
        return None
    raw = raw.split("?", 1)[0]
    while raw.startswith("./"):
        raw = raw[2:]
    raw = raw.lstrip("/")
    raw = re.sub(r"^(?:\.\./)+", "", raw)
    if not raw:
        return None
    suffix = Path(raw).suffix.lower()
    if suffix not in IMAGE_EXTENSIONS:
        return None
    return Path(raw)


def collect_paths() -> set[Path]:
    paths: set[Path] = set()
    for file in ROOT.rglob("*"):
        if file.suffix.lower() not in {".html", ".css", ".js"}:
            continue
        text = file.read_text(encoding="utf-8", errors="ignore")
        for pattern in (URL_IN_CSS, URL_IN_ATTR, STYLE_BG):
            for match in pattern.finditer(text):
                path = normalize_path(match.group(1))
                if path:
                    paths.add(path)
    return paths


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=45) as resp:
        return resp.read()


def main() -> None:
    paths = sorted(collect_paths(), key=lambda p: str(p))
    print(f"Found {len(paths)} image references")

    downloaded = 0
    skipped = 0
    failed: list[str] = []

    for rel in paths:
        dest = ROOT / rel
        if dest.is_file() and dest.stat().st_size > 0:
            skipped += 1
            continue

        url = urllib.parse.urljoin(BASE_URL, rel.as_posix())
        try:
            data = fetch(url)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
            failed.append(f"{rel} ({exc})")
            continue

        if len(data) < 100:
            failed.append(f"{rel} (too small: {len(data)} bytes)")
            continue

        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        downloaded += 1
        print(f"OK {rel} ({len(data) // 1024} KB)")
        time.sleep(DELAY)

    print(f"\nDownloaded: {downloaded}, skipped existing: {skipped}, failed: {len(failed)}")
    if failed:
        print("\nFailed:")
        for item in failed[:40]:
            print(f"  - {item}")
        if len(failed) > 40:
            print(f"  ... and {len(failed) - 40} more")


if __name__ == "__main__":
    main()
