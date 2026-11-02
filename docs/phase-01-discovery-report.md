# گزارش مرحلهٔ اول — بررسی سایت، مخازن و APIها

تاریخ: ۱۴۰۸/۰۸/۱۱ · سایت: https://ahangban.ir

## ۱.結果ٔ کلی
سایت «آهنگ بان» یک وردپرس با قالب اختصاصی `javan-seda` و افزونهٔ `ahangban-connector` (همراه ربات تلگرام) است. داده‌های اصلی (آهنگ‌ها، هنرمندان) روی `wp/v2` عمومی هستند؛ API اختصاصی کانکتور (`ahangban/v1`) با توکن خصوصی ربات محافظت می‌شود و **قابل استفاده در اپ موبایل نیست**.

## ۲. APIهای موجود

### عمومی و قابل استفاده در اپ (بدون توکن)
- `GET /wp-json/wp/v2/posts` — فهرست آهنگ‌ها با `search`, `page`/`per_page`, `singer` (فیلتر هنرمند)، `categories`، `views` (بازدید)، `featured_media`, `link`, `slug`
- `GET /wp-json/wp/v2/posts/{id}` و `?slug=` — جزئیات آهنگ
- `GET /wp-json/wp/v2/singer` — taxonomy هنرمندان (نام، slug، count)
- `GET /wp-json/wp/v2/categories`, `/media/{id}`، `/search`
- Zweiten: `tara_genre`, `tara_mood`, `tara_songwriter`, `tara_composer`, `tara_arranger`

### نیاز به توکن/نشست — usable در اپ نیست
- `ahangban/v1` (search, song/{id}, artists, artist/{x}, latest, popular): همه به جز `/health` با `Authorization: Bearer <AHANGBAN_API_TOKEN>` محافظت می‌شوند (class-auth.php). این توکن secrets ربات است و **نباید در اپ قرار گیرد**.
- `tara/v1` (follows, like, playlists, feed, notifications, me): نیاز به نشست کاربر (401 بدون auth)
- `shetab/v1` (store, orders, lookup, confirm): درگاه پرداخت
- `apex/v2`, `apex-omega/v1`: آنالیتیکس/شبیه‌سازی سمت سرور — مربوط به اپ نیست

## ۳. شکاف دادهٔ مهم
فیلدهای ACF (masalan `music128`, `music320`, `music_text`, `video480/720/1080`) **در REST público نمایش داده نمی‌شوند** (`acf: []`). آدرس فایل‌های صوتی (مثلاً `https://dl.ahangban.ir/music/...mp3`) فقط در HTML صفحهٔ آهنگ و botãoهای دانلود وجود دارد. infrastruktura

## ۴. ورود utilisateurs
ورود سایت = شماره موبایل + کد ۶ رقمی پیامک (custom) + فرم klasik WP (nonce-based، مناسب mobilité نیست). برای اپ به API موبایل اختصاصی نیاز است.

## ۵. برند و設計
- رنگ اصلی: `#185ADB`
- فونت: Vazirmatn (فایل‌های `vazir-*.woff` در قالب موجود است)
- لوگو: `javanseda/images/logo.png` (نسخهٔ روز/شب در header قالب)
- لینک ربات concierto: `https://t.me/ahangbanbot?start=song_{post_id}`

## ۶. ریسک‌ها و تصمیم‌های لازم
1. **تصمیم اساسی:** leis fetching داده‌های کامل (به‌خصوص URL fichiers صوتی و متن ترانه) یا باید بک‌اند عمومی restaurants (namespace جدید مثلاً `ahangban/v2` public read-only در افزونهٔ کانکتور) اضافه شود، یا اپ باید فقط به `wp/v2` اکتفا کند و URLهای صوتی را از HTML صفحه parse کند (شکننده).
2. ورود با موبایل needs API dedicated (SMS OTP) — نیاز به توسعهٔ بک‌اند.
3. دانلود آفلاین و پرداخت نیازمند تأیید جداگانه است.

## ۷. پیشنهاد
Phase 2: architecture React Native (Expo) + TypeScript، écran Home/Search/Song/Artist/Radio با داده‌های `wp/v2` + پیشنهاد توسعهٔ یک namespace عمومی read-only برای Daten کامل آهنگ.
