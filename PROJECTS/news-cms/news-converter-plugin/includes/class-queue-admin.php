<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class NC_Queue_Admin {

    public static function init() {
        add_action( 'admin_menu', array( __CLASS__, 'add_menu_pages' ) );
        add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_scripts' ) );
        add_action( 'wp_ajax_nc_get_queue_items', array( __CLASS__, 'ajax_get_items' ) );
        add_action( 'wp_ajax_nc_approve_queue_item', array( __CLASS__, 'ajax_approve' ) );
        add_action( 'wp_ajax_nc_reject_queue_item', array( __CLASS__, 'ajax_reject' ) );
        add_action( 'wp_ajax_nc_save_draft', array( __CLASS__, 'ajax_save_draft' ) );
        add_action( 'wp_ajax_nc_process_source_now', array( __CLASS__, 'ajax_process_source' ) );
        add_action( 'wp_ajax_nc_save_source', array( __CLASS__, 'ajax_save_source' ) );
        add_action( 'wp_ajax_nc_delete_source', array( __CLASS__, 'ajax_delete_source' ) );
        add_action( 'add_meta_boxes', array( __CLASS__, 'add_meta_boxes' ) );
    }

    public static function add_menu_pages() {
        // DESACTIVADO - Usar nuevas interfaces en class-editorial-sources.php y class-editorial-queue.php
        // Estos menús están comentados para evitar duplicados
        
        /*
        add_submenu_page(
            'news-converter',
            'Cola Editorial (Legacy)',
            'Cola Editorial',
            'edit_posts',
            'nc-queue',
            array( __CLASS__, 'render_queue_page' )
        );
        */
    }

    public static function enqueue_scripts( $hook ) {
        if ( strpos( $hook, 'nc-' ) === false ) {
            return;
        }
        wp_enqueue_style( 'nc-admin-css', NC_PLUGIN_URL . 'assets/css/admin.css', array(), NC_VERSION );
        wp_enqueue_script( 'nc-admin-js', NC_PLUGIN_URL . 'assets/js/admin.js', array( 'jquery' ), NC_VERSION, true );
        wp_localize_script( 'nc-admin-js', 'ncAjax', array(
            'ajaxurl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( 'nc_nonce' ),
        ) );
    }

    public static function render_queue_page() {
        $counts = array(
            'pending'   => NC_Database::count_queue_items( 'pending_review' ),
            'approved'  => NC_Database::count_queue_items( 'approved' ),
            'published' => NC_Database::count_queue_items( 'published' ),
            'rejected'  => NC_Database::count_queue_items( 'rejected' ),
        );
        ?>
        <div class="wrap nc-wrap">
            <div class="nc-header">
                <h1><span class="dashicons dashicons-list-view"></span> Cola Editorial</h1>
                <p>Revisa, edita y aprueba contenido antes de publicar</p>
            </div>

            <div class="nc-stats-bar" style="display:flex;gap:30px;margin-bottom:30px;">
                <div style="background:#fff;padding:20px 30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <div style="font-size:2rem;font-weight:700;color:#667eea;"><?php echo $counts['pending']; ?></div>
                    <div style="color:#666;">Pendientes de revisión</div>
                </div>
                <div style="background:#fff;padding:20px 30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <div style="font-size:2rem;font-weight:700;color:#38a169;"><?php echo $counts['published']; ?></div>
                    <div style="color:#666;">Publicados hoy</div>
                </div>
            </div>

            <div class="nc-card">
                <div class="nc-filters" style="margin-bottom:20px;">
                    <button class="button nc-filter-btn active" data-status="pending_review">Pendientes</button>
                    <button class="button nc-filter-btn" data-status="approved">Aprobados</button>
                    <button class="button nc-filter-btn" data-status="published">Publicados</button>
                    <button class="button nc-filter-btn" data-status="rejected">Rechazados</button>
                    <input type="search" id="ncQueueSearch" placeholder="Buscar..." style="float:right;">
                </div>

                <div id="ncQueueList">
                    <?php self::render_queue_list( 'pending_review' ); ?>
                </div>
            </div>
        </div>
        <?php
    }

    public static function render_queue_list( $status = 'pending_review', $search = '' ) {
        $items = NC_Database::get_queue_items( array(
            'status' => $status,
            'search' => $search,
            'limit'  => 50,
        ) );

        if ( empty( $items ) ) {
            echo '<p style="text-align:center;color:#666;padding:40px;">No hay items en esta categoría.</p>';
            return;
        }
        ?>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th style="width:50%;">Título</th>
                    <th>Fuente</th>
                    <th>Confianza IA</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ( $items as $item ) :
                    $source = NC_Database::get_source( $item['source_id'] );
                    $confidence = round( $item['ai_confidence'] * 100 );
                ?>
                <tr>
                    <td>
                        <strong><?php echo esc_html( $item['processed_title'] ); ?></strong>
                        <br><small style="color:#666;"><?php echo esc_html( mb_substr( $item['processed_excerpt'], 0, 100 ) ); ?>...</small>
                    </td>
                    <td><?php echo esc_html( $source['name'] ?? 'Desconocida' ); ?></td>
                    <td>
                        <span style="background:<?php echo $confidence >= 80 ? '#c6f6d5' : ( $confidence >= 60 ? '#fefcbf' : '#fed7d7' ); ?>;padding:4px 12px;border-radius:20px;font-size:12px;">
                            <?php echo $confidence; ?>%
                        </span>
                    </td>
                    <td><?php echo human_time_diff( strtotime( $item['extracted_at'] ), time() ); ?> atrás</td>
                    <td>
                        <?php if ( $status === 'pending_review' ) : ?>
                            <a href="<?php echo admin_url( 'post.php?post=' . $item['id'] . '&action=edit&nc_queue=1' ); ?>" class="button">Revisar</a>
                        <?php elseif ( $status === 'published' && $item['post_id'] ) : ?>
                            <a href="<?php echo get_permalink( $item['post_id'] ); ?>" target="_blank" class="button">Ver</a>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php
    }

    public static function render_sources_page() {
        $sources = NC_Database::get_sources();
        $sections = NC_Taxonomies::get_sections();
        ?>
        <div class="wrap nc-wrap">
            <div class="nc-header">
                <h1><span class="dashicons dashicons-rss"></span> Fuentes de Datos</h1>
                <p>Configura las fuentes que alimentan cada sección del portal</p>
            </div>

            <div class="nc-grid">
                <div class="nc-card">
                    <h2>Agregar Nueva Fuente</h2>
                    <form id="ncSourceForm">
                        <table class="form-table">
                            <tr>
                                <th><label for="src_name">Nombre</label></th>
                                <td><input type="text" id="src_name" class="regular-text" required></td>
                            </tr>
                            <tr>
                                <th><label for="src_type">Tipo</label></th>
                                <td>
                                    <select id="src_type" required>
                                        <option value="rss">Feed RSS</option>
                                        <option value="twitter">Twitter/X</option>
                                        <option value="api">API Externa</option>
                                        <option value="webhook">Webhook</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th><label for="src_url">URL Endpoint</label></th>
                                <td><input type="url" id="src_url" class="regular-text" placeholder="https://..."></td>
                            </tr>
                            <tr>
                                <th><label for="src_section">Sección</label></th>
                                <td>
                                    <select id="src_section">
                                        <option value="">-- Seleccionar --</option>
                                        <?php foreach ( $sections as $section ) : ?>
                                            <option value="<?php echo $section->term_id; ?>"><?php echo esc_html( $section->name ); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th><label for="src_freq">Frecuencia (minutos)</label></th>
                                <td><input type="number" id="src_freq" value="30" min="5" max="1440"></td>
                            </tr>
                        </table>
                        <p>
                            <button type="submit" class="button button-primary">Guardar Fuente</button>
                            <span class="spinner" style="float:none;margin-top:0;"></span>
                        </p>
                    </form>
                </div>

                <div class="nc-card">
                    <h2>Fuentes Configuradas</h2>
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th>Fuente</th>
                                <th>Tipo</th>
                                <th>Sección</th>
                                <th>Estado</th>
                                <th>Última revisión</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ( $sources as $source ) :
                                $section = $source['section_id'] ? get_term( $source['section_id'], 'nc_section' ) : null;
                            ?>
                            <tr data-source-id="<?php echo $source['id']; ?>">
                                <td><strong><?php echo esc_html( $source['name'] ); ?></strong></td>
                                <td><?php echo esc_html( strtoupper( $source['type'] ) ); ?></td>
                                <td><?php echo $section ? esc_html( $section->name ) : '-'; ?></td>
                                <td>
                                    <span style="color:<?php echo $source['is_active'] ? '#38a169' : '#e53e3e'; ?>">
                                        <?php echo $source['is_active'] ? '● Activa' : '○ Inactiva'; ?>
                                    </span>
                                </td>
                                <td>
                                    <?php echo $source['last_run'] ? human_time_diff( strtotime( $source['last_run'] ), time() ) . ' atrás' : 'Nunca'; ?>
                                </td>
                                <td>
                                    <button class="button nc-process-now" data-id="<?php echo $source['id']; ?>">Procesar ahora</button>
                                    <button class="button nc-delete-source" data-id="<?php echo $source['id']; ?>">Eliminar</button>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <?php
    }

    public static function render_metrics_page() {
        global $wpdb;
        $logs = NC_Database::get_logs( null, 100 );
        $total_queued = NC_Database::count_queue_items();
        $total_published = NC_Database::count_queue_items( 'published' );

        // Top sources
        $sources_stats = $wpdb->get_results(
            "SELECT s.name, COUNT(q.id) as total, SUM(CASE WHEN q.status='published' THEN 1 ELSE 0 END) as published
             FROM {$wpdb->prefix}nc_sources s
             LEFT JOIN {$wpdb->prefix}nc_content_queue q ON s.id = q.source_id
             GROUP BY s.id
             ORDER BY published DESC
             LIMIT 10"
        );
        ?>
        <div class="wrap nc-wrap">
            <div class="nc-header">
                <h1><span class="dashicons dashicons-chart-area"></span> Métricas</h1>
                <p>Rendimiento del sistema de fuentes automatizadas</p>
            </div>

            <div class="nc-grid" style="grid-template-columns: repeat(4, 1fr);">
                <div class="nc-card" style="text-align:center;">
                    <div style="font-size:3rem;font-weight:700;color:#667eea;"><?php echo $total_queued; ?></div>
                    <div>Items en cola (total)</div>
                </div>
                <div class="nc-card" style="text-align:center;">
                    <div style="font-size:3rem;font-weight:700;color:#38a169;"><?php echo $total_published; ?></div>
                    <div>Items publicados</div>
                </div>
                <div class="nc-card" style="text-align:center;">
                    <div style="font-size:3rem;font-weight:700;color:#d69e2e;"><?php echo count( NC_Database::get_sources( array( 'is_active' => true ) ) ); ?></div>
                    <div>Fuentes activas</div>
                </div>
                <div class="nc-card" style="text-align:center;">
                    <div style="font-size:3rem;font-weight:700;color:#805ad5;"><?php echo round( $total_published / max( $total_queued, 1 ) * 100 ); ?>%</div>
                    <div>Tasa de publicación</div>
                </div>
            </div>

            <div class="nc-card">
                <h2>Rendimiento por Fuente</h2>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Fuente</th>
                            <th>Total procesados</th>
                            <th>Publicados</th>
                            <th>Efectividad</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ( $sources_stats as $stat ) :
                            $effectiveness = round( $stat->published / max( $stat->total, 1 ) * 100 );
                        ?>
                        <tr>
                            <td><?php echo esc_html( $stat->name ); ?></td>
                            <td><?php echo $stat->total; ?></td>
                            <td><?php echo $stat->published; ?></td>
                            <td>
                                <div style="background:#edf2f7;height:20px;border-radius:10px;overflow:hidden;width:200px;">
                                    <div style="background:<?php echo $effectiveness >= 50 ? '#38a169' : '#d69e2e'; ?>;height:100%;width:<?php echo $effectiveness; ?>%;"></div>
                                </div>
                                <small><?php echo $effectiveness; ?>%</small>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <div class="nc-card">
                <h2>Últimas ejecuciones</h2>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Fuente</th>
                            <th>Inicio</th>
                            <th>Duración</th>
                            <th>Encontrados</th>
                            <th>Encolados</th>
                            <th>Errores</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ( array_slice( $logs, 0, 20 ) as $log ) :
                            $source = NC_Database::get_source( $log['source_id'] );
                        ?>
                        <tr>
                            <td><?php echo esc_html( $source['name'] ?? 'Desconocida' ); ?></td>
                            <td><?php echo date( 'd/m/Y H:i', strtotime( $log['run_start'] ) ); ?></td>
                            <td><?php echo round( $log['execution_time_ms'] / 1000, 1 ); ?>s</td>
                            <td><?php echo $log['items_found']; ?></td>
                            <td><?php echo $log['items_queued']; ?></td>
                            <td style="color:<?php echo $log['errors'] ? '#e53e3e' : '#38a169'; ?>">
                                <?php echo $log['errors'] ? count( json_decode( $log['errors'], true ) ?: array() ) : 0; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <?php
    }

    public static function add_meta_boxes() {
        add_meta_box(
            'nc_queue_editor',
            'Editorial - Revisión de Noticia',
            array( __CLASS__, 'render_queue_meta_box' ),
            'nc_queue',
            'normal',
            'high'
        );
    }

    public static function render_queue_meta_box( $post ) {
        $item = NC_Database::get_queue_item( $post->ID );
        if ( ! $item ) {
            echo 'Item no encontrado';
            return;
        }
        wp_nonce_field( 'nc_queue_save', 'nc_queue_nonce' );
        ?>
        <div class="nc-queue-editor">
            <div class="nc-editor-preview" style="background:#f7fafc;padding:20px;margin-bottom:20px;border-radius:8px;">
                <h4>Original</h4>
                <p><strong>URL:</strong> <a href="<?php echo esc_url( $item['original_url'] ); ?>" target="_blank"><?php echo esc_html( $item['original_url'] ); ?></a></p>
                <p><strong>Título original:</strong> <?php echo esc_html( $item['original_title'] ); ?></p>
            </div>

            <table class="form-table">
                <tr>
                    <th><label for="nc_title">Título (Cuña)</label></th>
                    <td><input type="text" id="nc_title" name="nc_title" value="<?php echo esc_attr( $item['processed_title'] ); ?>" class="large-text" required></td>
                </tr>
                <tr>
                    <th><label for="nc_excerpt">Extracto</label></th>
                    <td><textarea id="nc_excerpt" name="nc_excerpt" rows="3" class="large-text"><?php echo esc_textarea( $item['processed_excerpt'] ); ?></textarea></td>
                </tr>
                <tr>
                    <th><label for="nc_content">Contenido</label></th>
                    <td><?php wp_editor( $item['processed_content'], 'nc_content', array( 'textarea_name' => 'nc_content', 'textarea_rows' => 15 ) ); ?></td>
                </tr>
                <tr>
                    <th><label for="nc_author">Autor/Fuente</label></th>
                    <td><input type="text" id="nc_author" name="nc_author" value="<?php echo esc_attr( $item['processed_author'] ); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="nc_category">Sección</label></th>
                    <td>
                        <select name="nc_category" id="nc_category">
                            <?php foreach ( NC_Taxonomies::get_sections() as $section ) : ?>
                                <option value="<?php echo esc_attr( $section->name ); ?>" <?php selected( $item['suggested_category'], $section->name ); ?>>
                                    <?php echo esc_html( $section->name ); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label>Imagen sugerida</label></th>
                    <td>
                        <?php if ( $item['suggested_image_url'] ) : ?>
                            <img src="<?php echo esc_url( $item['suggested_image_url'] ); ?>" style="max-width:300px;border-radius:8px;">
                            <input type="hidden" name="nc_image_url" value="<?php echo esc_attr( $item['suggested_image_url'] ); ?>">
                        <?php endif; ?>
                    </td>
                </tr>
                <tr>
                    <th><label for="nc_editor_notes">Notas del editor</label></th>
                    <td><textarea id="nc_editor_notes" name="nc_editor_notes" rows="2" class="large-text" placeholder="Razón de rechazo o comentarios internos..."></textarea></td>
                </tr>
            </table>

            <div class="nc-editor-actions" style="margin-top:30px;padding-top:20px;border-top:2px solid #e2e8f0;">
                <button type="submit" name="nc_action" value="publish" class="button button-primary button-hero" style="background:#38a169;border-color:#38a169;">
                    ✓ Aprobar y Publicar
                </button>
                <button type="submit" name="nc_action" value="draft" class="button button-secondary" style="margin-left:10px;">
                    Guardar Borrador
                </button>
                <button type="submit" name="nc_action" value="reject" class="button" style="margin-left:10px;color:#e53e3e;border-color:#e53e3e;">
                    ✗ Rechazar
                </button>
            </div>
        </div>
        <?php
    }

    // AJAX handlers
    public static function ajax_get_items() {
        check_ajax_referer( 'nc_nonce', 'nonce' );
        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_send_json_error( 'Sin permisos' );
        }
        $status = sanitize_text_field( $_POST['status'] ?? 'pending_review' );
        $search = sanitize_text_field( $_POST['search'] ?? '' );
        ob_start();
        self::render_queue_list( $status, $search );
        wp_send_json_success( array( 'html' => ob_get_clean() ) );
    }

    public static function ajax_approve() {
        check_ajax_referer( 'nc_nonce', 'nonce' );
        if ( ! current_user_can( 'publish_posts' ) ) {
            wp_send_json_error( 'Sin permisos' );
        }
        $id = intval( $_POST['id'] ?? 0 );
        $processor = new NC_Processor();
        $post_id = $processor->publish_from_queue( $id );
        if ( is_wp_error( $post_id ) ) {
            wp_send_json_error( $post_id->get_error_message() );
        }
        wp_send_json_success( array( 'post_id' => $post_id, 'url' => get_permalink( $post_id ) ) );
    }

    public static function ajax_reject() {
        check_ajax_referer( 'nc_nonce', 'nonce' );
        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_send_json_error( 'Sin permisos' );
        }
        $id = intval( $_POST['id'] ?? 0 );
        $reason = sanitize_textarea_field( $_POST['reason'] ?? '' );
        NC_Database::update_queue_item( $id, array(
            'status'           => 'rejected',
            'rejection_reason' => $reason,
            'reviewed_at'      => current_time( 'mysql' ),
        ) );
        wp_send_json_success();
    }

    public static function ajax_save_draft() {
        check_ajax_referer( 'nc_nonce', 'nonce' );
        $id = intval( $_POST['id'] ?? 0 );
        NC_Database::update_queue_item( $id, array(
            'processed_title'   => sanitize_text_field( $_POST['title'] ?? '' ),
            'processed_excerpt' => sanitize_textarea_field( $_POST['excerpt'] ?? '' ),
            'processed_content' => wp_kses_post( $_POST['content'] ?? '' ),
            'status'            => 'pending_review',
        ) );
        wp_send_json_success();
    }

    public static function ajax_process_source() {
        check_ajax_referer( 'nc_nonce', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Sin permisos' );
        }
        $id = intval( $_POST['id'] ?? 0 );
        $processor = new NC_Processor();
        $result = $processor->process_source( $id );
        wp_send_json_success( $result );
    }

    public static function ajax_save_source() {
        check_ajax_referer( 'nc_nonce', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Sin permisos' );
        }
        $data = array(
            'name'              => sanitize_text_field( $_POST['name'] ?? '' ),
            'type'              => sanitize_text_field( $_POST['type'] ?? 'rss' ),
            'endpoint_url'      => esc_url_raw( $_POST['url'] ?? '' ),
            'section_id'        => intval( $_POST['section'] ?? 0 ),
            'frequency_minutes' => intval( $_POST['frequency'] ?? 30 ),
            'is_active'         => true,
        );
        $id = NC_Database::save_source( $data );
        wp_send_json_success( array( 'id' => $id ) );
    }

    public static function ajax_delete_source() {
        check_ajax_referer( 'nc_nonce', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Sin permisos' );
        }
        $id = intval( $_POST['id'] ?? 0 );
        NC_Database::delete_source( $id );
        wp_send_json_success();
    }
}

NC_Queue_Admin::init();
