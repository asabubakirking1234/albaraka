// Initial catalog for Al Baraka Qurilish Mollari.
// Prices are in Uzbek so'm. Images live in /public/assets/img.

export const defaultSettings = {
  phone: '+998 90 123 45 67',
  phone2: '+998 71 200 40 40',
  address: {
    uz: "Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi, 12-uy",
    ru: 'г. Ташкент, Чиланзарский район, ул. Бунёдкор, дом 12'
  },
  landmark: {
    uz: "Yangi Chilonzor bozori ro'parasida",
    ru: 'Напротив рынка Новый Чиланзар'
  },
  hours: {
    uz: 'Dushanba–Shanba, 08:00–19:00',
    ru: 'Понедельник–Суббота, 08:00–19:00'
  },
  pickupNote: {
    uz: "Buyurtmani saytda qoldiring — tayyor bo'lgach, do'kondan olib ketasiz yoki haydovchi bilan kelishib yetkazasiz.",
    ru: 'Оставьте заказ на сайте — когда он будет готов, заберите его из магазина или договоритесь о доставке с водителем.'
  }
};

export const defaultCategories = [
  {
    id: 'santexnika',
    name: { uz: 'Santexnika', ru: 'Сантехника' },
    blurb: { uz: 'Truba, fiting, aralashtirgich', ru: 'Трубы, фитинги, смесители' },
    image: '/assets/img/pipe.svg',
    sort: 10
  },
  {
    id: 'boyoq',
    name: { uz: "Boyoqlar", ru: 'Краски' },
    blurb: { uz: 'Ichki va fasad bo‘yoqlari', ru: 'Интерьерные и фасадные краски' },
    image: '/assets/img/paint-white.svg',
    sort: 20
  },
  {
    id: 'sement',
    name: { uz: 'Sement', ru: 'Цемент' },
    blurb: { uz: 'M400, M500, qadoqlangan', ru: 'М400, М500, в мешках' },
    image: '/assets/img/cement.svg',
    sort: 30
  },
  {
    id: 'rotband',
    name: { uz: 'Rotband va gips', ru: 'Rotband и гипс' },
    blurb: { uz: 'Suvoq, gipsokarton, profil', ru: 'Штукатурка, гипсокартон, профиль' },
    image: '/assets/img/rotband.svg',
    sort: 40
  },
  {
    id: 'elektro',
    name: { uz: 'Elektrotexnika', ru: 'Электротехника' },
    blurb: { uz: 'Kabel, rozetka, avtomat', ru: 'Кабель, розетки, автоматы' },
    image: '/assets/img/cable.svg',
    sort: 50
  },
  {
    id: 'xizmat',
    name: { uz: 'Xizmatlar', ru: 'Услуги' },
    blurb: { uz: 'Rover kesish xizmati', ru: 'Услуга резки Rover' },
    image: '/assets/img/service.svg',
    sort: 60
  }
];

export const defaultProducts = [
  {
    id: 'p01',
    category: 'santexnika',
    name: { uz: 'Polipropilen truba PN20, 25 mm', ru: 'Полипропиленовая труба PN20, 25 мм' },
    desc: {
      uz: "Issiq va sovuq suv uchun mustahkam PP truba. 1 metr narxi. O'lcham bo'yicha kesib beramiz.",
      ru: 'Прочная ПП-труба для горячей и холодной воды. Цена за 1 метр. Нарежем по размеру.'
    },
    price: 22000,
    unit: 'metr',
    stock: 240,
    image: '/assets/img/pipe.svg',
    active: true
  },
  {
    id: 'p02',
    category: 'santexnika',
    name: { uz: 'Aralashtirgich «Standart», xrom', ru: 'Смеситель «Стандарт», хром' },
    desc: {
      uz: "Oshxona va hammom uchun bir tutqichli aralashtirgich. Sopol kartrij, xrom qoplama.",
      ru: 'Однорычажный смеситель для кухни и ванной. Керамический картридж, хром.'
    },
    price: 185000,
    unit: 'dona',
    stock: 18,
    image: '/assets/img/faucet.svg',
    active: true
  },
  {
    id: 'p03',
    category: 'santexnika',
    name: { uz: "PP fitinglar to'plami, 20 dona", ru: 'Комплект ПП-фитингов, 20 шт' },
    desc: {
      uz: "25 mm truba uchun burchaklar, muftalar va o'tkazgichlar. Montaj ishlari uchun tayyor to'plam.",
      ru: 'Уголки, муфты и переходники для трубы 25 мм. Готовый набор для монтажа.'
    },
    price: 68000,
    unit: 'toplm',
    stock: 34,
    image: '/assets/img/fitting.svg',
    active: true
  },
  {
    id: 'p04',
    category: 'boyoq',
    name: { uz: 'Ichki bo\'yoq «Al Baraka», 10 l, oq', ru: 'Интерьерная краска «Al Baraka», 10 л, белая' },
    desc: {
      uz: "Devor va shiftlar uchun yuviladigan akril bo'yoq. Yaxshi yopish xossasi, kuchsiz hid.",
      ru: 'Моющаяся акриловая краска для стен и потолков. Хорошая укрывистость, слабый запах.'
    },
    price: 320000,
    unit: 'banka',
    stock: 42,
    image: '/assets/img/paint-white.svg',
    active: true
  },
  {
    id: 'p05',
    category: 'boyoq',
    name: { uz: 'Fasad bo\'yoq, 10 l, bazaviy oq', ru: 'Фасадная краска, 10 л, база белая' },
    desc: {
      uz: "Tashqi fasad uchun atmosferaga chidamli bo'yoq. -30 °C dan +60 °C gacha.",
      ru: 'Атмосферостойкая краска для наружных фасадов. От −30 °C до +60 °C.'
    },
    price: 395000,
    unit: 'banka',
    stock: 21,
    image: '/assets/img/paint-facade.svg',
    active: true
  },
  {
    id: 'p06',
    category: 'boyoq',
    name: { uz: 'Grunt «Beton-kontakt», 5 l', ru: 'Грунт «Бетон-контакт», 5 л' },
    desc: {
      uz: "Silliq beton va eski bo'yoq yuzasiga yopishishni kuchaytiradi. Ichki va tashqi ishlar uchun.",
      ru: 'Усиливает сцепление с гладким бетоном и старой краской. Для внутренних и наружных работ.'
    },
    price: 145000,
    unit: 'banka',
    stock: 30,
    image: '/assets/img/primer.svg',
    active: true
  },
  {
    id: 'p07',
    category: 'sement',
    name: { uz: 'Sement M400, 50 kg', ru: 'Цемент M400, 50 кг' },
    desc: {
      uz: "Umumiy qurilish ishlari uchun portlandsement. Poydevor, suvoq va beton uchun.",
      ru: 'Портландцемент для общестроительных работ. Для фундамента, стяжки и бетона.'
    },
    price: 58000,
    unit: 'qop',
    stock: 180,
    image: '/assets/img/cement.svg',
    active: true
  },
  {
    id: 'p08',
    category: 'sement',
    name: { uz: 'Sement M500, 50 kg', ru: 'Цемент M500, 50 кг' },
    desc: {
      uz: "Yuqori mustahkamlikdagi sement. Yuk ko'taruvchi konstruksiyalar va og'ir beton uchun.",
      ru: 'Высокопрочный цемент. Для несущих конструкций и тяжёлого бетона.'
    },
    price: 65000,
    unit: 'qop',
    stock: 96,
    image: '/assets/img/cement-m500.svg',
    active: true
  },
  {
    id: 'p09',
    category: 'sement',
    name: { uz: 'Sement M400, 25 kg', ru: 'Цемент M400, 25 кг' },
    desc: {
      uz: "Kichik hajmdagi ishlar uchun qulay qadoq. Ta'mirlash va pardoz uchun.",
      ru: 'Удобная упаковка для небольших работ. Для ремонта и отделки.'
    },
    price: 32000,
    unit: 'qop',
    stock: 0,
    image: '/assets/img/cement-small.svg',
    active: true
  },
  {
    id: 'p10',
    category: 'rotband',
    name: { uz: 'Rotband gips suvoq, 30 kg', ru: 'Гипсовая штукатурка Rotband, 30 кг' },
    desc: {
      uz: "Devor va shiftlarni tekislash uchun gipsli suvoq. Qo'lda va mashinada ishlatiladi.",
      ru: 'Гипсовая штукатурка для выравнивания стен и потолков. Ручное и машинное нанесение.'
    },
    price: 92000,
    unit: 'qop',
    stock: 54,
    image: '/assets/img/rotband.svg',
    active: true
  },
  {
    id: 'p11',
    category: 'rotband',
    name: { uz: 'Gipsokarton 12,5 mm, 1200×2500', ru: 'Гипсокартон 12,5 мм, 1200×2500' },
    desc: {
      uz: "Ichki bezash uchun standart gipsokarton list. Devor va shift konstruksiyalari uchun.",
      ru: 'Стандартный лист гипсокартона для внутренней отделки. Для стен и потолков.'
    },
    price: 78000,
    unit: 'list',
    stock: 35,
    image: '/assets/img/drywall.svg',
    active: true
  },
  {
    id: 'p12',
    category: 'rotband',
    name: { uz: 'Profil CD-60, 3 m', ru: 'Профиль CD-60, 3 м' },
    desc: {
      uz: "Gipsokarton shiftlari uchun galvanizatsiyalangan profil. 0,5 mm metall.",
      ru: 'Оцинкованный профиль для потолков из гипсокартона. Металл 0,5 мм.'
    },
    price: 38000,
    unit: 'dona',
    stock: 48,
    image: '/assets/img/profile.svg',
    active: true
  },
  {
    id: 'p13',
    category: 'elektro',
    name: { uz: 'Kabel VVG 3×2,5, 1 m', ru: 'Кабель ВВГ 3×2,5, 1 м' },
    desc: {
      uz: "Uy va ofis elektr tarmog'i uchun mis kabel. 1 metr narxi, kerakli uzunlikda kesamiz.",
      ru: 'Медный кабель для домашней и офисной проводки. Цена за 1 метр, отрежем нужную длину.'
    },
    price: 26000,
    unit: 'metr',
    stock: 300,
    image: '/assets/img/cable.svg',
    active: true
  },
  {
    id: 'p14',
    category: 'elektro',
    name: { uz: 'Rozetka 16A, oq', ru: 'Розетка 16A, белая' },
    desc: {
      uz: "Yashirin o'rnatish uchun rozetka. 16 A gacha bo'lgan yuklamaga mo'ljallangan.",
      ru: 'Розетка для скрытой установки. Рассчитана на нагрузку до 16 A.'
    },
    price: 28000,
    unit: 'dona',
    stock: 76,
    image: '/assets/img/socket.svg',
    active: true
  },
  {
    id: 'p15',
    category: 'elektro',
    name: { uz: "Avtomatik o'chirgich 16A", ru: 'Автоматический выключатель 16A' },
    desc: {
      uz: "Qisqa tutashuv va ortiqcha yuklamadan himoya. DIN reykaga o'rnatiladi.",
      ru: 'Защита от короткого замыкания и перегрузки. Устанавливается на DIN-рейку.'
    },
    price: 48000,
    unit: 'dona',
    stock: 32,
    image: '/assets/img/breaker.svg',
    active: true
  },
  {
    id: 'p16',
    category: 'elektro',
    name: { uz: 'LED lampa 12W, E27', ru: 'LED-лампа 12W, E27' },
    desc: {
      uz: "Tejamkor va uzoq muddatli lampa. Iliq oq yorug'lik, E27 asos.",
      ru: 'Экономичная лампа с долгим сроком службы. Тёплый белый свет, цоколь E27.'
    },
    price: 22000,
    unit: 'dona',
    stock: 110,
    image: '/assets/img/lamp.svg',
    active: true
  },
  {
    id: 'p17',
    category: 'xizmat',
    name: { uz: 'Rover kesish xizmati', ru: 'Услуга резки Rover' },
    desc: {
      uz: "Plitka, profil va list materiallarni o'lchamingizga moslab kesamiz. Aniq va toza kesim.",
      ru: 'Резка плитки, профиля и листовых материалов под ваш размер. Точный и чистый рез.'
    },
    price: 15000,
    unit: 'xizmat',
    stock: 100,
    image: '/assets/img/service.svg',
    active: true
  }
];
