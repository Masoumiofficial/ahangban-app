# راهنمای نصب و Rollback — افزونهٔ AhangBan App API (ahangban/v2)

> **فقط در محیط تست (Muhit).** هیچ تغییری بدون تأیید کتبی روی سایت اصلی، دیتابیس تولید یا ربات فعال اعمال نشود.

## نصب در محیط تست
1. پوشهٔ `wp-plugin/ahangban-app-api/` را در `wp-content/plugins/` 환경 تست کپی کنید.
2. در پیشخوان وردپرس → افزونه‌ها → «AhangBan App API» را **فعال** کنید ( żyje option پیش‌فرض ساخته می‌شود).
3._flush: 阿درس `https://TEST/wp-json/ahangban/v2/config` را باز کنید؛ باید JSON تنظیمات عمومی برگردد.
4. تست‌های خودکار: `php wp-content/plugins/ahangban-app-api/tests/run-tests.php` (باید `ALL TESTS PASSED`).

## Rollback
- غیرفعال‌سازی افزونه تمام routeهای `ahangban/v2` را حذف می‌کند ( هيچ تغییری در داده‌های موجود نمی‌دهد؛ فقط یک option добавía می‌کند که با حذف دستی `ahangban_app_settings` و `ahangban_app_cache_version` پاک می‌شود).
- سازگاری: با قالب `javan-seda` و افزونهٔ `ahangban-connector` تداخلی ندارد (namespace و option جدا).

##注意事项 امنیتی
- API عمومی read-only است؛ بدون توکن ربات؛ rate limit ۱۲۰ درخواست/دقیقه/IP؛ کش ۵ دقیقه‌ای.
- ماژول پیشخوان فقط با `manage_options` قابل دسترس است و POST آن nonce دارد.
