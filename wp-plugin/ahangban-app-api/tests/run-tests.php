<?php
/**
 * تست‌های مستقل (بدون وردپرس) برای منطق pure افزونه.
 * اجرا در محیط تست:  php tests/run-tests.php
 * نیازی بهABSPATH واقعی نیست؛ stubهای حداقلی تعریف می‌شوند.
 */

define('ABSPATH', __DIR__ . '/');

// ---- WP stubs ----
function esc_url_raw($u) { return filter_var($u, FILTER_VALIDATE_URL) ? $u : ''; }
function wp_strip_all_tags($t) { return trim(strip_tags((string)$t)); }
function home_url($p = '') { return 'https://ahangban.ir' . $p; }
function sanitize_hex_color($c) { return preg_match('/^#([0-9a-f]{3}|[0-9a-f]{6})$/i', (string)$c) ? $c : null; }
function sanitize_text_field($s) { return trim(strip_tags((string)$s)); }
function wp_parse_args($args, $defaults) { return array_merge($defaults, (array)$args); }

$GLOBALS['__options'] = array();
function get_option($k, $d = false) { return $GLOBALS['__options'][$k] ?? $d; }
function update_option($k, $v, $autoload = null) { $GLOBALS['__options'][$k] = $v; return true; }
function add_option($k, $v, $x = '', $autoload = null) { $GLOBALS['__options'][$k] = $v; return true; }

require_once __DIR__ . '/../includes/class-song-data.php';
require_once __DIR__ . '/../includes/class-config.php';

$failures = 0;
function ok($cond, $name) {
    global $failures;
    if ($cond) { echo "PASS: $name\n"; } else { $failures++; echo "FAIL: $name\n"; }
}

// 1. clean_url فقط دامنهٔ مجاز را می‌پذیرد
ok(AhangBan_App_Song_Data::clean_url('https://dl.ahangban.ir/music/x[320].mp3') !== '', 'clean_url accepts dl.ahangban.ir');
ok(AhangBan_App_Song_Data::clean_url('https://ahangban.ir/wp-content/uploads/x.mp3') !== '', 'clean_url accepts ahangban.ir');
ok(AhangBan_App_Song_Data::clean_url('https://evil.com/x.mp3') === '', 'clean_url rejects foreign domain');
ok(AhangBan_App_Song_Data::clean_url('http://dl.ahangban.ir/x.mp3') === '', 'clean_url rejects http');

// 1b. allowlist دقیق — بدون wildcard و بدون bypass
ok(AhangBan_App_Song_Data::is_allowed_media_url('https://dl.ahangban.ir:8443/x.mp3') === false, 'rejects explicit port');
ok(AhangBan_App_Song_Data::is_allowed_media_url('https://dl.ahangban.ir@evil.com/x.mp3') === false, 'rejects userinfo bypass');
ok(AhangBan_App_Song_Data::is_allowed_media_url('https://cdn.ahangban.ir/x.mp3') === false, 'rejects non-listed subdomain');
ok(AhangBan_App_Song_Data::is_allowed_media_url('https://dl.ahangban.ir.evil.com/x.mp3') === false, 'rejects suffix-spoof host');
ok(AhangBan_App_Song_Data::is_allowed_media_url('https://DL.AHANGBAN.IR/x.mp3') === true, 'accepts case-insensitive allowed host');
ok(AhangBan_App_Song_Data::is_allowed_media_url('https://dl.ahangban.ir/x.mp3') === true, 'accepts dl.ahangban.ir https');

// 2. build_song_payload دادهٔ کامل می‌سازد
$payload = AhangBan_App_Song_Data::build_song_payload(
    array('ID' => 13033, 'post_name' => 'salar-darabi-man-ra-begir-az-man', 'post_title' => 'من را بگیر از من', 'post_date' => '2026-11-01 21:49:08'),
    array('music128' => 'https://dl.ahangban.ir/music/s/x[128].mp3', 'music320' => 'https://dl.ahangban.ir/music/s/x[320].mp3', 'music_text' => "<p>متن آهنگ</p>", 'views' => '3224', '_thumbnail_url' => 'https://ahangban.ir/wp-content/uploads/2026/11/cover.webp'),
    array('id' => 508, 'name' => 'سالار دارابی', 'slug' => 'salar-darabi')
);
ok($payload['id'] === 13033, 'payload id');
ok($payload['audio']['url'] === 'https://dl.ahangban.ir/music/s/x[320].mp3', 'audio prefers 320');
ok($payload['audio']['q128'] !== '' && $payload['audio']['q320'] !== '', 'both qualities exposed');
ok($payload['lyrics'] === 'متن آهنگ', 'lyrics stripped of HTML');
ok($payload['artist'] === 'سالار دارابی' && $payload['artist_slug'] === 'salar-darabi', 'artist mapped');
ok($payload['telegram'] === 'https://t.me/ahangbanbot?start=song_13033', 'telegram bot link contract');
ok(strpos($payload['cover'], 'ahangban.ir') !== false, 'cover present');

// 3._payload بدون فایل صوتی — audio خالی، نه URL جعلی
$p2 = AhangBan_App_Song_Data::build_song_payload(array('ID' => 1, 'post_name' => 'x', 'post_title' => 't'), array(), array());
ok($p2['audio']['url'] === '', 'no fake audio url when missing');

// 4. sanitize_settings — mold color و flags و sections
AhangBan_App_Config::register_defaults();
$clean = AhangBan_App_Config::sanitize_settings(array(
    'app_name' => '<b>آهنگ بان</b>', 'brand_color' => '#185ADB',
    'home_sections' => array('latest', 'hack', 'popular'),
    'feature_flags' => array('download' => '1', 'login' => ''),
    'selected_songs' => array('13033', 'abc', '13030'),
    'radio_source' => 'random',
));
ok($clean['app_name'] === 'آهنگ بان', 'app_name sanitized');
ok($clean['home_sections'] === array('latest', 'popular'), 'unknown sections dropped');
ok($clean['selected_songs'] === array(13033, 13030), 'selected songs int-cast');
ok($clean['feature_flags']['download'] === true && $clean['feature_flags']['login'] === false, 'flags booleanized');

// 5. public_config — هيچ secret/managerial keyids افشا نمی‌شود
$pub = AhangBan_App_Config::public_config();
ok(isset($pub['brand_color'], $pub['feature_flags'], $pub['min_versions'], $pub['home_sections']), 'public config keys present');
ok(!isset($pub['selected_songs_raw']) && !array_key_exists('token', $pub), 'no secret leakage');
ok($pub['brand_color'] === '#185ADB', 'brand color default');

// 6. sanitize_color rejects invalid
ok(AhangBan_App_Config::sanitize_color('red') === '#185ADB', 'invalid color falls back to brand');
ok(AhangBan_App_Config::sanitize_color('#abc') === '#abc', 'valid short hex accepted');

echo $failures === 0 ? "\nALL TESTS PASSED\n" : "\n$failures TEST(S) FAILED\n";
exit($failures === 0 ? 0 : 1);
