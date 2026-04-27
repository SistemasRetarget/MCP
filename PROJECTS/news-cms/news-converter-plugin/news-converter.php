<?php
/**
 * Plugin Name: News Converter
 * Plugin URI: https://example.com/news-converter
 * Description: Convierte links de redes sociales (Twitter/X, etc.) en posts de WordPress usando OpenAI.
 * Version: 1.0.0
 * Author: News Converter Team
 * License: GPL v2 or later
 * Text Domain: news-converter
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'NC_VERSION', '1.4.0' );
define( 'NC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once NC_PLUGIN_DIR . 'includes/class-database.php';
require_once NC_PLUGIN_DIR . 'includes/class-taxonomies.php';
require_once NC_PLUGIN_DIR . 'includes/class-extractor.php';
require_once NC_PLUGIN_DIR . 'includes/class-openai.php';
require_once NC_PLUGIN_DIR . 'includes/class-feedback.php';
require_once NC_PLUGIN_DIR . 'includes/class-admin.php';
require_once NC_PLUGIN_DIR . 'includes/class-processor.php';
require_once NC_PLUGIN_DIR . 'includes/class-queue-admin.php';
require_once NC_PLUGIN_DIR . 'includes/class-instagram-comments.php';
require_once NC_PLUGIN_DIR . 'includes/class-instagram-scraper.php';
require_once NC_PLUGIN_DIR . 'includes/class-instagram-admin.php';
require_once NC_PLUGIN_DIR . 'includes/class-editorial-dashboard.php';
require_once NC_PLUGIN_DIR . 'includes/class-editorial-sources.php';
require_once NC_PLUGIN_DIR . 'includes/class-editorial-queue.php';
require_once NC_PLUGIN_DIR . 'includes/class-editorial-demo.php';

class News_Converter {

    private static $instance = null;

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
        add_action( 'wp_ajax_nc_convert_url', array( $this, 'ajax_convert_url' ) );
        add_action( 'wp_ajax_nc_publish_post', array( $this, 'ajax_publish_post' ) );
        add_action( 'wp_ajax_nc_regenerate_field', array( $this, 'ajax_regenerate_field' ) );
        add_action( 'wp_ajax_nc_edit_image', array( $this, 'ajax_edit_image' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );

        NC_Taxonomies::register();
        add_action( 'init', array( $this, 'register_post_types' ) );

        add_action( 'nc_cron_process_sources', array( $this, 'cron_process_sources' ) );
        if ( ! wp_next_scheduled( 'nc_cron_process_sources' ) ) {
            wp_schedule_event( time(), 'five_minutes', 'nc_cron_process_sources' );
        }

        add_filter( 'cron_schedules', array( $this, 'add_cron_intervals' ) );
    }

    public function register_post_types() {
        // Post types registrados en NC_Taxonomies
    }

    public function cron_process_sources() {
        $processor = new NC_Processor();
        $processor->run_scheduled_processing();
    }

    public function add_cron_intervals( $schedules ) {
        $schedules['five_minutes'] = array(
            'interval' => 300,
            'display'  => __( 'Cada 5 minutos', 'news-converter' ),
        );
        return $schedules;
    }

    public static function activate() {
        NC_Database::install();
        NC_Taxonomies::register();
        flush_rewrite_rules();
    }

    public static function deactivate() {
        wp_clear_scheduled_hook( 'nc_cron_process_sources' );
    }

    public function add_admin_menu() {
        add_menu_page(
            'Portal Editorial',
            '📰 Portal Editorial',
            'edit_posts',
            'news-converter',
            array( 'NC_Editorial_Dashboard', 'render_dashboard' ),
            'dashicons-rss',
            30
        );

        add_submenu_page(
            'news-converter',
            'Dashboard',
            '📊 Dashboard',
            'edit_posts',
            'news-converter',
            array( 'NC_Editorial_Dashboard', 'render_dashboard' )
        );

        add_submenu_page(
            'news-converter',
            'Configuración',
            '⚙️ Configuración',
            'manage_options',
            'news-converter-settings',
            array( 'NC_Admin', 'render_settings_page' )
        );
    }

    public function enqueue_admin_assets( $hook ) {
        if ( strpos( $hook, 'news-converter' ) === false ) {
            return;
        }
        wp_enqueue_style( 'nc-admin-css', NC_PLUGIN_URL . 'assets/css/admin.css', array(), NC_VERSION );
        wp_enqueue_script( 'nc-admin-js', NC_PLUGIN_URL . 'assets/js/admin.js', array( 'jquery' ), NC_VERSION, true );
        wp_localize_script( 'nc-admin-js', 'ncAjax', array(
            'ajaxurl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( 'nc_nonce' ),
        ) );
    }

    public function register_settings() {
        register_setting( 'nc_settings_group', 'nc_openai_api_key' );
        register_setting( 'nc_settings_group', 'nc_default_category' );
        register_setting( 'nc_settings_group', 'nc_openai_model' );
    }

    public function ajax_convert_url() {
        check_ajax_referer( 'nc_nonce', 'nonce' );

        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_send_json_error( 'Permisos insuficientes' );
        }

        $url = isset( $_POST['url'] ) ? esc_url_raw( $_POST['url'] ) : '';

        if ( empty( $url ) ) {
            wp_send_json_error( 'URL es requerida' );
        }

        $extractor = new NC_Extractor();
        $extracted = $extractor->extract( $url );

        if ( is_wp_error( $extracted ) ) {
            wp_send_json_error( $extracted->get_error_message() );
        }

        $api_key = get_option( 'nc_openai_api_key', '' );
        if ( empty( $api_key ) ) {
            wp_send_json_error( 'Configura tu API Key de OpenAI en Configuración' );
        }

        $model = get_option( 'nc_openai_model', 'gpt-4o-mini' );
        $openai = new NC_OpenAI( $api_key, $model );
        $analyzed = $openai->analyze( $extracted );

        if ( is_wp_error( $analyzed ) ) {
            wp_send_json_error( $analyzed->get_error_message() );
        }

        $analyzed['original_url'] = $url;
        $analyzed['extracted_raw'] = $extracted;

        wp_send_json_success( $analyzed );
    }

    public function ajax_regenerate_field() {
        check_ajax_referer( 'nc_nonce', 'nonce' );

        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_send_json_error( 'Permisos insuficientes' );
        }

        $field         = sanitize_text_field( $_POST['field'] ?? '' );
        $current_value = sanitize_textarea_field( $_POST['current_value'] ?? '' );
        $context       = sanitize_textarea_field( $_POST['context'] ?? '' );
        $original_title = sanitize_text_field( $_POST['original_title'] ?? '' );

        if ( empty( $field ) ) {
            wp_send_json_error( 'Campo no especificado' );
        }

        $api_key = get_option( 'nc_openai_api_key', '' );
        if ( empty( $api_key ) ) {
            wp_send_json_error( 'Configura tu API Key de OpenAI' );
        }

        $title_lessons = NC_Feedback::format_lessons_for_prompt( 'title', 5 );

        $prompts = array(
            'title' => 'Genera una NUEVA cuña periodística diferente a esta: "' . $current_value . '"

Contexto de la noticia: ' . $context . '
Título original de la fuente (NO lo repitas): ' . $original_title . '

REGLAS:
- PROHIBIDO usar nombres de personas.
- PROHIBIDO parafrasear (nada de "Fulano critica/advierte/señala").
- PROHIBIDO porcentajes o cifras numéricas.
- Solo la afirmación directa, como cita textual sin comillas.
- Máximo 80 caracteres. Corta, potente, decidora.
- DEBE SER DIFERENTE a: "' . $current_value . '"
' . $title_lessons . '
Responde SOLO con la nueva cuña, sin comillas, sin explicación.',

            'excerpt' => 'Mejora este extracto periodístico: "' . $current_value . '"

Contexto: ' . $context . '

Debe ser un resumen breve que contextualice la opinión, máximo 160 caracteres. No repitas el título.
Responde SOLO con el nuevo extracto, sin comillas.',

            'author' => 'Identifica mejor al autor/fuente de esta noticia.

Valor actual: "' . $current_value . '"
Contexto: ' . $context . '

Responde SOLO con el nombre correcto del autor o fuente, sin explicación.',

            'content' => 'Mejora y reescribe este contenido para un post de opinión en un blog de noticias:

' . $current_value . '

Contexto adicional: ' . $context . '

Formatea en HTML usando <p>, <strong>, <em>. Máximo 500 palabras. Tono periodístico de opinión.
Responde SOLO con el HTML del contenido.',
        );

        if ( ! isset( $prompts[ $field ] ) ) {
            wp_send_json_error( 'Campo no válido' );
        }

        $model = get_option( 'nc_openai_model', 'gpt-4o-mini' );

        $response = wp_remote_post( 'https://api.openai.com/v1/chat/completions', array(
            'timeout' => 30,
            'headers' => array(
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $api_key,
            ),
            'body'    => wp_json_encode( array(
                'model'      => $model,
                'max_tokens' => $field === 'content' ? 1500 : 200,
                'messages'   => array(
                    array(
                        'role'    => 'system',
                        'content' => 'Eres un editor periodístico chileno experto en columnas de opinión. Respondes de forma directa, sin explicaciones ni formato extra.',
                    ),
                    array(
                        'role'    => 'user',
                        'content' => $prompts[ $field ],
                    ),
                ),
            ) ),
        ) );

        if ( is_wp_error( $response ) ) {
            wp_send_json_error( 'Error conectando con OpenAI' );
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );
        $new_value = trim( $data['choices'][0]['message']['content'] ?? '' );
        $new_value = trim( $new_value, '"\'""' );

        if ( empty( $new_value ) ) {
            wp_send_json_error( 'No se generó contenido' );
        }

        wp_send_json_success( array( 'value' => $new_value ) );
    }

    public function ajax_edit_image() {
        check_ajax_referer( 'nc_nonce', 'nonce' );

        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_send_json_error( 'Permisos insuficientes' );
        }

        $image_url   = esc_url_raw( $_POST['image_url'] ?? '' );
        $instruction = sanitize_text_field( $_POST['instruction'] ?? '' );
        $title       = sanitize_text_field( $_POST['title'] ?? '' );
        $filter      = sanitize_text_field( $_POST['filter'] ?? '' );
        $overlay_text = sanitize_text_field( $_POST['overlay_text'] ?? '' );

        if ( empty( $image_url ) ) {
            wp_send_json_error( 'No hay imagen para editar' );
        }

        $tmp_file = download_url( $image_url, 30 );
        if ( is_wp_error( $tmp_file ) ) {
            wp_send_json_error( 'No se pudo descargar la imagen: ' . $tmp_file->get_error_message() );
        }

        $image_info = getimagesize( $tmp_file );
        if ( ! $image_info ) {
            @unlink( $tmp_file );
            wp_send_json_error( 'Archivo no es una imagen válida' );
        }

        $mime = $image_info['mime'];
        switch ( $mime ) {
            case 'image/jpeg':
                $img = imagecreatefromjpeg( $tmp_file );
                break;
            case 'image/png':
                $img = imagecreatefrompng( $tmp_file );
                break;
            case 'image/webp':
                $img = imagecreatefromwebp( $tmp_file );
                break;
            default:
                @unlink( $tmp_file );
                wp_send_json_error( 'Formato de imagen no soportado: ' . $mime );
        }

        @unlink( $tmp_file );

        if ( ! $img ) {
            wp_send_json_error( 'Error procesando la imagen' );
        }

        $width  = imagesx( $img );
        $height = imagesy( $img );

        if ( ! empty( $filter ) ) {
            switch ( $filter ) {
                case 'grayscale':
                    imagefilter( $img, IMG_FILTER_GRAYSCALE );
                    break;
                case 'sepia':
                    imagefilter( $img, IMG_FILTER_GRAYSCALE );
                    imagefilter( $img, IMG_FILTER_COLORIZE, 90, 60, 30 );
                    break;
                case 'contrast':
                    imagefilter( $img, IMG_FILTER_CONTRAST, -30 );
                    break;
                case 'brightness':
                    imagefilter( $img, IMG_FILTER_BRIGHTNESS, 30 );
                    break;
                case 'darken':
                    imagefilter( $img, IMG_FILTER_BRIGHTNESS, -50 );
                    break;
                case 'blur':
                    for ( $i = 0; $i < 5; $i++ ) {
                        imagefilter( $img, IMG_FILTER_GAUSSIAN_BLUR );
                    }
                    break;
                case 'sharpen':
                    imagefilter( $img, IMG_FILTER_CONTRAST, -10 );
                    $sharpen = array(
                        array( -1, -1, -1 ),
                        array( -1, 16, -1 ),
                        array( -1, -1, -1 ),
                    );
                    imageconvolution( $img, $sharpen, 8, 0 );
                    break;
            }
        }

        if ( ! empty( $overlay_text ) ) {
            $font_size_px = max( 16, intval( $width * 0.035 ) );
            $padding = intval( $width * 0.04 );
            $max_chars_per_line = intval( ($width - $padding * 2) / ($font_size_px * 0.55) );

            $wrapped = wordwrap( $overlay_text, $max_chars_per_line, "\n", true );
            $lines = explode( "\n", $wrapped );
            $line_count = count( $lines );

            $line_height = intval( $font_size_px * 1.4 );
            $block_height = $line_count * $line_height + $padding * 2;

            $overlay = imagecreatetruecolor( $width, $block_height );
            imagealphablending( $overlay, false );
            $bg_color = imagecolorallocatealpha( $overlay, 0, 0, 0, 40 );
            imagefilledrectangle( $overlay, 0, 0, $width, $block_height, $bg_color );
            imagealphablending( $overlay, true );

            $y_start = $height - $block_height;
            imagecopymerge( $img, $overlay, 0, $y_start, 0, 0, $width, $block_height, 100 );
            imagedestroy( $overlay );

            $text_color = imagecolorallocate( $img, 255, 255, 255 );
            $shadow_color = imagecolorallocate( $img, 0, 0, 0 );

            $font_file = NC_PLUGIN_DIR . 'assets/fonts/OpenSans-Bold.ttf';
            $use_ttf = file_exists( $font_file );

            foreach ( $lines as $i => $line ) {
                $line = trim( $line );
                $y = $y_start + $padding + ($i * $line_height) + $font_size_px;

                if ( $use_ttf ) {
                    $bbox = imagettfbbox( $font_size_px * 0.75, 0, $font_file, $line );
                    $text_width = $bbox[2] - $bbox[0];
                    $x = intval( ($width - $text_width) / 2 );
                    imagettftext( $img, $font_size_px * 0.75, 0, $x + 2, $y + 2, $shadow_color, $font_file, $line );
                    imagettftext( $img, $font_size_px * 0.75, 0, $x, $y, $text_color, $font_file, $line );
                } else {
                    $builtin_font = 5;
                    $char_w = imagefontwidth( $builtin_font );
                    $text_width = strlen( $line ) * $char_w;
                    $x = intval( ($width - $text_width) / 2 );
                    imagestring( $img, $builtin_font, $x + 1, $y - $font_size_px + 1, $line, $shadow_color );
                    imagestring( $img, $builtin_font, $x, $y - $font_size_px, $line, $text_color );
                }
            }
        }

        $upload_dir = wp_upload_dir();
        $filename = 'nc-edited-' . time() . '.jpg';
        $filepath = $upload_dir['path'] . '/' . $filename;
        $fileurl  = $upload_dir['url'] . '/' . $filename;

        imagejpeg( $img, $filepath, 92 );
        imagedestroy( $img );

        wp_send_json_success( array( 'image_url' => $fileurl ) );
    }

    public function ajax_publish_post() {
        check_ajax_referer( 'nc_nonce', 'nonce' );

        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_send_json_error( 'Permisos insuficientes' );
        }

        $title    = sanitize_text_field( $_POST['title'] ?? '' );
        $excerpt  = sanitize_textarea_field( $_POST['excerpt'] ?? '' );
        $content  = wp_kses_post( $_POST['content'] ?? '' );
        $author   = sanitize_text_field( $_POST['author_name'] ?? '' );
        $category = sanitize_text_field( $_POST['category'] ?? 'Opiniones' );
        $tags     = isset( $_POST['tags'] ) ? array_map( 'sanitize_text_field', $_POST['tags'] ) : array();
        $image_url = esc_url_raw( $_POST['image_url'] ?? '' );
        $original_url = esc_url_raw( $_POST['original_url'] ?? '' );
        $status   = sanitize_text_field( $_POST['post_status'] ?? 'draft' );

        $ai_title   = sanitize_text_field( $_POST['ai_title'] ?? '' );
        $ai_excerpt = sanitize_textarea_field( $_POST['ai_excerpt'] ?? '' );
        $ai_content = sanitize_textarea_field( $_POST['ai_content'] ?? '' );
        $ai_author  = sanitize_text_field( $_POST['ai_author'] ?? '' );

        NC_Feedback::save( 'title', $ai_title, $title );
        NC_Feedback::save( 'excerpt', $ai_excerpt, $excerpt );
        NC_Feedback::save( 'content', $ai_content, $content );
        NC_Feedback::save( 'author', $ai_author, $author );

        if ( empty( $title ) || empty( $content ) ) {
            wp_send_json_error( 'Título y contenido son requeridos' );
        }

        $content_with_source = $content;
        if ( ! empty( $author ) ) {
            $content_with_source = '<p><strong>Fuente:</strong> ' . esc_html( $author ) . '</p>' . "\n" . $content_with_source;
        }
        if ( ! empty( $original_url ) ) {
            $content_with_source .= "\n" . '<p><a href="' . esc_url( $original_url ) . '" target="_blank" rel="noopener">Ver publicación original</a></p>';
        }

        $cat_id = 0;
        $cat = get_term_by( 'name', $category, 'category' );
        if ( $cat ) {
            $cat_id = $cat->term_id;
        } else {
            $new_cat = wp_insert_term( $category, 'category' );
            if ( ! is_wp_error( $new_cat ) ) {
                $cat_id = $new_cat['term_id'];
            }
        }

        $post_data = array(
            'post_title'    => $title,
            'post_excerpt'  => $excerpt,
            'post_content'  => $content_with_source,
            'post_status'   => $status,
            'post_category' => $cat_id ? array( $cat_id ) : array(),
            'tags_input'    => $tags,
            'post_type'     => 'post',
        );

        $post_id = wp_insert_post( $post_data, true );

        if ( is_wp_error( $post_id ) ) {
            wp_send_json_error( 'Error creando el post: ' . $post_id->get_error_message() );
        }

        if ( ! empty( $image_url ) ) {
            $this->set_featured_image_from_url( $post_id, $image_url, $title );
        }

        update_post_meta( $post_id, '_nc_original_url', $original_url );
        update_post_meta( $post_id, '_nc_source_author', $author );

        wp_send_json_success( array(
            'post_id'  => $post_id,
            'edit_url' => get_edit_post_link( $post_id, 'raw' ),
            'view_url' => get_permalink( $post_id ),
            'status'   => $status,
        ) );
    }

    private function set_featured_image_from_url( $post_id, $image_url, $title ) {
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $tmp = download_url( $image_url );

        if ( is_wp_error( $tmp ) ) {
            return;
        }

        $file_array = array(
            'name'     => sanitize_file_name( $title ) . '.jpg',
            'tmp_name' => $tmp,
        );

        $attachment_id = media_handle_sideload( $file_array, $post_id, $title );

        if ( is_wp_error( $attachment_id ) ) {
            @unlink( $tmp );
            return;
        }

        set_post_thumbnail( $post_id, $attachment_id );
    }
}

add_action( 'plugins_loaded', array( 'News_Converter', 'get_instance' ) );

register_activation_hook( __FILE__, array( 'News_Converter', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'News_Converter', 'deactivate' ) );
