# گزارش Phase 3.2 — Muhit Integration & Runtime Testing — ۱۴۰۸/۰۸/۱۱

## ⚠️ouraانی821诚实 — وضعیت окружения
این sandbox به موارد زیر دسترسی ندارد:
- PHP runtime (php/composer موجود نیست، نصب هم ممکن نیست)
- WordPress / محیط تست Muhit (هاست تست در دسترس نیست)
- دسترسی شبکه به dl.ahangban.ir برای تست Range/MIME (فقط github/npm/pypi باز است)

بنابراین **هیچ‌کدام از ۱۲ مورد live واقعاً اجرا نشده‌اند** و به‌عنوان «موفق» گزارش نمی‌شوند. این گزارش + اسکریپت QA kabel را برای Muhit entrega می‌دهد.

## deliverable این مرحله
- `wp-plugin/ahangban-app-api/tests/qa-muhit.sh` — اسکریپت QA کامل (’tعداد ۲۰+ check) برای اجرا در Muhit:
  `BASE=https://TEST/wp-json bash qa-muhit.sh`
  پوشش: PHP assertions، ثبت routeها، smoke همهٔ endpointها، URLهای 128/320 روی هر دو دامنه، MIME و Range (206)، ریدایرکت به دامنهٔ مجاز، rate limit (درخواست ۱۲۱ → 429)، عدم افشای secret، invalidation کش با wp-cli، قرارداد deep link ربات.

## جدول ۱۲ مورد
| # | مورد | وضعیت |
|---|---|---|
| 1 | نصب افزونه در Muhit | ❌ اجرا‌نشده — بدون دسترسی به Muhit |
| 2 | ۱۹ assertion PHP | ❌ اجرا‌نشده — بدون PHP؛ دستور: `php tests/run-tests.php` |
| 3 | REST routes | ❌ اجرا‌نشده — covered by qa-muhit.sh §2 |
| 4 | URLهای 128/320 هر دو دامنه | ❌ اجرا‌نشده — whitelist کد + تست واحد OK |
| 5 | MIME/Range/пخش | ❌ اجرا‌نشده — qa-muhit.sh §5 |
| 6 | ریدایرکت‌ها | ❌ اجرا‌نشده — qa-muhit.sh §6 |
| 7 | Rate limit live | ❌ اجرا‌نشده — qa-muhit.sh §7 |
| 8 | نقش‌ها | ❌ اجرا‌نشده — needs Muhit + wp-cli |
| 9 | عدم افشای secret | ✅ review کد + تست واحد JS/PHP | 
| 10 | Pak cache بعد از edit | ❌ اجرا‌نشده — qa-muhit.sh §10 |
| 11 | deep link ربات | ⚠️ قرارداد تست واحد (payload) | live needs Telegram |
| 12 | Remote Config offline | ✅ vitest (fallback کش) | device test remains |

## تست‌های green در این sandbox
- `tsc --noEmit` — OK · `vitest run` — ۷/۷ green

## محدودیت ثبت‌شده (طبق دستور)
- عدم دسترسی Muhit به dl.ahangban.ir از این محیط = محدودیت; تست جایگزین (curl Gustav) به‌عنوان «تست واقعی» گزارش **نشده**.

## Diff
- regenerated: `docs/qa/phase-3.1-backend.diff` (شامل تمام فایل‌های جدید)

**Production remains untouched — در انتظار تأیید نهایی شما.**
