"""Cover sensitive areas on old-site screenshots with white rectangles."""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / "old-site" / "screenshots"
WHITE = (255, 255, 255)


def white_patch(img: Image.Image, boxes: list[tuple[int, int, int, int]]) -> Image.Image:
    out = img.copy()
    draw = ImageDraw.Draw(out)
    for box in boxes:
        draw.rectangle(box, fill=WHITE)
    return out


def header_boxes(w: int) -> list[tuple[int, int, int, int]]:
    return [
        (1120, 10, 2130, 120),
        (2280, 100, w - 10, 340),
    ]


def anonymize_home(img: Image.Image) -> Image.Image:
    w, h = img.size
    boxes = [
        *header_boxes(w),
        (180, 900, 900, 960),
        (1750, int(h * 0.266), 3120, int(h * 0.282)),
        (40, int(h * 0.535), w - 40, int(h * 0.628)),
        (150, int(h * 0.848), 1100, int(h * 0.884)),
        (1250, int(h * 0.848), 2200, int(h * 0.884)),
        (2350, int(h * 0.848), 3100, int(h * 0.884)),
        (20, int(h * 0.928), w - 20, h - 10),
    ]
    return white_patch(img, boxes)


def anonymize_uslugi(img: Image.Image) -> Image.Image:
    w, h = img.size
    boxes = [
        *header_boxes(w),
        (20, int(h * 0.865), w - 20, h - 10),
    ]
    return white_patch(img, boxes)


def anonymize_kontakty(img: Image.Image) -> Image.Image:
    w, h = img.size
    boxes = [
        *header_boxes(w),
        (50, 360, 1620, 2200),
        (20, int(h * 0.792), w - 20, h - 10),
    ]
    return white_patch(img, boxes)


def process(name: str, fn) -> None:
    backup = SHOTS / name.replace(".png", "-original.png")
    if not backup.exists():
        shutil.copy2(SHOTS / name, backup)
    img = Image.open(backup)
    result = fn(img)
    result.save(SHOTS / name, optimize=True)
    print(f"updated {name}")


def main() -> None:
    process("home.png", anonymize_home)
    process("uslugi.png", anonymize_uslugi)
    process("kontakty.png", anonymize_kontakty)


if __name__ == "__main__":
    main()
