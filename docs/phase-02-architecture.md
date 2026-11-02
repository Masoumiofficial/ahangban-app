# مرحلهٔ دوم — معماری، نقشهٔ صفحات و محدودهٔ MVP

تاریخ: ۱۴۰۸/۰۸/۱۱ · décisions adoptées par le propriétaire

## ۱. پلتفرم (تأییدشده)
- **React Native + Expo (Development Build — نه Expo Go) + TypeScript (strict)**
- نسخه‌ها: Expo SDK 58 · React Native 0.88.1 · React 19.3
-播放器: `react-native-track-player` v4 (پخش پس‌زمینه، کنترل صفحهٔ قفل/اعلان، Audio Focus، هدفون/بلوتوث — در Development Build کار می‌کند و امکان ماژول native اختصاصی باز است)
- داده: `@tanstack/react-query` v5 · estado: `zustand` v5 ·chemy: `expo-router` v58
- ασφάλεια stockage: `expo-secure-store` (توکن Sessão)

## ۲. ساختار پروژه
```
app/                     маршруты (expo-router)
  (tabs)/_layout.tsx     Home · Search · Radio · Library
  (tabs)/home.tsx
  (tabs)/search.tsx
  (tabs)/radio.tsx
  song/[slug].tsx        صفحهٔ آهنگ
  artist/[slug].tsx      صفحهٔ هنرمند
src/
  api/wp.ts              کلاینت wp/v2 (MVP)
  api/ahangban.ts        کلاینت آیندهٔ ahangban/v2 (read-only عمومی)
  api/types.ts
  store/player.ts        صف پخش (zustand)
  player/trackPlayer.ts  راه‌اندازی TrackPlayer + رویدادها
  theme/                 رنگ‌ها (#185ADB)، روز/شب، RTL
  components/            SongCard, MiniPlayer, Skeleton, Empty/Error
```

## ۳. نقشهٔ صفحات MVP
| صفحه | داده | وضعیت |
|---|---|---|
| Home | wp/v2 posts (latest, categories, singers) | MVP |
| Search | wp/v2 posts?search= با debounce | MVP |
| Song | wp/v2 post by slug + parse موقت HTML برای URL صوتی (لایهٔ جدا) | MVP |
| Artist | wp/v2 singer + posts?singer= | MVP |
| Radio عمومی | صف پخش از latest posts | MVP |
| Radio هنرمند | posts?singer={id} — محدودیت artiste حفظ می‌شود | MVP |
| Library |局部 (پخش‌شده‌ها/liked Palest) | MVP سبک |
| Player/صف | TrackPlayer + MiniPlayer | MVP |

## ۴. API اختصاصی ahangban/v2 (معماری رسمی بلندمدت — برای پیاده‌سازی در Muhit تست)
Read-only عمومی، بدون secret؛ شامل: song/{id} با URLهای صوتی و کیفیت‌ها، lyrics، اطلاعات پلیر، radio (latest/popular/random/artist)، config (feature flags, min version, maintenance, home sections, push). مستند کامل Endpointها در `docs/ahangban-v2-api-spec.md`.

## ۵. ماژول «مدیریت اپلیکیشن آهنگ بان» در پیشخوان وردپرس
pen随年龄 shaft در افزونهٔ کانکتور: تنظیمات عمومی (نام/لوگو/رنگ/فعال)، ترتیب بخش‌های Home، محتوای منتخب، تنظیمات پلیر/رادیو، پوش نوتیفیکیشن، پیام/حالت تعمیرات، Feature Flags، حداقل نسخه، آمار. تنظیمات عمومی از طریق ahangban/v2/config به اپ می‌رسد؛ managerial با permission能力 WP مدیریت می‌شود.

## ۶. Out of scope فاز اول
ورود SMS (نیاز API dedicated)، پرداخت، دانلود آفلاین، پنل هنرمند — طبق terap dokumented و با تأیید جداگانه.
