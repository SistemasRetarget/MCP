<?php
/**
 * Retarget Modern - Tema WordPress con Vite
 * 
 * @package RetargetModern
 * @author The Solve
 * @version 2.0.0
 */

if (!defined('ABSPATH')) exit;

// Constantes
define('RETARGET_VERSION', '2.0.0');
define('RETARGET_DIR', get_template_directory());
define('RETARGET_URI', get_template_directory_uri());
define('RETARGET_DIST', RETARGET_URI . '/dist');
define('RETARGET_DEV_MODE', defined('WP_DEBUG') && WP_DEBUG);

/**
 * Setup del tema
 */
add_action('after_setup_theme', 'retarget_setup');
function retarget_setup() {
    load_theme_textdomain('retarget', RETARGET_DIR . '/languages');
    
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'script', 'style']);
    add_theme_support('custom-logo', ['height' => 60, 'width' => 200, 'flex-height' => true, 'flex-width' => true]);
    add_theme_support('customize-selective-refresh-widgets');
    add_theme_support('editor-styles');
    add_theme_support('responsive-embeds');
    add_theme_support('wp-block-styles');
    add_theme_support('align-wide');
    
    // Image sizes
    add_image_size('hero', 1600, 900, true);
    add_image_size('card', 800, 600, true);
    add_image_size('thumb', 400, 300, true);
    add_image_size('sidebar', 200, 150, true);
    
    // Menús
    register_nav_menus([
        'primary' => __('Menú Principal', 'retarget'),
        'mobile' => __('Menú Móvil', 'retarget'),
        'footer' => __('Menú Footer', 'retarget'),
    ]);
}

/**
 * Encolar assets con Vite
 */
add_action('wp_enqueue_scripts', 'retarget_scripts');
function retarget_scripts() {
    // Desencolar jQuery por defecto si no se necesita
    // wp_deregister_script('jquery');
    
    // En desarrollo o producción
    if (RETARGET_DEV_MODE) {
        // Modo desarrollo - HMR de Vite
        wp_enqueue_script('vite-client', 'http://localhost:3000/@vite/client', [], null, false);
        wp_enqueue_script('retarget-main', 'http://localhost:3000/src/js/main.js', [], null, true);
    } else {
        // Modo producción - Assets compilados
        $manifest = retarget_get_manifest();
        
        if ($manifest) {
            // CSS
            if (isset($manifest['src/js/main.js']['css'])) {
                foreach ($manifest['src/js/main.js']['css'] as $css_file) {
                    wp_enqueue_style(
                        'retarget-style',
                        RETARGET_DIST . '/' . $css_file,
                        [],
                        RETARGET_VERSION
                    );
                }
            }
            
            // JS
            wp_enqueue_script(
                'retarget-main',
                RETARGET_DIST . '/' . $manifest['src/js/main.js']['file'],
                [],
                RETARGET_VERSION,
                true
            );
            
            // Legacy JS para navegadores antiguos
            if (isset($manifest['src/js/main.js-legacy'])) {
                wp_enqueue_script(
                    'retarget-main-legacy',
                    RETARGET_DIST . '/' . $manifest['src/js/main.js-legacy']['file'],
                    [],
                    RETARGET_VERSION,
                    true
                );
            }
        }
    }
    
    // Localizar datos para JS
    wp_localize_script('retarget-main', 'retargetData', [
        'restUrl' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'themeUri' => RETARGET_URI,
        'isDev' => RETARGET_DEV_MODE,
    ]);
}

/**
 * Leer manifest de Vite
 */
function retarget_get_manifest() {
    $manifest_path = RETARGET_DIR . '/dist/.vite/manifest.json';
    
    if (!file_exists($manifest_path)) {
        return false;
    }
    
    $manifest = json_decode(file_get_contents($manifest_path), true);
    return $manifest;
}

/**
 * Google Fonts
 */
add_action('wp_head', 'retarget_preconnect');
function retarget_preconnect() {
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
    echo '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">' . "\n";
}

/**
 * Widgets
 */
add_action('widgets_init', 'retarget_widgets');
function retarget_widgets() {
    register_sidebar([
        'name' => __('Sidebar Principal', 'retarget'),
        'id' => 'sidebar-1',
        'description' => __('Widgets de la barra lateral.', 'retarget'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h3 class="widget-title">',
        'after_title' => '</h3>',
    ]);
    
    register_sidebar([
        'name' => __('Pre-footer 1', 'retarget'),
        'id' => 'footer-1',
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h4 class="footer-title">',
        'after_title' => '</h4>',
    ]);
    
    register_sidebar([
        'name' => __('Pre-footer 2', 'retarget'),
        'id' => 'footer-2',
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h4 class="footer-title">',
        'after_title' => '</h4>',
    ]);
    
    register_sidebar([
        'name' => __('Pre-footer 3', 'retarget'),
        'id' => 'footer-3',
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h4 class="footer-title">',
        'after_title' => '</h4>',
    ]);
}

/**
 * Customizer
 */
add_action('customize_register', 'retarget_customize');
function retarget_customize($wp_customize) {
    // Panel principal
    $wp_customize->add_panel('retarget_panel', [
        'title' => __('Retarget Options', 'retarget'),
        'priority' => 1,
    ]);
    
    // Sección: Header
    $wp_customize->add_section('retarget_header', [
        'title' => __('Header', 'retarget'),
        'panel' => 'retarget_panel',
    ]);
    
    $wp_customize->add_setting('retarget_breaking', [
        'default' => true,
        'sanitize_callback' => 'wp_validate_boolean',
    ]);
    $wp_customize->add_control('retarget_breaking', [
        'type' => 'checkbox',
        'label' => __('Mostrar barra de breaking news', 'retarget'),
        'section' => 'retarget_header',
    ]);
    
    // Sección: Carrusel
    $wp_customize->add_section('retarget_carousel', [
        'title' => __('Carrusel Principal', 'retarget'),
        'panel' => 'retarget_panel',
    ]);
    
    $wp_customize->add_setting('retarget_carousel_enabled', [
        'default' => true,
        'sanitize_callback' => 'wp_validate_boolean',
    ]);
    $wp_customize->add_control('retarget_carousel_enabled', [
        'type' => 'checkbox',
        'label' => __('Mostrar carrusel', 'retarget'),
        'section' => 'retarget_carousel',
    ]);
    
    $wp_customize->add_setting('retarget_carousel_count', [
        'default' => 5,
        'sanitize_callback' => 'absint',
    ]);
    $wp_customize->add_control('retarget_carousel_count', [
        'type' => 'number',
        'label' => __('Cantidad de slides', 'retarget'),
        'section' => 'retarget_carousel',
        'input_attrs' => ['min' => 1, 'max' => 10],
    ]);
    
    // Sección: Colores
    $wp_customize->add_section('retarget_colors', [
        'title' => __('Colores', 'retarget'),
        'panel' => 'retarget_panel',
    ]);
    
    $wp_customize->add_setting('retarget_primary_color', [
        'default' => '#1a365d',
        'sanitize_callback' => 'sanitize_hex_color',
    ]);
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'retarget_primary_color', [
        'label' => __('Color primario', 'retarget'),
        'section' => 'retarget_colors',
    ]));
    
    $wp_customize->add_setting('retarget_accent_color', [
        'default' => '#e53e3e',
        'sanitize_callback' => 'sanitize_hex_color',
    ]);
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'retarget_accent_color', [
        'label' => __('Color acento', 'retarget'),
        'section' => 'retarget_colors',
    ]));
}

/**
 * CSS dinámico del customizer
 */
add_action('wp_head', 'retarget_customizer_css');
function retarget_customizer_css() {
    $primary = get_theme_mod('retarget_primary_color', '#1a365d');
    $accent = get_theme_mod('retarget_accent_color', '#e53e3e');
    ?>
    <style>
        :root {
            --color-primary: <?php echo esc_attr($primary); ?>;
            --color-accent: <?php echo esc_attr($accent); ?>;
        }
    </style>
    <?php
}

/**
 * Funciones helper
 */

// Obtener posts para carrusel
function retarget_get_carousel_posts($count = 5) {
    return get_posts([
        'posts_per_page' => $count,
        'post_status' => 'publish',
        'meta_key' => '_is_featured',
        'meta_value' => '1',
    ]) ?: get_posts([
        'posts_per_page' => $count,
        'post_status' => 'publish',
    ]);
}

// Obtener posts recientes
function retarget_get_recent($count = 6, $category = null) {
    $args = [
        'posts_per_page' => $count,
        'post_status' => 'publish',
    ];
    if ($category) {
        $args['cat'] = $category;
    }
    return get_posts($args);
}

// Tiempo relativo
function retarget_time_ago($post_date) {
    return sprintf(__('Hace %s', 'retarget'), 
        human_time_diff(strtotime($post_date), current_time('timestamp'))
    );
}

// Obtener excerpt
function retarget_excerpt($post_id, $length = 20) {
    if (has_excerpt($post_id)) {
        return get_the_excerpt($post_id);
    }
    return wp_trim_words(get_post_field('post_content', $post_id), $length);
}

// Verificar modo demo
function retarget_is_demo() {
    return !class_exists('News_Converter') || get_option('retarget_demo_mode', true);
}

// Mock data para demo
function retarget_demo_posts($count = 6) {
    $posts = [
        [
            'title' => 'Paz Charpentier: Unboxing invitaciones cambio de mando',
            'excerpt' => 'La diputada electa muestra las invitaciones para el juramento del miércoles 11. Los comentarios en redes destacan la controversia sobre el financiamiento...',
            'category' => 'Política',
            'image' => 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1600',
            'date' => 'Hace 2 horas',
        ],
        [
            'title' => 'Reforma tributaria: Congreso debate nueva propuesta',
            'excerpt' => 'El proyecto busca aumentar la recaudación en un 2% del PIB. Expertos advierten impacto en la inversión...',
            'category' => 'Economía',
            'image' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600',
            'date' => 'Hace 4 horas',
        ],
        [
            'title' => 'Nueva tecnología chilena revoluciona industria minera',
            'excerpt' => 'Startup nacional desarrolla sistema de extracción que reduce consumo de agua en un 40%...',
            'category' => 'Tecnología',
            'image' => 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600',
            'date' => 'Hace 5 horas',
        ],
        [
            'title' => 'Partido de Chile vs Argentina por eliminatorias',
            'excerpt' => 'La Roja busca recuperarse tras derrota ante Uruguay. Bielsa confirmó alineación con sorpresas...',
            'category' => 'Deportes',
            'image' => 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600',
            'date' => 'Hace 6 horas',
        ],
        [
            'title' => 'Festival de Viña 2025 anuncia primeros artistas',
            'excerpt' => 'La Quinta Vergara recibirá a artistas internacionales. Entradas salen a la venta la próxima semana...',
            'category' => 'Cultura',
            'image' => 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600',
            'date' => 'Hace 8 horas',
        ],
        [
            'title' => 'Alerta por sistema frontal en zona centro-sur',
            'excerpt' => 'Onemag advierte precipitaciones intensas entre Biobío y Los Lagos durante el fin de semana...',
            'category' => 'Nacional',
            'image' => 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1600',
            'date' => 'Hace 10 horas',
        ],
    ];
    return array_slice($posts, 0, $count);
}

// Walker para menú personalizado
class Retarget_Walker extends Walker_Nav_Menu {
    function start_el(&$output, $item, $depth = 0, $args = null, $id = 0) {
        $indent = ($depth) ? str_repeat("\t", $depth) : '';
        $classes = empty($item->classes) ? [] : (array) $item->classes;
        $classes[] = 'nav-link';
        $class_names = join(' ', apply_filters('nav_menu_css_class', array_filter($classes), $item, $args));
        
        $output .= $indent . '<li class="' . esc_attr($class_names) . '">';
        
        $attributes = !empty($item->attr_title) ? ' title="' . esc_attr($item->attr_title) . '"' : '';
        $attributes .= !empty($item->target) ? ' target="' . esc_attr($item->target) . '"' : '';
        $attributes .= !empty($item->xfn) ? ' rel="' . esc_attr($item->xfn) . '"' : '';
        $attributes .= !empty($item->url) ? ' href="' . esc_attr($item->url) . '"' : '';
        
        $output .= '<a' . $attributes . '>';
        $output .= apply_filters('the_title', $item->title, $item->ID);
        $output .= '</a>';
    }
}

/**
 * Mejoras de performance
 */

// Lazy load nativo para imágenes
add_filter('wp_img_tag_add_loading_attr', '__return_true');

// Preload crítico
add_action('wp_head', 'retarget_preload_critical', 1);
function retarget_preload_critical() {
    if (!RETARGET_DEV_MODE) {
        $manifest = retarget_get_manifest();
        if ($manifest && isset($manifest['src/js/main.js']['css'])) {
            foreach ($manifest['src/js/main.js']['css'] as $css) {
                echo '<link rel="preload" href="' . esc_url(RETARGET_DIST . '/' . $css) . '" as="style">' . "\n";
            }
        }
    }
}

// Deshabilitar emojis
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('admin_print_scripts', 'print_emoji_detection_script');
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('admin_print_styles', 'print_emoji_styles');

// Deshabilitar embeds si no se usan
// remove_action('wp_head', 'wp_oembed_add_discovery_links');
// remove_action('wp_head', 'wp_oembed_add_host_js');
