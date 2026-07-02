#!/usr/bin/env python3
"""Fix asset paths that must be relative to <base href> (old-site root)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"

FIXES_HREF = "./old-site-fixes.css"
PORTFOLIO_HREF = "../../index.html"
PORTFOLIO_CSS = "../../portfolio-back.css"

FIXES_RE = re.compile(
    r'<link\s+rel="stylesheet"\s+href="(?:\./|\.\./)*old-site-fixes\.css"\s*>',
    re.I,
)
PORTFOLIO_LINK_RE = re.compile(
    r'(<a\s+class="portfolio-back"\s+href=")(?:\./|\.\./)*index\.html(")',
    re.I,
)
PORTFOLIO_CSS_RE = re.compile(
    r'(<link\s+rel="stylesheet"\s+href=")(?:\./|\.\./)*portfolio-back\.css("\s*>)',
    re.I,
)


def main() -> None:
    updated = 0
    for html_file in ROOT.rglob("*.html"):
        text = html_file.read_text(encoding="utf-8", errors="ignore")
        original = text
        text = FIXES_RE.sub(f'<link rel="stylesheet" href="{FIXES_HREF}">', text)
        text = PORTFOLIO_LINK_RE.sub(rf"\1{PORTFOLIO_HREF}\2", text)
        text = PORTFOLIO_CSS_RE.sub(rf"\1{PORTFOLIO_CSS}\2", text)
        if text != original:
            html_file.write_text(text, encoding="utf-8")
            updated += 1
            print(f"fixed {html_file.relative_to(ROOT)}")
    print(f"\nDone. Updated {updated} files.")


if __name__ == "__main__":
    main()
