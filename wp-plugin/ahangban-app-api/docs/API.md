# مستند API `ahangban/v2` — عمومی و read-only

Base: `https://<env>/wp-json/ahangban/v2` · همهٔ GET · Rate limit: ۱۲۰ req/min/IP · کش سرور: ۵ دقیقه

## GET /config — تنظیمات عمومی اپ (بدون نیاز به نسخهٔ جدید)
```json
{
  "app_name": "آهنگ بان",
  "logo": {"light": "", "dark": ""},
  "brand_color": "#185ADB",
  "enabled": true,
  "maintenance": false,
  "maintenance_message": "…",
  "min_versions": {"android": "1.0.0", "ios": "1.0.0"},
  "home_sections": ["latest", "popular", "artists"],
  "radio_source": "latest",
  "feature_flags": {"search": true, "radio": true, "artist_radio": true, "share": true, "download": false, "login": false},
  "notifications": [{"title": "…", "body": "…", "link": ""}]
}
```

## GET /home — بخش‌های صفحهٔ اصلی مطابق تنظیمات
```json
{"sections": [{"key": "latest", "title": "جدیدترین آهنگ‌ها", "items": [SONG]}]}
```

## GET /songs?order=latest|popular|random&category=&singer=&page=&per_page=
## GET /radio?source=latest|popular|random  → `{"source": "latest", "items": [SONG]}`
## GET /radio/artist/{slug} — فقط آثار همان هنرمند
## GET /search?q=&type=song|artist
## GET /artists?popular=1 · GET /artists/{slug} → {…, "songs": [SONG]}
## GET /songs/{id} · GET /songs/by-slug/{slug}

### شیء SONG
```json
{
  "id": 13033,
  "slug": "salar-darabi-man-ra-begir-az-man",
  "title": "من را بگیر از من",
  "artist": "سالار دارابی",
  "artist_slug": "salar-darabi",
  "link": "https://ahangban.ir/salar-darabi-man-ra-begir-az-man/",
  "date": "2026-11-01 21:49:08",
  "views": 3224,
  "cover": "https://ahangban.ir/wp-content/uploads/2026/11/…-380x380.webp",
  "audio": {
    "url": "https://dl.ahangban.ir/music/s/salar-darabi/…[320].mp3",
    "q128": "https://dl.ahangban.ir/music/s/salar-darabi/…[128].mp3",
    "q320": "https://dl.ahangban.ir/music/s/salar-darabi/…[320].mp3"
  },
  "video": "",
  "lyrics": "متن ترانه…",
  "telegram": "https://t.me/ahangbanbot?start=song_13033"
}
```

## خطاها
`400 ahangban_app_invalid_query` · `404 ahangban_app_not_found` · `429 ahangban_app_rate_limited` · `503 ahangban_app_disabled|ahangban_app_rl_unavailable`

## نکات امنیتی
- هیچ توکن/ secret در پاسخ‌ها نیست.
- **whitelist دامنهٔ média:** فقط `https://ahangban.ir` و `https://dl.ahangban.ir` (هاست دانلود رسمی) مجازند — بدون wildcard، بدون پورت، فقط HTTPS، host دقیق (جلوگیری از bypass با userinfo یا پسوند دامنه).
- ریدایرکت fichiers média کنترل می‌شود: API فقط URL مستقیم از دامنهٔ مجاز برمی‌گرداند؛ اگر فایل با ریدایرکت پاسخ دهد، مقصد نهایی نیز باید در همین whitelist باشد.
- اپ هنگام قطع rete از آخرین تنظیمات معتبر کش‌شده استفاده می‌کند.
