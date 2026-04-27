<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class NC_Processor {

    private $extractor;
    private $openai;

    public function __construct() {
        $this->extractor = new NC_Extractor();

        $api_key = get_option( 'nc_openai_api_key', '' );
        $model   = get_option( 'nc_openai_model', 'gpt-4o-mini' );
        if ( $api_key ) {
            $this->openai = new NC_OpenAI( $api_key, $model );
        }
    }

    public function process_source( $source_id ) {
        $source = NC_Database::get_source( $source_id );
        if ( ! $source || ! $source['is_active'] ) {
            return false;
        }

        $run_start = microtime( true );
        $log_data  = array(
            'source_id' => $source_id,
            'run_start' => current_time( 'mysql' ),
            'items_found' => 0,
            'items_queued' => 0,
            'errors' => array(),
        );

        $items = array();

        switch ( $source['type'] ) {
            case 'rss':
                $items = $this->fetch_rss( $source );
                break;
            case 'twitter':
                $items = $this->fetch_twitter( $source );
                break;
            case 'api':
                $items = $this->fetch_api( $source );
                break;
            case 'webhook':
                // Webhooks se procesan cuando llegan
                break;
        }

        $log_data['items_found'] = count( $items );

        $topics = NC_Database::get_source_topics( $source_id );
        $include_keywords = array();
        $exclude_keywords = array();

        foreach ( $topics as $topic ) {
            $keywords = json_decode( $topic['keywords'], true ) ?: array();
            if ( $topic['action'] === 'include' && $topic['is_active'] ) {
                $include_keywords = array_merge( $include_keywords, $keywords );
            } elseif ( $topic['action'] === 'exclude' && $topic['is_active'] ) {
                $exclude_keywords = array_merge( $exclude_keywords, $keywords );
            }
        }

        $queued = 0;
        foreach ( $items as $item ) {
            if ( $this->should_skip_item( $item, $exclude_keywords, $include_keywords ) ) {
                continue;
            }

            if ( $this->item_exists( $item['url'] ) ) {
                continue;
            }

            $result = $this->process_and_queue( $item, $source );
            if ( $result ) {
                $queued++;
            } else {
                $log_data['errors'][] = 'Failed to process: ' . ( $item['title'] ?? $item['url'] );
            }
        }

        $log_data['items_queued']       = $queued;
        $log_data['run_end']            = current_time( 'mysql' );
        $log_data['execution_time_ms'] = round( ( microtime( true ) - $run_start ) * 1000 );

        NC_Database::log_processing( $log_data );

        return array(
            'found'  => $log_data['items_found'],
            'queued' => $queued,
            'errors' => count( $log_data['errors'] ),
        );
    }

    private function fetch_rss( $source ) {
        if ( ! $source['endpoint_url'] ) {
            return array();
        }

        require_once ABSPATH . WPINC . '/feed.php';

        $feed = fetch_feed( $source['endpoint_url'] );
        if ( is_wp_error( $feed ) ) {
            return array();
        }

        $items = array();
        foreach ( $feed->get_items( 0, 20 ) as $item ) {
            $items[] = array(
                'title'   => $item->get_title(),
                'url'     => $item->get_permalink(),
                'date'    => $item->get_date( 'Y-m-d H:i:s' ),
                'content' => $item->get_content(),
            );
        }

        return $items;
    }

    private function fetch_twitter( $source ) {
        // Placeholder - Twitter requiere API oficial
        // Por ahora retorna vacío, se puede integrar con API v2
        return array();
    }

    private function fetch_api( $source ) {
        if ( ! $source['endpoint_url'] ) {
            return array();
        }

        $args = array( 'timeout' => 30 );

        if ( $source['auth_config'] ) {
            $auth = json_decode( $source['auth_config'], true );
            if ( isset( $auth['header'] ) ) {
                $args['headers'] = $auth['header'];
            }
            if ( isset( $auth['api_key'] ) ) {
                $args['headers']['X-API-Key'] = $auth['api_key'];
            }
        }

        $response = wp_remote_get( $source['endpoint_url'], $args );
        if ( is_wp_error( $response ) ) {
            return array();
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( ! is_array( $data ) ) {
            return array();
        }

        // Asume formato genérico, ajustar según API específica
        $items = array();
        foreach ( $data as $item ) {
            $items[] = array(
                'title'   => $item['title'] ?? '',
                'url'     => $item['url'] ?? '',
                'date'    => $item['date'] ?? current_time( 'mysql' ),
                'content' => $item['content'] ?? '',
            );
        }

        return $items;
    }

    private function should_skip_item( $item, $exclude_keywords, $include_keywords ) {
        $text = strtolower( $item['title'] . ' ' . ( $item['content'] ?? '' ) );

        // Check exclude keywords first
        foreach ( $exclude_keywords as $keyword ) {
            if ( stripos( $text, strtolower( $keyword ) ) !== false ) {
                return true;
            }
        }

        // If include keywords defined, item must match at least one
        if ( ! empty( $include_keywords ) ) {
            foreach ( $include_keywords as $keyword ) {
                if ( stripos( $text, strtolower( $keyword ) ) !== false ) {
                    return false; // Found match, don't skip
                }
            }
            return true; // No include keyword matched, skip
        }

        return false;
    }

    private function item_exists( $url ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_content_queue';
        $count = $wpdb->get_var( $wpdb->prepare(
            "SELECT COUNT(*) FROM $table WHERE original_url = %s",
            $url
        ) );
        return $count > 0;
    }

    private function process_and_queue( $item, $source ) {
        if ( ! $this->openai ) {
            return false;
        }

        // Extract full content
        $extracted = $this->extractor->extract( $item['url'] );
        if ( is_wp_error( $extracted ) ) {
            return false;
        }

        // Analyze with OpenAI
        $analyzed = $this->openai->analyze( $extracted );
        if ( is_wp_error( $analyzed ) ) {
            return false;
        }

        // Get section term
        $section_name = '';
        if ( $source['section_id'] ) {
            $term = get_term( $source['section_id'], 'nc_section' );
            if ( ! is_wp_error( $term ) ) {
                $section_name = $term->name;
            }
        }

        // Queue item
        $queue_data = array(
            'source_id'           => $source['id'],
            'original_url'        => $item['url'],
            'original_title'      => $item['title'],
            'raw_content'         => $extracted,
            'processed_title'     => $analyzed['title'] ?? $item['title'],
            'processed_excerpt'   => $analyzed['excerpt'] ?? '',
            'processed_content'   => $analyzed['content'] ?? '',
            'processed_author'    => $analyzed['author'] ?? '',
            'suggested_category'  => $section_name ?: ( $analyzed['category'] ?? 'Opiniones' ),
            'suggested_tags'      => $analyzed['tags'] ?? array(),
            'suggested_image_url' => $analyzed['image_url'] ?? ( $extracted['image'] ?? '' ),
            'ai_confidence'       => $analyzed['confidence'] ?? 0.80,
        );

        return NC_Database::add_to_queue( $queue_data );
    }

    public function publish_from_queue( $queue_id, $editor_data = array() ) {
        $item = NC_Database::get_queue_item( $queue_id );
        if ( ! $item ) {
            return new WP_Error( 'not_found', 'Item no encontrado en cola' );
        }

        $title    = $editor_data['title'] ?? $item['processed_title'];
        $excerpt  = $editor_data['excerpt'] ?? $item['processed_excerpt'];
        $content  = $editor_data['content'] ?? $item['processed_content'];
        $author   = $editor_data['author'] ?? $item['processed_author'];
        $category = $editor_data['category'] ?? $item['suggested_category'];
        $tags     = $editor_data['tags'] ?? json_decode( $item['suggested_tags'], true );
        $image_url = $editor_data['image_url'] ?? $item['suggested_image_url'];

        // Get or create category
        $cat_id = 0;
        if ( $category ) {
            $cat = get_term_by( 'name', $category, 'nc_section' );
            if ( $cat ) {
                $cat_id = $cat->term_id;
            } else {
                $new_cat = wp_insert_term( $category, 'nc_section' );
                if ( ! is_wp_error( $new_cat ) ) {
                    $cat_id = $new_cat['term_id'];
                }
            }
        }

        $post_data = array(
            'post_title'    => $title,
            'post_excerpt'  => $excerpt,
            'post_content'  => $content,
            'post_status'   => 'publish',
            'post_author'   => get_current_user_id(),
            'post_type'     => 'post',
            'tax_input'     => array( 'nc_section' => $cat_id ? array( $cat_id ) : array() ),
            'tags_input'    => is_array( $tags ) ? $tags : array(),
        );

        $post_id = wp_insert_post( $post_data, true );
        if ( is_wp_error( $post_id ) ) {
            return $post_id;
        }

        // Set featured image
        if ( $image_url ) {
            $this->set_featured_image( $post_id, $image_url, $title );
        }

        // Update queue item
        NC_Database::update_queue_item( $queue_id, array(
            'status'        => 'published',
            'post_id'       => $post_id,
            'published_at'  => current_time( 'mysql' ),
            'reviewed_at'   => current_time( 'mysql' ),
        ) );

        // Store metadata
        update_post_meta( $post_id, '_nc_source_id', $item['source_id'] );
        update_post_meta( $post_id, '_nc_original_url', $item['original_url'] );
        update_post_meta( $post_id, '_nc_queue_id', $queue_id );

        return $post_id;
    }

    private function set_featured_image( $post_id, $image_url, $title ) {
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $tmp = download_url( $image_url, 30 );
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

    public function run_scheduled_processing() {
        $sources = NC_Database::get_sources( array( 'is_active' => true ) );

        foreach ( $sources as $source ) {
            $last_run    = strtotime( $source['last_run'] ?: '1970-01-01' );
            $frequency   = intval( $source['frequency_minutes'] ) * 60;
            $should_run  = ( time() - $last_run ) >= $frequency;

            if ( $should_run ) {
                $this->process_source( $source['id'] );
            }
        }
    }
}
