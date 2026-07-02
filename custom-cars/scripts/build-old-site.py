#!/usr/bin/env python3
"""Generate static old-site pages for Custom Cars."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "old-site"

NAV = [
    ("index.html", "О НАС"),
    ("antigravijnaya-plenka/index.html", "ПЛЁНКА"),
    ("ceramic/index.html", "КЕРАМИКА"),
    ("himchistka-salona/index.html", "ХИМЧИСТКА"),
    ("complex/index.html", "КОМПЛЕКСЫ"),
    ("detejling-mojka/index.html", "МОЙКА"),
    ("contact/index.html", "КОНТАКТЫ"),
]

PAGES = {
    "index.html": {
        "title": "Custom Cars Detailing — детейлинг центр",
        "active": "index.html",
        "video": '<video class="hero-video" controls playsinline preload="metadata" poster="./assets/video/hero-poster.jpg" src="./assets/video/hero.mp4">Ваш браузер не поддерживает видео.</video>',
        "body": """
        <h1>Детейлинг центр Custom Cars Detailing</h1>
        <p class="lead">Профессиональный уход за автомобилем в Москве</p>
        <p>Custom Cars Detailing — это современный детейлинг-центр, где выполняют мойку, полировку, нанесение керамики, оклейку антигравийной плёнкой, химчистку салона и комплексные программы ухода за автомобилем.</p>
        <p>Мы работаем с премиальными материалами и оборудованием, уделяя внимание каждой детали — от лакокрасочного покрытия до салона и стёкол.</p>
        """,
    },
    "antigravijnaya-plenka/index.html": {
        "title": "Антигравийная и виниловая плёнка — Custom Cars Detailing",
        "active": "antigravijnaya-plenka/index.html",
        "video": '<video class="hero-video" controls playsinline preload="metadata" poster="../assets/video/plenka-poster.jpg" src="../assets/video/plenka.mp4">Ваш браузер не поддерживает видео.</video>',
        "body": """
        <h1>Антигравийная и виниловая плёнка</h1>
        <p class="lead">Антигравийная пленка <span class="accent">Llumar (USA)</span></p>
        <p>Антигравийная плёнка защищает лакокрасочное покрытие от сколов, царапин и дорожных реагентов. Мы используем плёнку Llumar — материал с высокой прозрачностью, самовосстанавливающимся верхним слоем и стойкостью к пожелтению.</p>
        <p>Плёнку можно наносить на отдельные зоны или на весь кузов. При необходимости её легко заменить — уход не требует специальных средств.</p>
        """,
    },
    "ceramic/index.html": {
        "title": "Керамика — Custom Cars Detailing",
        "active": "ceramic/index.html",
        "video": "",
        "body": """
        <h1>Керамическое покрытие</h1>
        <p class="lead">Защита и блеск лакокрасочного покрытия</p>
        <p>Керамическое покрытие создаёт прочный защитный слой на кузове автомобиля, усиливает блеск и облегчает мойку. Подходит для новых и подготовленных автомобилей после полировки.</p>
        """,
    },
    "himchistka-salona/index.html": {
        "title": "Химчистка салона — Custom Cars Detailing",
        "active": "himchistka-salona/index.html",
        "video": "",
        "body": """
        <h1>Химчистка салона</h1>
        <p class="lead">Глубокая очистка обивки и текстиля</p>
        <p>Удаляем загрязнения с сидений, ковров, потолка и пластиковых элементов. Используем профессиональную химию и оборудование для деликатной, но эффективной чистки.</p>
        """,
    },
    "complex/index.html": {
        "title": "Комплексы — Custom Cars Detailing",
        "active": "complex/index.html",
        "video": "",
        "body": """
        <h1>Комплексы услуг</h1>
        <p class="lead">Готовые программы детейлинга</p>
        <p>Комплексные пакеты объединяют мойку, полировку, защиту кузова и уход за салоном. Это удобный способ привести автомобиль в идеальное состояние за один визит.</p>
        """,
    },
    "detejling-mojka/index.html": {
        "title": "Мойка — Custom Cars Detailing",
        "active": "detejling-mojka/index.html",
        "video": "",
        "body": """
        <h1>Детейлинг-мойка</h1>
        <p class="lead">Бережная двухфазная мойка кузова</p>
        <p>Выполняем бесконтактную и ручную мойку, очистку дисков, арок и сложных зон. Используем мягкие материалы и составы, безопасные для лака и защитных покрытий.</p>
        """,
    },
    "contact/index.html": {
        "title": "Контакты — Custom Cars Detailing",
        "active": "contact/index.html",
        "video": "",
        "body": """
        <h1>Контакты</h1>
        <p class="lead">Свяжитесь с нами</p>
        <p><strong>Телефон:</strong> +7 (499) XXX-XX-XX</p>
        <p><strong>Email:</strong> info@exXXXX.com</p>
        <p><strong>Адрес:</strong> Москва, ул. XXX, д. XX</p>
        <p><strong>Режим работы:</strong> ежедневно с 10:00 до 20:00</p>
        """,
    },
}


def page_prefix(page_path: str) -> str:
    depth = page_path.count("/")
    return "../" * depth if depth else "./"


def portfolio_prefix(page_path: str) -> str:
    return "../" * (page_path.count("/") + 2)


def render(page_path: str, data: dict) -> str:
    p = page_prefix(page_path)
    pf = portfolio_prefix(page_path)
    nav_html = []
    for href, label in NAV:
        full = p + href if p != "./" else "./" + href
        cls = ' class="is-active"' if href == data["active"] else ""
        nav_html.append(f'        <a href="{full}"{cls}>{label}</a>')

    video_block = data["video"]
    if video_block:
        video_block = f"\n      {video_block}\n"

    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{data["title"]}</title>
  <link rel="stylesheet" href="{p}css/site.css">
  <link rel="stylesheet" href="{pf}portfolio-back.css">
</head>
<body>
  <div class="page">
    <header class="site-header">
      <div class="header-top">
        <a class="logo" href="{p}index.html" aria-label="Custom Cars Detailing">
          <span class="logo__line"><span class="logo__custom">CUSTOM</span> <span class="logo__cars">CARS</span></span>
          <span class="logo__detailing">detailing</span>
        </a>

        <div class="contacts">
          <div class="contact-item">
            <svg class="contact-item__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#666" d="M6.6 10.8c1.5 3.1 3.8 5.5 6.9 6.9l2.3-2.3c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
            <span class="contact-item__text">+7 (499) XXX-XX-XX</span>
          </div>
          <div class="contact-item">
            <svg class="contact-item__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#666" d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z"/></svg>
            <span class="contact-item__text">Москва, ул. XXX, д. XX</span>
          </div>
          <div class="contact-item">
            <svg class="contact-item__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#666" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"/></svg>
            <a class="contact-item__text" href="mailto:info@exXXXX.com">info@exXXXX.com</a>
          </div>
          <div class="contact-item">
            <svg class="contact-item__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#666" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
            <span class="contact-item__text">ежедневно с 10:00 до 20:00</span>
          </div>
        </div>

        <div class="socials" aria-label="Социальные сети">
          <a class="ig" href="#" aria-label="Instagram">IG</a>
          <a class="fb" href="#" aria-label="Facebook">FB</a>
          <a class="yt" href="#" aria-label="YouTube">YT</a>
        </div>
      </div>

      <nav class="main-nav" aria-label="Основное меню">
{chr(10).join(nav_html)}
      </nav>
    </header>

    <main>{video_block}
      <div class="content">
{data["body"].strip()}
      </div>
    </main>

    <footer class="site-footer">
      <p>© Custom Cars Detailing. Демо-версия старого сайта для портфолио.</p>
    </footer>
  </div>

  <a class="portfolio-back" href="{pf}index.html" aria-label="Вернуться в портфолио">← Портфолио</a>
</body>
</html>
"""


def main() -> None:
    for page_path, data in PAGES.items():
        out = ROOT / page_path
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(render(page_path, data), encoding="utf-8")
        print(f"Wrote {page_path}")


if __name__ == "__main__":
    main()
