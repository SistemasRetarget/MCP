<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class NC_Database {

    public static function install() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $sources_table = $wpdb->prefix . 'nc_sources';
        $topics_table = $wpdb->prefix . 'nc_source_topics';
        $queue_table = $wpdb->prefix . 'nc_content_queue';
        $logs_table = $wpdb->prefix . 'nc_processing_logs';

        $sources_sql = "CREATE TABLE IF NOT EXISTS $sources_table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            type varchar(50) NOT NULL COMMENT 'rss|api|twitter|webhook|manual',
            endpoint_url text,
            auth_config longtext,
            section_id bigint(20) unsigned,
            frequency_minutes int(11) DEFAULT 30,
            last_run datetime DEFAULT NULL,
            is_active tinyint(1) DEFAULT 1,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_by bigint(20) unsigned,
            PRIMARY KEY (id),
            KEY is_active (is_active),
            KEY section_id (section_id),
            KEY type (type)
        ) $charset_collate;";

        $topics_sql = "CREATE TABLE IF NOT EXISTS $topics_table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            source_id bigint(20) unsigned NOT NULL,
            topic_name varchar(255) NOT NULL,
            keywords longtext NOT NULL COMMENT 'JSON array',
            weight int(11) DEFAULT 5,
            action varchar(20) DEFAULT 'include' COMMENT 'include|exclude',
            is_active tinyint(1) DEFAULT 1,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY source_id (source_id),
            KEY action (action),
            KEY is_active (is_active)
        ) $charset_collate;";

        $queue_sql = "CREATE TABLE IF NOT EXISTS $queue_table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            source_id bigint(20) unsigned NOT NULL,
            original_url varchar(500),
            original_title text,
            raw_content longtext COMMENT 'JSON extracted data',
            processed_title varchar(500),
            processed_excerpt text,
            processed_content longtext,
            processed_author varchar(255),
            suggested_category varchar(100),
            suggested_tags longtext COMMENT 'JSON array',
            suggested_image_url varchar(500),
            status varchar(50) DEFAULT 'pending_review' COMMENT 'pending_review|approved|rejected|published|archived',
            priority int(11) DEFAULT 5,
            assigned_editor_id bigint(20) unsigned,
            editor_notes text,
            rejection_reason text,
            post_id bigint(20) unsigned,
            ai_confidence decimal(3,2) DEFAULT 0.80,
            extracted_at datetime DEFAULT CURRENT_TIMESTAMP,
            processed_at datetime,
            reviewed_at datetime,
            published_at datetime,
            PRIMARY KEY (id),
            KEY source_id (source_id),
            KEY status (status),
            KEY priority (priority),
            KEY extracted_at (extracted_at),
            KEY assigned_editor_id (assigned_editor_id),
            FULLTEXT KEY processed_title (processed_title)
        ) $charset_collate;";

        $logs_sql = "CREATE TABLE IF NOT EXISTS $logs_table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            source_id bigint(20) unsigned NOT NULL,
            run_start datetime DEFAULT CURRENT_TIMESTAMP,
            run_end datetime,
            items_found int(11) DEFAULT 0,
            items_queued int(11) DEFAULT 0,
            items_published int(11) DEFAULT 0,
            errors longtext COMMENT 'JSON array',
            execution_time_ms int(11),
            PRIMARY KEY (id),
            KEY source_id (source_id),
            KEY run_start (run_start)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sources_sql );
        dbDelta( $topics_sql );
        dbDelta( $queue_sql );
        dbDelta( $logs_sql );

        update_option( 'nc_db_version', '2.0.0' );
    }

    public static function get_sources( $args = array() ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_sources';

        $defaults = array(
            'is_active' => null,
            'type'      => null,
            'orderby'   => 'created_at',
            'order'     => 'DESC',
            'limit'     => 100,
        );
        $args = wp_parse_args( $args, $defaults );

        $where = array( '1=1' );
        if ( $args['is_active'] !== null ) {
            $where[] = $wpdb->prepare( 'is_active = %d', $args['is_active'] ? 1 : 0 );
        }
        if ( $args['type'] ) {
            $where[] = $wpdb->prepare( 'type = %s', $args['type'] );
        }

        $where_sql = implode( ' AND ', $where );
        $orderby = sanitize_sql_orderby( $args['orderby'] . ' ' . $args['order'] ) ?: 'created_at DESC';
        $limit = intval( $args['limit'] );

        return $wpdb->get_results(
            "SELECT * FROM $table WHERE $where_sql ORDER BY $orderby LIMIT $limit",
            ARRAY_A
        );
    }

    public static function get_source( $id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_sources';
        return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ), ARRAY_A );
    }

    public static function save_source( $data, $id = null ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_sources';

        $insert_data = array(
            'name'              => sanitize_text_field( $data['name'] ),
            'type'              => sanitize_text_field( $data['type'] ),
            'endpoint_url'      => esc_url_raw( $data['endpoint_url'] ?? '' ),
            'auth_config'       => isset( $data['auth_config'] ) ? wp_json_encode( $data['auth_config'] ) : null,
            'section_id'        => ! empty( $data['section_id'] ) ? intval( $data['section_id'] ) : null,
            'frequency_minutes' => intval( $data['frequency_minutes'] ?? 30 ),
            'is_active'         => ! empty( $data['is_active'] ) ? 1 : 0,
            'created_by'        => get_current_user_id(),
        );

        if ( $id ) {
            $wpdb->update( $table, $insert_data, array( 'id' => $id ) );
            return $id;
        }

        $wpdb->insert( $table, $insert_data );
        return $wpdb->insert_id;
    }

    public static function delete_source( $id ) {
        global $wpdb;
        $wpdb->delete( $wpdb->prefix . 'nc_source_topics', array( 'source_id' => $id ) );
        $wpdb->delete( $wpdb->prefix . 'nc_sources', array( 'id' => $id ) );
    }

    public static function get_source_topics( $source_id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_source_topics';
        return $wpdb->get_results(
            $wpdb->prepare( "SELECT * FROM $table WHERE source_id = %d ORDER BY weight DESC", $source_id ),
            ARRAY_A
        );
    }

    public static function save_topic( $data, $id = null ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_source_topics';

        $insert_data = array(
            'source_id'   => intval( $data['source_id'] ),
            'topic_name'  => sanitize_text_field( $data['topic_name'] ),
            'keywords'    => wp_json_encode( array_map( 'sanitize_text_field', (array) $data['keywords'] ) ),
            'weight'      => intval( $data['weight'] ?? 5 ),
            'action'      => in_array( $data['action'], array( 'include', 'exclude' ) ) ? $data['action'] : 'include',
            'is_active'   => ! empty( $data['is_active'] ) ? 1 : 0,
        );

        if ( $id ) {
            return $wpdb->update( $table, $insert_data, array( 'id' => $id ) );
        }
        return $wpdb->insert( $table, $insert_data );
    }

    public static function delete_topic( $id ) {
        global $wpdb;
        $wpdb->delete( $wpdb->prefix . 'nc_source_topics', array( 'id' => $id ) );
    }

    public static function get_queue_items( $args = array() ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_content_queue';

        $defaults = array(
            'status'    => null,
            'source_id' => null,
            'search'    => '',
            'orderby'   => 'extracted_at',
            'order'     => 'DESC',
            'limit'     => 50,
            'offset'    => 0,
        );
        $args = wp_parse_args( $args, $defaults );

        $where = array( '1=1' );
        if ( $args['status'] ) {
            $where[] = $wpdb->prepare( 'status = %s', $args['status'] );
        }
        if ( $args['source_id'] ) {
            $where[] = $wpdb->prepare( 'source_id = %d', $args['source_id'] );
        }
        if ( $args['search'] ) {
            $where[] = $wpdb->prepare( 'processed_title LIKE %s', '%' . $wpdb->esc_like( $args['search'] ) . '%' );
        }

        $where_sql = implode( ' AND ', $where );
        $orderby = sanitize_sql_orderby( $args['orderby'] . ' ' . $args['order'] ) ?: 'extracted_at DESC';
        $limit = intval( $args['limit'] );
        $offset = intval( $args['offset'] );

        return $wpdb->get_results(
            "SELECT * FROM $table WHERE $where_sql ORDER BY $orderby LIMIT $limit OFFSET $offset",
            ARRAY_A
        );
    }

    public static function count_queue_items( $status = null ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_content_queue';

        if ( $status ) {
            return $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE status = %s", $status ) );
        }
        return $wpdb->get_var( "SELECT COUNT(*) FROM $table" );
    }

    public static function add_to_queue( $data ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_content_queue';

        $insert_data = array(
            'source_id'             => intval( $data['source_id'] ),
            'original_url'          => esc_url_raw( $data['original_url'] ?? '' ),
            'original_title'        => sanitize_text_field( $data['original_title'] ?? '' ),
            'raw_content'           => isset( $data['raw_content'] ) ? wp_json_encode( $data['raw_content'] ) : null,
            'processed_title'       => sanitize_text_field( $data['processed_title'] ?? '' ),
            'processed_excerpt'     => sanitize_textarea_field( $data['processed_excerpt'] ?? '' ),
            'processed_content'     => wp_kses_post( $data['processed_content'] ?? '' ),
            'processed_author'      => sanitize_text_field( $data['processed_author'] ?? '' ),
            'suggested_category'    => sanitize_text_field( $data['suggested_category'] ?? '' ),
            'suggested_tags'        => isset( $data['suggested_tags'] ) ? wp_json_encode( $data['suggested_tags'] ) : null,
            'suggested_image_url'   => esc_url_raw( $data['suggested_image_url'] ?? '' ),
            'priority'              => intval( $data['priority'] ?? 5 ),
            'ai_confidence'         => floatval( $data['ai_confidence'] ?? 0.80 ),
            'status'                => 'pending_review',
        );

        $wpdb->insert( $table, $insert_data );
        return $wpdb->insert_id;
    }

    public static function update_queue_item( $id, $data ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_content_queue';
        return $wpdb->update( $table, $data, array( 'id' => $id ) );
    }

    public static function get_queue_item( $id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_content_queue';
        return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ), ARRAY_A );
    }

    public static function log_processing( $data ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_processing_logs';

        $wpdb->insert( $table, array(
            'source_id'         => intval( $data['source_id'] ),
            'run_start'         => $data['run_start'] ?? current_time( 'mysql' ),
            'run_end'           => $data['run_end'] ?? null,
            'items_found'       => intval( $data['items_found'] ?? 0 ),
            'items_queued'      => intval( $data['items_queued'] ?? 0 ),
            'items_published'   => intval( $data['items_published'] ?? 0 ),
            'errors'            => isset( $data['errors'] ) ? wp_json_encode( $data['errors'] ) : null,
            'execution_time_ms' => intval( $data['execution_time_ms'] ?? 0 ),
        ) );

        $wpdb->update(
            $wpdb->prefix . 'nc_sources',
            array( 'last_run' => current_time( 'mysql' ) ),
            array( 'id' => $data['source_id'] )
        );

        return $wpdb->insert_id;
    }

    public static function get_logs( $source_id = null, $limit = 50 ) {
        global $wpdb;
        $table = $wpdb->prefix . 'nc_processing_logs';

        if ( $source_id ) {
            return $wpdb->get_results(
                $wpdb->prepare( "SELECT * FROM $table WHERE source_id = %d ORDER BY run_start DESC LIMIT %d", $source_id, $limit ),
                ARRAY_A
            );
        }
        return $wpdb->get_results( "SELECT * FROM $table ORDER BY run_start DESC LIMIT $limit", ARRAY_A );
    }
}
