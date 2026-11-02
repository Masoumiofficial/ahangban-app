<?php
if (!defined('ABSPATH')) { exit; }

/**
 * تنظیمات اپ — ذخیره در option؛ projeection عمومی برای /config.
 * Trennung: کلیدهای عمومی (public) vs managerial (только admin، هرگز در API عمومی).
 */
class AhangBan_App_Config {

    public static function defaults() {
        return array(
            'app_name'        => 'آهنگ بان',
            'app_slug'        => 'ahangban',
            'logo_light'      => '',
            'logo_dark'       => '',
            'brand_color'     => '#185ADB',
            'enabled'         => true,
            'maintenance'     => false,
            'maintenance_msg' => 'اپلیکیشن در حال به‌روزرسانی است. لطفاً کمی بعد دوباره تلاش کنید.',
            'min_version_android' => '1.0.0',
            'min_version_ios'     => '1.0.0',
            'home_sections'   => array('latest', 'popular', 'artists'),
            'selected_songs'  => array(),   // array of post IDs —Charles manages in admin
            'radio_source'    => 'latest',  // latest|popular|random
            'playerAutoplay'  => false,
            'feature_flags'   => array(
                'search'   => true,
                'radio'    => true,
                'artist_radio' => true,
                'share'    => true,
                'download' => false,     // تا زمانی که ambient اجازهٔ دانلود confirmar نشده
                'login'    => false,     // تا API ورود موبایل آماده نشده
            ),
            'notifications'   => array(),   // array of {title, body, deep_link}
        );
    }

    public static function register_defaults() {
        if (false === get_option(AHANGBAN_APP_API_OPTION)) {
            add_option(AHANGBAN_APP_API_OPTION, self::defaults(), '', false);
        }
    }

    public static function get_all() {
        $saved = get_option(AHANGBAN_APP_API_OPTION, array());
        return wp_parse_args(is_array($saved) ? $saved : array(), self::defaults());
    }

    /** Daten عمومی که از طریق /ahangban/v2/config به اپ می‌رسد — بدون هيچ secret. */
    public static function public_config() {
        $c = self::get_all();
        return array(
            'app_name'  => $c['app_name'],
            'logo'      => array('light' => esc_url_raw($c['logo_light']), 'dark' => esc_url_raw($c['logo_dark'])),
            'brand_color' => self::sanitize_color($c['brand_color']),
            'enabled'   => (bool)$c['enabled'],
            'maintenance' => (bool)$c['maintenance'],
            'maintenance_message' => $c['maintenance_msg'],
            'min_versions' => array('android' => $c['min_version_android'], 'ios' => $c['min_version_ios']),
            'home_sections' => array_values($c['home_sections']),
            'radio_source' => $c['radio_source'],
            'feature_flags' => (object)$c['feature_flags'],
            'notifications' => array_values(array_map(function ($n) {
                return array(
                    'title' => wp_strip_all_tags((string)($n['title'] ?? '')),
                    'body'  => wp_strip_all_tags((string)($n['body'] ?? '')),
                    'link'  => esc_url_raw($n['link'] ?? ''),
                );
            }, $c['notifications'])),
        );
    }

    public static function sanitize_color($color) {
        $color = sanitize_hex_color((string)$color);
        return $color ?: '#185ADB';
    }

    public static function sanitize_settings($input) {
        $d = self::defaults();
        $out = self::get_all();
        $out['app_name'] = sanitize_text_field($input['app_name'] ?? $d['app_name']);
        $out['logo_light'] = esc_url_raw($input['logo_light'] ?? '');
        $out['logo_dark'] = esc_url_raw($input['logo_dark'] ?? '');
        $out['brand_color'] = self::sanitize_color($input['brand_color'] ?? $d['brand_color']);
        $out['enabled'] = !empty($input['enabled']);
        $out['maintenance'] = !empty($input['maintenance']);
        $out['maintenance_msg'] = sanitize_text_field($input['maintenance_msg'] ?? '');
        $out['min_version_android'] = sanitize_text_field($input['min_version_android'] ?? '1.0.0');
        $out['min_version_ios'] = sanitize_text_field($input['min_version_ios'] ?? '1.0.0');
        $allowed_sections = array('latest', 'popular', 'selected', 'artists', 'albums', 'remixes', 'videos');
        $sections = array_values(array_intersect((array)($input['home_sections'] ?? $d['home_sections']), $allowed_sections));
        $out['home_sections'] = $sections;
        $out['selected_songs'] = array_values(array_filter(array_map('intval', (array)($input['selected_songs'] ?? array()))));
        $out['radio_source'] = in_array($input['radio_source'] ?? '', array('latest', 'popular', 'random'), true) ? $input['radio_source'] : 'latest';
        $out['playerAutoplay'] = !empty($input['playerAutoplay']);
        foreach (array_keys($d['feature_flags']) as $flag) {
            $out['feature_flags'][$flag] = !empty($input['feature_flags'][$flag]);
        }
        $notes = array();
        foreach ((array)($input['notifications'] ?? array()) as $n) {
            if (!is_array($n)) continue;
            $notes[] = array(
                'title' => sanitize_text_field($n['title'] ?? ''),
                'body'  => sanitize_text_field($n['body'] ?? ''),
                'link'  => esc_url_raw($n['link'] ?? ''),
            );
        }
        $out['notifications'] = $notes;
        return $out;
    }
}
