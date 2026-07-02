#!/usr/bin/env python3
"""Mirror gloris-lux.ru into old-site/ with PII redaction for portfolio demo."""

from __future__ import annotations

import hashlib
import os
import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import deque
from pathlib import Path

BASE_URL = "https://gloris-lux.ru/"
ROOT = Path(__file__).resolve().parents[1] / "old-site"
MAX_PAGES = 120
DELAY = 0.15

SKIP_EXTENSIONS = {".pdf", ".zip", ".doc", ".docx", ".xml"}
BINARY_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".webm",
}

USER_AGENT = "PortfolioMirror/1.0 (+local demo archive)"


def sanitize_text(text: str) -> str:
    replacements = [
        (r"\+7\s*\(\s*499\s*\)\s*612[-\s]?72[-\s]?29", "+7 (499) XXX-XX-XX"),
        (r"\+7\s*\(\s*901\s*\)\s*517[-\s]?26[-\s]?12", "+7 (901) XXX-XX-XX"),
        (r"tel:\+74996127229", "tel:+74990000000"),
        (r"tel:\+79015172612", "tel:+79000000000"),
        (r"whatsapp://send\?phone=79015172612", "whatsapp://send?phone=79000000000"),
        (r"phone=79015172612", "phone=79000000000"),
        (r"79015172612", "7900XXXXXXX"),
        (r"74996127229", "7499XXXXXXX"),
        (r"Ул\.\s*Кантемировская,\s*д\.\s*39", "ул. XXX, д. XX"),
        (r"Пр\.\s*Андропова,\s*д\.\s*38", "пр-т XXX, д. XX"),
        (r"Проспект\s+Андропова\s+дом\s+38", "пр-т XXX, д. XX"),
        (r"пр\.?\s*Андропова[^<\n]*38", "пр-т XXX, д. XX"),
        (r"Кантемировская[^<\n]*39", "ул. XXX, д. XX"),
        (r"метро\s+Коломенская", "м. XXX"),
        (r"станции\s+метро\s+Коломенская", "станции метро XXX"),
        (r"Коломенская", "XXX"),
    ]
    for pattern, repl in replacements:
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
    return text


def strip_tracking(text: str) -> str:
    text = re.sub(
        r"<!--\s*Yandex\.Metrika counter\s*-->.*?<!--\s*/Yandex\.Metrika counter\s*-->",
        "",
        text,
        flags=re.DOTALL | re.IGNORECASE,
    )
    text = re.sub(
        r"<script[^>]*>[\s\S]*?mc\.yandex\.ru[\s\S]*?</script>",
        "",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(
        r'<noscript>[\s\S]*?mc\.yandex\.ru[\s\S]*?</noscript>',
        "",
        text,
        flags=re.IGNORECASE,
    )
    return text


def rewrite_html(html: str, page_url: str) -> str:
    html = strip_tracking(html)
    html = sanitize_text(html)
    html = re.sub(
        r'<base\s+href="[^"]*"\s*/?>',
        '<base href="./" />',
        html,
        flags=re.IGNORECASE,
    )
    # Absolute same-site links -> relative
    html = html.replace("https://gloris-lux.ru/", "./")
    html = html.replace("http://gloris-lux.ru/", "./")
    html = html.replace('href="/', 'href="./')
    html = html.replace("href='/", "href='./")
    html = html.replace('src="/', 'src="./')
    html = html.replace("src='/", "src='./")
    html = html.replace('url(/', 'url(./')
    html = html.replace("url('/", "url('./")
    html = html.replace('url("/', 'url("./')
    html = html.replace('action="/', 'action="./')
    return html


def rewrite_css(css: str) -> str:
    css = sanitize_text(css)
    css = css.replace("https://gloris-lux.ru/", "./")
    css = css.replace('url(/', 'url(./')
    css = css.replace("url('/", "url('./")
    css = css.replace('url("/', 'url("./')
    return css


def url_to_path(url: str) -> Path:
    parsed = urllib.parse.urlparse(url)
    path = parsed.path
    if not path or path.endswith("/"):
        path = path + "index.html"
    elif "." not in Path(path).name:
        path = path.rstrip("/") + "/index.html"
    return ROOT / path.lstrip("/")


def normalize_url(url: str, base: str) -> str | None:
    joined = urllib.parse.urljoin(base, url)
    parsed = urllib.parse.urlparse(joined)
    if parsed.netloc and parsed.netloc not in ("gloris-lux.ru", "www.gloris-lux.ru"):
        return None
    clean = urllib.parse.urlunparse((
        parsed.scheme or "https",
        "gloris-lux.ru",
        parsed.path or "/",
        "",
        "",
        "",
    ))
    if clean.startswith("https://gloris-lux.ru/index.php?"):
        return clean
    if any(clean.lower().endswith(ext) for ext in SKIP_EXTENSIONS):
        return None
    return clean


def fetch(url: str) -> tuple[bytes, str | None]:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        data = resp.read()
        ctype = resp.headers.get_content_type()
        return data, ctype


def extract_links(content: str, base_url: str) -> set[str]:
    links: set[str] = set()
    for match in re.finditer(r"""(?:href|src|action|data-link|data-src|url)\s*=\s*['"]([^'"]+)['"]""", content, re.I):
        links.add(match.group(1))
    for match in re.finditer(r"""url\(\s*['"]?([^'"\)]+)['"]?\s*\)""", content, re.I):
        links.add(match.group(1))
    normalized: set[str] = set()
    for link in links:
        if link.startswith(("mailto:", "tel:", "javascript:", "#", "data:")):
            continue
        nu = normalize_url(link, base_url)
        if nu:
            normalized.add(nu)
    return normalized


def save_file(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def process_content(url: str, data: bytes, ctype: str | None) -> bytes:
    ext = Path(urllib.parse.urlparse(url).path).suffix.lower()
    if ext in BINARY_EXTENSIONS or (ctype and not ctype.startswith("text")):
        if ext in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
            return data
        try:
            text = data.decode("utf-8", errors="ignore")
        except Exception:
            return data
        if ext == ".css" or "css" in (ctype or ""):
            return rewrite_css(text).encode("utf-8")
        if ext in {".js", ".html", ".htm"} or "html" in (ctype or "") or "javascript" in (ctype or ""):
            text = sanitize_text(text)
            if ext in {".html", ".htm"} or "html" in (ctype or ""):
                text = rewrite_html(text, url)
            return text.encode("utf-8")
        return data

    text = data.decode("utf-8", errors="ignore")
    if ext == ".css" or "css" in (ctype or ""):
        return rewrite_css(text).encode("utf-8")
    if "html" in (ctype or "") or ext in {".html", ".htm"} or url.endswith("/") or ext == "":
        return rewrite_html(text, url).encode("utf-8")
    if ext == ".js" or "javascript" in (ctype or ""):
        return sanitize_text(text).encode("utf-8")
    return data


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    queue: deque[str] = deque([BASE_URL])
    seen: set[str] = set()
    downloaded = 0

    while queue and downloaded < MAX_PAGES:
        url = queue.popleft()
        if url in seen:
            continue
        seen.add(url)

        try:
            data, ctype = fetch(url)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as e:
            print(f"SKIP {url}: {e}")
            continue

        path = url_to_path(url)
        processed = process_content(url, data, ctype)
        save_file(path, processed)
        downloaded += 1
        print(f"OK [{downloaded}] {url} -> {path.relative_to(ROOT)}")

        if (ctype and "html" in ctype) or path.suffix.lower() in {".html", ".htm", ""}:
            text = processed.decode("utf-8", errors="ignore")
            for link in extract_links(text, url):
                if link not in seen:
                    queue.append(link)

        time.sleep(DELAY)

    # Portfolio back link injection in index.html
    index_path = ROOT / "index.html"
    if index_path.exists():
        html = index_path.read_text(encoding="utf-8")
        if "portfolio-back" not in html:
            snippet = (
                '\n<a class="portfolio-back" href="../../index.html" '
                'aria-label="Вернуться в портфолио">← Портфолио</a>\n'
                '<link rel="stylesheet" href="../../portfolio-back.css">\n'
            )
            html = html.replace("</body>", snippet + "</body>")
            index_path.write_text(html, encoding="utf-8")

    print(f"\nDone. Downloaded {downloaded} files into {ROOT}")


if __name__ == "__main__":
    main()
