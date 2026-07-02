#!/usr/bin/env python3
"""Redact remaining PII in mirrored old-site HTML files."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"

PATTERNS: list[tuple[str, str]] = [
    (r"https://t\.me/glorious_lux", "#"),
    (r"gloris-lux@yandex\.ru", "info@exampleXXX.com"),
    (r"info@example\.com", "info@exampleXXX.com"),
    (r"https://yandex\.ru/maps[^\"'>\s]*", "#"),
    (r"https://api-maps\.yandex\.ru/services/constructor[^\"'>\s]*", ""),
    (r"ИП Есина Лариса Николаевна", "ИП XXX X. X."),
    (r"ИНН\s+\d{10,12}", "ИНН XXX XXX XXX XXX"),
    (r"ОГРНИП\s+\d{15}", "ОГРНИП XXX XXX XXX XXXXX"),
    (r"БИК\s+\d{9}", "БИК XXX XXX XXX"),
    (r"Расчетный счет\s+\d+", "Расчетный счет XXX XX XXX X XXXX XXXXXXX"),
    (r"к/счет\s+\d+", "к/счет XXX XX XXX X XXXX XXXXXXX"),
    (r"8\s*-926-\s*\d{3}-\d{2}-\d{2}", "+7 (XXX) XXX-XX-XX"),
]

MAP_PLACEHOLDER = '<div class="custom-html"><p>Карта скрыта в демо-версии</p></div>'


def sanitize_html(text: str) -> str:
    for pattern, repl in PATTERNS:
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
    text = re.sub(
        r'<div class="custom-html"><script[^>]*></script></div>',
        MAP_PLACEHOLDER,
        text,
        flags=re.IGNORECASE,
    )
    return text


def main() -> None:
    updated = 0
    for path in ROOT.rglob("*.html"):
        original = path.read_text(encoding="utf-8", errors="ignore")
        cleaned = sanitize_html(original)
        if cleaned != original:
            path.write_text(cleaned, encoding="utf-8")
            updated += 1
    print(f"Updated {updated} HTML files in {ROOT}")


if __name__ == "__main__":
    main()
