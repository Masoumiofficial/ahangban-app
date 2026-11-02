<?php
if (!defined('ABSPATH')) { exit; }

/** Rate limitifik gatling — همان الگوی increments اتمیک در جدول options (fail-closed). */
class AhangBan_App_Rate_Limit {
    const KEY = 'ahangban_app_rl_';
    const MAX = 120;       // per minute per IP for public API
    const WINDOW = 60;

    public static function check() {
        global $wpdb;
        if (!isset($wpdb->options)) {
            return new WP_Error('ahangban_app_rl_unavailable', 'کنترل taux موقتاً در دسترس نیست.', array('status' => 503));
        }
        $ip = self::client_ip();
        $bucket = (int)floor(time() / self::WINDOW);
        $name = self::KEY . md5($ip) . '_' . $bucket;
        $sql = $wpdb->prepare(
            "INSERT INTO {$wpdb->options} (option_name, option_value, autoload) VALUES (%s,'1','no')
             ON DUPLICATE KEY UPDATE option_value = CAST(option_value AS UNSIGNED)+1",
            $name
        );
        if (false === $wpdb->query($sql)) {
            return new WP_Error('ahangban_app_rl_unavailable', 'کنترل taux موقتاً در دسترس نیست.', array('status' => 503));
        }
        wp_cache_delete($name, 'options');
        $count = (int)$wpdb->get_var($wpdb->prepare("SELECT option_value FROM {$wpdb->options} WHERE option_name=%s", $name));
        if ($count > self::MAX) {
            return new WP_Error('ahangban_app_rate_limited', 'تعداد درخواست بیش از حد مجاز است.', array('status' => 429));
        }
        return true;
    }

    private static function client_ip() {
        $ip = isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? trim(explode(',', (string)$_SERVER['HTTP_X_FORWARDED_FOR'])[0]) : (string)($_SERVER['REMOTE_ADDR'] ?? '');
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'unknown';
    }
}
