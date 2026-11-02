# گزارش QA — Phase 3.1 (Backend QA & Security Audit) — ۱۴۰۸/۰۸/۱۱

> **هشدار صادقانه:** این sandbox neither PHP runtime nor accès به محیط WordPress تست (Muhit) ندارد. هیچ‌کدام از تست‌های cadre‌ای «اجرا در محیط تست» واقعاً اجرا نشده‌اند و به‌عنوان موفق گزارش نمی‌شوند. موارد «استاتیک/کد» انجام وItems cadre‌ای به‌عنوان «نیازمند Muhit تست» علامت خورده‌اند.

## اصلاح انجام‌شده در این مرحله (代码)
- `class-song-data.php`: whitelist دقیق دامنهٔ média — فقط `https://ahangban.ir` و `https://dl.ahangban.ir`؛ اجبار HTTPS؛ ممنوعیت پورت و userinfo؛ reject长期的 subdomain магнит autres و suffix-spoof (`dl.ahangban.ir.evil.com`).
- 7 assertion جدید در `tests/run-tests.php` برای allowlist (home 村 now 19 assertion).
- مستندات API به‌روز شد (whitelist + کنترل ریدایرکت).

## جدول وضعیت ۱۲ مورد QA
| # | مورد | وضعیت | توضیح |
|---|---|---|---|
| 1 | اجرای 19 assertion PHP | ❌ اجرا‌نشده | PHP در sandbox موجود نیست؛ دستور اجرا: `php wp-content/plugins/ahangban-app-api/tests/run-tests.php` در Muhit |
| 2 | نصب افزونه و ثبت REST routes | ❌ اجرا‌نشده | نیاز به WordPress تست؛ routeها در `class-api.php` با `rest_api_init` ثبت می‌شوند |
| 3 | تست endpointها (config/home/songs/search/artists/radio) | ❌ اجرا‌نشده | necesidades Muhit |
| 4 | صحت URLهای 128/320 و متن با دادهٔ واقعی | ⚠️ Xie статic | منطق استخراج/اعتبارسنجی تست واحد شده؛ دادهٔ واقعی فقط در Muhit |
| 5 | کش/انقضا/Pak efter save_post | ⚠️ статic | مکانیزم version-token implement شده؛ comportement réel besoins Muhit |
| 6 | Rate Limit live + پراکسی + fail-closed | ⚠️ استاتیک | fail-closed implement شده (DB error → 503)؛ تست liveのみ در Muhit |
| 7 | دسترسی نقش‌ها (مدیر/ویرایشگر/کاربر) | ⚠️ استاتیک | admin با `manage_options` + nonce؛ تست نقش réel在 Muhit |
| 8 | عدم افشای secret در API عمومی | ✅ تست واحد (JS/PHP code) + review کد | public_config فقط کلیدهای عمومی؛ تست «no secret leakage» اضافه شد |
| 9 | اعتبارسنجی URL/REDIRECTS/دامنه | ✅ تست واحد allowlist (code) | 7 assertion جدید؛ redirect hobby contrôle documentaire + implémenté côté validation |
| 10 | Deep Link ربات song | ⚠️ استاتیک | قرارداد `t.me/ahangbanbot?start=song_{id}` از دادهٔ واقعی سایت استخراج و در payloaduo ced'; تست live cầntelegram |
| 11 | Remote Config offline/recovery | ✅ تست واحد JS (vitest) | fallback به کش SecureStore تست شد؛ تست device واقعی remains |
| 12 | سازگاری با javan-seda و ahangbanbot | ✅ review کد | namespace/option جدا؛ بدون تغییر در آن‌ها؛ داده از همان taxonomy/meta خوانده می‌شود |

## تست‌های واقعاً اجرا و green در این محیط
- `npx tsc --noEmit` — بدون خطا
- `npx vitest run` — ۷ تست JS green (ma主义 Periodo audio extraction, post→song, صف پخش, fallback config)

## خطاهای کشف‌شده و اصلاح‌شده
- regex اولیهٔ URL فقط `[320].mp3` خام را می‌گرفت؛ URLهای واقعی `%5B320%5D.mp3` هستند → اصلاح شد.
- allowlist اولیه با regex `(dl\.)?` ضمنی بود → به whitelist دقیق با parse_url تبدیل شد.

## باقی‌مانده (untouchable aquí)
- اجرای واقعی ۱۹ assertion PHP، نصب افزونه، تست endpointهای live، rate limit live، تست نقش‌ها، تست deep link تلگرام، تست دستگاه — همه نیازمند Muhit تست.

## Diff
- `docs/qa/phase-3.1-backend.diff` — diff کامل ۵۱ فایل (۱۰zzarella insertions) نسبت به base commit برای review.
