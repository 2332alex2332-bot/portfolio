/* GLORIS BEAUTY — полный каталог услуг (M и SALON_MASTERS — в masters-data.js) */

function s(name, d, p, pm, o = {}) {
  return {
    name,
    duration: d,
    price: p,
    priceMax: pm ?? null,
    masters: o.masters || M[o.cat] || [],
    category: o.cat || 'other',
    from: !!o.from,
    oldPrice: o.oldPrice || null,
    promo: !!o.promo,
    group: o.group || null,
    desc: o.desc || null,
  };
}

const CATALOG_SECTIONS = [
  {
    id: 'barbershop',
    title: 'Мужской зал',
    icon: 'fa-user-tie',
    cat: 'barber',
    groups: [{
      title: null,
      items: [
        s('Стрижка мужская (комплекс)', 60, 1500, 1800, { cat: 'barber' }),
        s('Креативная стрижка', 60, 2000, null, { cat: 'barber' }),
        s('Стрижка детская (до 7 лет)', 45, 1000, null, { cat: 'barber' }),
        s('Камуфляж (тонирование седины) Loreal', 60, 2500, null, { cat: 'barber' }),
        s('Стрижка под машинку (одна насадка)', 30, 800, null, { cat: 'barber' }),
        s('Стрижка машинкой (под 0)', 15, 800, null, { cat: 'barber' }),
        s('Стрижка бороды', 15, 700, null, { cat: 'barber' }),
        s('Стрижка усов', 15, 500, null, { cat: 'barber' }),
        s('Мытье головы', 30, 300, null, { cat: 'barber' }),
        s('Массаж головы', 15, 500, null, { cat: 'barber' }),
      ],
    }],
  },
  {
    id: 'hair',
    title: 'Женский зал и окрашивание',
    icon: 'fa-scissors',
    cat: 'hair',
    groups: [
      {
        title: 'Стрижки',
        items: [
          s('Стрижка женская (мытье + сушка по форме)', 60, 1600, 2500, { cat: 'hair' }),
          s('Стрижка комплекс с укладкой', 75, 1900, 2800, { cat: 'hair' }),
          s('Подравнивание кончиков волос', 30, 1000, null, { cat: 'hair' }),
          s('Стрижка челки', 30, 500, null, { cat: 'hair' }),
          s('Стрижка горячими ножницами', 90, 2200, 3000, { cat: 'hair' }),
          s('Стрижка детская (до 9 лет)', 60, 1000, null, { cat: 'hair' }),
        ],
      },
      {
        title: 'Укладки и причёски',
        items: [
          s('Укладка феном (комплекс)', 60, 1200, 1700, { cat: 'hair' }),
          s('Укладка утюжок, гофре, плойка (комплекс)', 60, 1400, 2000, { cat: 'hair' }),
          s('Укладка коктейльная (комплекс), локоны', 60, 2200, 3800, { cat: 'hair' }),
          s('Укладка гофре', 60, 700, null, { cat: 'hair', from: true }),
          s('Вечерние прически', 90, 2700, 3700, { cat: 'hair' }),
          s('Плетение', 60, 1200, 1700, { cat: 'hair' }),
          s('Мытье + сушка волос', 30, 900, 1100, { cat: 'hair' }),
        ],
      },
      {
        title: 'Окрашивание',
        items: [
          s('Окрашивание корней (до 3 см)', 90, 2100, null, { cat: 'hair' }),
          s('Окрашивание одним цветом', 120, 2200, 3200, { cat: 'hair' }),
          s('Окрашивание техникой Airtouch', 480, 9000, 15000, { cat: 'hair' }),
          s('Мелирование', 120, 3800, 5700, { cat: 'hair' }),
          s('Мелирование Ice Tint Вуаль', 60, 7000, 9000, { cat: 'hair' }),
          s('Тонирование', 90, 2200, 3200, { cat: 'hair' }),
          s('Блондирование', 120, 2200, 3200, { cat: 'hair' }),
          s('Декапирование', 120, 2700, 3700, { cat: 'hair' }),
          s('Сушка волос (при окрашивании)', 15, 600, 800, { cat: 'hair' }),
          s('Растяжка цвета', 120, 3700, 4200, { cat: 'hair' }),
          s('Сложное окрашивание (шатуш, омбре, балаяж)', 180, 5600, 8700, { cat: 'hair' }),
        ],
      },
      {
        title: 'Химическая завивка',
        items: [s('Химическая биозавивка NIAGARA', 120, 3600, 6900, { cat: 'hair' })],
      },
      {
        title: 'СПА-процедуры Lebel (Япония)',
        items: [
          s('Абсолютное счастье', 90, 2800, 8600, { cat: 'hair' }),
          s('Блеск и Сила', 60, 1400, 5100, { cat: 'hair' }),
          s('Уходы Metal Detox, Vitamino Color', 20, 1100, 2100, { cat: 'hair' }),
          s('Кондиционер Vitamino color', 10, 500, null, { cat: 'hair' }),
        ],
      },
    ],
  },
  {
    id: 'nails',
    title: 'Маникюр и педикюр',
    icon: 'fa-hand-sparkles',
    cat: 'nails',
    groups: [
      {
        title: 'Комплексы',
        items: [
          s('Маникюр + гель-лак', 120, 2000, null, { cat: 'nails' }),
          s('Снятие + маникюр + гель-лак', 120, 2300, null, { cat: 'nails' }),
          s('Снятие + маникюр + выравнивание + гель-лак', 120, 2700, null, { cat: 'nails', promo: true, oldPrice: 2900 }),
          s('Снятие + маникюр + выравнивание + гель-лак френч', 150, 2900, null, { cat: 'nails' }),
          s('Покрытие гель-лаком', 30, 1000, null, { cat: 'nails', promo: true, oldPrice: 1200 }),
          s('Покрытие гель-лак френч', 45, 1200, null, { cat: 'nails', promo: true, oldPrice: 1500 }),
          s('Покрытие лаком EMI', 15, 500, null, { cat: 'nails', promo: true, oldPrice: 700 }),
          s('Покрытие лечебное EMI', 15, 400, null, { cat: 'nails', promo: true, oldPrice: 550 }),
        ],
      },
      {
        title: 'Маникюр без покрытия',
        items: [
          s('Маникюр женский (обрезной, комбинированный, аппаратный)', 60, 1000, null, { cat: 'nails' }),
          s('Маникюр мужской', 60, 1200, null, { cat: 'nails' }),
          s('Маникюр детский', 60, 800, null, { cat: 'nails' }),
        ],
      },
      {
        title: 'Педикюр',
        items: [
          s('Педикюр (классический, комбинированный, аппаратный)', 90, 2200, null, { cat: 'nails' }),
          s('Педикюр + гель-лак', 120, 3200, null, { cat: 'nails' }),
          s('Снятие + педикюр + гель-лак', 120, 3200, null, { cat: 'nails', promo: true, oldPrice: 3600 }),
          s('Частичный педикюр женский', 60, 1200, null, { cat: 'nails' }),
          s('Педикюр мужской', 150, 2500, null, { cat: 'nails' }),
          s('Частичный педикюр мужской', 60, 1300, null, { cat: 'nails' }),
        ],
      },
      {
        title: 'Дизайн и доп. услуги',
        items: [
          s('Выравнивание ногтевой пластины', 15, 400, null, { cat: 'nails' }),
          s('Снятие гель-лака (с последующим покрытием)', 30, 300, null, { cat: 'nails', promo: true, oldPrice: 500 }),
          s('Снятие гель-лака (без покрытия)', 30, 500, null, { cat: 'nails' }),
          s('Снятие геля с ногтей', 30, 1200, null, { cat: 'nails' }),
          s('Снятие лака', 15, 200, null, { cat: 'nails' }),
          s('Полировка, шлифовка', 15, 100, null, { cat: 'nails' }),
          s('Ремонт 1 ногтя (акрил, шелк, гель)', 15, 300, null, { cat: 'nails' }),
          s('Дизайн одного ногтя', 15, 50, 150, { cat: 'nails' }),
          s('Укрепление ногтей акриловой пудрой', 30, 600, null, { cat: 'nails' }),
          s('Укрепление ногтей акригелем/гелем', 45, 1000, null, { cat: 'nails' }),
          s('Удаление мозолей, трещин, натоптышей (1 зона)', 15, 150, null, { cat: 'nails' }),
          s('Придание ногтям формы', 15, 300, null, { cat: 'nails' }),
        ],
      },
      {
        title: 'SPA-уход',
        items: [
          s('Парафинотерапия рук', 30, 500, null, { cat: 'nails' }),
          s('Парафинотерапия ног', 30, 600, null, { cat: 'nails' }),
          s('Холодный парафин', 15, 500, null, { cat: 'nails' }),
        ],
      },
    ],
  },
  {
    id: 'cosmetology',
    title: 'Косметология',
    icon: 'fa-face-smile',
    cat: 'cosmetology',
    groups: [
      {
        title: 'Брови и ресницы',
        items: [
          s('Коррекция бровей', 15, 600, null, { cat: 'cosmetology' }),
          s('Форма бровей', 15, 800, null, { cat: 'cosmetology' }),
          s('Форма бровей для мужчин', 15, 900, null, { cat: 'cosmetology' }),
          s('Окрашивание бровей краской', 15, 400, null, { cat: 'cosmetology' }),
          s('Окрашивание бровей хной', 45, 800, null, { cat: 'cosmetology' }),
          s('Ламинирование ресниц', 45, 2000, null, { cat: 'cosmetology', promo: true, oldPrice: 2500 }),
        ],
      },
      {
        title: 'Чистки лица',
        items: [
          s('Комбинированная чистка (УЗИ + механическая)', 90, 3600, null, { cat: 'cosmetology' }),
          s('Комбинированная чистка + крио массаж лица', 90, 4200, null, { cat: 'cosmetology' }),
          s('Чистка лица HOLI LEND', 90, 2800, null, { cat: 'cosmetology' }),
          s('Ультразвуковая чистка лица', 60, 2800, null, { cat: 'cosmetology' }),
        ],
      },
      {
        title: 'Массажи и уходы',
        items: [
          s('Массаж лица', 45, 2000, null, { cat: 'cosmetology' }),
          s('Массаж буккальный', 30, 1200, null, { cat: 'cosmetology' }),
          s('Массаж камнями Гуаша', 30, 1200, null, { cat: 'cosmetology' }),
          s('Уход FIT FACE (3 массажа)', 105, 2500, 3400, { cat: 'cosmetology' }),
          s('Маски для лица в ассортименте', 30, 800, 1500, { cat: 'cosmetology' }),
          s('Регенерирующий уход', 60, 3100, null, { cat: 'cosmetology' }),
          s('Комплексный уход Janssen', 90, 3000, 3800, { cat: 'cosmetology' }),
          s('Экспресс-уход', 60, 2100, null, { cat: 'cosmetology' }),
          s('Гоммаж', 30, 1200, null, { cat: 'cosmetology' }),
          s('6 ступеней красоты', 75, 3400, null, { cat: 'cosmetology', promo: true, oldPrice: 4200 }),
        ],
      },
      {
        title: 'Аппаратные процедуры',
        items: [
          s('Безинъекционная мезотерапия', 60, 2900, null, { cat: 'cosmetology' }),
          s('Биомеханическая стимуляция лица', 30, 1200, null, { cat: 'cosmetology' }),
          s('Д\'арсенваль (5 мин)', 15, 500, null, { cat: 'cosmetology' }),
          s('Микротоковая терапия по лицу', 30, 1500, 2500, { cat: 'cosmetology' }),
          s('Карбокситерапия', 60, 3100, null, { cat: 'cosmetology' }),
          s('RF-лифтинг лицо (20 мин)', 60, 3350, null, { cat: 'cosmetology' }),
          s('RF-лифтинг зона глаз', 30, 1600, null, { cat: 'cosmetology' }),
          s('RF-лифтинг лица', 30, 1800, null, { cat: 'cosmetology' }),
        ],
      },
      {
        title: 'Пилинги',
        items: [
          s('Пилинг Джесснера, Миндальный, Молочный, Гликолевый', 60, 3500, null, { cat: 'cosmetology' }),
          s('Пилинг гликолевый Janssen 40% / 60%', 60, 3000, null, { cat: 'cosmetology' }),
          s('Ретеиновый пилинг Martinex', 60, 6000, null, { cat: 'cosmetology' }),
          s('Пилинг PRX', 40, 5000, null, { cat: 'cosmetology', promo: true, oldPrice: 6000 }),
        ],
      },
      {
        title: 'Крио-массаж',
        items: [
          s('Крио массаж лица (азот)', 15, 1100, null, { cat: 'cosmetology' }),
          s('Крио массаж зоны декольте', 30, 1000, null, { cat: 'cosmetology' }),
          s('Крио массаж головы (азот)', 15, 1500, null, { cat: 'cosmetology' }),
          s('Крио массаж рук (азот)', 15, 1100, null, { cat: 'cosmetology' }),
          s('Крио массаж спины (азот)', 15, 1200, null, { cat: 'cosmetology' }),
          s('Крио массаж ног полностью (азот)', 15, 1800, null, { cat: 'cosmetology' }),
          s('Крио массаж ягодиц (азот)', 15, 1300, null, { cat: 'cosmetology' }),
        ],
      },
      {
        title: 'Удаления и прочее',
        items: [
          s('Удаление папиллом азотом', 15, 300, 400, { cat: 'cosmetology' }),
          s('Удаление жировиков 1 шт.', 15, 200, null, { cat: 'cosmetology' }),
          s('Удаление бородавок азотом 1 шт', 10, 400, null, { cat: 'cosmetology' }),
          s('Прокол ушей', 15, 2000, null, { cat: 'cosmetology' }),
          s('Серьги 1 пара для ушей', null, 500, null, { cat: 'cosmetology', from: true }),
          s('Брашинг', 30, 800, null, { cat: 'cosmetology' }),
        ],
      },
    ],
  },
  {
    id: 'sugaring',
    title: 'Биоэпиляция и шугаринг',
    icon: 'fa-leaf',
    cat: 'sugaring',
    groups: [
      {
        title: 'Биоэпиляция',
        items: [
          s('Биоэпиляция ушных раковин', 15, 800, null, { cat: 'sugaring' }),
          s('Биоэпиляция верхней губы', 15, 450, null, { cat: 'sugaring' }),
          s('Биоэпиляция щеки', 15, 1000, null, { cat: 'sugaring' }),
          s('Биоэпиляция подмышечных впадин', 15, 1000, null, { cat: 'sugaring' }),
          s('Биоэпиляция рук до локтя', 15, 800, null, { cat: 'sugaring' }),
          s('Биоэпиляция рук полностью', 30, 1100, null, { cat: 'sugaring' }),
          s('Биоэпиляция голени', 30, 1100, null, { cat: 'sugaring' }),
          s('Биоэпиляция ног полностью', 45, 2000, null, { cat: 'sugaring' }),
          s('Биоэпиляция бедер', 30, 1300, null, { cat: 'sugaring' }),
          s('Биоэпиляция ягодиц', 30, 800, null, { cat: 'sugaring' }),
          s('Биоэпиляция бикини классика', 30, 1300, null, { cat: 'sugaring' }),
          s('Биоэпиляция бикини глубокое', 30, 2200, null, { cat: 'sugaring' }),
          s('Биоэпиляция живота', 15, 500, 800, { cat: 'sugaring' }),
          s('Биоэпиляция спины верхняя часть', 15, 1100, null, { cat: 'sugaring' }),
          s('Биоэпиляция мужской груди', 15, 1100, null, { cat: 'sugaring' }),
          s('Биоэпиляция носа', 10, 500, null, { cat: 'sugaring' }),
          s('Биоэпиляция подбородок', 15, 500, null, { cat: 'sugaring' }),
          s('Биоэпиляция шейно-воротниковая зона', 15, 750, null, { cat: 'sugaring' }),
          s('Биоэпиляция поясницы', 30, 800, null, { cat: 'sugaring' }),
        ],
      },
      {
        title: 'Шугаринг',
        items: [
          s('Шугаринг верхней губы', 15, 500, null, { cat: 'sugaring' }),
          s('Шугаринг подбородка', 15, 600, null, { cat: 'sugaring' }),
          s('Шугаринг подмышечных впадин', 15, 1000, null, { cat: 'sugaring' }),
          s('Шугаринг рук до локтя', 30, 800, null, { cat: 'sugaring' }),
          s('Шугаринг рук полностью', 45, 1000, null, { cat: 'sugaring' }),
          s('Шугаринг голени', 30, 1000, null, { cat: 'sugaring' }),
          s('Шугаринг ног полностью', 60, 2000, null, { cat: 'sugaring' }),
          s('Шугаринг бедер', 30, 1200, null, { cat: 'sugaring' }),
          s('Шугаринг ягодиц', 30, 1000, null, { cat: 'sugaring' }),
          s('Шугаринг бикини классика', 30, 1400, null, { cat: 'sugaring' }),
          s('Шугаринг бикини глубокое не полное', 30, 2000, null, { cat: 'sugaring' }),
          s('Шугаринг бикини глубокое', 30, 2400, null, { cat: 'sugaring' }),
          s('Шугаринг груди (1 зона)', 15, 1000, null, { cat: 'sugaring' }),
          s('Шугаринг живота (1 зона)', 15, 800, null, { cat: 'sugaring' }),
          s('Шугаринг спины верхняя часть', 60, 2000, null, { cat: 'sugaring' }),
          s('Шугаринг щеки', 30, 800, null, { cat: 'sugaring' }),
          s('Шугаринг поясница', 30, 1000, null, { cat: 'sugaring' }),
          s('Анастезия (крем Эмла)', null, 1000, null, { cat: 'sugaring' }),
        ],
      },
    ],
  },
  {
    id: 'massage',
    title: 'Массажный кабинет',
    icon: 'fa-spa',
    cat: 'massage',
    groups: [
      {
        title: 'Общий и антицеллюлитный',
        items: [
          s('Общий массаж женский (1 час)', 60, 3500, null, { cat: 'massage' }),
          s('Общий массаж мужской (1 час)', 60, 4000, null, { cat: 'massage' }),
          s('Антицеллюлитный массаж (ягодицы, бедра)', 45, 3000, null, { cat: 'massage' }),
          s('Антицеллюлитный массаж (живот)', 30, 2000, null, { cat: 'massage' }),
          s('Массаж антицеллюлитный (руки)', 30, 1500, null, { cat: 'massage' }),
          s('Массаж лимфодренажный (женский)', 60, 3500, null, { cat: 'massage' }),
          s('Массаж лимфодренажный (мужской)', 60, 4200, null, { cat: 'massage' }),
          s('Моделирующий комплекс для живота', 120, 3000, null, { cat: 'massage' }),
        ],
      },
      {
        title: 'Зональный массаж',
        items: [
          s('Массаж шейно-воротниковая зона', 30, 1800, null, { cat: 'massage' }),
          s('Массаж спины (женский)', 30, 2100, null, { cat: 'massage' }),
          s('Массаж спины (мужской)', 30, 2300, null, { cat: 'massage' }),
          s('Массаж рук', 30, 1000, null, { cat: 'massage' }),
          s('Массаж ног', 30, 2200, null, { cat: 'massage' }),
          s('Массаж стоп', 15, 1000, null, { cat: 'massage' }),
          s('Массаж головы', 15, 1000, null, { cat: 'massage' }),
        ],
      },
    ],
  },
  {
    id: 'laser',
    title: 'Лазерная эпиляция',
    icon: 'fa-bolt',
    cat: 'laser',
    groups: [
      {
        title: 'Популярные зоны',
        items: [
          s('Бедра полностью', 30, 2250, null, { cat: 'laser' }),
          s('Голени (включая колени)', 30, 1950, null, { cat: 'laser' }),
          s('Ноги полностью', 45, 2950, null, { cat: 'laser' }),
          s('Пальцы рук', 15, 550, null, { cat: 'laser' }),
          s('Кисти рук', 15, 750, null, { cat: 'laser' }),
          s('Руки выше локтя', 30, 1450, null, { cat: 'laser' }),
          s('Руки полностью', 45, 1750, null, { cat: 'laser' }),
          s('Руки до локтя (не включая кисти)', 30, 1550, null, { cat: 'laser' }),
          s('Нижняя часть лица', 30, 1390, null, { cat: 'laser' }),
          s('Щеки', 15, 950, null, { cat: 'laser' }),
          s('Бакенбарды', 15, 950, null, { cat: 'laser' }),
          s('Шея (передняя/задняя часть)', 30, 1450, null, { cat: 'laser' }),
          s('Шея полностью', 30, 1990, null, { cat: 'laser' }),
          s('Подбородок', 15, 550, null, { cat: 'laser' }),
          s('Уши', 15, 690, null, { cat: 'laser' }),
          s('Виски', 15, 590, null, { cat: 'laser' }),
          s('Лоб', 15, 950, null, { cat: 'laser' }),
          s('Межбровье', 15, 590, null, { cat: 'laser' }),
          s('Зона над верхней губой', 15, 590, null, { cat: 'laser' }),
          s('Лицо полностью', 30, 2750, null, { cat: 'laser' }),
          s('Классическое бикини по линии белья (женщины)', 30, 1400, null, { cat: 'laser' }),
          s('Глубокое бикини (женщины)', 30, 2000, null, { cat: 'laser' }),
          s('Подмышечные впадины (женщины)', 20, 1000, null, { cat: 'laser' }),
          s('Тотальное бикини (женщины)', 30, 2200, null, { cat: 'laser' }),
          s('Подмышечные впадины (мужчины)', 20, 1200, null, { cat: 'laser' }),
          s('Классическое бикини (мужчины)', 35, 1300, null, { cat: 'laser' }),
          s('Тотальное бикини (мужчины)', 60, 2500, null, { cat: 'laser' }),
          s('Глубокое бикини (мужчины)', 40, 2200, null, { cat: 'laser' }),
          s('Изменение длины волос машинкой', 15, 400, null, { cat: 'laser' }),
        ],
      },
      {
        title: 'Все зоны',
        items: [
          s('Участок 10×10 см', 15, 590, null, { cat: 'laser' }),
          s('Межъягодичная складка', 15, 950, null, { cat: 'laser' }),
          s('Ягодицы', 45, 1590, null, { cat: 'laser' }),
          s('Ягодицы + межъягодичная складка', 45, 1990, null, { cat: 'laser' }),
          s('Плечи', 30, 790, null, { cat: 'laser' }),
          s('Грудная клетка', 30, 1490, null, { cat: 'laser' }),
          s('Декольте', 45, 1490, null, { cat: 'laser' }),
          s('Ореолы', 15, 990, null, { cat: 'laser' }),
          s('Живот половина', 15, 990, null, { cat: 'laser' }),
          s('Живот полностью', 60, 1490, null, { cat: 'laser' }),
          s('Поясница', 30, 1990, null, { cat: 'laser' }),
          s('Лопатки', 30, 1990, null, { cat: 'laser' }),
          s('Спина половина', 30, 1990, null, { cat: 'laser' }),
          s('Спина полностью', 45, 2990, null, { cat: 'laser' }),
          s('Пальцы ног', 15, 550, null, { cat: 'laser' }),
          s('Подъем ног', 15, 850, null, { cat: 'laser' }),
          s('Колени', 15, 990, null, { cat: 'laser' }),
          s('Бедра (внутр./передн./задн. поверхность)', 30, 1450, null, { cat: 'laser' }),
          s('Предплечья', 30, 990, null, { cat: 'laser' }),
        ],
      },
      {
        title: 'Акции',
        items: [
          s('Ноги полностью + подмышки + бикини глубокое', 60, 5390, null, { cat: 'promo', promo: true, oldPrice: 6140 }),
          s('Голени + подмышки + бикини глубокое', 60, 3990, null, { cat: 'promo', promo: true, oldPrice: 5140 }),
          s('Руки, ноги, бикини тотальное, подмышки', 90, 5950, null, { cat: 'promo', promo: true, oldPrice: 7890 }),
          s('Глубокое бикини + подмышечные впадины', 30, 2490, null, { cat: 'promo', promo: true, oldPrice: 3000 }),
          s('Подмышечные впадины + ноги полностью', 60, 3790, null, { cat: 'promo', promo: true, oldPrice: 3950 }),
          s('Глубокое бикини + ноги полностью', 60, 4390, null, { cat: 'promo', promo: true, oldPrice: 4950 }),
          s('Тотальное бикини + ноги полностью', 60, 4880, null, { cat: 'promo', promo: true, oldPrice: 5150 }),
        ],
      },
    ],
  },
  {
    id: 'apparatus',
    title: 'Аппаратная косметология',
    icon: 'fa-microchip',
    cat: 'apparatus',
    groups: [
      {
        title: 'Кавитация и RF-лифтинг',
        items: [
          s('Кавитация живот + бока (20 мин)', 30, 2000, null, { cat: 'apparatus' }),
          s('Кавитация бедра + ягодицы (40 мин)', 45, 3000, null, { cat: 'apparatus' }),
          s('Кавитация 4 зоны (60 мин)', 60, 4500, null, { cat: 'apparatus' }),
          s('RF-лифтинг бедра + ягодицы (30 мин)', 45, 3000, null, { cat: 'apparatus' }),
          s('RF-лифтинг руки', 30, 2000, null, { cat: 'apparatus' }),
          s('RF-лифтинг живот + бока', 30, 2200, null, { cat: 'apparatus' }),
          s('RF-лифтинг лицо, шея, зона декольте', 45, 3500, null, { cat: 'apparatus' }),
          s('RF-лифтинг лицо + шея', 30, 3000, null, { cat: 'apparatus' }),
        ],
      },
      {
        title: 'Липолиз и вакуумный массаж',
        items: [
          s('Лазерный липолиз живот/бедра/руки', 45, 2000, null, { cat: 'apparatus' }),
          s('Вакуумный массаж одна зона', 30, 2500, null, { cat: 'apparatus' }),
          s('Вакуумный массаж все тело', 60, 4500, null, { cat: 'apparatus' }),
          s('Вакуумный массаж с RF-лифтингом', 30, 2500, null, { cat: 'apparatus' }),
        ],
      },
      {
        title: 'Антицеллюлитные комплексы',
        items: [
          s('Комплекс-живот 5 процедур', 45, 10080, null, { cat: 'apparatus' }),
          s('Комплекс-бедра 5 процедур', 45, 12150, null, { cat: 'apparatus' }),
        ],
      },
    ],
  },
];

const SERVICE_VENUES = {
  salon: {
    id: 'salon',
    tabLabel: 'Немедицинские услуги',
    address: 'ул. Кантемировская, д. 27',
    addressFull: 'ул. Кантемировская, д. 27',
    sectionIds: ['barbershop', 'hair', 'nails', 'cosmetology', 'sugaring', 'massage'],
  },
  medical: {
    id: 'medical',
    tabLabel: 'Медицинские услуги',
    address: 'пр-т Андропова, д. 26',
    addressFull: 'пр-т Андропова, д. 26',
    sectionIds: ['laser', 'apparatus'],
  },
};

function getServiceAddress(venueId) {
  return SERVICE_VENUES[venueId]?.addressFull || SERVICE_VENUES.salon.addressFull;
}

function venueIdForSection(sectionId) {
  return SERVICE_VENUES.medical.sectionIds.includes(sectionId) ? 'medical' : 'salon';
}

const PLANNER_CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'barber', label: 'Мужской зал' },
  { id: 'hair', label: 'Парикмахер' },
  { id: 'nails', label: 'Ногти' },
  { id: 'cosmetology', label: 'Косметология' },
  { id: 'sugaring', label: 'Шугаринг' },
  { id: 'massage', label: 'Массаж' },
  { id: 'laser', label: 'Лазер' },
  { id: 'apparatus', label: 'Аппаратная' },
  { id: 'promo', label: 'Акции' },
];

const PLANNER_SERVICES = CATALOG_SECTIONS.flatMap(sec =>
  sec.groups.flatMap(g => g.items.map(item => ({
    ...item,
    sectionId: sec.id,
    venueId: venueIdForSection(sec.id),
    category: item.promo ? 'promo' : (item.category === 'barber' ? 'barber' : item.category),
  })))
);
