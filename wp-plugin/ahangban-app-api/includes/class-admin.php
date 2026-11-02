<?php
if (!defined('ABSPATH')) { exit; }

/**
 * ماژول «مدیریت اپلیکیشن آهنگ بان» در پیشخوان وردپرس.
 * دسترسی فقط با capability управленie_options (مدیر کل).
 * formulaire POST با nonce؛ ذخیره در option — بدون نیاز به انتشار نسخهٔ اپ.
 */
class AhangBan_App_Admin {

    const CAP = 'manage_options';
    const PAGE_SLUG = 'ahangban-app-manager';
    const NONCE = 'ahangban_app_save_settings';

    public static function register_menu() {
        add_menu_page(
            'مدیریت اپلیکیشن آهنگ بان',
            'اپلیکیشن آهنگ بان',
            self::CAP,
            self::PAGE_SLUG,
            array(__CLASS__, 'render_page'),
            'dashicons-smartphone',
            58
        );
    }

    public static function render_page() {
        if (!current_user_can(self::CAP)) {
            wp_die('دسترسی غیرمجاز.');
        }
        $saved = false;
        if (isset($_POST['ahangban_app_settings_nonce']) && wp_verify_nonce((string)$_POST['ahangban_app_settings_nonce'], self::NONCE)) {
            $raw = (string)($_POST['notifications_raw'] ?? '');
            $notes = array();
            foreach (preg_split('/\r\n|\r|\n/', $raw) as $line) {
                $line = trim($line);
                if ($line === '') continue;
                $parts = array_map('trim', explode('|', $line, 3));
                $notes[] = array('title' => $parts[0] ?? '', 'body' => $parts[1] ?? '', 'link' => $parts[2] ?? '');
            }
            $_POST['notifications'] = $notes;
            $clean = AhangBan_App_Config::sanitize_settings($_POST);
            update_option(AHANGBAN_APP_API_OPTION, $clean, false);
            AhangBan_App_Cache::invalidate_song_caches(0);
            $saved = true;
        }
        $c = AhangBan_App_Config::get_all();
        ?>
        <div class="wrap" dir="rtl">
            <h1>مدیریت اپلیکیشن آهنگ بان</h1>
            <?php if ($saved) echo '<div class="notice notice-success"><p>تنظیمات ذخیره شد و بدون انتشار نسخهٔ جدید اپ اعمال می‌شود.</p></div>'; ?>
            <form method="post">
                <?php wp_nonce_field(self::NONCE, 'ahangban_app_settings_nonce'); ?>
                <h2>عمومی و هویت بصری</h2>
                <table class="form-table"><tbody>
                    <tr><th>نام اپ</th><td><input type="text" name="app_name" value="<?php echo esc_attr($c['app_name']); ?>" class="regular-text"></td></tr>
                    <tr><th>لوگو (حالت روز)</th><td><input type="url" name="logo_light" value="<?php echo esc_attr($c['logo_light']); ?>" class="regular-text"></td></tr>
                    <tr><th>لوگو (حالت شب)</th><td><input type="url" name="logo_dark" value="<?php echo esc_attr($c['logo_dark']); ?>" class="regular-text"></td></tr>
                    <tr><th>رنگ برند</th><td><input type="text" name="brand_color" value="<?php echo esc_attr($c['brand_color']); ?>" class="regular-text" placeholder="#185ADB"></td></tr>
                    <tr><th>اپ فعال است</th><td><label><input type="checkbox" name="enabled" value="1" <?php checked($c['enabled']); ?>> فعال</label></td></tr>
                    <tr><th>حالت تعمیرات</th><td><label><input type="checkbox" name="maintenance" value="1" <?php checked($c['maintenance']); ?>> فعال</label>
                        <input type="text" name="maintenance_msg" value="<?php echo esc_attr($c['maintenance_msg']); ?>" class="regular-text" placeholder="پیام حالت تعمیرات"></td></tr>
                </tbody></table>

                <h2>حداقل نسخهٔ مجاز</h2>
                <table class="form-table"><tbody>
                    <tr><th>Android</th><td><input type="text" name="min_version_android" value="<?php echo esc_attr($c['min_version_android']); ?>"></td></tr>
                    <tr><th>iOS</th><td><input type="text" name="min_version_ios" value="<?php echo esc_attr($c['min_version_ios']); ?>"></td></tr>
                </tbody></table>

                <h2>بخش‌های صفحهٔ اصلی (ترتیب نمایش)</h2>
                <table class="form-table"><tbody>
                    <?php
                    $all = array('latest' => 'جدیدترین‌ها', 'popular' => 'پربازدیدترین‌ها', 'selected' => 'منتخب‌ها', 'artists' => 'هنرمندان', 'albums' => 'آلبوم‌ها', 'remixes' => 'ریمیکس‌ها', 'videos' => 'موزیک ویدیوها');
                    foreach ($all as $key => $label):
                        $checked = in_array($key, $c['home_sections'], true); ?>
                        <tr><th><?php echo esc_html($label); ?></th><td><label><input type="checkbox" name="home_sections[]" value="<?php echo esc_attr($key); ?>" <?php checked($checked); ?>> نمایش</label></td></tr>
                    <?php endforeach; ?>
                </tbody></table>

                <h2>آهنگ‌های منتخب (ID America)</h2>
                <p><input type="text" name="selected_songs" value="<?php echo esc_attr(implode(',', $c['selected_songs'])); ?>" class="regular-text" placeholder="مثلاً 13033,13030"></p>

                <h2>رادیو و پلیر</h2>
                <table class="form-table"><tbody>
                    <tr><th>منبع پیش‌فرض رادیو</th><td><select name="radio_source">
                        <?php foreach (array('latest' => 'جدیدترین', 'popular' => 'پربازدیدترین', 'random' => 'تصادفی') as $v => $l)
                            echo '<option value="' . esc_attr($v) . '"' . selected($c['radio_source'], $v, false) . '>' . esc_html($l) . '</option>'; ?>
                    </select></td></tr>
                    <tr><th>پخش خودکار پلیر</th><td><label><input type="checkbox" name="playerAutoplay" value="1" <?php checked($c['playerAutoplay']); ?>> فعال</label></td></tr>
                </tbody></table>

                <h2>قابلیت‌ها (Feature Flags)</h2>
                <table class="form-table"><tbody>
                    <?php foreach ($c['feature_flags'] as $flag => $on): ?>
                        <tr><th><?php echo esc_html($flag); ?></th><td><label><input type="checkbox" name="feature_flags[<?php echo esc_attr($flag); ?>]" value="1" <?php checked($on); ?>> فعال</label></td></tr>
                    <?php endforeach; ?>
                </tbody></table>

                <h2>اعلان‌ها / اطلاعیه‌ها</h2>
                <p>هر خط: <code>عنوان | متن | لینک (اختیاری)</code></p>
                <textarea name="notifications_raw" rows="4" class="large-text"><?php
                    foreach ($c['notifications'] as $n) echo esc_textarea(($n['title'] ?? '') . ' | ' . ($n['body'] ?? '') . ' | ' . ($n['link'] ?? '')) . "\n";
                ?></textarea>
                <?php submit_button('ذخیرهٔ تنظیمات'); ?>
            </form>
        </div>
        <?php
    }
}
