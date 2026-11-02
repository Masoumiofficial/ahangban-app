<?php
if (!defined('ABSPATH')) { exit; }

/**
 * نگاشت دادهٔ خام (post + meta + terms) به payload اپ — تابع‌های pure و قابل تست.
 */
class AhangBan_App_Song_Data {

    /**
     * @param array $post آرایهٔ post (id, post_title, post_name, post_date, guid)
     * @param array $meta associative array of post meta keys
     * @param array $singer array {id,name,slug} یا []
     * @return array payload song
     */
    public static function build_song_payload(array $post, array $meta, array $singer = array()) {
        $id = (int)($post['ID'] ?? $post['id'] ?? 0);
        $slug = (string)($post['post_name'] ?? $post['slug'] ?? '');
        $audio128 = self::clean_url($meta['music128'] ?? '');
        $audio320 = self::clean_url($meta['music320'] ?? '');
        $video = self::clean_url($meta['video1080'] ?? $meta['video720'] ?? $meta['video480'] ?? '');
        return array(
            'id'       => $id,
            'slug'     => $slug,
            'title'    => self::strip_html($post['post_title'] ?? ''),
            'artist'   => $singer['name'] ?? '',
            'artist_slug' => $singer['slug'] ?? '',
            'link'     => $id > 0 ? self::site_url('/' . $slug . '/') : '',
            'date'     => (string)($post['post_date'] ?? ''),
            'views'    => (int)($meta['views'] ?? 0),
            'cover'    => self::cover_from_meta($meta),
            'audio'    => array(
                'url'   => $audio320 !== '' ? $audio320 : $audio128,
                'q128'  => $audio128,
                'q320'  => $audio320,
            ),
            'video'    => $video,
            'lyrics'   => self::strip_html($meta['music_text'] ?? ''),
            'telegram' => $id > 0 ? 'https://t.me/ahangbanbot?start=song_' . $id : '',
        );
    }

    /** فهرست دقیق دامنه‌های مجاز-лmedia — بدون wildcard. */
    const ALLOWED_MEDIA_HOSTS = array('ahangban.ir', 'dl.ahangban.ir');

    /**
     * اعتبارسنجی دقیق URL média: فقط HTTPS، بدون پورت، بدون userinfo،
     * host دقیقاً یکی از دامنه‌های مجاز (جلوگیری از bypass با userinfo یا866 پسوند).
     */
    public static function is_allowed_media_url($url) {
        $url = trim((string)$url);
        if ($url === '' || strlen($url) > 2048) return false;
        $parts = parse_url($url);
        if ($parts === false) return false;
        if (strtolower($parts['scheme'] ?? '') !== 'https') return false;
        if (isset($parts['port'])) return false;
        if (isset($parts['user']) || isset($parts['pass'])) return false;
        $host = strtolower($parts['host'] ?? '');
        if ($host === '') return false;
        return in_array($host, self::ALLOWED_MEDIA_HOSTS, true);
    }

    /** فقط URLهای دامنهٔ مجاز (ahangban.ir و dl.ahangban.ir) پذیرفته می‌شوند. */
    public static function clean_url($url) {
        $url = trim((string)$url);
        if ($url === '') return '';
        if (!self::is_allowed_media_url($url)) return '';
        return esc_url_raw($url);
    }

    public static function strip_html($text) {
        $text = html_entity_decode(wp_strip_all_tags((string)$text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return trim(preg_replace('/\s+/u', ' ', $text));
    }

    public static function cover_from_meta(array $meta) {
        $cover = self::clean_url($meta['_thumbnail_url'] ?? '');
        return $cover;
    }

    private static function site_url($path) {
        return function_exists('home_url') ? home_url($path) : 'https://ahangban.ir' . $path;
    }

    /** 限 palvel: خواندن meta با fallback به ACF */
    public static function read_meta($post_id) {
        $keys = array('music128', 'music320', 'music_text', 'video480', 'video720', 'video1080', 'views');
        $meta = array();
        foreach ($keys as $k) {
            if (function_exists('get_field')) {
                $v = get_field($k, $post_id);
                $meta[$k] = is_string($v) ? $v : (is_array($v) ? ($v['url'] ?? '') : '');
            }
            if (empty($meta[$k])) {
                $meta[$k] = (string)get_post_meta($post_id, $k, true);
            }
        }
        $thumb_id = (int)get_post_meta($post_id, '_thumbnail_id', true);
        if ($thumb_id > 0) {
            $meta['_thumbnail_url'] = (string)wp_get_attachment_image_url($thumb_id, 'medium_large');
        }
        return $meta;
    }

    public static function read_singer($post_id) {
        $terms = get_the_terms($post_id, 'artist') ?: get_the_terms($post_id, 'singer');
        if (is_wp_error($terms) || empty($terms)) return array();
        $t = $terms[0];
        return array('id' => (int)$t->term_id, 'name' => $t->name, 'slug' => $t->slug);
    }
}
