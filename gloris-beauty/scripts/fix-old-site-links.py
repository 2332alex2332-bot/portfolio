#!/usr/bin/env python3
"""Make old-site navigation work when opened via file:// (no directory index)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"

SKIP_SCHEMES = ("http://", "https://", "mailto:", "tel:", "whatsapp:", "javascript:", "data:")
ASSET_EXTENSIONS = {
    ".css", ".js", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".webm", ".pdf", ".php",
}
LINK_ATTR_RE = re.compile(
    r'(?P<attr>href|data-link)\s*=\s*"(?P<url>(?!#)[^"]*)"',
    re.IGNORECASE,
)


def fix_anchor_tag(tag: str) -> str:
    def repl(match: re.Match[str]) -> str:
        attr = match.group("attr")
        url = match.group("url")
        fixed = to_index_link(url)
        if fixed == url:
            return match.group(0)
        return f'{attr}="{fixed}"'

    return LINK_ATTR_RE.sub(repl, tag)


def fix_html(html: str) -> str:
    return re.sub(r"<a\b[^>]*>", fix_anchor_tag, html, flags=re.IGNORECASE)


PORTFOLIO_SNIPPET = (
    '\n<a class="portfolio-back" href="{href}" aria-label="Вернуться в портфолио">'
    "← Портфолио</a>\n"
    '<link rel="stylesheet" href="{css}">\n'
)


def has_asset_extension(path: str) -> bool:
    clean = path.split("?", 1)[0].split("#", 1)[0]
    suffix = Path(clean).suffix.lower()
    return suffix in ASSET_EXTENSIONS


def to_index_link(url: str) -> str:
    if not url or url.startswith(SKIP_SCHEMES):
        return url
    if url.startswith("#"):
        return url
    if has_asset_extension(url):
        return url

    fragment = ""
    if "#" in url:
        url, fragment = url.split("#", 1)
        fragment = f"#{fragment}"

    url = url.strip()
    if not url or url in {".", "./"}:
        path_part = Path(".")
    elif url.startswith("./"):
        path_part = Path(url[2:])
    else:
        return url + fragment

    path_part = Path(str(path_part).rstrip("/"))
    candidate = ROOT / path_part / "index.html"
    if not candidate.is_file():
        return (url or "./") + fragment

    if path_part in {Path("."), Path("")}:
        return "./index.html" + fragment
    return f"./{path_part.as_posix()}/index.html" + fragment


def portfolio_paths(_html_file: Path) -> tuple[str, str]:
    # All pages use <base href> pointing at old-site root.
    return "../../index.html", "../../portfolio-back.css"


def inject_portfolio_back(html: str, html_file: Path) -> str:
    if "portfolio-back" in html:
        return html
    href, css = portfolio_paths(html_file)
    snippet = PORTFOLIO_SNIPPET.format(href=href, css=css)
    return html.replace("</body>", snippet + "</body>")


def main() -> None:
    updated = 0
    for html_file in ROOT.rglob("*.html"):
        original = html_file.read_text(encoding="utf-8", errors="ignore")
        text = fix_html(original)
        text = inject_portfolio_back(text, html_file)
        if text != original:
            html_file.write_text(text, encoding="utf-8")
            updated += 1
            print(f"fixed {html_file.relative_to(ROOT)}")
    print(f"\nDone. Updated {updated} files.")


if __name__ == "__main__":
    main()
