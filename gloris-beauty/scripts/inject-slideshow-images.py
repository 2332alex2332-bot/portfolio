#!/usr/bin/env python3
"""Inject inline slideshow backgrounds from page CSS for offline file:// viewing."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"

RULE_RE = re.compile(
    r"(#item-\d+)\s+li\.item:nth-child\((\d+)\)\s+\.ba-slideshow-img\s*"
    r"\{[^}]*background-image:\s*url\(([^)]+)\)",
    re.I,
)
HEIGHT_RE = re.compile(
    r"(#item-\d+)\s+\.ba-slideshow-img\s*\{[^}]*height:\s*(\d+)px",
    re.I,
)
BG_SIZE_RE = re.compile(
    r"(#item-\d+)\s+\.ba-slideshow-img\s*\{[^}]*background-size\s*:\s*([^;]+)",
    re.I,
)


def css_path_to_site(path: str) -> str:
    path = path.strip().strip("'\"")
    path = re.sub(r"^(?:\.\./)+", "", path)
    return f"./{path}"


def load_css_rules(css_file: Path) -> tuple[dict[str, dict[int, str]], dict[str, str], dict[str, str]]:
    text = css_file.read_text(encoding="utf-8", errors="ignore")
    images: dict[str, dict[int, str]] = {}
    heights: dict[str, str] = {}
    sizes: dict[str, str] = {}
    for match in RULE_RE.finditer(text):
        item_id, nth, raw_url = match.groups()
        images.setdefault(item_id, {})[int(nth)] = css_path_to_site(raw_url)
    for match in HEIGHT_RE.finditer(text):
        heights[match.group(1)] = match.group(2)
    for match in BG_SIZE_RE.finditer(text):
        sizes[match.group(1)] = match.group(2).strip()
    return images, heights, sizes


def linked_css(html: str) -> Path | None:
    match = re.search(
        r'href="\./components/com_gridbox/assets/css/storage/(style-\d+\.css)',
        html,
        re.I,
    )
    if not match:
        return None
    css = ROOT / "components/com_gridbox/assets/css/storage" / match.group(1)
    return css if css.is_file() else None


def inject_item_block(block: str, item_id: str, slide_map: dict[int, str], height: str, size: str) -> str:
    nth = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal nth
        nth += 1
        tag = match.group(0)
        if 'style="background-image' in tag:
            return tag
        image = slide_map.get(nth)
        if not image:
            return tag
        style = (
            f'style="background-image: url({image}); '
            f"background-size: {size}; background-position: center; height: {height}px;\""
        )
        return f"<div class=\"ba-slideshow-img\" {style}></div>"

    return re.sub(r'<div class="ba-slideshow-img"(?:\s[^>]*)?></div>', repl, block)


def inject_slideshows(html: str, css_file: Path) -> str:
    images, heights, sizes = load_css_rules(css_file)
    for item_id, slide_map in images.items():
        bare_id = item_id.lstrip("#")
        marker = f'id="{bare_id}"'
        start = html.find(marker)
        if start < 0:
            continue
        content_start = html.find('<div class="slideshow-content', start)
        if content_start < 0:
            continue
        content_end = html.find("</ul>", content_start)
        if content_end < 0:
            continue
        block = html[content_start:content_end]
        height = heights.get(item_id, "450")
        size = sizes.get(item_id, "cover")
        new_block = inject_item_block(block, item_id, slide_map, height, size)
        if new_block != block:
            html = html[:content_start] + new_block + html[content_end:]
    return html


def strip_query_versions(html: str) -> str:
    html = re.sub(
        r'(href="\./(?:components|templates|media)/[^"?]+\?)[^"]*(")',
        r"\1\2",
        html,
    )
    html = re.sub(r'\?(?=")', "", html)
    return html


def main() -> None:
    updated = 0
    for html_file in ROOT.rglob("*.html"):
        html = html_file.read_text(encoding="utf-8", errors="ignore")
        original = html
        css_file = linked_css(html)
        if css_file:
            html = inject_slideshows(html, css_file)
        html = strip_query_versions(html)
        if html != original:
            html_file.write_text(html, encoding="utf-8")
            updated += 1
            print(f"updated {html_file.relative_to(ROOT)}")
    print(f"\nDone. Updated {updated} files.")


if __name__ == "__main__":
    main()
