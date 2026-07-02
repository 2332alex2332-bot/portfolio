#!/usr/bin/env python3
"""Download demo videos for static old-site."""
import pathlib
import ssl
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1] / "old-site" / "assets" / "video"
ROOT.mkdir(parents=True, exist_ok=True)

FILES = {
    "hero.mp4": "https://video.wixstatic.com/video/f664af_d56b4119638747fb8d890263042b68b2/1080p/mp4/file.mp4",
    "plenka.mp4": "https://video.wixstatic.com/video/f664af_6713e1e3faad42e99f2191d8b61715a9/1080p/mp4/file.mp4",
}

for name, url in FILES.items():
    target = ROOT / name
    if target.exists() and target.stat().st_size > 1_000_000:
        print(f"skip {name}")
        continue
    print(f"download {name}")
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0", "Referer": "https://www.ccdetailing.ru/"},
    )
    with urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=180) as resp:
        target.write_bytes(resp.read())
    print(f"saved {target} ({target.stat().st_size})")

poster = ROOT / "plenka-poster.jpg"
if not poster.exists() or poster.stat().st_size < 10_000:
    try:
        import imageio.v3 as iio

        frame = iio.imread(ROOT / "plenka.mp4", index=100)
        iio.imwrite(poster, frame, quality=90)
        print(f"saved {poster} ({poster.stat().st_size})")
    except Exception as exc:
        print(f"poster skip: {exc}")
