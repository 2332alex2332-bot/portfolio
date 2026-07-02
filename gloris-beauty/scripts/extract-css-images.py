#!/usr/bin/env python3
import re
from pathlib import Path

css = Path(__file__).resolve().parents[1] / "old-site/components/com_gridbox/assets/css/storage/style-24.css"
text = css.read_text(encoding="utf-8")
urls = re.findall(r"url\(([^)]+)\)", text)
for u in urls:
    u = u.strip("'\"")
    if "images" in u or "slideshow" in u.lower():
        print(u)
