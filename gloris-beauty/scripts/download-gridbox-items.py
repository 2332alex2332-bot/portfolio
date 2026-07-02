#!/usr/bin/env python3
"""Download Gridbox getItems JS snapshots for offline old-site."""

from __future__ import annotations

import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"
OUT = ROOT / "assets" / "gridbox-items"
BASE = "https://gloris-lux.ru/"
UA = "PortfolioMirror/1.0"
DELAY = 0.12

GET_ITEMS_RE = re.compile(
    r'src="\./index\.php\?option=com_gridbox&task=editor\.getItems&id=(\d+)&([^"]+)"',
    re.I,
)


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=60) as r:
        return r.read()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    refs: dict[str, str] = {}
    for html in ROOT.rglob("*.html"):
        text = html.read_text(encoding="utf-8", errors="ignore")
        for m in GET_ITEMS_RE.finditer(text):
            page_id = m.group(1)
            query_tail = m.group(2)
            refs[page_id] = (
                f"index.php?option=com_gridbox&task=editor.getItems&id={page_id}&{query_tail}"
            )

    print(f"unique page ids: {len(refs)}")
    ok = 0
    for page_id, rel_query in sorted(refs.items(), key=lambda x: int(x[0])):
        dest = OUT / f"items-{page_id}.js"
        if dest.is_file() and dest.stat().st_size > 1000:
            print(f"skip {dest.name} ({dest.stat().st_size // 1024} KB)")
            ok += 1
            continue
        url = urllib.parse.urljoin(BASE, rel_query)
        try:
            data = fetch(url)
            if b"gridboxItems" not in data:
                print(f"WARN {page_id}: no gridboxItems in response")
            dest.write_bytes(data)
            ok += 1
            print(f"OK items-{page_id}.js ({len(data) // 1024} KB)")
        except Exception as exc:
            print(f"FAIL {page_id}: {exc}")
        time.sleep(DELAY)

    updated = 0
    for html in ROOT.rglob("*.html"):
        text = html.read_text(encoding="utf-8", errors="ignore")
        new_text = GET_ITEMS_RE.sub(
            lambda m: f'src="./assets/gridbox-items/items-{m.group(1)}.js"',
            text,
        )
        if new_text != text:
            html.write_text(new_text, encoding="utf-8")
            updated += 1

    print(f"\nDownloaded/verified {ok} item files, updated {updated} HTML pages.")


if __name__ == "__main__":
    main()
