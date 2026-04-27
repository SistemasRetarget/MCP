<?php
/**
 * Retarget News Theme Functions
 * Tema para portal de noticias con integración al plugin News Converter
 */

// Prevenir acceso directo
if (!defined('ABSPATH')) {
    exit;
}

// Constantes del tema
define('RETARGET_VERSION', '1.0.0');
define('RETARGET_DIR', get_template_directory());
define('RETARGET_URI', get_template_directory_uri());

/**
 * Setup del tema
 */
add_action('after_setup_theme', 'retarget_setup');
function retarget_setup() {
    // Soporte para traducciones
    load_theme_textdomain('retarget', RETARGET_DIR . '/languages');
    
    // Soporte para título automático
    add_theme_support('title-tag');
    
    // Soporte para imágenes destacadas
    add_theme_support('post-thumbnails');
    set_post_thumbnail_size(1200, 9999);
    
    // Tamaños de imagen personalizados
    add_image_size('carousel', 1200, 600, true);
    add_image_size('card', 400, 300, true);
    add_image_size('sidebar', 100, 80, true);
    
    // Soporte para HTML5
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'script',
        'style',
    ));
    
    // Soporte para logo personalizado
    add_theme_support('custom-logo', array(
        'height'      => 60,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
    ));
    
    // Soporte para colores del tema
    add_theme_support('editor-color-palette', array(
        array(
            'name'  => __('Primary', 'retarget'),
            'slug'  => 'primary',
            'color' => '#1a365d',
        ),
        array(
            'name'  => __('Accent', 'retarget'),
            'slug'  => 'accent',
            'color' => '#e53e3e',
        ),
    ));
    
    // Registrar menús
    register_nav_menus(array(
        'primary'   => __('Menú Principal', 'retarget'),
        'footer'    => __('Menú Footer', 'retarget'),
        'social'    => __('Menú Social', 'retarget'),
    ));
}

/**
 * Encolar scripts y estilos
 */
add_action('wp_enqueue_scripts', 'retarget_scripts');
function retarget_scripts() {
    // CSS principal
    wp_enqueue_style(
        'retarget-style',
        get_stylesheet_uri(),
        array(),
        RETARGET_VERSION
    );
    
    // Google Fonts
    wp_enqueue_style(
        'retarget-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        array(),
        null
    );
    
    // JavaScript del tema
    wp_enqueue_script(
        'retarget-scripts',
        RETARGET_URI . '/assets/js/theme.js',
        array(),
        RETARGET_VERSION,
        true
    );
    
    // Pasar variables a JavaScript
    wp_localize_script('retarget-scripts', 'retargetData', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('retarget_nonce'),
        'themeUri' => RETARGET_URI,
    ));
}

/**
 * Registrar widgets
 */
add_action('widgets_init', 'retarget_widgets_init');
function retarget_widgets_init() {
    // Sidebar principal
    register_sidebar(array(
        'name'          => __('Sidebar Principal', 'retarget'),
        'id'            => 'sidebar-1',
        'description'   => __('Widgets que aparecen en la barra lateral.', 'retarget'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
    
    // Footer widgets
    register_sidebar(array(
        'name'          => __('Footer 1', 'retarget'),
        'id'            => 'footer-1',
        'description'   => __('Primera columna del footer.', 'retarget'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="footer-title">',
        'after_title'   => '</h4>',
    ));
    
    register_sidebar(array(
        'name'          => __('Footer 2', 'retarget'),
        'id'            => 'footer-2',
        'description'   => __('Segunda columna del footer.', 'retarget'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="footer-title">',
        'after_title'   => '</h4>',
    ));
    
    register_sidebar(array(
        'name'          => __('Footer 3', 'retarget'),
        'id'            => 'footer-3',
        'description'   => __('Tercera columna del footer.', 'retarget'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4 class="footer-title">',
        'after_title'   => '</h4>',
    ));
}

/**
 * Clase personalizada para el menú walker
 */
class Retarget_Walker_Nav_Menu extends Walker_Nav_Menu {
    function start_lvl(&$output, $depth = 0, $args = null) {
        $indent = str_repeat("\t", $depth);
        $output .= "\n$indent<ul class=\"sub-menu\">\n";
    }
    
    function start_el(&$output, $item, $depth = 0, $args = null, $id = 0) {
        $indent = ($depth) ? str_repeat("\t", $depth) : '';
        
        $classes = empty($item->classes) ? array() : (array) $item->classes;
        $classes[] = 'menu-item-' . $item->ID;
        
        $class_names = join(' ', apply_filters('nav_menu_css_class', array_filter($classes), $item, $args));
        $class_names = $class_names ? ' class="' . esc_attr($class_names) . '"' : '';
        
        $id = apply_filters('nav_menu_item_id', 'menu-item-'. $item->ID, $item, $args);
        $id = $id ? ' id="' . esc_attr($id) . '"' : '';
        
        $output .= $indent . '<li' . $id . $class_names .'>';
        
        $attributes = ! empty($item->attr_title) ? ' title="' . esc_attr($item->attr_title) .'"' : '';
        $attributes .= ! empty($item->target) ? ' target="' . esc_attr($item->target) .'"' : '';
        $attributes .= ! empty($item->xfn) ? ' rel="' . esc_attr($item->xfn) .'"' : '';
        $attributes .= ! empty($item->url) ? ' href="' . esc_attr($item->url) .'"' : '';
        
        $item_output = $args->before;
        $item_output .= '<a'. $attributes .'>';
        $item_output .= $args->link_before . apply_filters('the_title', $item->title, $item->ID) . $args->link_after;
        $item_output .= '</a>';
        $item_output .= $args->after;
        
        $output .= apply_filters('walker_nav_menu_start_el', $item_output, $item, $depth, $args);
    }
}

/**
 * Customizer - Opciones del tema
 */
add_action('customize_register', 'retarget_customize_register');
function retarget_customize_register($wp_customize) {
    // Panel principal
    $wp_customize->add_panel('retarget_options', array(
        'title'    => __('Opciones Retarget', 'retarget'),
        'priority' => 1,
    ));
    
    // Sección: Header
    $wp_customize->add_section('retarget_header', array(
        'title'    => __('Header', 'retarget'),
        'panel'    => 'retarget_options',
        'priority' => 1,
    ));
    
    // Breaking News
    $wp_customize->add_setting('retarget_breaking_news', array(
        'default'           => true,
        'sanitize_callback' => 'wp_validate_boolean',
    ));
    $wp_customize->add_control('retarget_breaking_news', array(
        'type'    => 'checkbox',
        'label'   => __('Mostrar barra de últimas noticias', 'retarget'),
        'section' => 'retarget_header',
    ));
    
    // Sección: Carousel
    $wp_customize->add_section('retarget_carousel', array(
        'title'    => __('Carrusel Principal', 'retarget'),
        'panel'    => 'retarget_options',
        'priority' => 2,
    ));
    
    $wp_customize->add_setting('retarget_carousel_enabled', array(
        'default'           => true,
        'sanitize_callback' => 'wp_validate_boolean',
    ));
    $wp_customize->add_control('retarget_carousel_enabled', array(
        'type'    => 'checkbox',
        'label'   => __('Mostrar carrusel en homepage', 'retarget'),
        'section' => 'retarget_carousel',
    ));
    
    $wp_customize->add_setting('retarget_carousel_count', array(
        'default'           => 5,
        'sanitize_callback' => 'absint',
    ));
    $wp_customize->add_control('retarget_carousel_count', array(
        'type'    => 'number',
        'label'   => __('Número de slides', 'retarget'),
        'section' => 'retarget_carousel',
        'input_attrs' => array(
            'min'  => 1,
            'max'  => 10,
            'step' => 1,
        ),
    ));
    
    // Sección: Colores
    $wp_customize->add_section('retarget_colors', array(
        'title'    => __('Colores', 'retarget'),
        'panel'    => 'retarget_options',
        'priority' => 3,
    ));
    
    $wp_customize->add_setting('retarget_primary_color', array(
        'default'           => '#1a365d',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'retarget_primary_color', array(
        'label'   => __('Color primario', 'retarget'),
        'section' => 'retarget_colors',
    )));
    
    $wp_customize->add_setting('retarget_accent_color', array(
        'default'           => '#e53e3e',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'retarget_accent_color', array(
        'label'   => __('Color de acento', 'retarget'),
        'section' => 'retarget_colors',
    )));
}

/**
 * Generar CSS dinámico del Customizer
 */
add_action('wp_head', 'retarget_customizer_css');
function retarget_customizer_css() {
    $primary = get_theme_mod('retarget_primary_color', '#1a365d');
    $accent = get_theme_mod('retarget_accent_color', '#e53e3e');
    ?>
    <style type="text/css">
        :root {
            --primary: <?php echo esc_attr($primary); ?>;
            --accent: <?php echo esc_attr($accent); ?>;
        }
    </style>
    <?php
}

/**
 * Funciones auxiliares para templates
 */

// Obtener posts para el carrusel
function retarget_get_carousel_posts($count = 5) {
    return get_posts(array(
        'posts_per_page' => $count,
        'post_status'    => 'publish',
        'orderby'        => 'date',
        'order'          => 'DESC',
    ));
}

// Obtener posts recientes para widgets
function retarget_get_recent_posts($count = 5, $category = null) {
    $args = array(
        'posts_per_page' => $count,
        'post_status'    => 'publish',
        'orderby'        => 'date',
        'order'          => 'DESC',
    );
    
    if ($category) {
        $args['cat'] = $category;
    }
    
    return get_posts($args);
}

// Obtener categorías populares
function retarget_get_popular_categories($count = 5) {
    return get_categories(array(
        'orderby' => 'count',
        'order'   => 'DESC',
        'number'  => $count,
    ));
}

// Formatear fecha relativa
function retarget_time_ago($post_date) {
    $time = human_time_diff(strtotime($post_date), current_time('timestamp'));
    return sprintf(__('%s atrás', 'retarget'), $time);
}

// Obtener resumen del post
function retarget_get_excerpt($post_id, $length = 20) {
    $post = get_post($post_id);
    
    if (has_excerpt($post_id)) {
        return get_the_excerpt($post_id);
    }
    
    $excerpt = wp_trim_words($post->post_content, $length);
    return $excerpt;
}

// Verificar si estamos en modo demo (sin plugin)
function retarget_is_demo_mode() {
    return !class_exists('News_Converter');
}

// Obtener posts de demo (mock data)
function retarget_get_demo_posts($count = 6) {
    $demo_posts = array(
        array(
            'title'    => 'Paz Charpentier: Unboxing invitaciones cambio de mando',
            'excerpt'  => 'La diputada electa muestra las invitaciones para el juramento del miércoles 11. Los comentarios en redes destacan la controversia sobre el financiamiento...',
            'category' => 'Política',
            'image'    => 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
            'date'     => 'Hace 2 horas',
        ),
        array(
            'title'    => 'Reforma tributaria: Congreso debate nueva propuesta',
            'excerpt'  => 'El proyecto busca aumentar la recaudación en un 2% del PIB. Expertos advierten impacto en la inversión...',
            'category' => 'Economía',
            'image'    => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
            'date'     => 'Hace 4 horas',
        ),
        array(
            'title'    => 'Nueva tecnología chilena revoluciona industria minera',
            'excerpt'  => 'Startup nacional desarrolla sistema de extracción que reduce consumo de agua en un 40%...',
            'category' => 'Tecnología',
            'image'    => 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
            'date'     => 'Hace 5 horas',
        ),
        array(
            'title'    => 'Partido de Chile vs Argentina por eliminatorias',
            'excerpt'  => 'La Roja busca recuperarse tras derrota ante Uruguay. Bielsa confirmó alineación con sorpresas...',
            'category' => 'Deportes',
            'image'    => 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
            'date'     => 'Hace 6 horas',
        ),
        array(
            'title'    => 'Festival de Viña 2025 anuncia primeros artistas',
            'excerpt'  => 'La Quinta Vergara recibirá a artistas internacionales. Entradas salen a la venta la próxima semana...',
            'category' => 'Cultura',
            'image'    => 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
            'date'     => 'Hace 8 horas',
        ),
        array(
            'title'    => 'Alerta por sistema frontal en zona centro-sur',
            'excerpt'  => 'Onemag advierte precipitaciones intensas entre Biobío y Los Lagos durante el fin de semana...',
            'category' => 'Nacional',
            'image'    => 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800',
            'date'     => 'Hace 10 horas',
        ),
    );
    
    return array_slice($demo_posts, 0, $count);
}

// Obtener breaking news de demo
function retarget_get_demo_breaking() {
    return array(
        'URGENTE: Congreso aprueba en general reforma tributaria',
        'Mercados cierran con alza del 2% tras anuncios económicos',
        'Selección chilena confirma equipo para partido crucial',
    );
}

/**
 * Filtros
 */

// Añadir clase a los enlaces de paginación
add_filter('next_posts_link_attributes', 'retarget_pagination_link_class');
add_filter('previous_posts_link_attributes', 'retarget_pagination_link_class');
function retarget_pagination_link_class() {
    return 'class="pagination-link"';
}

// Custom excerpt length
add_filter('excerpt_length', 'retarget_excerpt_length');
function retarget_excerpt_length($length) {
    return 25;
}

// Custom excerpt more
add_filter('excerpt_more', 'retarget_excerpt_more');
function retarget_excerpt_more($more) {
    return '...';
}

/**
 * Shortcodes
 */

// Shortcode para carrusel
add_shortcode('retarget_carousel', 'retarget_carousel_shortcode');
function retarget_carousel_shortcode($atts) {
    $atts = shortcode_atts(array(
        'count' => 5,
    ), $atts, 'retarget_carousel');
    
    ob_start();
    get_template_part('template-parts/carousel', null, array('count' => $atts['count']));
    return ob_get_clean();
}

// Shortcode para grilla de noticias
add_shortcode('retarget_grid', 'retarget_grid_shortcode');
function retarget_grid_shortcode($atts) {
    $atts = shortcode_atts(array(
        'count'   => 6,
        'columns' => 3,
        'category' => '',
    ), $atts, 'retarget_grid');
    
    ob_start();
    get_template_part('template-parts/news-grid', null, $atts);
    return ob_get_clean();
}
