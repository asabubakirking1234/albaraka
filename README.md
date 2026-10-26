# Al Baraka Qurilish Mollari

Toshkent, Chilonzordagi **qurilish mollari do'koni uchun onlayn katalog va buyurtma tizimi**.
Sayt ikki tilda — **o'zbekcha va ruscha**.

Buyurtmani ikki usulda olish mumkin:

- **Olib ketish** — mijoz do'kondan o'zi oladi.
- **Haydovchi orqali yetkazish** — mijoz haydovchiga qo'ng'iroq qilib, vaqt, manzil va narxni kelishadi. Do'kon yetkazishni o'zi tashkil qilmaydi va haydovchi narxi buyurtma summasiga kirmaydi.

Sayt manzili (local): **http://127.0.0.1:3000**
Sotuvchi paneli: **http://127.0.0.1:3000/admin**

---

## 1. Sotuvchi paneli uchun kirish

| | |
|---|---|
| Login | `admin` |
| Parol | `albaraka2026` |

> Birinchi kirishdan keyin **Sozlamalar → Parolni o'zgartirish** bo'limida parolni albatta almashtiring.
> Login/parolni birinchi ishga tushirishda `ADMIN_USERNAME` va `ADMIN_PASSWORD` muhit o'zgaruvchilari orqali ham berish mumkin.

---

## 2. Mijoz uchun imkoniyatlar

- O'zbek va rus tilidagi to'liq interfeys; tanlov brauzerda saqlanadi.
- Kategoriyalar **dinamik**: sotuvchi ularni qo'shadi, nomini o'zgartiradi yoki o'chiradi.
- Mahsulot kartochkasida **narx, o'lchov birligi va ombordagi aniq qoldiq**.
- Qidiruv, kategoriya filtri, narx/nom bo'yicha saralash.
- Savat: miqdorni oshirish/kamaytirish, qoldiqdan oshirib bo'lmaydi.
- Buyurtma formasi:
  - ism, telefon, manzil/tuman, izoh;
  - **olib ketish** yoki **haydovchi orqali yetkazish**;
  - kutilayotgan vaqt.
- Yetkazish tanlansa, faol **haydovchilar ro'yxati va telefon raqamlari** ko'rinadi; mijoz qo'ng'iroq qilib kelishadi.
- Buyurtma yuborilgach **buyurtma raqami** beriladi.
- **Buyurtmani tekshirish**: raqam + telefon orqali holat, vaqt, haydovchi va tarkibni ko'rish.
- Mobil telefon va kompyuterda moslashgan dizayn.
- To'lov saytda emas — to'lov do'konda naqd/karta orqali.

---

## 3. Sotuvchi paneli

### Buyurtmalar
- Yangi / tasdiqlangan / tayyor / yakunlangan / bekor qilingan buyurtmalar.
- Har bir buyurtmada:
  - buyurtma raqami va vaqti;
  - mijoz ismi, telefoni, manzili;
  - **olib ketish yoki yetkazish** belgisi;
  - tanlangan **haydovchi ismi va telefoni**;
  - mahsulotlar tarkibi va jami summa.
- **Olib ketish/yetkazish vaqtini sotuvchi o'zgartiradi.**
- Holatni bir tugma bilan yangilash.
- Buyurtma bekor qilinsa, mahsulotlar omborga avtomatik qaytadi.
- Yangi buyurtmalar 25 sekundda avtomatik yangilanadi.

### Mahsulotlar
- Qo'shish, tahrirlash, arxivlash/qaytarish.
- Nomi va tavsifi ikki tilda.
- Kategoriya, o'lchov birligi, narx, qoldiq, rasm.
- Rasm JPG/PNG/WebP, 3 MB gacha; brauzer avtomatik siqadi.
- Qoldiqni jadvalda `−` / `+` bilan tez o'zgartirish.
- **Kategoriyalar** tugmasi orqali:
  - yangi kategoriya qo'shish;
  - nomi, izohi va rasmini o'zgartirish;
  - bo'sh kategoriyani o'chirish.
  - Agar kategoriyada mahsulot bo'lsa, o'chirish bloklanadi — avval mahsulotlarni boshqa kategoriyaga o'tkazish kerak.

### Haydovchilar
**Sozlamalar → Yetkazib berish haydovchilari**:
- haydovchi qo'shish: ismi, telefoni, hududi, izohi;
- tahrirlash, o'chirish;
- mijozlarga ko'rinishini yoqish/o'chirish.

**Muhim:** haydovchi qo'shilmaguncha mijozlarda «Haydovchi orqali» varianti o'chirilgan bo'ladi. Avval haydovchilarni kiriting.

### Sozlamalar
- telefonlar, manzil (uz/ru), mo'ljal, ish vaqti;
- buyurtma izohi;
- parolni almashtirish.

---

## 4. Ishga tushirish

Talab: **Node.js 18+**. Tashqi npm paketlari yo'q.

```powershell
cd C:\Users\User\Documents\deepseek-harness\default-workspace
node server.js
```

yoki:

```powershell
npm start
```

Brauzerda:

- Sayt: http://127.0.0.1:3000
- Sotuvchi paneli: http://127.0.0.1:3000/admin

Portni o'zgartirish:

```powershell
$env:PORT=8080; node server.js
```

Boshqa qurilmalardan (telefonda) kirish:

```powershell
$env:HOST="0.0.0.0"; node server.js
```

So'ng `http://<kompyuter-IP>:3000` ga kiring. Windows Firewall ruxsat so'rashi mumkin.

---

## 5. Dastlabki sozlash (tavsiya etiladi)

1. `/admin` ga kiring.
2. **Sozlamalar**:
   - telefonlar, manzil, mo'ljal, ish vaqti;
   - buyurtma izohini kiriting.
3. **Sozlamalar → Haydovchilar**:
   - ishlaydigan haydovchilarni qo'shing (ism, telefon, hudud);
   - ular mijozlarga shu telefon orqali ko'rinadi.
4. **Parolni o'zgartirish**.
5. **Kategoriyalar**:
   - kerakli bo'limlarni qo'shing;
   - mavjudlarini tahrirlang;
   - bo'sh va keraksizlarini o'chiring.
6. **Mahsulotlar**: narx, qoldiq va rasmlarni o'zingizga moslang.
7. Sinov buyurtmasi bering va panelda tekshiring.

> Saytdagi telefon va manzil — namuna. Ularni albatta o'zgartiring.
> Barcha narxlar so'mda kiritiladi.

---

## 6. Kategoriyalar bilan ishlash

**Mahsulotlar → Kategoriyalar**:

- **Kategoriya qo'shish** — o'zbekcha/ruscha nom, qisqa izoh, rasm.
- **Tahrirlash** — nom, izoh, rasmni almashtirish.
- **O'chirish** — faqat kategoriyada mahsulot bo'lmasa.
- Yangi kategoriya saytda katalog va filtrda darhol ko'rinadi (mijoz sahifasi yangilanganda yoki 60 sekund ichida).
- Mahsulot qo'shishda kategoriya ro'yxati avtomatik yangilanadi.
- Kategoriya o'chirilganda uning yuklangan rasmi ham tozalanadi.

---

## 7. Haydovchilar va yetkazib berish

1. **Sozlamalar → Haydovchilar → Haydovchi qo'shish**.
2. Ism, telefon, hudud va izoh kiriting; «Mijozlarga ko'rinadi» belgilangan bo'lsin.
3. Mijoz saytda:
   - **Haydovchi orqali** ni tanlaydi;
   - haydovchilar ro'yxatidan qo'ng'iroq qiladi;
   - vaqt, manzil va narxni kelishadi;
   - buyurtmada qaysi haydovchi bilan kelishganini tanlashi mumkin (ixtiyoriy).
4. Sotuvchi buyurtmada haydovchi ismi/telefonini ko'radi.
5. Buyurtma vaqti kerak bo'lsa sotuvchi tomondan o'zgartiriladi.

Cheklovlar:
- Haydovchi faol bo'lmasa, mijoz ro'yxatda ko'rmaydi.
- Faol haydovchi bo'lmasa, yetkazish varianti bloklanadi.
- Haydovchi narxi saytda hisoblanmaydi va buyurtma summasiga qo'shilmaydi.
- Haydovchi o'chirilsa ham, eski buyurtmalardagi uning ma'lumotlari saqlanadi.

---

## 8. Ma'lumotlar va zaxira nusxa

```
data/db.json               — mahsulotlar, kategoriyalar, haydovchilar, buyurtmalar, sozlamalar, admin parol hash
public/uploads/            — yuklangan mahsulot va kategoriya rasmlari
```

- `data/db.json` va `public/uploads/` ni zaxiralang.
- Sayt ishlab turgan paytda faylni qo'lda tahrirlamang.
- To'liq tozalab, boshlang'ich katalogga qaytish uchun: serverni to'xtatib, `data/db.json` ni o'chiring, so'ng `node server.js` ni qayta ishga tushiring. **Diqqat: barcha buyurtmalar, kategoriyalar, haydovchilar va sozlamalar o'chadi.**
- Admin parolni unutib qo'ysangiz, `data/db.json` dagi `admin` qismini o'chirib, serverni qayta ishga tushiring. Avval zaxira nusxa oling.

Boshlang'ich holatda haydovchilar ro'yxati bo'sh bo'ladi — ularni o'zingiz qo'shasiz.

---

## 9. Texnik tuzilish

```
server.js                  — Node HTTP server, barcha API
lib/db.js                  — JSON saqlash, parol hash (scrypt), boshlang'ich ma'lumotlar
lib/auth.js                — sessiyalar, cookie, login limiting
seed.js                    — boshlang'ich kategoriyalar, mahsulotlar, sozlamalar
public/index.html          — mijoz sayti
public/admin.html          — sotuvchi paneli
public/assets/css/         — main.css, admin.css
public/assets/js/          — i18n.js, app.js, admin.js
public/assets/img/         — brend va mahsulot SVG rasmlari
public/uploads/            — yuklangan rasmlar
data/db.json               — yaratilgan ma'lumotlar bazasi
```

API qisqacha:

- `GET /api/catalog` — mahsulotlar, kategoriyalar, faol haydovchilar, sozlamalar.
- `POST /api/orders`, `GET /api/orders/track?code=...&phone=...`
- `POST /api/login`, `POST /api/logout`, `GET /api/me`
- `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/:id`
- `POST /api/admin/products/:id/stock`
- `GET/POST /api/admin/categories`, `PUT/DELETE /api/admin/categories/:id`
- `GET/POST /api/admin/drivers`, `PUT/DELETE /api/admin/drivers/:id`
- `GET /api/admin/orders`, `PATCH /api/admin/orders/:id`
- `GET/PUT /api/admin/settings`, `POST /api/admin/password`

Server tashqi paketlardan foydalanmaydi. Node 18+ yetarli.

---

## 10. GitHub va internetga chiqarish

**Muhim:** GitHub Pages faqat statik fayllarni ko'rsatadi. Bu loyihada Node.js server, login, buyurtmalar bazasi va admin panel bor — shuning uchun GitHub Pages'da to'liq ishlamaydi.

To'g'ri yo'l:

1. Kodni GitHub repository'ga yuklang.
2. Repository'ni **Render**, **Railway** yoki **VPS** kabi Node.js hostingga ulang.
3. Start buyrug'i: `node server.js`; muhit: `HOST=0.0.0.0`, `PORT=3000`.
4. `data/` va `public/uploads/` uchun doimiy disk (persistent volume) ajrating — aks holda restartda buyurtmalar va rasmlar yo'qoladi.
5. HTTPS o'rnatilgach `SECURE_COOKIES=1` qo'shing.
6. Standart parolni almashtiring.

VPS + Nginx:

1. Fayllarni serverga ko'chiring.
2. `node server.js` ni `pm2` yoki `systemd` orqali doimiy ishlatib turing.
3. Nginx orqali `https://domen.uz` ni `127.0.0.1:3000` ga proxylang.
4. HTTPS o'rnatilgach `SECURE_COOKIES=1` muhit o'zgaruvchisini qo'shing.
5. `data/` va `public/uploads/` ni zaxiralash jadvalini sozlang.
6. Standart parolni birinchi kundanoq almashtiring.

Onlayn to'lov yo'q. Buyurtma qabul qilinadi, to'lov do'konda amalga oshiriladi. Payme/Click/Uzum kerak bo'lsa, alohida integratsiya qo'shiladi.

---

## 11. Tillar va matnlar

Barcha interfeys matnlari `public/assets/js/i18n.js` faylida: `DICT.uz` va `DICT.ru`.
Kategoriya nomlari va tavsiflari bazada ikki tilda saqlanadi va admin panelda tahrirlanadi.
Haydovchi ismi/telefoni — bitta kiritish; hudud va izoh ham bitta tilda kiritiladi.

---

## 12. Tekshirilgan stsenariylar

- Kategoriya qo'shish, tahrirlash, rasm yuklash.
- Mahsuloti bor kategoriyani o'chirishni bloklash.
- Yangi kategoriyada mahsulot yaratish.
- Haydovchi qo'shish, tahrirlash, faolsizlantirish, o'chirish.
- Haydovchi bo'lmasa yetkazish variantini bloklash.
- Yetkazish buyurtmasi: haydovchini tanlash, buyurtma berish, panelda va kuzatuvda ko'rish.
- Buyurtma bekor qilinsa qoldiqning qaytishi.
- O'zbek/rus tillari, mobil va desktop ko'rinishlari.
- Login, parolni almashtirish, sessiya tugashi.
