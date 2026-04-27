<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * HITO 4 y 5: Funcionalidad REAL pero DEFENSIVA
 * - Agrega fuente RSS real
 * - Procesa y muestra en cola
 * - Integra Instagram sin romper nada
 * 
 * Este código es 100% defensivo - usa try/catch y verificaciones
 */
class NC_Editorial_Demo {

    private static $test_mode = true; // Cambiar a false para producción

    public static function init() {
        // Solo agregar hooks si estamos en admin
        if ( ! is_admin() ) {
            return;
        }

        add_action( 'wp_ajax_nc_add_source_real', array( __CLASS__, 'ajax_add_source' ) );
        add_action( 'wp_ajax_nc_process_source_now', array( __CLASS__, 'ajax_process_source' ) );
        add_action( 'wp_ajax_nc_add_instagram_manual', array( __CLASS__, 'ajax_add_instagram' ) );
        
        // Agregar demo data al activar (solo para pruebas)
        add_action( 'admin_init', array( __CLASS__, 'maybe_add_demo_data' ) );
    }

    /**
     * Agregar fuente RSS real vía AJAX
     * Defensivo: verifica todo antes de guardar
     */
    public static function ajax_add_source() {
        check_ajax_referer( 'nc_nonce', 'nonce' );
        
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Sin permisos' );
            return;
        }

        try {
            $name = isset( $_POST['name'] ) ? sanitize_text_field( $_POST['name'] ) : '';
            $url = isset( $_POST['url'] ) ? esc_url_raw( $_POST['url'] ) : '';
            $section = isset( $_POST['section'] ) ? sanitize_text_field( $_POST['section'] ) : '';
            $keywords = isset( $_POST['keywords'] ) ? sanitize_text_field( $_POST['keywords'] ) : '';

            if ( empty( $name ) || empty( $url ) ) {
                wp_send_json_error( 'Nombre y URL son requeridos' );
                return;
            }

            // Verificar que la URL es válida y accesible (solo HEAD request)
            $response = wp_remote_head( $url, array( 'timeout' => 10 ) );
            if ( is_wp_error( $response ) ) {
                wp_send_json_error( 'No se puede acceder a la URL: ' . $response->get_error_message() );
                return;
            }

            $code = wp_remote_retrieve_response_code( $response );
            if ( $code !== 200 && $code !== 301 && $code !== 302 ) {
                wp_send_json_error( 'URL retorna código ' . $code );
                return;
            }

            // Guardar en base de datos existente
            global $wpdb;
            
            $table = $wpdb->prefix . 'nc_sources';
            
            $result = $wpdb->insert(
                $table,
                array(
                    'name' => $name,
                    'type' => 'rss',
                    'endpoint_url' => $url,
                    'section_id' => self::get_section_id( $section ),
                    'is_active' => 1,
                    'frequency_minutes' => 5,
                    'created_by' => get_current_user_id(),
                ),
                array( '%s', '%s', '%s', '%d', '%d', '%d', '%d' )
            );

            if ( $result === false ) {
                wp_send_json_error( 'Error al guardar: ' . $wpdb->last_error );
                return;
            }

            $source_id = $wpdb->insert_id;

            // Guardar keywords si existen
            if ( ! empty( $keywords ) ) {
                self::save_keywords( $source_id, $keywords );
            }

            wp_send_json_success( array(
                'message' => 'Fuente agregada exitosamente',
                'source_id' => $source_id,
                'next_step' => 'Procesar manualmente para ver items'
            ));

        } catch ( Exception $e ) {
            wp_send_json_error( 'Error inesperado: ' . $e->getMessage() );
        }
    }

    /**
     * Procesar fuente RSS y agregar items a cola
     */
    public static function ajax_process_source() {
        check_ajax_referer( 'nc_nonce', 'nonce' );
        
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Sin permisos' );
            return;
        }

        $source_id = isset( $_POST['source_id'] ) ? intval( $_POST['source_id'] ) : 0;
        
        if ( ! $source_id ) {
            wp_send_json_error( 'ID de fuente requerido' );
            return;
        }

        try {
            $source = NC_Database::get_source( $source_id );
            
            if ( ! $source ) {
                wp_send_json_error( 'Fuente no encontrada' );
                return;
            }

            // Usar el procesador existente
            $processor = new NC_Processor();
            $result = $processor->process_source( $source_id );

            if ( $result === false ) {
                wp_send_json_error( 'Error al procesar fuente' );
                return;
            }

            wp_send_json_success( array(
                'message' => 'Fuente procesada',
                'items_found' => $result['items_found'] ?? 0,
                'items_queued' => $result['items_queued'] ?? 0,
            ));

        } catch ( Exception $e ) {
            wp_send_json_error( 'Error: ' . $e->getMessage() );
        }
    }

    /**
     * Agregar Instagram manual a la cola
     * HITO 5: Usa el scraper existente
     */
    public static function ajax_add_instagram() {
        check_ajax_referer( 'nc_nonce', 'nonce' );
        
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Sin permisos' );
            return;
        }

        $url = isset( $_POST['url'] ) ? esc_url_raw( $_POST['url'] ) : '';
        
        if ( empty( $url ) || ! self::is_instagram_url( $url ) ) {
            wp_send_json_error( 'URL de Instagram inválida' );
            return;
        }

        try {
            // Intentar usar el scraper de Playwright si existe
            if ( class_exists( 'Instagram_Playwright_Scraper' ) ) {
                $result = Instagram_Playwright_Scraper::scrape_post( $url, array(
                    'max_comments' => 20,
                    'timeout' => 60000,
                ));

                if ( is_wp_error( $result ) ) {
                    // Fallback: guardar en cola para procesar después
                    self::queue_instagram_manual( $url );
                    wp_send_json_success( array(
                        'message' => 'URL agregada a cola para procesamiento manual (scraper no disponible)',
                        'status' => 'queued'
                    ));
                    return;
                }

                // Guardar en cola editorial con datos reales
                self::save_to_queue( array(
                    'title' => $result['title'] ?? 'Post de Instagram',
                    'excerpt' => $result['excerpt'] ?? '',
                    'source_type' => 'instagram',
                    'source_name' => $result['username'] ?? 'Instagram',
                    'original_url' => $url,
                    'raw_content' => json_encode( $result ),
                ));

                wp_send_json_success( array(
                    'message' => 'Post de Instagram agregado a la cola',
                    'comments' => $result['comments_count'] ?? 0,
                ));
            } else {
                // Scraper no disponible, guardar para procesar después
                self::queue_instagram_manual( $url );
                wp_send_json_success( array(
                    'message' => 'URL guardada para procesamiento (scraper no activo)',
                    'status' => 'pending_processing'
                ));
            }

        } catch ( Exception $e ) {
            wp_send_json_error( 'Error al procesar Instagram: ' . $e->getMessage() );
        }
    }

    /**
     * Agregar datos demo para presentación
     * Solo si no hay fuentes configuradas
     */
    public static function maybe_add_demo_data() {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        // Verificar si ya tenemos datos
        $has_sources = get_option( 'nc_demo_data_added', false );
        if ( $has_sources ) {
            return;
        }

        // NO agregar datos automáticamente - solo marcar como "visto"
        // El usuario debe agregar manualmente
        update_option( 'nc_demo_data_added', true );
    }

    // ============ HELPERS ============

    private static function get_section_id( $section_name ) {
        // Por ahora retornar 1 (Política por defecto)
        // En versión real, buscaría en tabla de secciones
        return 1;
    }

    private static function save_keywords( $source_id, $keywords ) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'nc_source_topics';
        $keywords_array = array_map( 'trim', explode( ',', $keywords ) );
        
        $wpdb->insert( $table, array(
            'source_id' => $source_id,
            'topic_name' => 'Keywords de filtro',
            'keywords' => json_encode( $keywords_array ),
            'action' => 'include',
        ));
    }

    private static function is_instagram_url( $url ) {
        return strpos( $url, 'instagram.com/p/' ) !== false || 
               strpos( $url, 'instagram.com/reel/' ) !== false;
    }

    private static function queue_instagram_manual( $url ) {
        // Guardar en cola como "pendiente de procesamiento"
        global $wpdb;
        
        $wpdb->insert( $wpdb->prefix . 'nc_content_queue', array(
            'source_id' => 0, // 0 = manual
            'original_url' => $url,
            'original_title' => 'Instagram - Procesamiento pendiente',
            'status' => 'pending_review',
            'raw_content' => json_encode( array( 'url' => $url, 'status' => 'waiting_scraper' ) ),
        ));
    }

    private static function save_to_queue( $data ) {
        global $wpdb;
        
        $wpdb->insert( $wpdb->prefix . 'nc_content_queue', array(
            'source_id' => 0,
            'original_url' => $data['original_url'],
            'original_title' => $data['title'],
            'processed_title' => $data['title'],
            'processed_excerpt' => $data['excerpt'],
            'processed_content' => $data['excerpt'],
            'status' => 'pending_review',
            'raw_content' => $data['raw_content'],
            'suggested_category' => 'Política',
        ));
    }
}

// Inicializar de forma segura
add_action( 'plugins_loaded', array( 'NC_Editorial_Demo', 'init' ) );
