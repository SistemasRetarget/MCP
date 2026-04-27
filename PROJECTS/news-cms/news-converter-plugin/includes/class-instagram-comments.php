<?php
/**
 * Instagram Comments Downloader
 * Descarga comentarios de perfiles de Instagram usando Instagram Graph API
 *
 * Requiere:
 * - Instagram Business Account o Creator Account
 * - App registrada en Facebook Developers
 * - Access Token válido con permisos: instagram_basic, pages_read_engagement
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Instagram_Comments_Downloader {

    private $access_token;
    private $api_version = 'v18.0';
    private $base_url = 'https://graph.facebook.com/';
    private $instagram_account_id;
    private $rate_limit_delay = 1; // segundos entre requests

    // Almacenamiento de comentarios
    private $comments_data = array();
    private $errors = array();

    public function __construct( $access_token, $instagram_account_id = null ) {
        $this->access_token = $access_token;
        $this->instagram_account_id = $instagram_account_id;
    }

    /**
     * Obtiene el ID de la cuenta de Instagram desde Facebook Page
     */
    public function get_instagram_account_id( $page_id ) {
        $endpoint = $this->base_url . $this->api_version . '/' . $page_id;
        $params = array(
            'fields' => 'instagram_business_account{id}',
            'access_token' => $this->access_token
        );

        $response = $this->make_request( $endpoint, $params );

        if ( isset( $response['instagram_business_account']['id'] ) ) {
            $this->instagram_account_id = $response['instagram_business_account']['id'];
            return $this->instagram_account_id;
        }

        return false;
    }

    /**
     * Obtiene posts de la cuenta de Instagram
     */
    public function get_posts( $limit = 25, $since = null, $until = null ) {
        if ( ! $this->instagram_account_id ) {
            $this->add_error( 'No se ha configurado el ID de cuenta de Instagram' );
            return false;
        }

        $endpoint = $this->base_url . $this->api_version . '/' . $this->instagram_account_id . '/media';
        $params = array(
            'fields' => 'id,caption,media_type,media_url,permalink,timestamp,username,like_count,comments_count',
            'limit' => $limit,
            'access_token' => $this->access_token
        );

        if ( $since ) {
            $params['since'] = strtotime( $since );
        }
        if ( $until ) {
            $params['until'] = strtotime( $until );
        }

        $posts = array();
        $next_url = $endpoint . '?' . http_build_query( $params );

        while ( $next_url && count( $posts ) < $limit ) {
            $response = $this->make_request( $next_url, array(), true );

            if ( ! $response || isset( $response['error'] ) ) {
                break;
            }

            if ( isset( $response['data'] ) ) {
                foreach ( $response['data'] as $post ) {
                    $posts[] = $post;
                    if ( count( $posts ) >= $limit ) {
                        break 2;
                    }
                }
            }

            $next_url = isset( $response['paging']['next'] ) ? $response['paging']['next'] : null;
        }

        return $posts;
    }

    /**
     * Obtiene comentarios de un post específico
     */
    public function get_comments( $media_id, $include_replies = true ) {
        $endpoint = $this->base_url . $this->api_version . '/' . $media_id . '/comments';
        $params = array(
            'fields' => 'id,text,timestamp,username,like_count,replies{id,text,timestamp,username,like_count}',
            'access_token' => $this->access_token
        );

        $comments = array();
        $next_url = $endpoint . '?' . http_build_query( $params );

        while ( $next_url ) {
            $response = $this->make_request( $next_url, array(), true );

            if ( ! $response || isset( $response['error'] ) ) {
                if ( isset( $response['error'] ) ) {
                    $this->add_error( "Error en comentarios de {$media_id}: " . $response['error']['message'] );
                }
                break;
            }

            if ( isset( $response['data'] ) ) {
                foreach ( $response['data'] as $comment ) {
                    $comment_data = array(
                        'comment_id' => $comment['id'],
                        'media_id' => $media_id,
                        'username' => $comment['username'] ?? 'unknown',
                        'text' => $comment['text'] ?? '',
                        'timestamp' => $comment['timestamp'] ?? '',
                        'like_count' => $comment['like_count'] ?? 0,
                        'is_reply' => false,
                        'parent_comment_id' => null
                    );

                    $comments[] = $comment_data;

                    // Procesar replies si están habilitadas
                    if ( $include_replies && isset( $comment['replies']['data'] ) ) {
                        foreach ( $comment['replies']['data'] as $reply ) {
                            $comments[] = array(
                                'comment_id' => $reply['id'],
                                'media_id' => $media_id,
                                'username' => $reply['username'] ?? 'unknown',
                                'text' => $reply['text'] ?? '',
                                'timestamp' => $reply['timestamp'] ?? '',
                                'like_count' => $reply['like_count'] ?? 0,
                                'is_reply' => true,
                                'parent_comment_id' => $comment['id']
                            );
                        }
                    }
                }
            }

            $next_url = isset( $response['paging']['next'] ) ? $response['paging']['next'] : null;
        }

        return $comments;
    }

    /**
     * Descarga comentarios de múltiples posts
     */
    public function download_comments_from_posts( $posts, $include_replies = true ) {
        $this->comments_data = array();
        $total = count( $posts );

        foreach ( $posts as $index => $post ) {
            $comments = $this->get_comments( $post['id'], $include_replies );

            if ( $comments ) {
                foreach ( $comments as $comment ) {
                    $comment['post_permalink'] = $post['permalink'] ?? '';
                    $comment['post_caption'] = $post['caption'] ?? '';
                    $comment['post_timestamp'] = $post['timestamp'] ?? '';
                    $this->comments_data[] = $comment;
                }
            }

            // Delay para rate limiting
            sleep( $this->rate_limit_delay );
        }

        return $this->comments_data;
    }

    /**
     * Exporta comentarios a JSON
     */
    public function export_to_json( $filename = null ) {
        if ( ! $filename ) {
            $filename = 'instagram_comments_' . date( 'Y-m-d_H-i-s' ) . '.json';
        }

        $json_data = json_encode( $this->comments_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE );

        file_put_contents( $filename, $json_data );

        return array(
            'filename' => $filename,
            'count' => count( $this->comments_data ),
            'path' => realpath( $filename )
        );
    }

    /**
     * Exporta comentarios a CSV
     */
    public function export_to_csv( $filename = null ) {
        if ( ! $filename ) {
            $filename = 'instagram_comments_' . date( 'Y-m-d_H-i-s' ) . '.csv';
        }

        $fp = fopen( $filename, 'w' );

        // Headers
        $headers = array(
            'Comment ID',
            'Media ID',
            'Username',
            'Text',
            'Timestamp',
            'Like Count',
            'Is Reply',
            'Parent Comment ID',
            'Post Permalink',
            'Post Caption',
            'Post Timestamp'
        );
        fputcsv( $fp, $headers );

        // Data
        foreach ( $this->comments_data as $comment ) {
            fputcsv( $fp, array(
                $comment['comment_id'],
                $comment['media_id'],
                $comment['username'],
                $comment['text'],
                $comment['timestamp'],
                $comment['like_count'],
                $comment['is_reply'] ? 'Yes' : 'No',
                $comment['parent_comment_id'] ?? '',
                $comment['post_permalink'] ?? '',
                $comment['post_caption'] ?? '',
                $comment['post_timestamp'] ?? ''
            ) );
        }

        fclose( $fp );

        return array(
            'filename' => $filename,
            'count' => count( $this->comments_data ),
            'path' => realpath( $filename )
        );
    }

    /**
     * Realiza petición a la API
     */
    private function make_request( $url, $params = array(), $is_full_url = false ) {
        if ( ! $is_full_url ) {
            $url = $url . '?' . http_build_query( $params );
        }

        $ch = curl_init();
        curl_setopt( $ch, CURLOPT_URL, $url );
        curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
        curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
        curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, true );
        curl_setopt( $ch, CURLOPT_TIMEOUT, 30 );
        curl_setopt( $ch, CURLOPT_HTTPHEADER, array(
            'Accept: application/json'
        ) );

        $response = curl_exec( $ch );
        $http_code = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
        $curl_error = curl_error( $ch );
        curl_close( $ch );

        if ( $curl_error ) {
            $this->add_error( 'CURL Error: ' . $curl_error );
            return false;
        }

        if ( $http_code !== 200 ) {
            $this->add_error( "HTTP Error: {$http_code}" );
            return false;
        }

        $decoded = json_decode( $response, true );

        if ( json_last_error() !== JSON_ERROR_NONE ) {
            $this->add_error( 'JSON Parse Error: ' . json_last_error_msg() );
            return false;
        }

        return $decoded;
    }

    /**
     * Obtiene estadísticas del scraping
     */
    public function get_stats() {
        $total_comments = count( $this->comments_data );
        $replies = array_filter( $this->comments_data, function( $c ) {
            return $c['is_reply'];
        } );

        $users = array_unique( array_column( $this->comments_data, 'username' ) );

        return array(
            'total_comments' => $total_comments,
            'total_replies' => count( $replies ),
            'unique_users' => count( $users ),
            'errors' => $this->errors
        );
    }

    private function add_error( $message ) {
        $this->errors[] = array(
            'time' => date( 'Y-m-d H:i:s' ),
            'message' => $message
        );
    }

    public function get_errors() {
        return $this->errors;
    }

    public function has_errors() {
        return ! empty( $this->errors );
    }
}
