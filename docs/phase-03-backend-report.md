# گزارش پایان مرحلهٔ بک‌اند — ahangban/v2 + ماژول مدیریت اپ (۱۴۰۸/۰۸/۱۱)

> اجرا فقط در محیط تست Muhit؛ هیچ تغییری روی سایت اصلی/ دیتابیس تولید/ ربات فعال اعمال نشده است.

## ۱. فایل‌ها و بخش‌های تغییر‌یافته
- `wp-plugin/ahangban-app-api/` — افزونهٔ جدید وردپرس:
  - `ahangban-app-api.php` — bootstrap، ثابت‌ها، activation
  - `includes/class-api.php` — routeهای عمومی read-only
  - `includes/class-config.php` — تنظیمات + projeection عمومی/这是什么 Sanitize
  - `includes/class-song-data.php` — نگاشت داده (SONG payload) + reading meta/ACF
  - `includes/class-admin.php` — منوی «اپلیکیشن آهنگ بان» (manage_options + nonce)
  - `includes/class-rate-limit.php` — ۱۲۰ req/min/IP، fail-closed
  - `includes/class-cache.php` — کش transient با version token و invalidation روی save_post
  - `tests/run-tests.php` — تست مستقل (بدون وردپرس)، `tests/phpunit.xml`
  - `docs/INSTALL.md`، `docs/API.md` (نمونهٔ JSON)
- اپ: `src/api/ahangban.ts` — کلاینت v2 با fallback به últimas تنظیمات معتبر (SecureStore) + ۲ تست fallback

## ۲. Endpointهای پیاده‌سازی‌شده (نمونهٔ JSON در docs/API.md)
`GET /config` · `/home` · `/songs` (order/category/singer/page) · `/songs/{id}` · `/songs/by-slug/{slug}` · `/search?q=&type=` · `/artists` · `/artists/{slug}` · `/radio?source=` · `/radio/artist/{slug}` (محدود به همان هنرمند)

## ۳. امکانات پیشخوان
نام/لوگو/رنگ/فعال/تعمیرات، ترتیب بخش‌های Home، آهنگ‌های منتخب، منبع رادیو + autoplay، feature flags، mindestens version برای Android/iOS، اعلان‌ها — همگی از طریق option و بدون انتشار نسخهٔ اپ.

## ۴. تست‌ها
- ۷ تست vitest اپ (JS) — همه green؛ `tsc --noEmit` بدون خطا.
- ۱۲ assertion در `tests/run-tests.php` (PHP): clean_url (reject دامنهٔ خارجی/http)، SONG payload، sanitize تنظیمات، عدم افشای secret در public_config.
- **محدودیت صادقانه:** PHP در این sandbox موجود نیست؛ تست‌های PHP tại đây اجرا نشده‌اند و باید در Muhit تست با `php tests/run-tests.php` اجرا شوند. تست學 device/مelder واقعی هنوز انجام نشده.

## ۵. موارد ناقص
- stats در پیشخوان «در صورت وجود زیرساخت» — پیاده‌سازی نشده (منبع دادهٔ jóvenes現在 موجود نیست).
- ورود SMS و پرداخت همچنان خارج از فاز.
- قبل از انتقال به سایت اصلی، نیاز به اجرای تست‌های PHP و تست دستی API در محیط تست و تأیید شماست.
