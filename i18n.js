/* Shared language + formatting helpers for the storefront and seller panel. */
(function () {
  const DICT = {
    uz: {
      langUz: 'UZ',
      langRu: 'RU',
      brandTagline: 'Qurilish mollari',
      topbarPickup: 'Olib ketish + haydovchi orqali yetkazish',
      topbarHours: 'Dush–Shan, 08:00–19:00',
      navCatalog: 'Katalog',
      navPickup: 'Qanday ishlaydi',
      navDelivery: 'Yetkazish',
      navAbout: "Do'kon haqida",
      navContact: 'Aloqa',
      trackOrder: 'Buyurtmani tekshirish',
      cart: 'Savat',
      sellerPanel: 'Sotuvchi paneli',
      heroKicker: "Qurilish mollari do'koni · Chilonzor",
      heroTitle1: 'Poydevordan',
      heroTitle2: 'tomgacha',
      heroTitle3: 'bir joyda.',
      heroLead: "Sement, bo'yoq, santexnika, gips va elektrotexnika. Ombordagi qoldiqni saytda ko'ring, buyurtma bering — olib ketasiz yoki haydovchi bilan kelishib yetkazasiz.",
      heroPrimary: 'Katalogni ko‘rish',
      heroSecondary: 'Qanday ishlaydi?',
      heroNote: 'Haydovchi orqali yetkazish mavjud',
      statCategories: 'kategoriya',
      statStock: 'ombor qoldig‘i',
      statStockValue: 'Onlayn',
      statDelivery: 'yetkazish',
      statDeliveryValue: 'Haydovchi',
      heroBadge: 'Bugun ochiq',
      ticketLabel: 'YETKAZISH',
      ticketSub: 'OLIB KETISH',
      ticketTime: '08:00 — 19:00',
      marquee1: 'Sement',
      marquee2: "Bo'yoq",
      marquee3: 'Santexnika',
      marquee4: 'Rotband',
      marquee5: 'Elektrotexnika',
      marquee6: 'Kesish xizmati',
      catsKicker: 'Katalog',
      catsTitle: 'Nima quryapsiz?',
      catsSub: "Kerakli bo'limni tanlang — qolganini biz tayyorlab qo'yamiz.",
      catProducts: '{n} pozitsiya',
      seeAll: 'Barchasi',
      catalogKicker: 'Omborda bor',
      catalogTitle: 'Mahsulotlar va narxlar',
      catalogSub: "Qoldiq har buyurtmadan keyin avtomatik yangilanadi. Narxlar so'mda.",
      searchPlaceholder: 'Mahsulot qidirish...',
      sortLabel: 'Saralash',
      sortDefault: 'Odatiy',
      sortPriceAsc: 'Narx: arzon → qimmat',
      sortPriceDesc: 'Narx: qimmat → arzon',
      sortName: "Nomi bo'yicha",
      filterAll: 'Barchasi',
      stockLeft: 'Omborda: {n} {unit}',
      stockOut: 'Omborda qolmagan',
      serviceAvailable: 'Xizmat mavjud',
      lowStock: 'Kam qoldi',
      addToCart: 'Savatga',
      unavailable: 'Tugagan',
      emptyTitle: 'Hech narsa topilmadi',
      emptyText: "Boshqa nom bilan qidirib ko'ring yoki filtrni tozalang.",
      clearFilters: 'Filtrlarni tozalash',
      loading: 'Yuklanmoqda...',
      howKicker: 'Oson jarayon',
      howTitle: 'Uch qadam — va materiallar sizda',
      step1Title: 'Tanlang',
      step1Text: "Katalogdan kerakli mahsulotni va miqdorini tanlang. Qoldiq saytda ko'rinadi.",
      step2Title: 'Buyurtma bering',
      step2Text: "Ismingiz, telefoningiz va qulay vaqtni qoldiring.",
      step3Title: 'Oling yoki yetkazing',
      step3Text: "Buyurtmani do'kondan olib ketasiz yoki haydovchi bilan qo'ng'iroq qilib, yetkazishni kelishasiz.",
      howNote: "Yetkazishni haydovchi bilan kelishasiz: vaqt, manzil va narxni telefon orqali aniqlashtirasiz. Do'kon buyurtmani tayyorlab beradi.",
      serviceKicker: "Qo'shimcha xizmat",
      serviceTitle: "O'lcham muhimmi? Biz kesamiz.",
      serviceText: "Rover stanogida plitka, profil va list materiallarni aniq o'lchamda kesamiz. Kesish narxi — ish hajmidan kelib chiqib.",
      serviceCta: 'Kesish xizmatini ko‘rish',
      aboutKicker: "Do'kon haqida",
      aboutTitle: 'Al Baraka — ishonchli poydevor',
      aboutText1: "Chilonzorda joylashgan qurilish mollari do'koni. Sement, gips, bo'yoq, santexnika va elektrotexnika — qurilishning barcha asosiy bosqichlari uchun.",
      aboutText2: "Biz onlayn katalog va real vaqtdagi qoldiqlar bilan ishlaymiz: nima borligini oldindan bilasiz, navbatda kutib qolmaysiz.",
      aboutAddress: 'Manzil',
      aboutHours: 'Ish vaqti',
      aboutPhone: 'Telefon',
      aboutPickup: 'Yetkazib berish',
      aboutPickupValue: 'Haydovchi bilan kelishiladi',
      aboutCta: 'Buyurtma berish',
      footTagline: 'Poydevordan tomgacha — bitta manzilda.',
      footCatalog: 'Katalog',
      footHelp: 'Ma’lumot',
      footContacts: 'Aloqa',
      footRights: '© 2026 Al Baraka. Barcha huquqlar himoyalangan.',
      footAdmin: 'Sotuvchi paneli',
      footPickupOnly: 'Olib ketish + yetkazish',
      cartTitle: 'Savat',
      cartEmptyTitle: "Savat hozircha bo'sh",
      cartEmptyText: "Katalogdan mahsulot tanlang — shu yerda paydo bo'ladi.",
      cartContinue: 'Katalogga qaytish',
      cartPickup: 'Olib ketish yoki haydovchi orqali yetkazish',
      cartSubtotal: 'Jami',
      cartItems: 'Mahsulotlar',
      cartCheckout: 'Buyurtma berish',
      cartRemove: "O'chirish",
      cartQty: 'Miqdor',
      cartMax: 'Omborda shu miqdorda qoldi',
      cartStockNote: 'Qoldiq: {n} {unit}',
      coKicker: 'Buyurtmani tasdiqlash',
      coTitle: 'Buyurtma berish',
      coSub: "Buyurtmani do'kondan olib ketasiz yoki haydovchi bilan kelishib yetkazasiz.",
      coName: 'Ismingiz',
      coNamePh: 'Masalan, Aziz Karimov',
      coPhone: 'Telefon raqamingiz',
      coPhonePh: '+998 90 123 45 67',
      coAddress: 'Manzil / tuman',
      coAddressPh: 'Tuman yoki manzil',
      coAddressHint: 'Sotuvchi sizni tanashi uchun. Yetkazishda manzilni haydovchi bilan aniqlashtirasiz.',
      coPickup: 'Olib ketish vaqti',
      coPickupHint: 'Do‘kon ish vaqti: {hours}',
      coNote: 'Izoh (ixtiyoriy)',
      coNotePh: 'Masalan: 20 qop sement, yuklashda yordam kerak...',
      coSummary: 'Buyurtmangiz',
      coTotal: 'Jami',
      coSubmit: 'Buyurtmani yuborish',
      coSubmitting: 'Yuborilmoqda...',
      coAgree: "Buyurtma do'kondan olib ketiladi yoki haydovchi orqali yetkaziladi.",
      coEmpty: "Savat bo'sh",
      okKicker: 'Rahmat!',
      okTitle: 'Buyurtma qabul qilindi',
      okText: "Sotuvchi tez orada buyurtmani tasdiqlaydi. Holatni buyurtma raqami orqali kuzatishingiz mumkin.",
      okCode: 'Buyurtma raqami',
      okPickup: 'Kutilayotgan vaqt',
      okTotal: 'Jami',
      okTrack: 'Buyurtmani kuzatish',
      okClose: 'Xaridni davom ettirish',
      okKeep: "Raqamni saqlab qo'ying yoki ekranni suratga oling.",
      okPhone: "Savollar bo'lsa, do'konga qo'ng'iroq qiling.",
      trTitle: 'Buyurtma holati',
      trSub: 'Buyurtma raqami va telefon raqamingizni kiriting.',
      trCreated: 'Qabul qilingan',
      trCode: 'Buyurtma raqami',
      trCodePh: 'AB-1001',
      trPhone: 'Telefon',
      trSubmit: 'Tekshirish',
      trChecking: 'Tekshirilmoqda...',
      trNotFound: 'Bunday buyurtma topilmadi. Raqam va telefonni tekshiring.',
      trPickup: 'Kutilayotgan vaqt',
      trChanged: "Sotuvchi vaqtni o'zgartirgan bo'lishi mumkin. Quyidagi vaqt amal qiladi.",
      trItems: 'Buyurtma tarkibi',
      trTotal: 'Jami',
      trNewSearch: 'Boshqa buyurtma',
      errName: 'Ismingizni kiriting (kamida 2 harf).',
      errPhone: "To'g'ri telefon raqam kiriting.",
      errAddress: 'Manzil yoki tumanni kiriting.',
      errPickup: 'Kutilayotgan vaqtni tanlang.',
      errCart: "Savatga kamida bitta mahsulot qo'shing.",
      errStock: "Ombordagi qoldiq o'zgargan. Savatni yangilang.",
      errGeneric: 'Xatolik yuz berdi. Qayta urinib ko‘ring.',
      errNetwork: "Server bilan aloqa yo'q. Internetni tekshiring.",
      toastAdded: "Savatga qo'shildi",
      toastMax: 'Omborda shu miqdorda qoldi',
      toastRemoved: 'Savatdan olib tashlandi',
      deliveryKicker: 'Yetkazib berish',
      deliveryTitle: 'Haydovchilar bilan kelishasiz',
      deliverySub: "Buyurtma bergach, haydovchiga qo'ng'iroq qilib vaqt, manzil va narxni kelishib oling. Do'kon yetkazishni o'zi tashkil qilmaydi.",
      deliveryNote: "Yetkazib berish narxi buyurtma summasiga kirmaydi. Uni haydovchi bilan kelishasiz.",
      deliveryCall: "Qo'ng'iroq qilish",
      deliveryStoreCall: "Do'konga qo'ng'iroq qilish",
      deliveryDriversTitle: 'Haydovchilar',
      deliveryDriversCount: '{n} ta',
      deliveryNoDrivers: "Hozircha haydovchilar ro'yxati bo'sh. Yetkazish bo'yicha do'konga qo'ng'iroq qiling.",
      fulfillmentTitle: 'Qanday olasiz?',
      fulfillmentPickup: 'Olib ketaman',
      fulfillmentPickupSub: "Do'kondan o'zim olib ketaman",
      fulfillmentDelivery: 'Haydovchi orqali',
      fulfillmentDeliverySub: "Haydovchi bilan telefon orqali kelishaman",
      coDeliveryTitle: 'Haydovchini tanlang',
      coDeliveryText: "Buyurtmani yuborishdan oldin haydovchiga qo'ng'iroq qiling va vaqt, manzil hamda narxni kelishib oling.",
      coDriverLabel: 'Kelishilgan haydovchi (ixtiyoriy)',
      coDriverNone: 'Hali kelishmadim',
      coDeliveryFee: "Yetkazish narxi haydovchi bilan kelishiladi va buyurtma summasiga kirmaydi.",
      coDeliveryNoDrivers: "Hozircha faol haydovchilar yo'q. Iltimos, olib ketishni tanlang.",
      coPickupDelivery: 'Yetkazish vaqti (kelishiladi)',
      coAddressHintDelivery: 'Yetkazish manzili. Aniq manzilni haydovchi bilan kelishasiz.',
      coSummaryMethod: 'Qabul qilish',
      coSummaryDriver: 'Haydovchi',
      coDriverPhone: 'Haydovchi telefoni',
      methodPickup: 'Olib ketish',
      methodDelivery: 'Yetkazib berish',
      orderPickupLabel: 'Olib ketish vaqti',
      orderDeliveryLabel: 'Yetkazish vaqti',
      errDelivery: "Yetkazish uchun faol haydovchi yo'q. Olib ketishni tanlang.",
      adminTitle: 'Sotuvchi paneli',
      loginWord1: 'Buyurtma.',
      loginWord2: 'Qoldiq.',
      loginWord3: 'Nazorat.',
      adminLoginKicker: 'AL BARAKA · SOTUVCHI',
      adminLoginTitle: 'Panelga kirish',
      adminLoginSub: 'Buyurtmalar, qoldiq va narxlarni boshqarish uchun tizimga kiring.',
      adminUser: 'Login',
      adminPass: 'Parol',
      adminLoginBtn: 'Kirish',
      adminLoginWait: 'Kirilmoqda...',
      adminLoginError: 'Login yoki parol xato.',
      adminBack: 'Saytga qaytish',
      adminSecure: 'Faqat sotuvchilar uchun',
      adminLoginHint: "Login va parolni do'kon egasidan oling.",
      adminNavOrders: 'Buyurtmalar',
      adminNavProducts: 'Mahsulotlar',
      adminNavSettings: 'Sozlamalar',
      adminLogout: 'Chiqish',
      adminViewSite: 'Saytni ochish',
      adminHello: 'Xush kelibsiz',
      adminToday: 'Bugun',
      adminOrdersTitle: 'Buyurtmalar',
      adminOrdersSub: "Kim, qayerdan va qanday olishi — barchasi shu yerda.",
      adminProductsTitle: 'Mahsulotlar',
      adminProductsSub: "Nomi, narxi, qoldig'i va rasmini boshqaring.",
      adminSettingsTitle: 'Sozlamalar',
      adminSettingsSub: "Do'kon ma'lumotlari va kirish paroli.",
      adminSearchOrders: 'Buyurtma, ism yoki telefon...',
      adminSearchProducts: 'Mahsulot qidirish...',
      adminAll: 'Barchasi',
      adminRefresh: 'Yangilash',
      adminNoOrders: "Buyurtmalar yo'q",
      adminNoOrdersText: 'Yangi buyurtma kelganda shu yerda ko‘rinadi.',
      adminNoProducts: 'Mahsulot topilmadi',
      adminOrder: 'Buyurtma',
      adminCreated: 'Qabul qilingan',
      adminCustomer: 'Mijoz',
      adminAddress: 'Qayerdan',
      adminDeliveryAddress: 'Yetkazish manzili',
      adminNote: 'Izoh',
      adminItems: 'Tarkib',
      adminTotal: 'Jami',
      adminPickup: 'Olib ketish vaqti',
      adminSavePickup: 'Vaqtni saqlash',
      adminStatus: 'Holat',
      adminMarkConfirmed: 'Tasdiqlash',
      adminMarkReady: 'Tayyor',
      adminMarkCompleted: 'Yakunlash',
      adminCancelOrder: 'Bekor qilish',
      adminPickupSaved: 'Vaqt yangilandi',
      adminStatusSaved: 'Holat yangilandi',
      adminOrderUpdated: 'Buyurtma yangilandi',
      adminCancelConfirmTitle: 'Buyurtmani bekor qilasizmi?',
      adminCancelConfirmText: "Mahsulotlar omborga qaytariladi. Buyurtmani keyin qayta tiklash mumkin.",
      adminCancelConfirm: 'Ha, bekor qilish',
      adminKeep: "Yo'q, qoldirish",
      adminStatsNew: 'Yangi buyurtmalar',
      adminStatsToday: 'Bugungi buyurtmalar',
      adminStatsRevenue: 'Yakunlangan savdo',
      adminStatsLow: 'Kam qoldiq',
      adminStatsProducts: 'Mahsulotlar',
      adminAddProduct: "Mahsulot qo'shish",
      adminEditProduct: 'Mahsulotni tahrirlash',
      adminNewProduct: 'Yangi mahsulot',
      adminProductNameUz: "Nomi (o'zbekcha)",
      adminProductNameRu: 'Nomi (ruscha)',
      adminDescUz: "Tavsif (o'zbekcha)",
      adminDescRu: 'Tavsif (ruscha)',
      adminCategory: 'Kategoriya',
      adminUnit: "O'lchov birligi",
      adminPrice: "Narx, so'm",
      adminStockQty: 'Ombordagi miqdor',
      adminImage: 'Mahsulot rasmi',
      adminImageHint: 'JPG, PNG yoki WebP · 3 MB gacha. Avtomatik siqiladi.',
      adminChooseImage: 'Rasm tanlash',
      adminReplaceImage: 'Rasmni almashtirish',
      adminActive: 'Saytda ko‘rinadi',
      adminSave: 'Saqlash',
      adminSaving: 'Saqlanmoqda...',
      adminCancel: 'Bekor qilish',
      adminEdit: 'Tahrirlash',
      adminArchive: "O'chirish",
      adminArchiveTitle: 'Mahsulotni o‘chirasizmi?',
      adminArchiveText: 'Mahsulot katalogdan yashiriladi. Buyurtmalar tarixi saqlanadi.',
      adminArchiveConfirm: "O'chirish",
      adminRestore: 'Qaytarish',
      adminArchived: 'Arxivlangan',
      adminShown: 'Faol',
      adminHidden: 'Yashirilgan',
      adminProductSaved: 'Mahsulot saqlandi',
      adminProductArchived: "Mahsulot o'chirildi",
      adminProductRestored: 'Mahsulot qaytarildi',
      adminStockSaved: 'Qoldiq yangilandi',
      adminPriceCol: 'Narx',
      adminStockCol: 'Qoldiq',
      adminStatusCol: 'Holat',
      adminActions: 'Amallar',
      adminCategoryCol: 'Kategoriya',
      adminProductCol: 'Mahsulot',
      adminLow: 'Kam',
      adminOut: 'Tugagan',
      adminSettingsStore: "Do'kon ma'lumotlari",
      adminPhone: 'Telefon 1',
      adminPhone2: 'Telefon 2',
      adminAddressUz: 'Manzil (o‘zbekcha)',
      adminAddressRu: 'Manzil (ruscha)',
      adminLandmarkUz: 'Mo‘ljal (o‘zbekcha)',
      adminLandmarkRu: 'Mo‘ljal (ruscha)',
      adminHoursUz: 'Ish vaqti (o‘zbekcha)',
      adminHoursRu: 'Ish vaqti (ruscha)',
      adminPickupNoteUz: 'Buyurtma izohi (o‘zbekcha)',
      adminPickupNoteRu: 'Buyurtma izohi (ruscha)',
      adminSaveSettings: 'Sozlamalarni saqlash',
      adminSettingsSaved: 'Sozlamalar saqlandi',
      adminPassword: "Parolni o'zgartirish",
      adminPasswordSub: 'Xavfsizlik uchun kamida 8 belgidan foydalaning.',
      adminCurrentPassword: 'Joriy parol',
      adminNewPassword: 'Yangi parol',
      adminRepeatPassword: 'Yangi parolni takrorlang',
      adminChangePassword: 'Parolni yangilash',
      adminPasswordChanged: "Parol o'zgartirildi. Qaytadan kiring.",
      adminPasswordMismatch: 'Parollar mos kelmadi.',
      adminPasswordShort: 'Parol kamida 8 belgi bo‘lishi kerak.',
      adminWrongPassword: 'Joriy parol xato.',
      adminSessionExpired: 'Sessiya tugadi. Qaytadan kiring.',
      adminLoading: 'Yuklanmoqda...',
      adminError: "Ma'lumotlarni yuklab bo'lmadi.",
      adminRetry: 'Qayta urinish',
      adminConfirm: 'Tasdiqlash',
      adminClose: 'Yopish',
      adminAllCategories: 'Barcha kategoriyalar',
      adminNoAddress: "Ko'rsatilmagan",
      adminUpdatedAt: 'Yangilandi',
      adminProductCount: '{n} ta mahsulot',
      adminOrderCount: '{n} ta buyurtma',
      adminRequired: "Yulduzcha bilan belgilangan maydonlarni to'ldiring.",
      adminStockDelta: 'Qoldiqni o‘zgartirish',
      adminLoginRequired: 'Login va parolni kiriting.',
      adminItemQty: '{n} dona',
      adminPickupPassed: 'Vaqt o‘tgan',
      adminQuickStock: 'Tez qoldiq',
      adminNoItems: "Tarkib yo'q",
      adminAllProducts: 'Barcha mahsulotlar',
      adminSearchEmpty: "Qidiruv bo'yicha mahsulot yo'q.",
      adminManageCategories: 'Kategoriyalar',
      adminAddCategory: "Kategoriya qo'shish",
      adminEditCategory: 'Kategoriyani tahrirlash',
      adminCategoryNameUz: "Nomi (o'zbekcha)",
      adminCategoryNameRu: 'Nomi (ruscha)',
      adminCategoryBlurbUz: "Qisqa izoh (o'zbekcha)",
      adminCategoryBlurbRu: 'Qisqa izoh (ruscha)',
      adminCategoryImage: 'Kategoriya rasmi',
      adminCategoryCount: '{n} ta mahsulot',
      adminCategorySaved: 'Kategoriya saqlandi',
      adminCategoryDeleted: "Kategoriya o'chirildi",
      adminCategoryDeleteTitle: "Kategoriyani o'chirasizmi?",
      adminCategoryDeleteText: "Kategoriya katalogdan yo'qoladi. Unda mahsulot bo'lsa, avval ularni boshqa kategoriyaga o'tkazing.",
      adminCategoryDeleteConfirm: "Ha, o'chirish",
      adminCategoryInUse: "Bu kategoriyada {n} ta mahsulot bor. Avval ularni boshqa kategoriyaga o'tkazing.",
      adminNoCategories: "Hozircha kategoriya yo'q. Yangi kategoriya qo'shing.",
      adminDriversTitle: 'Yetkazib berish haydovchilari',
      adminDriversSub: "Mijozlar qo'ng'iroq qiladigan haydovchilar ro'yxati.",
      adminAddDriver: "Haydovchi qo'shish",
      adminEditDriver: 'Haydovchini tahrirlash',
      adminDriverName: 'Ismi',
      adminDriverPhone: 'Telefon raqami',
      adminDriverArea: 'Hudud / yo‘nalish',
      adminDriverNote: 'Izoh (mashina, vaqt...)',
      adminDriverActive: "Mijozlarga ko'rinadi",
      adminDriverSaved: 'Haydovchi saqlandi',
      adminDriverDeleted: "Haydovchi o'chirildi",
      adminNoDrivers: "Hozircha haydovchi yo'q",
      adminNoDriversText: "Haydovchi qo'shsangiz, mijozlar unga qo'ng'iroq qilib yetkazishni kelishadi.",
      adminDriverDeleteTitle: "Haydovchini o'chirasizmi?",
      adminDriverDeleteText: "U mijozlar ro'yxatidan yo'qoladi. Oldingi buyurtmalardagi ma'lumot saqlanadi.",
      adminDriverDeleteConfirm: "Ha, o'chirish",
      adminDriverCount: '{n} ta haydovchi',
      adminOrderDriver: 'Haydovchi',
      adminNoDriverChosen: 'Haydovchi tanlanmagan'
    },
    ru: {
      langUz: 'UZ',
      langRu: 'RU',
      brandTagline: 'Стройматериалы',
      topbarPickup: 'Самовывоз + доставка с водителем',
      topbarHours: 'Пн–Сб, 08:00–19:00',
      navCatalog: 'Каталог',
      navPickup: 'Как это работает',
      navDelivery: 'Доставка',
      navAbout: 'О магазине',
      navContact: 'Контакты',
      trackOrder: 'Проверить заказ',
      cart: 'Корзина',
      sellerPanel: 'Панель продавца',
      heroKicker: 'Магазин стройматериалов · Чиланзар',
      heroTitle1: 'От фундамента',
      heroTitle2: 'до крыши',
      heroTitle3: 'в одном месте.',
      heroLead: 'Цемент, краски, сантехника, гипс и электрика. Смотрите остатки на сайте, оформляйте заказ — забирайте сами или договоритесь о доставке с водителем.',
      heroPrimary: 'Смотреть каталог',
      heroSecondary: 'Как это работает?',
      heroNote: 'Доставка с водителем доступна',
      statCategories: 'категорий',
      statStock: 'остатки в наличии',
      statStockValue: 'Онлайн',
      statDelivery: 'доставка',
      statDeliveryValue: 'Водитель',
      heroBadge: 'Сегодня открыто',
      ticketLabel: 'ДОСТАВКА',
      ticketSub: 'САМОВЫВОЗ',
      ticketTime: '08:00 — 19:00',
      marquee1: 'Цемент',
      marquee2: 'Краски',
      marquee3: 'Сантехника',
      marquee4: 'Rotband',
      marquee5: 'Электрика',
      marquee6: 'Услуга резки',
      catsKicker: 'Каталог',
      catsTitle: 'Что вы строите?',
      catsSub: 'Выберите нужный раздел — остальное мы подготовим.',
      catProducts: '{n} позиций',
      seeAll: 'Все',
      catalogKicker: 'В наличии',
      catalogTitle: 'Товары и цены',
      catalogSub: 'Остатки обновляются автоматически после каждого заказа. Цены в сумах.',
      searchPlaceholder: 'Поиск товара...',
      sortLabel: 'Сортировка',
      sortDefault: 'По умолчанию',
      sortPriceAsc: 'Цена: дешёвые → дорогие',
      sortPriceDesc: 'Цена: дорогие → дешёвые',
      sortName: 'По названию',
      filterAll: 'Все',
      stockLeft: 'В наличии: {n} {unit}',
      stockOut: 'Нет в наличии',
      serviceAvailable: 'Услуга доступна',
      lowStock: 'Мало осталось',
      addToCart: 'В корзину',
      unavailable: 'Нет в наличии',
      emptyTitle: 'Ничего не найдено',
      emptyText: 'Попробуйте другое название или сбросьте фильтры.',
      clearFilters: 'Сбросить фильтры',
      loading: 'Загрузка...',
      howKicker: 'Простой процесс',
      howTitle: 'Три шага — и материалы у вас',
      step1Title: 'Выберите',
      step1Text: 'Выберите товар и количество в каталоге. Остаток виден на сайте.',
      step2Title: 'Оформите заказ',
      step2Text: 'Оставьте имя, телефон и удобное время.',
      step3Title: 'Заберите или закажите доставку',
      step3Text: 'Заберите заказ из магазина или позвоните водителю и договоритесь о доставке.',
      howNote: 'Доставку вы согласуете напрямую с водителем: время, адрес и стоимость по телефону. Магазин подготовит заказ.',
      serviceKicker: 'Дополнительная услуга',
      serviceTitle: 'Важен точный размер? Мы отрежем.',
      serviceText: 'На станке Rover точно режем плитку, профиль и листовые материалы. Стоимость резки зависит от объёма работ.',
      serviceCta: 'Смотреть услугу резки',
      aboutKicker: 'О магазине',
      aboutTitle: 'Al Baraka — надёжный фундамент',
      aboutText1: 'Магазин стройматериалов в Чиланзаре. Цемент, гипс, краски, сантехника и электрика — для всех основных этапов стройки.',
      aboutText2: 'Мы работаем с онлайн-каталогом и актуальными остатками: вы заранее знаете, что есть в наличии, и не стоите в очереди.',
      aboutAddress: 'Адрес',
      aboutHours: 'Часы работы',
      aboutPhone: 'Телефон',
      aboutPickup: 'Доставка',
      aboutPickupValue: 'По договорённости с водителем',
      aboutCta: 'Оформить заказ',
      footTagline: 'От фундамента до крыши — по одному адресу.',
      footCatalog: 'Каталог',
      footHelp: 'Информация',
      footContacts: 'Контакты',
      footRights: '© 2026 Al Baraka. Все права защищены.',
      footAdmin: 'Панель продавца',
      footPickupOnly: 'Самовывоз + доставка',
      cartTitle: 'Корзина',
      cartEmptyTitle: 'Корзина пока пуста',
      cartEmptyText: 'Выберите товар в каталоге — он появится здесь.',
      cartContinue: 'Вернуться в каталог',
      cartPickup: 'Самовывоз или доставка с водителем',
      cartSubtotal: 'Итого',
      cartItems: 'Товары',
      cartCheckout: 'Оформить заказ',
      cartRemove: 'Удалить',
      cartQty: 'Количество',
      cartMax: 'Больше нет в наличии',
      cartStockNote: 'Остаток: {n} {unit}',
      coKicker: 'Подтверждение заказа',
      coTitle: 'Оформление заказа',
      coSub: 'Заберите заказ из магазина или договоритесь о доставке с водителем.',
      coName: 'Ваше имя',
      coNamePh: 'Например, Азиз Каримов',
      coPhone: 'Номер телефона',
      coPhonePh: '+998 90 123 45 67',
      coAddress: 'Адрес / район',
      coAddressPh: 'Район или адрес',
      coAddressHint: 'Чтобы продавец узнал вас. При доставке адрес уточните с водителем.',
      coPickup: 'Время самовывоза',
      coPickupHint: 'Часы работы магазина: {hours}',
      coNote: 'Комментарий (необязательно)',
      coNotePh: 'Например: 20 мешков цемента, нужна помощь с погрузкой...',
      coSummary: 'Ваш заказ',
      coTotal: 'Итого',
      coSubmit: 'Отправить заказ',
      coSubmitting: 'Отправляем...',
      coAgree: 'Заказ выдаётся в магазине или доставляется через водителя.',
      coEmpty: 'Корзина пуста',
      okKicker: 'Спасибо!',
      okTitle: 'Заказ принят',
      okText: 'Продавец скоро подтвердит заказ. Статус можно проверить по номеру заказа.',
      okCode: 'Номер заказа',
      okPickup: 'Ожидаемое время',
      okTotal: 'Итого',
      okTrack: 'Отследить заказ',
      okClose: 'Продолжить покупки',
      okKeep: 'Сохраните номер или сделайте скриншот.',
      okPhone: 'Если есть вопросы — позвоните в магазин.',
      trTitle: 'Статус заказа',
      trSub: 'Введите номер заказа и номер телефона.',
      trCreated: 'Принят',
      trCode: 'Номер заказа',
      trCodePh: 'AB-1001',
      trPhone: 'Телефон',
      trSubmit: 'Проверить',
      trChecking: 'Проверяем...',
      trNotFound: 'Заказ не найден. Проверьте номер и телефон.',
      trPickup: 'Ожидаемое время',
      trChanged: 'Продавец мог изменить время. Актуально время, указанное ниже.',
      trItems: 'Состав заказа',
      trTotal: 'Итого',
      trNewSearch: 'Другой заказ',
      errName: 'Укажите имя (минимум 2 символа).',
      errPhone: 'Укажите корректный номер телефона.',
      errAddress: 'Укажите район или адрес.',
      errPickup: 'Выберите желаемое время.',
      errCart: 'Добавьте хотя бы один товар в корзину.',
      errStock: 'Остаток изменился. Обновите корзину.',
      errGeneric: 'Произошла ошибка. Попробуйте ещё раз.',
      errNetwork: 'Нет связи с сервером. Проверьте интернет.',
      toastAdded: 'Добавлено в корзину',
      toastMax: 'Больше нет в наличии',
      toastRemoved: 'Удалено из корзины',
      deliveryKicker: 'Доставка',
      deliveryTitle: 'Договариваетесь с водителем напрямую',
      deliverySub: 'После заказа позвоните водителю и согласуйте время, адрес и стоимость. Магазин не организует доставку сам.',
      deliveryNote: 'Стоимость доставки не входит в сумму заказа. Её вы обсуждаете с водителем.',
      deliveryCall: 'Позвонить',
      deliveryStoreCall: 'Позвонить в магазин',
      deliveryDriversTitle: 'Водители',
      deliveryDriversCount: '{n}',
      deliveryNoDrivers: 'Список водителей пока пуст. По вопросам доставки позвоните в магазин.',
      fulfillmentTitle: 'Как получите заказ?',
      fulfillmentPickup: 'Заберу сам',
      fulfillmentPickupSub: 'Заберу из магазина',
      fulfillmentDelivery: 'С водителем',
      fulfillmentDeliverySub: 'Договорюсь с водителем по телефону',
      coDeliveryTitle: 'Выберите водителя',
      coDeliveryText: 'До отправки заказа позвоните водителю и согласуйте время, адрес и стоимость.',
      coDriverLabel: 'Согласованный водитель (необязательно)',
      coDriverNone: 'Ещё не договорился',
      coDeliveryFee: 'Стоимость доставки обсуждается с водителем и не входит в сумму заказа.',
      coDeliveryNoDrivers: 'Сейчас нет активных водителей. Выберите самовывоз.',
      coPickupDelivery: 'Время доставки (по договорённости)',
      coAddressHintDelivery: 'Адрес доставки. Точный адрес уточните с водителем.',
      coSummaryMethod: 'Получение',
      coSummaryDriver: 'Водитель',
      coDriverPhone: 'Телефон водителя',
      methodPickup: 'Самовывоз',
      methodDelivery: 'Доставка',
      orderPickupLabel: 'Время самовывоза',
      orderDeliveryLabel: 'Время доставки',
      errDelivery: 'Нет активных водителей. Выберите самовывоз.',
      adminTitle: 'Панель продавца',
      loginWord1: 'Заказы.',
      loginWord2: 'Остатки.',
      loginWord3: 'Контроль.',
      adminLoginKicker: 'AL BARAKA · ПРОДАВЕЦ',
      adminLoginTitle: 'Вход в панель',
      adminLoginSub: 'Войдите, чтобы управлять заказами, остатками и ценами.',
      adminUser: 'Логин',
      adminPass: 'Пароль',
      adminLoginBtn: 'Войти',
      adminLoginWait: 'Входим...',
      adminLoginError: 'Неверный логин или пароль.',
      adminBack: 'Вернуться на сайт',
      adminSecure: 'Только для продавцов',
      adminLoginHint: 'Логин и пароль получите у владельца магазина.',
      adminNavOrders: 'Заказы',
      adminNavProducts: 'Товары',
      adminNavSettings: 'Настройки',
      adminLogout: 'Выйти',
      adminViewSite: 'Открыть сайт',
      adminHello: 'Добро пожаловать',
      adminToday: 'Сегодня',
      adminOrdersTitle: 'Заказы',
      adminOrdersSub: 'Кто, откуда и как получит заказ — всё здесь.',
      adminProductsTitle: 'Товары',
      adminProductsSub: 'Управляйте названием, ценой, остатком и фото.',
      adminSettingsTitle: 'Настройки',
      adminSettingsSub: 'Данные магазина и пароль для входа.',
      adminSearchOrders: 'Заказ, имя или телефон...',
      adminSearchProducts: 'Поиск товара...',
      adminAll: 'Все',
      adminRefresh: 'Обновить',
      adminNoOrders: 'Заказов нет',
      adminNoOrdersText: 'Новые заказы появятся здесь.',
      adminNoProducts: 'Товары не найдены',
      adminOrder: 'Заказ',
      adminCreated: 'Принят',
      adminCustomer: 'Клиент',
      adminAddress: 'Откуда',
      adminDeliveryAddress: 'Адрес доставки',
      adminNote: 'Комментарий',
      adminItems: 'Состав',
      adminTotal: 'Итого',
      adminPickup: 'Время самовывоза',
      adminSavePickup: 'Сохранить время',
      adminStatus: 'Статус',
      adminMarkConfirmed: 'Подтвердить',
      adminMarkReady: 'Готов',
      adminMarkCompleted: 'Завершить',
      adminCancelOrder: 'Отменить',
      adminPickupSaved: 'Время обновлено',
      adminStatusSaved: 'Статус обновлён',
      adminOrderUpdated: 'Заказ обновлён',
      adminCancelConfirmTitle: 'Отменить заказ?',
      adminCancelConfirmText: 'Товары вернутся на склад. Заказ можно будет восстановить.',
      adminCancelConfirm: 'Да, отменить',
      adminKeep: 'Нет, оставить',
      adminStatsNew: 'Новые заказы',
      adminStatsToday: 'Заказы за сегодня',
      adminStatsRevenue: 'Завершённые продажи',
      adminStatsLow: 'Мало на складе',
      adminStatsProducts: 'Товары',
      adminAddProduct: 'Добавить товар',
      adminEditProduct: 'Редактировать товар',
      adminNewProduct: 'Новый товар',
      adminProductNameUz: 'Название (узбекский)',
      adminProductNameRu: 'Название (русский)',
      adminDescUz: 'Описание (узбекский)',
      adminDescRu: 'Описание (русский)',
      adminCategory: 'Категория',
      adminUnit: 'Единица измерения',
      adminPrice: 'Цена, сум',
      adminStockQty: 'Количество на складе',
      adminImage: 'Фото товара',
      adminImageHint: 'JPG, PNG или WebP · до 3 МБ. Сжимается автоматически.',
      adminChooseImage: 'Выбрать фото',
      adminReplaceImage: 'Заменить фото',
      adminActive: 'Показывать на сайте',
      adminSave: 'Сохранить',
      adminSaving: 'Сохраняем...',
      adminCancel: 'Отмена',
      adminEdit: 'Изменить',
      adminArchive: 'Удалить',
      adminArchiveTitle: 'Удалить товар?',
      adminArchiveText: 'Товар скроется из каталога. История заказов сохранится.',
      adminArchiveConfirm: 'Удалить',
      adminRestore: 'Вернуть',
      adminArchived: 'В архиве',
      adminShown: 'Активен',
      adminHidden: 'Скрыт',
      adminProductSaved: 'Товар сохранён',
      adminProductArchived: 'Товар удалён',
      adminProductRestored: 'Товар восстановлен',
      adminStockSaved: 'Остаток обновлён',
      adminPriceCol: 'Цена',
      adminStockCol: 'Остаток',
      adminStatusCol: 'Статус',
      adminActions: 'Действия',
      adminCategoryCol: 'Категория',
      adminProductCol: 'Товар',
      adminLow: 'Мало',
      adminOut: 'Нет',
      adminSettingsStore: 'Данные магазина',
      adminPhone: 'Телефон 1',
      adminPhone2: 'Телефон 2',
      adminAddressUz: 'Адрес (узбекский)',
      adminAddressRu: 'Адрес (русский)',
      adminLandmarkUz: 'Ориентир (узбекский)',
      adminLandmarkRu: 'Ориентир (русский)',
      adminHoursUz: 'Часы работы (узбекский)',
      adminHoursRu: 'Часы работы (русский)',
      adminPickupNoteUz: 'Примечание к заказу (узбекский)',
      adminPickupNoteRu: 'Примечание к заказу (русский)',
      adminSaveSettings: 'Сохранить настройки',
      adminSettingsSaved: 'Настройки сохранены',
      adminPassword: 'Сменить пароль',
      adminPasswordSub: 'Для безопасности используйте минимум 8 символов.',
      adminCurrentPassword: 'Текущий пароль',
      adminNewPassword: 'Новый пароль',
      adminRepeatPassword: 'Повторите новый пароль',
      adminChangePassword: 'Обновить пароль',
      adminPasswordChanged: 'Пароль изменён. Войдите снова.',
      adminPasswordMismatch: 'Пароли не совпадают.',
      adminPasswordShort: 'Пароль должен быть не короче 8 символов.',
      adminWrongPassword: 'Текущий пароль неверный.',
      adminSessionExpired: 'Сессия истекла. Войдите снова.',
      adminLoading: 'Загрузка...',
      adminError: 'Не удалось загрузить данные.',
      adminRetry: 'Повторить',
      adminConfirm: 'Подтвердить',
      adminClose: 'Закрыть',
      adminAllCategories: 'Все категории',
      adminNoAddress: 'Не указан',
      adminUpdatedAt: 'Обновлено',
      adminProductCount: '{n} товаров',
      adminOrderCount: '{n} заказов',
      adminRequired: 'Заполните поля со звёздочкой.',
      adminStockDelta: 'Изменить остаток',
      adminLoginRequired: 'Введите логин и пароль.',
      adminItemQty: '{n} шт',
      adminPickupPassed: 'Время прошло',
      adminQuickStock: 'Быстрый остаток',
      adminNoItems: 'Нет состава',
      adminAllProducts: 'Все товары',
      adminSearchEmpty: 'По запросу товаров нет.',
      adminManageCategories: 'Категории',
      adminAddCategory: 'Добавить категорию',
      adminEditCategory: 'Редактировать категорию',
      adminCategoryNameUz: 'Название (узбекский)',
      adminCategoryNameRu: 'Название (русский)',
      adminCategoryBlurbUz: 'Краткое описание (узбекский)',
      adminCategoryBlurbRu: 'Краткое описание (русский)',
      adminCategoryImage: 'Изображение категории',
      adminCategoryCount: '{n} товаров',
      adminCategorySaved: 'Категория сохранена',
      adminCategoryDeleted: 'Категория удалена',
      adminCategoryDeleteTitle: 'Удалить категорию?',
      adminCategoryDeleteText: 'Категория исчезнет из каталога. Если в ней есть товары, сначала перенесите их в другую категорию.',
      adminCategoryDeleteConfirm: 'Да, удалить',
      adminCategoryInUse: 'В этой категории {n} товаров. Сначала перенесите их в другую категорию.',
      adminNoCategories: 'Категорий пока нет. Добавьте новую категорию.',
      adminDriversTitle: 'Водители для доставки',
      adminDriversSub: 'Список водителей, которым звонят клиенты.',
      adminAddDriver: 'Добавить водителя',
      adminEditDriver: 'Редактировать водителя',
      adminDriverName: 'Имя',
      adminDriverPhone: 'Телефон',
      adminDriverArea: 'Район / направление',
      adminDriverNote: 'Примечание (машина, время...)',
      adminDriverActive: 'Виден клиентам',
      adminDriverSaved: 'Водитель сохранён',
      adminDriverDeleted: 'Водитель удалён',
      adminNoDrivers: 'Водителей пока нет',
      adminNoDriversText: 'Добавьте водителя, чтобы клиенты могли позвонить ему и договориться о доставке.',
      adminDriverDeleteTitle: 'Удалить водителя?',
      adminDriverDeleteText: 'Он исчезнет из списка для клиентов. Данные в старых заказах сохранятся.',
      adminDriverDeleteConfirm: 'Да, удалить',
      adminDriverCount: '{n} водителей',
      adminOrderDriver: 'Водитель',
      adminNoDriverChosen: 'Водитель не выбран'
    }
  };

  let runtimeCategories = [];

  function normalizeCategory(item) {
    const id = item.id || item.key || '';
    return {
      key: id,
      id,
      name: item.name || { uz: item.uz || id, ru: item.ru || id },
      blurb: item.blurb || { uz: item.blurbUz || '', ru: item.blurbRu || '' },
      image: item.image || '/assets/img/box.svg',
      sort: item.sort || 0,
      productCount: item.productCount || 0
    };
  }

  function setCategories(list) {
    runtimeCategories = Array.isArray(list) ? list.map(normalizeCategory) : [];
  }

  const UNITS = {
    dona: { uz: 'dona', ru: 'шт' },
    qop: { uz: 'qop', ru: 'меш.' },
    metr: { uz: 'm', ru: 'м' },
    litr: { uz: 'l', ru: 'л' },
    banka: { uz: 'banka', ru: 'банка' },
    toplm: { uz: "to'plam", ru: 'компл.' },
    list: { uz: 'list', ru: 'лист' },
    xizmat: { uz: 'xizmat', ru: 'услуга' },
    rulon: { uz: 'rulon', ru: 'рул.' }
  };

  const STATUSES = {
    new: {
      uz: 'Yangi',
      ru: 'Новый',
      hintUz: 'Buyurtma qabul qilindi. Sotuvchi tez orada tasdiqlaydi.',
      hintRu: 'Заказ принят. Продавец скоро его подтвердит.'
    },
    confirmed: {
      uz: 'Tasdiqlangan',
      ru: 'Подтверждён',
      hintUz: 'Sotuvchi buyurtmani tasdiqladi va tayyorlayapti.',
      hintRu: 'Продавец подтвердил заказ и готовит его.'
    },
    ready: {
      uz: 'Tayyor',
      ru: 'Готов',
      hintUz: "Buyurtmangiz tayyor. Olib ketish yoki haydovchi bilan kelishishingiz mumkin.",
      hintRu: 'Заказ готов. Можно забрать его или договориться о доставке с водителем.'
    },
    completed: {
      uz: 'Yakunlangan',
      ru: 'Завершён',
      hintUz: "Buyurtma yakunlandi. Xaridingiz uchun rahmat!",
      hintRu: 'Заказ завершён. Спасибо за покупку!'
    },
    cancelled: {
      uz: 'Bekor qilingan',
      ru: 'Отменён',
      hintUz: "Buyurtma bekor qilindi. Savollar uchun do'konga qo'ng'iroq qiling.",
      hintRu: 'Заказ отменён. По вопросам позвоните в магазин.'
    }
  };

  const MONTHS_UZ = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];

  const state = {
    lang: (() => {
      try {
        const saved = localStorage.getItem('ab_lang');
        if (saved === 'ru' || saved === 'uz') return saved;
      } catch {}
      return 'uz';
    })()
  };

  function t(key, vars) {
    let value = DICT[state.lang]?.[key] ?? DICT.uz[key] ?? key;
    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        value = value.replaceAll(`{${name}}`, String(replacement));
      }
    }
    return value;
  }

  function setLang(lang) {
    if (lang !== 'uz' && lang !== 'ru') return;
    state.lang = lang;
    try {
      localStorage.setItem('ab_lang', lang);
    } catch {}
    document.documentElement.lang = lang;
    applyTranslations();
    window.dispatchEvent(new CustomEvent('ab:langchange', { detail: { lang } }));
  }

  function applyTranslations(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      const active = btn.getAttribute('data-lang') === state.lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function category(key) {
    return (
      runtimeCategories.find((item) => item.key === key) || {
        key,
        id: key,
        name: { uz: key, ru: key },
        blurb: { uz: '', ru: '' },
        image: '/assets/img/box.svg',
        sort: 0,
        productCount: 0
      }
    );
  }

  function catName(key) {
    const c = category(key);
    return c.name?.[state.lang] || c.name?.uz || key;
  }

  function catBlurb(key) {
    const c = category(key);
    return c.blurb?.[state.lang] || c.blurb?.uz || '';
  }

  function categoryImage(key) {
    return category(key).image || '/assets/img/box.svg';
  }

  function unit(key) {
    return UNITS[key]?.[state.lang] || key || '';
  }

  function status(key) {
    return STATUSES[key]?.[state.lang] || key;
  }

  function statusHint(key) {
    const s = STATUSES[key];
    if (!s) return '';
    return state.lang === 'ru' ? s.hintRu : s.hintUz;
  }

  function formatPrice(value) {
    const n = Number(value) || 0;
    const formatter = new Intl.NumberFormat('ru-RU');
    return `${formatter.format(n).replace(/[\u00A0\u202F]/g, ' ')} ${state.lang === 'ru' ? 'сум' : "so'm"}`;
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatDate(iso, { withTime = true, short = false } = {}) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Tashkent',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(date);
    const pick = (type) => parts.find((p) => p.type === type)?.value || '';
    const day = Number(pick('day'));
    const month = Number(pick('month'));
    const year = pick('year');
    const hour = pick('hour') === '24' ? '00' : pick('hour');
    const minute = pick('minute');

    if (state.lang === 'ru') {
      const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
      if (short) return `${pad(day)}.${pad(month)}.${year}`;
      return `${day} ${monthsRu[month - 1]}${withTime ? `, ${hour}:${minute}` : ''}`;
    }
    if (short) return `${pad(day)}.${pad(month)}.${year}`;
    return `${day} ${MONTHS_UZ[month - 1]}${withTime ? `, ${hour}:${minute}` : ''}`;
  }

  function formatDateTime(iso) {
    return formatDate(iso, { withTime: true });
  }

  function toLocalInput(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function fromLocalInput(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function itemCount(n) {
    if (state.lang === 'ru') {
      const mod10 = n % 10;
      const mod100 = n % 100;
      let word = 'товаров';
      if (mod10 === 1 && mod100 !== 11) word = 'товар';
      else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = 'товара';
      return `${n} ${word}`;
    }
    return `${n} ta mahsulot`;
  }

  function orderCount(n) {
    if (state.lang === 'ru') {
      const mod10 = n % 10;
      const mod100 = n % 100;
      let word = 'заказов';
      if (mod10 === 1 && mod100 !== 11) word = 'заказ';
      else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = 'заказа';
      return `${n} ${word}`;
    }
    return `${n} ta buyurtma`;
  }

  document.documentElement.lang = state.lang;

  window.AB = {
    t,
    setLang,
    get lang() {
      return state.lang;
    },
    applyTranslations,
    setCategories,
    get categories() {
      return runtimeCategories;
    },
    units: UNITS,
    statuses: STATUSES,
    category,
    catName,
    catBlurb,
    categoryImage,
    unit,
    status,
    statusHint,
    price: formatPrice,
    formatDate,
    formatDateTime,
    toLocalInput,
    fromLocalInput,
    esc,
    itemCount,
    orderCount,
    pad
  };
})();
