/* GLORIS BEAUTY — мастера (displayName: Имя + первая буква фамилии) */
const MASTERS_DATA = [
  {
    displayName: 'Алиса Р.',
    bookingKey: 'Алиса',
    specialty: 'Парикмахер',
    reviews: 214,
    reviewsLabel: '214 отзывов',
    topMaster: false,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    defaultService: 'Стрижка женская (мытье+сушка по форме)',
    categories: ['barber', 'hair'],
    pitch: 'Аккуратная стрижка и укладка без спешки - подберёт форму под ваш образ и подскажет, как сохранить результат дома.',
  },
  {
    displayName: 'Дарья К.',
    bookingKey: 'Дарья',
    specialty: 'Парикмахер-стилист',
    reviews: 401,
    reviewsLabel: '401 отзыв',
    topMaster: false,
    photo: 'https://images.unsplash.com/photo-1595476108010-b7d1a01996a1?w=400&q=80',
    defaultService: 'Окрашивание одним цветом',
    categories: ['barber', 'hair'],
    pitch: 'Сложные оттенки и окрашивания с честной консультацией до начала - цвет выглядит живым, волосы остаются ухоженными.',
  },
  {
    displayName: 'Милана Г.',
    bookingKey: 'Милана',
    specialty: 'Парикмахер-стилист',
    reviews: 168,
    reviewsLabel: '168 отзывов',
    topMaster: false,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    defaultService: 'Мелирование',
    categories: ['barber', 'hair'],
    pitch: 'Мягкое мелирование и натуральные переходы - волосы смотрятся свежими, без эффекта пересушенных концов.',
  },
  {
    displayName: 'Полина Н.',
    bookingKey: 'Полина',
    specialty: 'Парикмахер-стилист',
    reviews: 2,
    reviewsLabel: '2 отзыва',
    topMaster: false,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    defaultService: 'Стрижка комплекс с укладкой',
    categories: ['barber', 'hair'],
    pitch: 'Стрижка с укладкой за один визит - выйдете с готовым образом, а не просто «подстриженной».',
  },
  {
    displayName: 'Карина Ф.',
    bookingKey: 'Карина',
    specialty: 'Массажист, косметолог',
    reviews: 397,
    reviewsLabel: '397 отзывов',
    topMaster: false,
    photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80',
    defaultService: 'Массаж спины (женский)',
    categories: ['cosmetology', 'massage', 'sugaring', 'apparatus'],
    pitch: 'Отдельный кабинет и спокойная атмосфера - руки, которые снимают напряжение, когда хочется выдохнуть по-настоящему.',
  },
  {
    displayName: 'Надежда В.',
    bookingKey: 'Надежда',
    specialty: 'Косметолог',
    reviews: 460,
    reviewsLabel: '460 отзывов',
    topMaster: false,
    photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80',
    defaultService: 'Ультразвуковая чистка лица',
    categories: ['cosmetology', 'sugaring', 'laser', 'apparatus', 'promo'],
    pitch: 'Внимательный взгляд на кожу и деликатные протоколы - подберёт процедуру, после которой лицо выглядит отдохнувшим.',
  },
  {
    displayName: 'Вероника Д.',
    bookingKey: 'Вероника',
    specialty: 'Косметолог',
    reviews: 156,
    reviewsLabel: '156 отзывов',
    topMaster: false,
    photo: 'https://images.unsplash.com/photo-1560750588-73207b1e9f9b?w=400&q=80',
    defaultService: 'Комбинированная чистка (УЗИ + механическая)',
    categories: ['cosmetology'],
    pitch: 'Глубокое очищение и уход без агрессии - кожа дышит, а процедура проходит комфортно от начала до конца.',
  },
  {
    displayName: 'Анастасия З.',
    bookingKey: 'Анастасия',
    specialty: 'Мастер ногтевого сервиса',
    reviews: 347,
    reviewsLabel: '347 отзывов',
    topMaster: false,
    photo: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80',
    defaultService: 'Маникюр + гель-лак',
    categories: ['nails'],
    pitch: 'Ровное покрытие, аккуратная форма и стерильность на каждом этапе - маникюр держится красиво и не раздражает кожу.',
  },
];

const SALON_MASTERS = [
  'Любой свободный мастер',
  ...MASTERS_DATA.map(m => `${m.displayName} - ${m.specialty.toLowerCase()}`),
];

function getMasterNamesForCategory(cat) {
  return MASTERS_DATA
    .filter(m => m.categories.includes(cat))
    .map(m => m.displayName);
}

const MASTER_SALON_CATS = ['barber', 'hair', 'nails', 'cosmetology', 'sugaring', 'massage'];
const MASTER_MEDICAL_CATS = ['laser', 'apparatus'];

function masterWorksAtVenue(master, venue) {
  if (venue === 'medical') {
    return master.categories.some(cat => MASTER_MEDICAL_CATS.includes(cat));
  }
  return master.categories.some(cat => MASTER_SALON_CATS.includes(cat));
}

const M = {
  barber: getMasterNamesForCategory('barber'),
  hair: getMasterNamesForCategory('hair'),
  nails: getMasterNamesForCategory('nails'),
  cosmetology: getMasterNamesForCategory('cosmetology'),
  massage: getMasterNamesForCategory('massage'),
  sugaring: getMasterNamesForCategory('sugaring'),
  laser: getMasterNamesForCategory('laser'),
  apparatus: getMasterNamesForCategory('apparatus'),
  promo: getMasterNamesForCategory('promo'),
};
