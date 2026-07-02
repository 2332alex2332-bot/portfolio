from pathlib import Path

p = Path(__file__).resolve().parent.parent / 'services.html'
text = p.read_text(encoding='utf-8')

old_nav = """            <a href="#calculator" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Калькулятор</a>
            <a href="#laser" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Лазер</a>
            <a href="#apparatus" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Аппаратная</a>
            <a href="#massage" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Массаж</a>
            <a href="#hair" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Парикмахер</a>
            <a href="#cosmetology" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Косметология</a>
            <a href="#nails" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Ногти</a>
            <a href="#brows" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Ресницы</a>
            <a href="#sugaring" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Шугаринг</a>
            <a href="#cryo" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Крио</a>
            <a href="#barbershop" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Барбер</a>
            <a href="#kids" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Детские</a>
            <a href="#piercing" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Прокол</a>"""

new_nav = """            <a href="#calculator" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Калькулятор</a>
            <a href="#barbershop" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Мужской зал</a>
            <a href="#hair" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Женский зал</a>
            <a href="#nails" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Ногти</a>
            <a href="#cosmetology" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Косметология</a>
            <a href="#sugaring" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Шугаринг</a>
            <a href="#massage" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Массаж</a>
            <a href="#laser" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Лазер</a>
            <a href="#apparatus" class="px-3 py-1.5 rounded-full bg-pink-50 text-brand-pink hover:bg-pink-100">Аппаратная</a>"""

text = text.replace(old_nav, new_nav)

start = text.index('    <section class="section-block space-y-12">')
end = text.index('    </section>\n    </main>', start)
replacement = '    <section class="section-block space-y-12" id="services-catalog-render"></section>\n'
text = text[:start] + replacement + text[end + len('    </section>\n'):]

text = text.replace(
    '  <script src="js/main.js"></script>',
    '  <script src="js/services-catalog.js"></script>\n  <script src="js/main.js"></script>',
)

p.write_text(text, encoding='utf-8')
print('patched services.html')
