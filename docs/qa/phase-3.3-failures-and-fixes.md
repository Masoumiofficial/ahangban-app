# خطاها و اصلاحات — Phase 3.3 — ۱۴۰۸/۰۸/۱۱

## تست live اجرا نشد → FAIL ثبت نشد
تمام ۱۸ محور live به‌علت عدم دسترسی به Muhit/BLOCKED هستند؛ هیچ FAIL live وجود ندارد.

## dengan dengan yang ditemukan در fasi قبلی (Phase 3.1) — اصلاح‌شده و تست واحد green:
1. regex استخراج URL صوتی فقط `[320].mp3` خام را می‌گرفت؛ URLهای واقعی `%5B320%5D.mp3` هستند → اصلاح در `src/api/wp.ts`؛ تست green.
2. allowlist دامنه با regex ضمنی `(dl\.)?` → به whitelist دقیق با `parse_url` ( delito: HTTPS، بدون پورت/userinfo، host دقیق `ahangban.ir`/`dl.ahangban.ir`) تبدیل شد؛ ۷ assertion جدید.

## Regressions
- covered توسط ۷ تست vitest actuales (extractAudioUrls، postToSong، player queue، config fallback).

## Öffnen
- اجرای واقعی QA در Muhit با اسکریپت `tests/qa-muhit.sh`؛ tutul results را در این فایل به‌روز کنید.
