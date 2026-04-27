<?php
/**
 * Admin interface para Instagram Comments Downloader
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Instagram_Comments_Admin {

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'add_menu_page' ), 20 );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
        add_action( 'wp_ajax_nc_instagram_download', array( $this, 'ajax_download_comments' ) );
        add_action( 'wp_ajax_nc_instagram_save_settings', array( $this, 'ajax_save_settings' ) );
        add_action( 'wp_ajax_nc_instagram_scrape', array( $this, 'ajax_scrape_public_profile' ) );
    }

    public function add_menu_page() {
        add_submenu_page(
            'news-converter',
            'Instagram Scraper',
            '📸 Instagram',
            'manage_options',
            'nc-instagram-comments',
            array( $this, 'render_page' )
        );
    }

    public function enqueue_assets( $hook ) {
        if ( $hook !== 'news-converter_page_nc-instagram-comments' ) {
            return;
        }

        wp_enqueue_style(
            'nc-instagram-comments-css',
            NC_PLUGIN_URL . 'assets/css/instagram-comments.css',
            array(),
            NC_VERSION
        );

        wp_enqueue_script(
            'nc-instagram-comments-js',
            NC_PLUGIN_URL . 'assets/js/instagram-comments.js',
            array( 'jquery' ),
            NC_VERSION,
            true
        );

        wp_localize_script( 'nc-instagram-comments-js', 'ncInstagram', array(
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce' => wp_create_nonce( 'nc_instagram_nonce' )
        ) );
    }

    public function render_page() {
        $settings = get_option( 'nc_instagram_settings', array() );
        $active_tab = isset( $_GET['tab'] ) ? sanitize_text_field( $_GET['tab'] ) : 'api';
        ?>
        <div class="wrap nc-instagram-comments">
            <h1>Instagram Comments Downloader</h1>

            <h2 class="nav-tab-wrapper">
                <a href="?page=nc-instagram-comments&tab=api" class="nav-tab <?php echo $active_tab === 'api' ? 'nav-tab-active' : ''; ?>">
                    API Oficial (Tu Cuenta)
                </a>
                <a href="?page=nc-instagram-comments&tab=scraper" class="nav-tab <?php echo $active_tab === 'scraper' ? 'nav-tab-active' : ''; ?>">
                    Scraper Público (Cualquier Cuenta)
                </a>
            </h2>

            <?php if ( $active_tab === 'api' ) : ?>


            <div class="nc-card">
                <div class="notice notice-info">
                    <p><strong>Método API Oficial:</strong> Descarga comentarios de tu propia cuenta Instagram Business/Creator usando la API oficial de Meta.</p>
                </div>
                <h2>Configuración de API</h2>
                <form id="nc-instagram-settings-form">
                    <table class="form-table">
                        <tr>
                            <th><label for="access_token">Access Token</label></th>
                            <td>
                                <input type="password"
                                       id="access_token"
                                       name="access_token"
                                       value="<?php echo esc_attr( $settings['access_token'] ?? '' ); ?>"
                                       class="regular-text">
                                <p class="description">
                                    <a href="https://developers.facebook.com/tools/explorer/" target="_blank">
                                        Obtener token en Facebook Developers →
                                    </a>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="instagram_account_id">Instagram Account ID</label></th>
                            <td>
                                <input type="text"
                                       id="instagram_account_id"
                                       name="instagram_account_id"
                                       value="<?php echo esc_attr( $settings['instagram_account_id'] ?? '' ); ?>"
                                       class="regular-text">
                                <p class="description">
                                    ID de la cuenta de Instagram Business o Creator
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="page_id">Facebook Page ID (alternativo)</label></th>
                            <td>
                                <input type="text"
                                       id="page_id"
                                       name="page_id"
                                       value="<?php echo esc_attr( $settings['page_id'] ?? '' ); ?>"
                                       class="regular-text">
                                <p class="description">
                                    Si no tienes el Account ID, puedes usar el Page ID conectado a Instagram
                                </p>
                            </td>
                        </tr>
                    </table>
                    <p class="submit">
                        <button type="submit" class="button button-primary">Guardar Configuración</button>
                        <span class="spinner" style="float: none; margin-top: 0;"></span>
                    </p>
                </form>
                <div id="settings-message"></div>
            </div>

            <div class="nc-card">
                <h2>Descargar Comentarios</h2>
                <form id="nc-instagram-download-form">
                    <table class="form-table">
                        <tr>
                            <th><label for="limit">Límite de Posts</label></th>
                            <td>
                                <input type="number"
                                       id="limit"
                                       name="limit"
                                       value="25"
                                       min="1"
                                       max="100"
                                       class="small-text">
                                <p class="description">Máximo número de posts a procesar</p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="since">Desde (opcional)</label></th>
                            <td>
                                <input type="date" id="since" name="since">
                            </td>
                        </tr>
                        <tr>
                            <th><label for="until">Hasta (opcional)</label></th>
                            <td>
                                <input type="date" id="until" name="until">
                            </td>
                        </tr>
                        <tr>
                            <th><label for="format">Formato de Exportación</label></th>
                            <td>
                                <select id="format" name="format">
                                    <option value="both">JSON + CSV</option>
                                    <option value="json">Solo JSON</option>
                                    <option value="csv">Solo CSV</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>Incluir Respuestas</th>
                            <td>
                                <label>
                                    <input type="checkbox" id="include_replies" name="include_replies" checked>
                                    Incluir respuestas a comentarios
                                </label>
                            </td>
                        </tr>
                    </table>
                    <p class="submit">
                        <button type="submit" class="button button-primary">
                            <span class="dashicons dashicons-download" style="line-height: 1.5;"></span>
                            Descargar Comentarios
                        </button>
                        <span class="spinner" style="float: none; margin-top: 0;"></span>
                    </p>
                </form>

                <div id="download-progress" style="display: none;">
                    <div class="nc-progress-bar">
                        <div class="nc-progress-fill" style="width: 0%"></div>
                    </div>
                    <p class="nc-progress-status">Iniciando...</p>
                </div>

                <div id="download-results" style="display: none;">
                    <h3>Resultados</h3>
                    <div class="nc-stats-grid">
                        <div class="nc-stat">
                            <span class="nc-stat-value" id="stat-total">0</span>
                            <span class="nc-stat-label">Total Comentarios</span>
                        </div>
                        <div class="nc-stat">
                            <span class="nc-stat-value" id="stat-replies">0</span>
                            <span class="nc-stat-label">Respuestas</span>
                        </div>
                        <div class="nc-stat">
                            <span class="nc-stat-value" id="stat-users">0</span>
                            <span class="nc-stat-label">Usuarios Únicos</span>
                        </div>
                        <div class="nc-stat">
                            <span class="nc-stat-value" id="stat-posts">0</span>
                            <span class="nc-stat-label">Posts Procesados</span>
                        </div>
                    </div>
                    <div id="download-links"></div>
                </div>
            </div>

            </div>

            <?php else : // Tab Scraper ?>

            <div class="nc-card">
                <div class="notice notice-warning">
                    <p><strong>⚠️ Advertencia:</strong> Este método usa scraping web y puede dejar de funcionar si Instagram cambia su estructura. Solo funciona con perfiles <strong>públicos</strong>. Usar con delay de 3+ segundos para evitar bloqueo de IP.</p>
                </div>
                <h2>Scraper de Perfiles Públicos</h2>
                <form id="nc-instagram-scraper-form">
                    <table class="form-table">
                        <tr>
                            <th><label for="scraper_url">URL o Username</label></th>
                            <td>
                                <input type="text"
                                       id="scraper_url"
                                       name="scraper_url"
                                       placeholder="https://instagram.com/bbcnews, @bbcnews, o https://instagram.com/p/ABC123/"
                                       class="regular-text">
                                <p class="description">
                                    Soporta:<br>
                                    • Perfil: <code>https://instagram.com/username</code> o <code>@username</code><br>
                                    • Post individual: <code>https://instagram.com/p/SHORTCODE/</code><br>
                                    • Reel: <code>https://instagram.com/reel/SHORTCODE/</code>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="scraper_posts">Posts a analizar</label></th>
                            <td>
                                <input type="number"
                                       id="scraper_posts"
                                       name="scraper_posts"
                                       value="5"
                                       min="1"
                                       max="20"
                                       class="small-text">
                                <p class="description">Máximo recomendado: 10 (evitar bloqueos)</p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="scraper_comments">Comentarios por post</label></th>
                            <td>
                                <input type="number"
                                       id="scraper_comments"
                                       name="scraper_comments"
                                       value="20"
                                       min="1"
                                       max="50"
                                       class="small-text">
                            </td>
                        </tr>
                        <tr>
                            <th><label for="scraper_delay">Delay (segundos)</label></th>
                            <td>
                                <input type="number"
                                       id="scraper_delay"
                                       name="scraper_delay"
                                       value="3"
                                       min="1"
                                       max="30"
                                       class="small-text">
                                <p class="description">Segundos entre requests (más = más seguro)</p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="scraper_format">Formato</label></th>
                            <td>
                                <select id="scraper_format" name="scraper_format">
                                    <option value="both">JSON + CSV</option>
                                    <option value="json">Solo JSON</option>
                                    <option value="csv">Solo CSV</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="scraper_method">Método</label></th>
                            <td>
                                <select id="scraper_method" name="scraper_method">
                                    <option value="php">PHP Simple (rápido, menos confiable)</option>
                                    <option value="playwright">Playwright (lento, más confiable con login)</option>
                                </select>
                                <p class="description">
                                    <strong>PHP Simple:</strong> Para posts públicos sin login<br>
                                    <strong>Playwright:</strong> Requiere Node.js. Para posts que necesitan login.
                                </p>
                            </td>
                        </tr>
                    </table>
                    <p class="submit">
                        <button type="submit" class="button button-primary">
                            <span class="dashicons dashicons-search" style="line-height: 1.5;"></span>
                            Scrapear Comentarios
                        </button>
                        <span class="spinner" style="float: none; margin-top: 0;"></span>
                    </p>
                </form>

                <div id="scraper-progress" style="display: none;">
                    <div class="nc-progress-bar">
                        <div class="nc-progress-fill" style="width: 0%"></div>
                    </div>
                    <p class="nc-progress-status">Iniciando...</p>
                </div>

                <div id="scraper-results" style="display: none;">
                    <h3>Resultados</h3>
                    <div class="nc-stats-grid">
                        <div class="nc-stat">
                            <span class="nc-stat-value" id="scraper-stat-total">0</span>
                            <span class="nc-stat-label">Total Comentarios</span>
                        </div>
                        <div class="nc-stat">
                            <span class="nc-stat-value" id="scraper-stat-replies">0</span>
                            <span class="nc-stat-label">Respuestas</span>
                        </div>
                        <div class="nc-stat">
                            <span class="nc-stat-value" id="scraper-stat-users">0</span>
                            <span class="nc-stat-label">Usuarios Únicos</span>
                        </div>
                        <div class="nc-stat">
                            <span class="nc-stat-value" id="scraper-stat-posts">0</span>
                            <span class="nc-stat-label">Posts Procesados</span>
                        </div>
                    </div>
                    <div id="scraper-links"></div>
                </div>
            </div>

            <div class="nc-card">
                <h2>Guía de Scraper</h2>
                <div class="nc-guide">
                    <h3>¿Cómo funciona?</h3>
                    <ol>
                        <li>Ingresa la URL o username de un perfil <strong>público</strong></li>
                        <li>El script descarga el HTML del perfil</li>
                        <li>Extrae los shortcodes de los últimos posts</li>
                        <li>Por cada post, obtiene los comentarios visibles</li>
                        <li>Espera N segundos entre requests (evita bloqueos)</li>
                    </ol>

                    <h3>Limitaciones</h3>
                    <ul>
                        <li>✗ No funciona con perfiles privados</li>
                        <li>✗ Solo obtiene comentarios visibles sin login (limitados)</li>
                        <li>✗ Instagram puede bloquear tu IP temporalmente</li>
                        <li>✗ Puede requerir login si Instagram detecta scraping</li>
                    </ul>

                    <h3>Medios populares de noticias</h3>
                    <p>Algunos perfiles que suelen ser públicos:</p>
                    <ul>
                        <li><code>bbcnews</code>, <code>cnn</code>, <code>guardian</code></li>
                        <li><code>nytimes</code>, <code>washingtonpost</code></li>
                        <li><code>elpais</code>, <code>elmundoes</code>, <code>clarincom</code></li>
                    </ul>
                </div>
            </div>

            <?php endif; ?>

            <div class="nc-card">
                <h2>Guía de Configuración</h2>
                <div class="nc-guide">
                    <h3>1. Crear App en Facebook Developers</h3>
                    <ol>
                        <li>Ve a <a href="https://developers.facebook.com/" target="_blank">developers.facebook.com</a></li>
                        <li>Crea una nueva app (tipo "Business")</li>
                        <li>Agrega el producto "Instagram Basic Display" o "Instagram Graph API"</li>
                    </ol>

                    <h3>2. Configurar Cuenta de Instagram</h3>
                    <ol>
                        <li>La cuenta debe ser Business o Creator (no personal)</li>
                        <li>Conectar la cuenta de Instagram a una página de Facebook</li>
                        <li>En Facebook Developers, agregar la cuenta como "Tester"</li>
                    </ol>

                    <h3>3. Obtener Access Token</h3>
                    <ol>
                        <li>En Facebook Developers, ir a "Tools" → "Graph API Explorer"</li>
                        <li>Seleccionar tu app y obtener token con permisos:
                            <code>instagram_basic</code>,
                            <code>pages_read_engagement</code>
                        </li>
                        <li>El token expira cada 60 días (nivel estándar) o nunca (nivel business)</li>
                    </ol>

                    <h3>4. Obtener Instagram Account ID</h3>
                    <p>Método 1: Usar el Graph API Explorer:</p>
                    <code>GET /{page-id}?fields=instagram_business_account</code>

                    <p>Método 2: Desde la URL de Instagram:</p>
                    <code>https://www.instagram.com/web/search/topsearch/?query={username}</code>
                </div>
            </div>
        </div>
        <?php
    }

    public function ajax_save_settings() {
        check_ajax_referer( 'nc_instagram_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Sin permisos' );
        }

        $settings = array(
            'access_token' => sanitize_text_field( $_POST['access_token'] ?? '' ),
            'instagram_account_id' => sanitize_text_field( $_POST['instagram_account_id'] ?? '' ),
            'page_id' => sanitize_text_field( $_POST['page_id'] ?? '' )
        );

        update_option( 'nc_instagram_settings', $settings );

        wp_send_json_success( 'Configuración guardada' );
    }

    public function ajax_download_comments() {
        check_ajax_referer( 'nc_instagram_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Sin permisos' );
        }

        $settings = get_option( 'nc_instagram_settings', array() );
        $access_token = $settings['access_token'] ?? '';
        $instagram_account_id = $settings['instagram_account_id'] ?? '';
        $page_id = $settings['page_id'] ?? '';

        if ( ! $access_token ) {
            wp_send_json_error( 'Access Token no configurado' );
        }

        $limit = intval( $_POST['limit'] ?? 25 );
        $since = sanitize_text_field( $_POST['since'] ?? '' );
        $until = sanitize_text_field( $_POST['until'] ?? '' );
        $format = sanitize_text_field( $_POST['format'] ?? 'both' );
        $include_replies = sanitize_text_field( $_POST['include_replies'] ?? 'true' ) === 'true';

        $upload_dir = wp_upload_dir();
        $output_dir = $upload_dir['basedir'] . '/instagram-comments';

        if ( ! is_dir( $output_dir ) ) {
            wp_mkdir_p( $output_dir );
        }

        $downloader = new Instagram_Comments_Downloader( $access_token, $instagram_account_id );

        // Si no tenemos account_id pero sí page_id
        if ( ! $instagram_account_id && $page_id ) {
            $instagram_account_id = $downloader->get_instagram_account_id( $page_id );
            if ( ! $instagram_account_id ) {
                wp_send_json_error( 'No se pudo obtener Instagram Account ID desde la página' );
            }
        }

        if ( ! $instagram_account_id ) {
            wp_send_json_error( 'Instagram Account ID requerido' );
        }

        // Obtener posts
        $posts = $downloader->get_posts( $limit, $since, $until );

        if ( ! $posts ) {
            $errors = $downloader->get_errors();
            wp_send_json_error( 'Error al obtener posts: ' . ( $errors[0]['message'] ?? 'Unknown error' ) );
        }

        // Descargar comentarios
        $comments = $downloader->download_comments_from_posts( $posts, $include_replies );
        $stats = $downloader->get_stats();

        // Exportar archivos
        $timestamp = date( 'Y-m-d_H-i-s' );
        $files = array();

        if ( in_array( $format, array( 'json', 'both' ) ) ) {
            $json_file = $output_dir . '/comments_' . $timestamp . '.json';
            $result = $downloader->export_to_json( $json_file );
            $files['json'] = array(
                'url' => $upload_dir['baseurl'] . '/instagram-comments/comments_' . $timestamp . '.json',
                'path' => $result['path'],
                'count' => $result['count']
            );
        }

        if ( in_array( $format, array( 'csv', 'both' ) ) ) {
            $csv_file = $output_dir . '/comments_' . $timestamp . '.csv';
            $result = $downloader->export_to_csv( $csv_file );
            $files['csv'] = array(
                'url' => $upload_dir['baseurl'] . '/instagram-comments/comments_' . $timestamp . '.csv',
                'path' => $result['path'],
                'count' => $result['count']
            );
        }

        wp_send_json_success( array(
            'stats' => array(
                'total_comments' => $stats['total_comments'],
                'total_replies' => $stats['total_replies'],
                'unique_users' => $stats['unique_users'],
                'posts_processed' => count( $posts )
            ),
            'files' => $files,
            'errors' => $downloader->has_errors() ? $downloader->get_errors() : array()
        ) );
    }

    public function ajax_scrape_public_profile() {
        check_ajax_referer( 'nc_instagram_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Sin permisos' );
        }

        $url = sanitize_text_field( $_POST['url'] ?? '' );
        $posts = intval( $_POST['posts'] ?? 5 );
        $comments = intval( $_POST['comments'] ?? 20 );
        $delay = intval( $_POST['delay'] ?? 3 );
        $format = sanitize_text_field( $_POST['format'] ?? 'both' );
        $method = sanitize_text_field( $_POST['method'] ?? 'php' );

        if ( empty( $url ) ) {
            wp_send_json_error( 'URL o username requerido' );
        }

        // Limitar valores para evitar abuso
        $posts = min( $posts, 20 );
        $comments = min( $comments, 50 );
        $delay = max( $delay, 1 );

        $upload_dir = wp_upload_dir();
        $output_dir = $upload_dir['basedir'] . '/instagram-scraper';

        if ( ! is_dir( $output_dir ) ) {
            wp_mkdir_p( $output_dir );
        }

        // Verificar si es método Playwright
        if ( $method === 'playwright' ) {
            // Usar Playwright Scraper
            if ( ! class_exists( 'Instagram_Playwright_Scraper' ) ) {
                require_once NC_PLUGIN_DIR . 'includes/class-instagram-playwright.php';
            }
            
            $scraper = new Instagram_Playwright_Scraper();
            
            if ( ! $scraper->is_installed() ) {
                wp_send_json_error( 'Playwright no está instalado. Ejecuta: php scripts/scrape-instagram-playwright.php --install' );
            }
            
            // Para Playwright, solo soportamos posts individuales (no perfiles completos)
            $result = $scraper->scrape_post( $url, array(
                'max_comments' => $comments,
                'output' => $output_dir,
                'timeout' => 60
            ) );
            
            if ( $result === false ) {
                $errors = $scraper->get_errors();
                wp_send_json_error( 'Error en Playwright: ' . ( $errors[0]['message'] ?? 'Error desconocido' ) );
            }
            
            $timestamp = date( 'Y-m-d_H-i-s' );
            $files = array();
            
            // Extraer shortcode del URL para el nombre de archivo
            preg_match( '/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/', $url, $matches );
            $shortcode = $matches[2] ?? 'unknown';
            
            if ( isset( $result['json'] ) ) {
                $files['json'] = array(
                    'url' => $upload_dir['baseurl'] . '/instagram-scraper/' . basename( $result['json']['path'] ),
                    'path' => $result['json']['path'],
                    'count' => $result['json']['stats']['total_comments'] ?? 0
                );
            }
            
            if ( isset( $result['csv'] ) ) {
                $files['csv'] = array(
                    'url' => $upload_dir['baseurl'] . '/instagram-scraper/' . basename( $result['csv']['path'] ),
                    'path' => $result['csv']['path'],
                    'count' => $result['csv']['count'] ?? 0
                );
            }
            
            $stats = array(
                'total_comments' => $result['json']['stats']['total_comments'] ?? 0,
                'total_replies' => $result['json']['stats']['replies'] ?? 0,
                'unique_users' => 0, // Playwright no calcula esto aún
                'posts_processed' => 1
            );
            
            wp_send_json_success( array(
                'stats' => $stats,
                'files' => $files,
                'errors' => $scraper->has_errors() ? $scraper->get_errors() : array()
            ) );
        }

        // Método PHP (default)
        $scraper = new Instagram_Public_Scraper();
        $scraper->set_delay( $delay );

        // Verificar username
        $username = $scraper->extract_username( $url );
        if ( ! $username ) {
            wp_send_json_error( 'URL o username inválido' );
        }

        // Detectar si es post individual
        $is_single_post = ( strpos( $username, 'post:' ) === 0 );

        // Ejecutar scraping
        $data = $scraper->scrape_comments_from_profile( $url, $posts, $comments );

        if ( $data === false ) {
            $errors = $scraper->get_errors();
            wp_send_json_error( 'Error al scrapear: ' . ( $errors[0]['message'] ?? 'Unknown error' ) );
        }

        $stats = $scraper->get_stats();
        $timestamp = date( 'Y-m-d_H-i-s' );
        $files = array();

        // Sanitizar nombre de archivo
        $file_basename = $is_single_post ? 'post_' . substr( $username, 5 ) : $username;
        $file_basename = preg_replace( '/[^a-zA-Z0-9_-]/', '_', $file_basename );

        if ( in_array( $format, array( 'json', 'both' ) ) ) {
            $json_file = $output_dir . '/scraper_' . $file_basename . '_' . $timestamp . '.json';
            $result = $scraper->export_to_json( $json_file );
            $files['json'] = array(
                'url' => $upload_dir['baseurl'] . '/instagram-scraper/scraper_' . $file_basename . '_' . $timestamp . '.json',
                'path' => $result['path'],
                'count' => $result['count']
            );
        }

        if ( in_array( $format, array( 'csv', 'both' ) ) ) {
            $csv_file = $output_dir . '/scraper_' . $file_basename . '_' . $timestamp . '.csv';
            $result = $scraper->export_to_csv( $csv_file );
            $files['csv'] = array(
                'url' => $upload_dir['baseurl'] . '/instagram-scraper/scraper_' . $file_basename . '_' . $timestamp . '.csv',
                'path' => $result['path'],
                'count' => $result['count']
            );
        }

        wp_send_json_success( array(
            'stats' => array(
                'total_comments' => $stats['total_comments'],
                'total_replies' => $stats['total_replies'],
                'unique_users' => $stats['unique_users'],
                'posts_processed' => $is_single_post ? 1 : $posts
            ),
            'files' => $files,
            'errors' => $scraper->has_errors() ? $scraper->get_errors() : array()
        ) );
    }
}

// Inicializar
new Instagram_Comments_Admin();
