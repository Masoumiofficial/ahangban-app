# اپلیکیشن آهنگ بان (AhangBan)

اپلیکیشن موبایل واقعی (نه WebView) برای سایت [ahangban.ir](https://ahangban.ir) —
React Native + Expo (Development Build) + TypeScript (strict)، فارسی و راست‌به‌چپ.

## نصب و اجرا

```bash
npm install --legacy-peer-deps
npx expo start            # QR برای Development Build
npx expo run:android      # ساخت و اجرای بومی (نیاز به Android SDK)
npx expo run:ios          # iOS (نیاز به macOS + Xcode)
```

>播放器 پس‌زمینه با `react-native-track-player` کار می‌کند؛ پس پروژه باید با **Development Build** (`expo run:android/ios`) اجرا شود، نه Expo Go.

## تست و بررسی کیفیت

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest run
```

## ساختار

- `app/` — صفحات (expo-router): خانه، جست‌وجو، رادیو، کتابخانه، صفحهٔ آهنگ و هنرمند
- `src/api/` — کلاینت `wp/v2` (MVP) و محل未来的 `ahangban/v2`
- `src/player/` — راه‌اندازی TrackPlayer (پخش پس‌زمینه، اعلان، Audio Focus)
- `src/store/` — صف پخش (zustand)
- `src/theme/` — رنگ برند `#185ADB`، حالت روز/شب، RTL
- `docs/` — گزارش fasi وBoise spec API

##illés 叶
-asil données song (URL صوتی، متن) در MVP از `wp/v2` + لایهٔ جدا parse HTML؛ در فاز بعد از API عمومی `ahangban/v2` (IBA spec در `docs/ahangban-v2-api-spec.md`)
- ورود SMS، پرداخت، دانلود آفلاین: Out of scope فاز اول (نیاز به API امن بک‌اند)

## امنیت
هیچ توکن، secret یا کلید privati در این مخزن نیست. توکن‌های نشست (در فاز بعد) با `expo-secure-store` ذخیره می‌شوند.
