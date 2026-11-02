<?php
if (!defined('ABSPATH')) { exit; }

class AhangBan_App_Cache {
    public static function get($key) {
        $v = get_transient('ahangban_app_' . md5($key));
        return false === $v ? null : $v;
    }

    public static function set($key, $value, $ttl = AHANGBAN_APP_API_CACHE_TTL) {
        set_transient('ahangban_app_' . md5($key), $value, $ttl);
    }

    public static function invalidate_song_caches($post_id) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (wp_is_post_revision($post_id)) return;
        // With transient-per-key we rely on TTL; bump a version token to invalidate all:
        $version = (int)get_option('ahangban_app_cache_version', 0);
        update_option('ahangban_app_cache_version', $version + 1, false);
    }

    public static function wrap($key, callable $producer) {
        $version = (int)get_option('ahangban_app_cache_version', 0);
        $full = $version . ':' . $key;
        $cached = self::get($full);
        if (null !== $cached) return $cached;
        $value = $producer();
        self::set($full, $value);
        return $value;
    }
}
