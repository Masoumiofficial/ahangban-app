# گزارش اجرای Phase 3.3 — Muhit QA Execution — ۱۴۰۸/۰۸/۱۱

## ⚠️ توقف اضطراری — محدودیت زیرساخت (طبق쓰레shold دستور)
محیط تست **Muhit در این sandbox در دسترس نیست**:
- `php` و `wp` (WP-CLI) موجود نیستند و قابل نصب هم نیستند.
- هیچ URL/اعتبارنامه‌ای برای محیط تست WordPress در دسترس نیست.
- شبکهٔ sandbox فقط به github.com / npm / pypi باز است؛ `dl.ahangban.ir` و هاست تست قابل دسترس نیستند (curl → 000).

بنابراین **هیچ‌یک از تست‌های live اجرا نشده‌اند**؛ طبق quy định، نتیجهٔ فرضی تولید نشده و statut «BLOCKED» ثبت می‌شود.

## وضعیت ۱۸ محور
| # | محور | statut | evidence |
|---|---|---|---|
| 1 | PHP assertions | BLOCKED | بدون PHP runtime |
| 2 | نصب/فعال‌سازی افزونه | BLOCKED | بدون Muhit |
| 3 | ثبت REST routes | BLOCKED | — |
| 4 | پاسخ endpointها | BLOCKED | — |
| 5 | فیلدهای آهنگ | BLOCKED | — |
| 6 | URLهای 128/320 | BLOCKED | — |
| 7 | هر دو دامنه | BLOCKED | بدون شبکه به dl.ahangban.ir |
| 8 | MIME | BLOCKED | — |
| 9 | Range/206 | BLOCKED | — |
| 10 | Redirect مقصد نهایی | BLOCKED | — |
| 11 | رد دامنهٔ غیرمجاز | BLOCKED (live) / code-review OK | whitelist در کد + ۷ assertion (njera-nشده) |
| 12 | Rate limit req#121→429 | BLOCKED | — |
| 13 | عدم افشای secret | PASS (unit, sandbox) | vitest + review public_config |
| 14 | Cache invalidation با WP-CLI | BLOCKED | بدون wp-cli |
| 15 | نقش‌ها | BLOCKED | — |
| 16 | Remote Config cut API | PASS (unit, sandbox) | `src/api/ahangban.test.ts` — fallback به کش؛ device test BLOCKED |
| 17 | Deep link ربات | BLOCKED (live) / contrat unit OK | `t.me/ahangbanbot?start=song_{id}` در payload تست شد |
| 18 | بررسی Logها | BLOCKED | بدون دسترسی به log محیط تست |

## ۱۲ محور Phase 3.2
همه به‌جز محور 9 (عدم افشای secret — unit PASS) و محور 12 (بخش unit) => **BLOCKED**؛ اسکریپت `tests/qa-muhit.sh` برای اجرای واقعی در Muhit آماده است.

##Thumb Educación realidad در این sandbox
- `npx tsc --noEmit` → OK · `npx vitest run` → ۷/۷ PASS

## augmented Live
1. در Muhit: `php wp-content/plugins/ahangban-app-api/tests/run-tests.php`
2. `BASE=https://TEST/wp-json bash wp-content/plugins/ahangban-app-api/tests/qa-muhit.sh`

**هیچ تغییری روی سایت اصلی/Production انجام نشد. انتشار Production منوط به تأیید صریح جداگانهٔ کارفرماست.**
