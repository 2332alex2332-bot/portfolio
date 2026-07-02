#!/usr/bin/env python3
"""Download missing CSS/JS/assets referenced by old-site HTML."""

from __future__ import annotations

import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"
BASE = "https://gloris-lux.ru/"
UA = "PortfolioMirror/1.0"
DELAY = 0.08

HREF_RE = re.compile(r'(?:href|src)="\./([^"?#]+\.(?:css|js|woff2?|ttf))"', re.I)


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=45) as r:
        return r.read()


def main() -> None:
    refs: set[str] = set()
    for html in ROOT.rglob("*.html"):
        text = html.read_text(encoding="utf-8", errors="ignore")
        for m in HREF_RE.finditer(text):
            refs.add(m.group(1))

    missing = sorted(r for r in refs if not (ROOT / r).is_file())
    print(f"refs={len(refs)} missing={len(missing)}")
    ok = 0
    fail = []
    for rel in missing:
        url = urllib.parse.urljoin(BASE, rel)
        try:
            data = fetch(url)
            dest = ROOT / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
            ok += 1
            print(f"OK {rel} ({len(data)//1024} KB)")
        except Exception as exc:
            fail.append(f"{rel}: {exc}")
        time.sleep(DELAY)
    print(f"\nDownloaded {ok}, failed {len(fail)}")
    for f in fail[:20]:
        print(f"  {f}")


if __name__ == "__main__":
    main()
