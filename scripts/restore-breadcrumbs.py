#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PORTFOLIO_BACK_LINK = re.compile(
    r'\n\s*<a class="portfolio-back"[^>]*>.*?</a>',
    re.I | re.S,
)
PORTFOLIO_BACK_CSS = re.compile(
    r'\s*<link rel="stylesheet" href="(?:\.\./)*portfolio-back\.css">\n?',
    re.I,
)
LEGAL_BACK = re.compile(
    r'\s*<a class="back" href="[^"]+">← На главную</a>\n?',
    re.I,
)

BREADCRUMB_BLOCK = """
    <div class="site-breadcrumbs-wrap{extra}">
      <nav class="site-breadcrumbs" data-breadcrumbs-root aria-label="Хлебные крошки"></nav>
    </div>
"""

SITES = {
    "timur": {
        "pages": [
            "index.html",
            "telegram-chat.html",
            "old-site/index.html",
            "legal/privacy-policy.html",
            "legal/cookie-policy.html",
            "legal/user-agreement.html",
        ],
        "css_href": {
            "index.html": "css/breadcrumbs.css",
            "telegram-chat.html": "css/breadcrumbs.css",
            "old-site/index.html": "../css/breadcrumbs.css",
            "legal/privacy-policy.html": "../css/breadcrumbs.css",
            "legal/cookie-policy.html": "../css/breadcrumbs.css",
            "legal/user-agreement.html": "../css/breadcrumbs.css",
        },
        "js_src": {
            "index.html": "js/breadcrumbs.js",
            "telegram-chat.html": "js/breadcrumbs.js",
            "old-site/index.html": "../js/breadcrumbs.js",
            "legal/privacy-policy.html": "../js/breadcrumbs.js",
            "legal/cookie-policy.html": "../js/breadcrumbs.js",
            "legal/user-agreement.html": "../js/breadcrumbs.js",
        },
        "insert_after_header": True,
        "insert_in_main": False,
        "header_extra": " hero-wide px-5 lg:px-10",
        "legal": True,
    },
    "gloris-beauty": {
        "pages": [
            "index.html",
            "services.html",
            "services-medical.html",
            "masters.html",
            "works.html",
            "promo.html",
            "contacts.html",
            "old-site/index.html",
        ],
        "css_href": {
            "default": "css/breadcrumbs.css",
            "old-site/index.html": "../css/breadcrumbs.css",
        },
        "js_src": {
            "default": "js/breadcrumbs.js",
            "old-site/index.html": "../js/breadcrumbs.js",
        },
        "insert_after_header": False,
        "insert_in_main": True,
        "header_extra": " page-shell",
        "legal": False,
    },
    "custom-cars": {
        "pages": [
            "index.html",
            "old-site/index.html",
            "legal/privacy-policy.html",
            "legal/cookie-policy.html",
            "legal/user-agreement.html",
        ],
        "css_href": {
            "index.html": "css/breadcrumbs.css",
            "old-site/index.html": "../css/breadcrumbs.css",
            "legal/privacy-policy.html": "../css/breadcrumbs.css",
            "legal/cookie-policy.html": "../css/breadcrumbs.css",
            "legal/user-agreement.html": "../css/breadcrumbs.css",
        },
        "js_src": {
            "index.html": "js/breadcrumbs.js",
            "old-site/index.html": "../js/breadcrumbs.js",
            "legal/privacy-policy.html": "../js/breadcrumbs.js",
            "legal/cookie-policy.html": "../js/breadcrumbs.js",
            "legal/user-agreement.html": "../js/breadcrumbs.js",
        },
        "insert_after_header": True,
        "insert_in_main": False,
        "header_extra": "",
        "legal": True,
    },
}


def get_map_value(mapping: dict[str, str], page: str) -> str:
    return mapping.get(page, mapping.get("default", ""))


def ensure_css(text: str, css_href: str) -> str:
    if "breadcrumbs.css" in text:
        text = PORTFOLIO_BACK_CSS.sub("\n", text)
        return text
    text = PORTFOLIO_BACK_CSS.sub("\n", text)
    link = f'  <link rel="stylesheet" href="{css_href}">\n'
    if "</head>" in text:
        return text.replace("</head>", link + "</head>", 1)
    return text


def ensure_breadcrumb_block(text: str, extra: str) -> str:
    if "data-breadcrumbs-root" in text:
        return text
    block = BREADCRUMB_BLOCK.format(extra=extra)
    return text


def insert_block(text: str, block: str, after_header: bool, in_main: bool) -> str:
    if "data-breadcrumbs-root" in text:
        return text

    if in_main:
        main_match = re.search(r'(<main class="(?:catalog-main )?page-main">)\s*\n', text, re.I)
        if main_match:
            return text.replace(main_match.group(0), main_match.group(1) + block + "\n", 1)

    if after_header:
        header_match = re.search(r"</header>\s*\n", text, re.I)
        if header_match:
            return text.replace(header_match.group(0), header_match.group(0) + block, 1)

    body_match = re.search(r"<body[^>]*>\s*\n", text, re.I)
    if body_match:
        return text.replace(body_match.group(0), body_match.group(0) + block, 1)
    return text


def ensure_script(text: str, js_src: str) -> str:
    if "breadcrumbs.js" in text:
        return text
    script = f'  <script src="{js_src}" defer></script>\n'
    return text.replace("</body>", script + "</body>", 1)


def patch_legal_body(text: str) -> str:
    if 'class="breadcrumbs-legal"' in text:
        return text
    text = LEGAL_BACK.sub("\n", text)
    return re.sub(r"<body>", '<body class="breadcrumbs-legal">', text, count=1)


def patch_site(site_name: str, config: dict) -> int:
    updated = 0
    site_root = ROOT / site_name
    for page in config["pages"]:
        path = site_root / page
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        original = text

        css_href = get_map_value(config["css_href"], page)
        js_src = get_map_value(config["js_src"], page)
        block = BREADCRUMB_BLOCK.format(extra=config.get("header_extra", ""))

        text = PORTFOLIO_BACK_LINK.sub("", text)
        text = ensure_css(text, css_href)
        if "legal/" in page.replace("\\", "/"):
            text = patch_legal_body(text)
        text = insert_block(
            text,
            block,
            config.get("insert_after_header", False),
            config.get("insert_in_main", False),
        )
        text = ensure_script(text, js_src)

        if text != original:
            path.write_text(text, encoding="utf-8")
            updated += 1
            print(f"updated: {path.relative_to(ROOT)}")
    return updated


def patch_css_imports() -> None:
    replacements = [
        (
            ROOT / "gloris-beauty" / "css" / "style.css",
            "@import url('../../portfolio-back.css');",
            "@import url('breadcrumbs.css');",
        ),
        (
            ROOT / "gloris-beauty" / "css" / "style.css",
            "body.menu-open .portfolio-back {",
            "body.menu-open .site-breadcrumbs-wrap {",
        ),
        (
            ROOT / "gloris-beauty" / "css" / "style.css",
            "body.yc-widget-body-open .portfolio-back {",
            "body.yc-widget-body-open .site-breadcrumbs-wrap {",
        ),
        (
            ROOT / "custom-cars" / "css" / "style.css",
            "@import url('../../portfolio-back.css');",
            "@import url('breadcrumbs.css');",
        ),
        (
            ROOT / "custom-cars" / "css" / "style.css",
            ".portfolio-back:focus,\n.portfolio-back:focus-visible,",
            ".site-breadcrumbs-wrap:focus,\n.site-breadcrumbs-wrap:focus-visible,\n.site-breadcrumbs a:focus,\n.site-breadcrumbs a:focus-visible,",
        ),
        (
            ROOT / "timur" / "legal" / "legal.css",
            "@import url('../../portfolio-back.css');",
            "@import url('../css/breadcrumbs.css');",
        ),
        (
            ROOT / "custom-cars" / "legal" / "legal.css",
            "@import url('../../portfolio-back.css');",
            "@import url('../css/breadcrumbs.css');",
        ),
    ]

    for path, old, new in replacements:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        if old in text:
            path.write_text(text.replace(old, new), encoding="utf-8")
            print(f"css: {path.relative_to(ROOT)}")


def main() -> None:
    total = 0
    for site_name, config in SITES.items():
        total += patch_site(site_name, config)
    patch_css_imports()
    print(f"done, updated {total} html files")


if __name__ == "__main__":
    main()
