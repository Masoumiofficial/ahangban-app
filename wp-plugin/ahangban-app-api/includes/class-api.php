<?php
if (!defined('ABSPATH')) { exit; }

/**
 * ahangban/v2 — API عمومی read-only برای اپ.
 * بدون secret؛ rate-limited؛ resultها کش می‌شوند.
 * aucun endpoint managerial aquí — admin فقط از پیشخوان وردپرس.
 */
class AhangBan_App_API {

    public static function register_routes() {
        $public = array(__CLASS__, 'public_guard');

        register_rest_route(AHANGBAN_APP_API_NS, '/config', array(
            'methods' => 'GET', 'callback' => array(__CLASS__, 'config'), 'permission_callback' => $public,
        ));
        register_rest_route(AHANGBAN_APP_API_NS, '/home', array(
            'methods' => 'GET', 'callback' => array(__CLASS__, 'home'), 'permission_callback' => $public,
        ));
        register_rest_route(AHANGBAN_APP_API_NS, '/songs', array(
            'methods' => 'GET', 'callback' => array(__CLASS__, 'songs'), 'permission_callback' => $public,
            'args' => array(
                'category' => array('type' => 'integer', 'required' => false),
                'singer'   => array('type' => 'integer', 'required' => false),
                'order'    => array('type' => 'string', 'required' => false, 'default' => 'latest', 'enum' => array('latest', 'popular', 'random')),
                'page'     => array('type' => 'integer', 'required' => false, 'default' => 1, 'minimum' => 1),
                'per_page' => array('type' => 'integer', 'required' => false, 'default' => 20, 'minimum' => 1, 'maximum' => 100),
            ),
        ));
        register_rest_route(AHANGBAN_APP_API_NS, '/songs/(?P<id>\d+)', array(
            'methods' => 'GET', 'callback' => array(__CLASS__, 'song'), 'permission_callback' => $public,
            'args' => array('id' => array('type' => 'integer', 'required' => true, 'minimum' => 1)),
        ));
        register_rest_route(AHANGBAN_APP_API_NS, '/songs/by-slug/(?P<slug>[^/]+)', array(
            'methods' => 'GET', 'callback' => array(__CLASS__, 'song_by_slug'), 'permission_callback' => $public,
        ));
        register_rest_route(AHANGBAN_APP_API_NS, '/search', array(
            'methods' => 'GET', 'callback' => array(__CLASS__, 'search'), 'permission_callback' => $public,
            'args' => array(
                'q'    => array('type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'),
                'type' => array('type' => 'string', 'required' => false, 'default' => 'song', 'enum' => array('song', 'artist')),
                'page' => array('type' => 'integer', 'required' => false, 'default' => 1, 'minimum' => 1),
            ),
        ));
        register_rest_route(AHANGBAN_APP_API_NS, '/artists', array(
            'methods' => 'GET', 'callback' => array(__CLASS__, 'artists'), 'permission_callback' => $public,
            'args' => array('popular' => array('type' => 'boolean', 'required' => false, 'default' => false)),
        ));
        register_rest_route(AHANGBAN_APP_API_NS, '/artists/(?P<slug>[^/]+)', array(
            'methods' => 'GET', 'callback' => array(__CLASS__, 'artist'), 'permission_callback' => $public,
        ));
        register_rest_route(AHANGBAN_APP_API_NS, '/radio', array(
            'methods' => 'GET', 'callback' => array(__CLASS__, 'radio'), 'permission_callback' => $public,
            'args' => array('source' => array('type' => 'string', 'required' => false, 'enum' => array('latest', 'popular', 'random'))),
        ));
        register_rest_route(AHANGBAN_APP_API_NS, '/radio/artist/(?P<slug>[^/]+)', array(
            'methods' => 'GET', 'callback' => array(__CLASS__, 'artist_radio'), 'permission_callback' => $public,
        ));
    }

    /** Safety gate: rate limit + maintenance/disable flag — هم applies روی همهٔ routeهای عمومی. */
    public static function public_guard(WP_REST_Request $request) {
        $rl = AhangBan_App_Rate_Limit::check();
        if (is_wp_error($rl)) return $rl;
        $config = AhangBan_App_Config::public_config();
        if (!$config['enabled']) {
            return new WP_Error('ahangban_app_disabled', 'اپلیکیشن موقتاً غیرفعال است.', array('status' => 503));
        }
        return true;
    }

    public static function config(WP_REST_Request $request) {
        return rest_ensure_response(AhangBan_App_Config::public_config());
    }

    public static function home(WP_REST_Request $request) {
        $config = AhangBan_App_Config::get_all();
        $sections = array();
        foreach ($config['home_sections'] as $section) {
            switch ($section) {
                case 'latest':
                    $sections[] = array('key' => 'latest', 'title' => 'جدیدترین آهنگ‌ها', 'items' => self::query_songs(array('order' => 'latest', 'per_page' => 10)));
                    break;
                case 'popular':
                    $sections[] = array('key' => 'popular', 'title' => 'پربازدیدترین‌ها', 'items' => self::query_songs(array('order' => 'popular', 'per_page' => 10)));
                    break;
                case 'selected':
                    $items = array();
                    foreach ($config['selected_songs'] as $pid) {
                        $s = self::song_payload((int)$pid);
                        if ($s) $items[] = $s;
                    }
                    $sections[] = array('key' => 'selected', 'title' => 'آثار منتخب', 'items' => $items);
                    break;
                case 'artists':
                    $sections[] = array('key' => 'artists', 'title' => 'هنرمندان', 'items' => self::artists_payload(true, 12));
                    break;
            }
        }
        return rest_ensure_response(array('sections' => $sections));
    }

    public static function songs(WP_REST_Request $request) {
        return rest_ensure_response(self::query_songs(array(
            'category' => $request->get_param('category'),
            'singer'   => $request->get_param('singer'),
            'order'    => $request->get_param('order'),
            'page'     => (int)$request->get_param('page'),
            'per_page' => (int)$request->get_param('per_page'),
        )));
    }

    public static function song(WP_REST_Request $request) {
        $payload = self::song_payload((int)$request['id']);
        if (!$payload) return new WP_Error('ahangban_app_not_found', 'آهنگ یافت نشد.', array('status' => 404));
        return rest_ensure_response($payload);
    }

    public static function song_by_slug(WP_REST_Request $request) {
        $post = get_page_by_path(sanitize_title($request['slug']), OBJECT, 'post');
        if (!$post) return new WP_Error('ahangban_app_not_found', 'آهنگ یافت نشد.', array('status' => 404));
        return rest_ensure_response(self::song_payload((int)$post->ID));
    }

    public static function search(WP_REST_Request $request) {
        $q = trim((string)$request['q']);
        if (mb_strlen($q) < 2) return new WP_Error('ahangban_app_invalid_query', 'حداقل ۲ حرف لازم است.', array('status' => 400));
        if ($request['type'] === 'artist') {
            $terms = get_terms(array('taxonomy' => 'artist', 'hide_empty' => false, 'search' => $q, 'number' => 20));
            if (is_wp_error($terms)) return $terms;
            return rest_ensure_response(array_map(function ($t) {
                return array('id' => (int)$t->term_id, 'name' => $t->name, 'slug' => $t->slug, 'count' => (int)$t->count);
            }, $terms));
        }
        return rest_ensure_response(self::query_songs(array('search' => $q, 'page' => (int)$request['page'], 'per_page' => 20)));
    }

    public static function artists(WP_REST_Request $request) {
        return rest_ensure_response(self::artists_payload((bool)$request['popular'], 50));
    }

    public static function artist(WP_REST_Request $request) {
        $term = get_term_by('slug', sanitize_title($request['slug']), 'artist');
        if (!$term || is_wp_error($term)) return new WP_Error('ahangban_app_not_found', 'هنرمند یافت نشد.', array('status' => 404));
        return rest_ensure_response(array(
            'id' => (int)$term->term_id, 'name' => $term->name, 'slug' => $term->slug,
            'description' => wp_strip_all_tags($term->description), 'count' => (int)$term->count,
            'songs' => self::query_songs(array('singer' => (int)$term->term_id, 'per_page' => 50)),
        ));
    }

    public static function radio(WP_REST_Request $request) {
        $source = $request->get_param('source');
        if (!$source) $source = AhangBan_App_Config::get_all()['radio_source'];
        return rest_ensure_response(array('source' => $source, 'items' => self::query_songs(array('order' => $source, 'per_page' => 50))));
    }

    /** رادیوی اختصاصی هنرمند — queryjj فقط با filtroی همان artiste; هيچ данных اضافی باز نمی‌شود. */
    public static function artist_radio(WP_REST_Request $request) {
        $term = get_term_by('slug', sanitize_title($request['slug']), 'artist');
        if (!$term || is_wp_error($term)) return new WP_Error('ahangban_app_not_found', 'هنرمند یافت نشد.', array('status' => 404));
        return rest_ensure_response(array(
            'artist' => array('id' => (int)$term->term_id, 'name' => $term->name, 'slug' => $term->slug),
            'items' => self::query_songs(array('singer' => (int)$term->term_id, 'order' => 'latest', 'per_page' => 50)),
        ));
    }

    // ---------- helpers ----------

    private static function query_songs(array $args) {
        $key = 'songs:' . md5(json_encode($args));
        return AhangBan_App_Cache::wrap($key, function () use ($args) {
            $q = array(
                'post_type' => 'post', 'post_status' => 'publish',
                'posts_per_page' => min(100, max(1, (int)($args['per_page'] ?? 20))),
                'paged' => max(1, (int)($args['page'] ?? 1)),
            );
            if (!empty($args['search'])) $q['s'] = $args['search'];
            if (!empty($args['category'])) $q['cat'] = (int)$args['category'];
            if (!empty($args['singer'])) {
                $q['tax_query'] = array(array('taxonomy' => 'artist', 'field' => 'term_id', 'terms' => (int)$args['singer']));
            }
            switch ($args['order'] ?? 'latest') {
                case 'popular':
                    $q['meta_key'] = 'views'; $q['orderby'] = 'meta_value_num'; $q['order'] = 'DESC';
                    break;
                case 'random':
                    $q['orderby'] = 'rand';
                    break;
                default:
                    $q['orderby'] = 'date'; $q['order'] = 'DESC';
            }
            $posts = get_posts($q);
            $items = array();
            foreach ($posts as $p) {
                $s = self::song_payload((int)$p->ID);
                if ($s) $items[] = $s;
            }
            return $items;
        });
    }

    private static function song_payload($post_id) {
        $key = 'song:' . (int)$post_id;
        return AhangBan_App_Cache::wrap($key, function () use ($post_id) {
            $post = get_post((int)$post_id);
            if (!$post || $post->post_status !== 'publish' || $post->post_type !== 'post') return null;
            return AhangBan_App_Song_Data::build_song_payload(
                (array)$post,
                AhangBan_App_Song_Data::read_meta((int)$post_id),
                AhangBan_App_Song_Data::read_singer((int)$post_id)
            );
        });
    }

    private static function artists_payload($popular, $limit) {
        $key = 'artists:' . ($popular ? 'pop' : 'all') . ':' . (int)$limit;
        return AhangBan_App_Cache::wrap($key, function () use ($popular, $limit) {
            $args = array('taxonomy' => 'artist', 'hide_empty' => true, 'number' => (int)$limit);
            if ($popular) { $args['orderby'] = 'count'; $args['order'] = 'DESC'; }
            $terms = get_terms($args);
            if (is_wp_error($terms)) return array();
            return array_map(function ($t) {
                return array('id' => (int)$t->term_id, 'name' => $t->name, 'slug' => $t->slug, 'count' => (int)$t->count);
            }, $terms);
        });
    }
}
