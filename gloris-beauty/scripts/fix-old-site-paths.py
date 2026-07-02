#!/usr/bin/env python3
"""Fix relative base paths and font URLs in mirrored old-site HTML."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1] / "old-site"

for html_file in ROOT.rglob("*.html"):
    rel = html_file.relative_to(ROOT)
    depth = len(rel.parts) - 1
    prefix = "../" * depth if depth else "./"
    text = html_file.read_text(encoding="utf-8")
    text = re.sub(
        r'<base\s+href="\./(?:index\.html)?"\s*/?>',
        f'<base href="{prefix}" />',
        text,
        flags=re.I,
    )
    text = text.replace(".//fonts.googleapis.com", "https://fonts.googleapis.com")
    text = text.replace('href=".//fonts.googleapis.com', 'href="https://fonts.googleapis.com')
    html_file.write_text(encoding="utf-8", data=text)
    print(f"fixed {rel}")
