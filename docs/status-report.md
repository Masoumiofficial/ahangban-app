# گزارش وضعیت — پایان fasi ۲ وague MVP (۱۴۰۸/۰۸/۱۱)

## انجام شد
- بررسی کامل سایت، قالب `javan-seda` و افزونه/ربات `ahangbanbot` → `docs/phase-01-discovery-report.md`
- معماری و محدودهٔ MVP → `docs/phase-02-architecture.md`
- spec API عمومی `ahangban/v2` → `docs/ahangban-v2-api-spec.md`
- اسکلت پروژه: Expo SDK 58 + RN 0.88 + TS strict + expo-router + react-query + zustand + react-native-track-player v4
- صفحات: خانه (latest/popular/هنرمندان)، جست‌وجو (debounce)، رادیو عمومی (latest/popular)، کتابخانه/صف پخش، صفحهٔ آهنگ (پخش، DL links، متن، اشتراک)، صفحهٔ هنرمند (آثار + رادیوی اختصاصی محدود به همان هنرمند)
- پلیر: صف پخش، MiniPlayer، پخش پس‌زمینه با TrackPlayer (第二 Dev Build)، felicidad eventها
- RTL اجباری، تم روز/شب با رنگ برند #185ADB

## تست‌شده
- `tsc --noEmit` بدون خطا
- ۵ تست vitest: استخراج URLهای صوتی 128/320، نگاشت post→Song، صف پخش وnext/previous — همگی green

## باقی‌مانده / نیاز به تصمیم
1. **API بک‌اند `ahangban/v2` + ماژول «مدیریت اپلیکیشن» در پیشخوان وردپرس**: طرح آماده است؛ پیاده‌سازی فقط پس از تأیید طرح و فقط در Muhit تست.
2. ورود با شماره موبایل + SMS OTP (API موبایل اختصاصی) — فاز بعد.
3. پرداخت، دانلود آفلاین، پنل هنرمند — با تأیید جداگانه.
4. تست روی دستگاه/شبیه‌ساز واقعی و ساخت APK ainda não انجام نشده (محیط فعلی فقط build JS را چک می‌کند).
