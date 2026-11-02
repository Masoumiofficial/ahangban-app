#!/usr/bin/env bash
# QA Suite — ahangban/v2 — اجرا در محیط تست Muhit (NOT production!)
# usage: BASE=https://TEST-ENV/wp-json ./qa-muhit.sh
set -u
BASE="${BASE:-https://ahangban.ir/wp-json}"
PASS=0; FAIL=0
ck() { # ck <name> <condition-result 0/1>
  if [ "$2" -eq 0 ]; then echo "PASS: $1"; PASS=$((PASS+1)); else echo "FAIL: $1"; FAIL=$((FAIL+1)); fi
}

echo "== 1. PHP unit assertions =="
php "$(dirname "$0")/run-tests.php" >/tmp/php-tests.log 2>&1
ck "run-tests.php ALL PASSED" $?

echo "== 2. REST routes registered =="
ROUTES=$(curl -s "$BASE/ahangban/v2")
echo "$ROUTES" | grep -q '/ahangban/v2/config'; ck "config route" $?
echo "$ROUTES" | grep -q '/ahangban/v2/songs'; ck "songs route" $?
echo "$ROUTES" | grep -q '/ahangban/v2/radio/artist'; ck "artist radio route" $?

echo "== 3. endpoints smoke =="
CODE=$(curl -s -o /tmp/cfg.json -w '%{http_code}' "$BASE/ahangban/v2/config"); [ "$CODE" = 200 ]; ck "GET /config 200" $?
grep -q 'brand_color' /tmp/cfg.json; ck "config has brand_color" $?
CODE=$(curl -s -o /tmp/home.json -w '%{http_code}' "$BASE/ahangban/v2/home"); [ "$CODE" = 200 ]; ck "GET /home 200" $?
CODE=$(curl -s -o /tmp/songs.json -w '%{http_code}' "$BASE/ahangban/v2/songs?per_page=5"); [ "$CODE" = 200 ]; ck "GET /songs 200" $?
CODE=$(curl -s -o /tmp/search.json -w '%{http_code}' "$BASE/ahangban/v2/search?q=%D8%B3%D8%A7%D9%84%D8%A7%D8%B1"); [ "$CODE" = 200 ]; ck "GET /search 200" $?
CODE=$(curl -s -o /tmp/artists.json -w '%{http_code}' "$BASE/ahangban/v2/artists?popular=1"); [ "$CODE" = 200 ]; ck "GET /artists 200" $?
CODE=$(curl -s -o /tmp/radio.json -w '%{http_code}' "$BASE/ahangban/v2/radio?source=latest"); [ "$CODE" = 200 ]; ck "GET /radio 200" $?

echo "== 4/5. audio URLs + MIME + Range =="
A320=$(python3 -c "import json;print(json.load(open('/tmp/songs.json'))[0]['audio']['q320'])" 2>/dev/null)
A128=$(python3 -c "import json;print(json.load(open('/tmp/songs.json'))[0]['audio']['q128'])" 2>/dev/null)
echo "q320=$A320"; echo "q128=$A128"
case "$A320$A128" in *dl.ahangban.ir*|*ahangban.ir*) ck "audio urls on allowed domains" 0;; *) ck "audio urls on allowed domains" 1;; esac
curl -s -o /dev/null -D - "$A320" | grep -qi '^content-type: audio/mpeg'; ck "MIME audio/mpeg (320)" $?
RANGE=$(curl -s -o /dev/null -w '%{http_code}' -H 'Range: bytes=0-1023' "$A320"); [ "$RANGE" = 206 ] || [ "$RANGE" = 200 ]; ck "Range request handled ($RANGE)" $?

echo "== 6. redirects end on allowed domain =="
FINAL=$(curl -s -o /dev/null -w '%{url_effective}' -L "$A320")
case "$FINAL" in https://dl.ahangban.ir/*|https://ahangban.ir/*) ck "final redirect host allowed" 0;; *) ck "final redirect host allowed ($FINAL)" 1;; esac

echo "== 7. rate limit (121 rapid requests) =="
LAST=0
for i in $(seq 1 121); do LAST=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/ahangban/v2/config"); done
[ "$LAST" = 429 ]; ck "request 121 -> 429 (last=$LAST)" $?
sleep 61

echo "== 8/9. no secret leakage in public API =="
curl -s "$BASE/ahangban/v2/config" | grep -qiE 'token|secret|password|AHANGBAN_API_TOKEN'; [ $? -ne 0 ]; ck "no secret in /config" $?

echo "== 10. cache invalidation after post update =="
# needs WP-CLI in test env: wp post update <id> --post_title=... then compare payload hash before/after
if command -v wp >/dev/null; then
  H1=$(curl -s "$BASE/ahangban/v2/songs/13033" | md5sum)
  wp post update 13033 --post_title="$(wp post get 13033 --field=post_title) (qa)" >/dev/null 2>&1
  H2=$(curl -s "$BASE/ahangban/v2/songs/13033" | md5sum)
  wp post update 13033 --post_title="$(wp post get 13033 --field=post_title | sed 's/ (qa)//')" >/dev/null 2>&1
  [ "$H1" != "$H2" ]; ck "cache invalidated on save_post" $?
else
  echo "SKIP: wp-cli not available — manual check required"
fi

echo "== 11. telegram deep link contract =="
TL=$(python3 -c "import json;print(json.load(open('/tmp/songs.json'))[0].get('telegram',''))" 2>/dev/null)
case "$TL" in https://t.me/ahangbanbot?start=song_*) ck "telegram link $TL" 0;; *) ck "telegram link ($TL)" 1;; esac

echo "== 12. remote config offline (app-side) =="
echo "Covered by vitest: src/api/ahangban.test.ts (fallback to cached config). Device test remains manual."

echo "RESULT: PASS=$PASS FAIL=$FAIL"
[ $FAIL -eq 0 ]
