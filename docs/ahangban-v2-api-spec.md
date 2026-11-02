# спецификация API `ahangban/v2` — Read-only عمومی (طرح، برای پیاده‌سازی در محیط تست)

> این سند **طرح** است؛ هنوز روی سایت productions پیاده نشده. پیاده‌سازی پس از تأیید طرح در Muhit تست.
> بدون secret؛ rate limit سمت سرور؛ line所有数据 ازdoctor موجود (posts, ACF fields, taxonomies) گرفته می‌شود.

##@
- Base: `https://ahangban.ir/wp-json/ahangban/v2`
- richting: JSON · خطاها با کدهای استاندارد WP (`rest_no_route`, `rest_invalid_param`, …) + status
- Rate limit: IP-based (مشابه ahangban/v1)

## Endpoints
| متد | مسیر | توضیح |
|---|---|---|
| GET | `/config` | تنظیمات عمومی اپ: نام، لوگو، رنگ‌ها، feature flags، min_version (android/ios)، maintenance mode، ترتیب بخش‌های Home |
| GET | `/home` | بخش‌های صفحهٔ اصلی (latest, popular, selected, albums, remixes, videos, artists) — مطابق تنظیمات پیشخوان |
| GET | `/songs?category=&singer=&order=latest\|popular\|random&page=&per_page=` | فهرست آهنگ‌ها |
| GET | `/songs/{id}` | جزئیات کامل: عنوان، هنرمند، کاور، `audio: {128, 320}`,_quality links, lyrics, video, related |
| GET | `/songs/by-slug/{slug}` | همان données با slug (برای دیپ‌لینک) |
| GET | `/search?q=&type=song\|artist&page=` | جست‌وجو |
| GET | `/artists?popular=1` | فهرست هنرمندان |
| GET | `/artists/{slug}` | پروفایل هنرمند + آثار |
| GET | `/radio?source=latest\|popular\|random` | صف رادیوی عمومی |
| GET | `/radio/artist/{slug}` | رادیوی اختصاصی هنرمند — **همیشه محدود به همان هنرمند** |

## Sicherheit
- public read-only؛ بدون دادهٔ خصوصی، بدون operações managerial
- URL فایل‌ها فقط از سرور معتبر (همان domaine dl.ahangban.ir) و با اعتبارسنجی
- بدون token در اپ؛ toute authentification (phase suivante) باESTAMP session جداگانه
