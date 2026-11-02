<?php
/**
 * Plugin Name: AhangBan App API (ahangban/v2)
 * Description: API عمومی read-only برای اپلیکیشن موبایل آهنگ بان + ماژول «مدیریت اپلیکیشن آهنگ بان» در پیشخوان.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 *
 * Hinweise: این افزونه فقط دادهٔ عمومی را می‌خواند؛ هیچ توکن ربات یا secret را افشا نمی‌کند.
 * نصب و تست فقط در محیط تست (Muhit) — هرگز بدون تأیید روی سایت اصلی.
 */

if (!defined('ABSPATH')) { exit; }

define('AHANGBAN_APP_API_VERSION', '1.0.0');
define('AHANGBAN_APP_API_NS', 'ahangban/v2');
define('AHANGBAN_APP_API_OPTION', 'ahangban_app_settings');
define('AHANGBAN_APP_API_CACHE_TTL', 300); // 5 دقیقه

require_once __DIR__ . '/includes/class-rate-limit.php';
require_once __DIR__ . '/includes/class-cache.php';
require_once __DIR__ . '/includes/class-song-data.php';
require_once __DIR__ . '/includes/class-config.php';
require_once __DIR__ . '/includes/class-api.php';
require_once __DIR__ . '/includes/class-admin.php';

register_activation_hook(__FILE__, function () {
    AhangBan_App_Config::register_defaults();
});

add_action('rest_api_init', array('AhangBan_App_API', 'register_routes'));
add_action('admin_menu', array('AhangBan_App_Admin', 'register_menu'));
add_action('save_post', array('AhangBan_App_Cache', 'invalidate_song_caches'), 10, 1);
