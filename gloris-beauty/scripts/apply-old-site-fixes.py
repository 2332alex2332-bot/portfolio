#!/usr/bin/env python3
"""Apply email masking, logo styling hook, and fixes.css to old-site HTML."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"
FIXES_LINK = '<link rel="stylesheet" href="./old-site-fixes.css">\n'
STICKY_SCRIPT = '<script src="./old-site-sticky-header.js"></script>\n'
EMAIL_FROM = "info@example.com"
EMAIL_TO = "info@exampleXXX.com"


def inject_fixes(html: str) -> str:
    if "old-site-fixes.css" not in html and "</head>" in html:
        html = html.replace("</head>", FIXES_LINK + "</head>", 1)
    if "old-site-sticky-header.js" not in html and "</body>" in html:
        html = html.replace("</body>", STICKY_SCRIPT + "</body>", 1)
    return html


def main() -> None:
    updated = 0
    for html_file in ROOT.rglob("*.html"):
        text = html_file.read_text(encoding="utf-8", errors="ignore")
        original = text
        text = text.replace(EMAIL_FROM, EMAIL_TO)
        text = inject_fixes(text)
        if text != original:
            html_file.write_text(text, encoding="utf-8")
            updated += 1
            print(f"updated {html_file.relative_to(ROOT)}")
    print(f"\nDone. Updated {updated} files.")


if __name__ == "__main__":
    main()
