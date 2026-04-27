<?php
/**
 * Instagram Public Profile Scraper
 * Extrae comentarios de perfiles públicos sin usar API oficial
 *
 * NOTA: Este método puede dejar de funcionar si Instagram cambia su estructura HTML
 * o requiere login forzado. Usar con responsabilidad y respetar rate limits.
 */

class Instagram_Public_Scraper {

    private $user_agent;
    private $timeout = 30;
    private $delay_between_requests = 3; // segundos
    private $cookies = array();
    private $errors = array();
    private $comments_data = array();

    // Headers para simular navegador real
    private $headers = array(
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.5',
        'Accept-Encoding: gzip, deflate, br',
        'DNT: 1',
        'Connection: keep-alive',
        'Upgrade-Insecure-Requests: 1',
        'Sec-Fetch-Dest: document',
        'Sec-Fetch-Mode: navigate',
        'Sec-Fetch-Site: none',
        'Cache-Control: max-age=0'
    );

    public function __construct() {
        $this->user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
    }

    /**
     * Extrae username de una URL de Instagram o detecta si es post individual
     */
    public function extract_username( $url ) {
        // Soporta: https://instagram.com/username, https://www.instagram.com/username/, @username
        $url = trim( $url );

        // Remover @ si existe
        if ( strpos( $url, '@' ) === 0 ) {
            return substr( $url, 1 );
        }

        // Parsear URL
        $parsed = parse_url( $url );
        if ( ! $parsed || ! isset( $parsed['path'] ) ) {
            return false;
        }

        $path = trim( $parsed['path'], '/' );
        $parts = explode( '/', $path );

        // Detectar si es URL de post individual: /p/SHORTCODE/
        if ( isset( $parts[0] ) && $parts[0] === 'p' && isset( $parts[1] ) ) {
            // Es un post individual, retornar el shortcode con prefijo especial
            return 'post:' . $parts[1];
        }

        // Detectar si es URL de reel: /reel/SHORTCODE/
        if ( isset( $parts[0] ) && $parts[0] === 'reel' && isset( $parts[1] ) ) {
            return 'post:' . $parts[1];
        }

        // El primer segmento debe ser el username
        $username = $parts[0];

        // Validar formato de username Instagram
        if ( ! preg_match( '/^[a-zA-Z0-9_.]{1,30}$/', $username ) ) {
            return false;
        }

        return $username;
    }

    /**
     * Obtiene comentarios de un post individual por su shortcode
     */
    public function get_comments_from_single_post( $shortcode, $max_comments = 20 ) {
        $comments = $this->get_post_comments( $shortcode, $max_comments );

        if ( ! $comments ) {
            return false;
        }

        // Agregar metadatos del post
        $post_url = "https://www.instagram.com/p/{$shortcode}/";

        foreach ( $comments as &$comment ) {
            $comment['post_shortcode'] = $shortcode;
            $comment['post_url'] = $post_url;
            $comment['post_caption'] = '';
            $comment['post_timestamp'] = '';
            $comment['scraped_at'] = date( 'Y-m-d H:i:s' );
        }

        return $comments;
    }

    /**
     * Obtiene los últimos posts de un perfil público
     */
    public function get_recent_posts( $username, $limit = 20 ) {
        $profile_url = "https://www.instagram.com/{$username}/";

        $html = $this->fetch_page( $profile_url );

        if ( ! $html ) {
            $this->add_error( "No se pudo obtener el perfil: {$username}" );
            return false;
        }

        // Extraer datos del script _sharedData
        $shared_data = $this->extract_shared_data( $html );

        if ( ! $shared_data || ! isset( $shared_data['entry_data']['ProfilePage'][0]['graphql']['user'] ) ) {
            // Intentar método alternativo: buscar en el HTML directamente
            return $this->extract_posts_from_html( $html, $limit );
        }

        $user = $shared_data['entry_data']['ProfilePage'][0]['graphql']['user'];
        $edges = $user['edge_owner_to_timeline_media']['edges'] ?? array();

        $posts = array();
        $count = 0;

        foreach ( $edges as $edge ) {
            if ( $count >= $limit ) {
                break;
            }

            $node = $edge['node'];
            $posts[] = array(
                'shortcode' => $node['shortcode'],
                'id' => $node['id'],
                'url' => "https://www.instagram.com/p/{$node['shortcode']}/",
                'caption' => $node['edge_media_to_caption']['edges'][0]['node']['text'] ?? '',
                'timestamp' => $node['taken_at_timestamp'] ?? '',
                'likes' => $node['edge_liked_by']['count'] ?? 0,
                'comments_count' => $node['edge_media_to_comment']['count'] ?? 0,
                'is_video' => $node['is_video'] ?? false,
                'display_url' => $node['display_url'] ?? ''
            );

            $count++;
        }

        return $posts;
    }

    /**
     * Obtiene comentarios de un post específico
     */
    public function get_post_comments( $shortcode, $limit = 20 ) {
        $post_url = "https://www.instagram.com/p/{$shortcode}/";

        $html = $this->fetch_page( $post_url );

        if ( ! $html ) {
            $this->add_error( "No se pudo obtener el post: {$shortcode}" );
            return false;
        }

        // Método 1: Extraer de _sharedData
        $shared_data = $this->extract_shared_data( $html );

        if ( $shared_data && isset( $shared_data['entry_data']['PostPage'][0]['graphql']['shortcode_media'] ) ) {
            $media = $shared_data['entry_data']['PostPage'][0]['graphql']['shortcode_media'];
            return $this->parse_comments_from_media( $media, $shortcode, $limit );
        }

        // Método 2: API GraphQL no oficial
        return $this->fetch_comments_graphql( $shortcode, $limit );
    }

    /**
     * Descarga comentarios de múltiples posts o un post individual
     */
    public function scrape_comments_from_profile( $username_or_url, $max_posts = 20, $max_comments_per_post = 20 ) {
        $this->comments_data = array();

        $username = $this->extract_username( $username_or_url );

        if ( ! $username ) {
            $this->add_error( 'URL o username inválido' );
            return false;
        }

        // Detectar si es un post individual
        if ( strpos( $username, 'post:' ) === 0 ) {
            $shortcode = substr( $username, 5 );
            echo "Obteniendo comentarios del post: {$shortcode}\n";

            $comments = $this->get_comments_from_single_post( $shortcode, $max_comments_per_post );

            if ( $comments ) {
                $this->comments_data = $comments;
                echo "✓ " . count( $comments ) . " comentarios extraídos\n";
                return $this->comments_data;
            } else {
                $this->add_error( "No se pudieron obtener comentarios del post" );
                return false;
            }
        }

        echo "Obteniendo posts de @{$username}...\n";

        $posts = $this->get_recent_posts( $username, $max_posts );

        if ( ! $posts || empty( $posts ) ) {
            $this->add_error( "No se encontraron posts o el perfil es privado/requiere login" );
            return false;
        }

        echo "Posts encontrados: " . count( $posts ) . "\n";

        foreach ( $posts as $index => $post ) {
            echo "Procesando post " . ($index + 1) . "/" . count( $posts ) . "...\n";

            $comments = $this->get_post_comments( $post['shortcode'], $max_comments_per_post );

            if ( $comments ) {
                foreach ( $comments as $comment ) {
                    $this->comments_data[] = array_merge( $comment, array(
                        'post_shortcode' => $post['shortcode'],
                        'post_url' => $post['url'],
                        'post_caption' => $post['caption'],
                        'post_timestamp' => $post['timestamp'],
                        'scraped_at' => date( 'Y-m-d H:i:s' )
                    ) );
                }

                echo "  ✓ " . count( $comments ) . " comentarios extraídos\n";
            } else {
                echo "  ✗ No se pudieron obtener comentarios\n";
            }

            // Delay para evitar bloqueo
            sleep( $this->delay_between_requests );
        }

        return $this->comments_data;
    }

    /**
     * Hace request HTTP
     */
    private function fetch_page( $url ) {
        $ch = curl_init();

        curl_setopt( $ch, CURLOPT_URL, $url );
        curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
        curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
        curl_setopt( $ch, CURLOPT_TIMEOUT, $this->timeout );
        curl_setopt( $ch, CURLOPT_USERAGENT, $this->user_agent );
        curl_setopt( $ch, CURLOPT_HTTPHEADER, $this->headers );
        curl_setopt( $ch, CURLOPT_ENCODING, '' ); // Acepta gzip/deflate
        curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false ); // Solo para desarrollo
        curl_setopt( $ch, CURLOPT_COOKIEJAR, '/tmp/ig_cookies.txt' );
        curl_setopt( $ch, CURLOPT_COOKIEFILE, '/tmp/ig_cookies.txt' );

        // Headers adicionales
        curl_setopt( $ch, CURLOPT_HTTPHEADER, array_merge( $this->headers, array(
            'Referer: https://www.instagram.com/',
            'Origin: https://www.instagram.com'
        ) ) );

        $response = curl_exec( $ch );
        $http_code = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
        $error = curl_error( $ch );

        if ( $error ) {
            $this->add_error( "CURL Error: {$error}" );
            return false;
        }

        if ( $http_code !== 200 ) {
            $this->add_error( "HTTP Error: {$http_code}" );
            return false;
        }

        return $response;
    }

    /**
     * Extrae datos del script _sharedData
     */
    private function extract_shared_data( $html ) {
        // Buscar el script que contiene window._sharedData
        if ( preg_match( '/<script type="text\/javascript">window\._sharedData = (.+?);<\/script>/', $html, $matches ) ) {
            $json = $matches[1];
            $data = json_decode( $json, true );

            if ( json_last_error() === JSON_ERROR_NONE ) {
                return $data;
            }
        }

        // Intentar buscar en otros formatos
        if ( preg_match( '/"graphql":\{([^}]+)\}/', $html, $matches ) ) {
            // Fallback parsing
        }

        return false;
    }

    /**
     * Parsea comentarios desde objeto media
     */
    private function parse_comments_from_media( $media, $shortcode, $limit ) {
        $comments = array();
        $edges = $media['edge_media_to_parent_comment']['edges'] ?? array();

        $count = 0;
        foreach ( $edges as $edge ) {
            if ( $count >= $limit ) {
                break;
            }

            $node = $edge['node'];
            $comments[] = array(
                'comment_id' => $node['id'],
                'username' => $node['owner']['username'] ?? 'unknown',
                'text' => $node['text'] ?? '',
                'timestamp' => $node['created_at'] ?? '',
                'likes' => $node['edge_liked_by']['count'] ?? 0,
                'is_reply' => false
            );

            // Procesar replies
            if ( isset( $node['edge_threaded_comments']['edges'] ) ) {
                foreach ( $node['edge_threaded_comments']['edges'] as $reply_edge ) {
                    $reply = $reply_edge['node'];
                    $comments[] = array(
                        'comment_id' => $reply['id'],
                        'username' => $reply['owner']['username'] ?? 'unknown',
                        'text' => $reply['text'] ?? '',
                        'timestamp' => $reply['created_at'] ?? '',
                        'likes' => $reply['edge_liked_by']['count'] ?? 0,
                        'is_reply' => true,
                        'parent_id' => $node['id']
                    );
                }
            }

            $count++;
        }

        return $comments;
    }

    /**
     * Extrae posts desde HTML cuando _sharedData no está disponible
     */
    private function extract_posts_from_html( $html, $limit ) {
        // Buscar enlaces a posts en el HTML
        if ( preg_match_all( '/href="\/p\/([a-zA-Z0-9_-]+)\//', $html, $matches ) ) {
            $shortcodes = array_slice( array_unique( $matches[1] ), 0, $limit );

            $posts = array();
            foreach ( $shortcodes as $shortcode ) {
                $posts[] = array(
                    'shortcode' => $shortcode,
                    'id' => '',
                    'url' => "https://www.instagram.com/p/{$shortcode}/",
                    'caption' => '',
                    'timestamp' => '',
                    'likes' => 0,
                    'comments_count' => 0,
                    'is_video' => false,
                    'display_url' => ''
                );
            }

            return $posts;
        }

        return array();
    }

    /**
     * Usa GraphQL no oficial para obtener más comentarios
     */
    private function fetch_comments_graphql( $shortcode, $limit ) {
        // Este método requiere el query_hash que cambia frecuentemente
        // Es un fallback cuando el HTML no contiene los datos

        $this->add_error( "GraphQL API no disponible, datos limitados" );
        return array();
    }

    /**
     * Exporta a JSON
     */
    public function export_to_json( $filename = null ) {
        if ( ! $filename ) {
            $filename = 'instagram_scraped_' . date( 'Y-m-d_H-i-s' ) . '.json';
        }

        file_put_contents( $filename, json_encode( $this->comments_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ) );

        return array(
            'filename' => $filename,
            'count' => count( $this->comments_data ),
            'path' => realpath( $filename )
        );
    }

    /**
     * Exporta a CSV
     */
    public function export_to_csv( $filename = null ) {
        if ( ! $filename ) {
            $filename = 'instagram_scraped_' . date( 'Y-m-d_H-i-s' ) . '.csv';
        }

        $fp = fopen( $filename, 'w' );

        fputcsv( $fp, array(
            'Comment ID', 'Username', 'Text', 'Timestamp', 'Likes',
            'Is Reply', 'Parent ID', 'Post Shortcode', 'Post URL',
            'Post Caption', 'Post Timestamp', 'Scraped At'
        ) );

        foreach ( $this->comments_data as $comment ) {
            fputcsv( $fp, array(
                $comment['comment_id'],
                $comment['username'],
                $comment['text'],
                $comment['timestamp'],
                $comment['likes'],
                $comment['is_reply'] ? 'Yes' : 'No',
                $comment['parent_id'] ?? '',
                $comment['post_shortcode'],
                $comment['post_url'],
                $comment['post_caption'],
                $comment['post_timestamp'],
                $comment['scraped_at']
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
     * Estadísticas
     */
    public function get_stats() {
        $total = count( $this->comments_data );
        $replies = array_filter( $this->comments_data, function( $c ) {
            return $c['is_reply'];
        } );
        $users = array_unique( array_column( $this->comments_data, 'username' ) );

        return array(
            'total_comments' => $total,
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

    public function set_delay( $seconds ) {
        $this->delay_between_requests = max( 1, intval( $seconds ) );
    }
}
