<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class NC_Extractor {

    public function extract( $url ) {
        if ( $this->is_twitter_url( $url ) ) {
            return $this->extract_from_twitter( $url );
        }
        return $this->extract_from_web( $url );
    }

    private function is_twitter_url( $url ) {
        return (bool) preg_match( '/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i', $url );
    }

    private function extract_from_twitter( $url ) {
        $api_url = preg_replace( '/https?:\/\/(www\.)?(twitter\.com|x\.com)/i', 'https://api.fxtwitter.com', $url );

        $response = wp_remote_get( $api_url, array(
            'timeout' => 15,
        ) );

        if ( is_wp_error( $response ) ) {
            return new WP_Error( 'extraction_failed', 'Error conectando con API de Twitter: ' . $response->get_error_message() );
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( empty( $data['tweet'] ) ) {
            return new WP_Error( 'no_tweet', 'No se pudo obtener el tweet' );
        }

        $tweet = $data['tweet'];

        return array(
            'title'         => ! empty( $tweet['text'] ) ? mb_substr( $tweet['text'], 0, 100 ) . '...' : '',
            'description'   => $tweet['text'] ?? '',
            'image'         => $tweet['media']['photos'][0]['url'] ?? ( $tweet['media']['videos'][0]['thumbnail_url'] ?? '' ),
            'author'        => sprintf( '%s (@%s)', $tweet['author']['name'] ?? '', $tweet['author']['screen_name'] ?? '' ),
            'author_avatar' => $tweet['author']['avatar_url'] ?? '',
            'text'          => $tweet['text'] ?? '',
            'date'          => $tweet['created_at'] ?? '',
            'likes'         => $tweet['likes'] ?? 0,
            'retweets'      => $tweet['retweets'] ?? 0,
            'replies'       => $tweet['replies'] ?? 0,
            'source'        => 'twitter',
            'url'           => $url,
        );
    }

    private function extract_from_web( $url ) {
        $response = wp_remote_get( $url, array(
            'timeout'    => 15,
            'user-agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ) );

        if ( is_wp_error( $response ) ) {
            return new WP_Error( 'extraction_failed', 'Error extrayendo contenido: ' . $response->get_error_message() );
        }

        $html = wp_remote_retrieve_body( $response );

        $title       = $this->extract_meta( $html, 'title' );
        $description = $this->extract_meta( $html, 'description' );
        $image       = $this->extract_meta( $html, 'image' );
        $author      = $this->extract_meta( $html, 'author' );
        $text        = $this->extract_body_text( $html );

        return array(
            'title'       => $title,
            'description' => $description,
            'image'       => $image,
            'author'      => $author,
            'text'        => $text,
            'source'      => 'web',
            'url'         => $url,
        );
    }

    private function extract_meta( $html, $type ) {
        switch ( $type ) {
            case 'title':
                if ( preg_match( '/<title[^>]*>(.*?)<\/title>/is', $html, $m ) ) {
                    return trim( html_entity_decode( $m[1] ) );
                }
                if ( preg_match( '/property=["\']og:title["\'][^>]*content=["\']([^"\']*)/i', $html, $m ) ) {
                    return trim( html_entity_decode( $m[1] ) );
                }
                return '';

            case 'description':
                if ( preg_match( '/property=["\']og:description["\'][^>]*content=["\']([^"\']*)/i', $html, $m ) ) {
                    return trim( html_entity_decode( $m[1] ) );
                }
                if ( preg_match( '/name=["\']description["\'][^>]*content=["\']([^"\']*)/i', $html, $m ) ) {
                    return trim( html_entity_decode( $m[1] ) );
                }
                return '';

            case 'image':
                if ( preg_match( '/property=["\']og:image["\'][^>]*content=["\']([^"\']*)/i', $html, $m ) ) {
                    return trim( $m[1] );
                }
                return '';

            case 'author':
                if ( preg_match( '/name=["\']author["\'][^>]*content=["\']([^"\']*)/i', $html, $m ) ) {
                    return trim( html_entity_decode( $m[1] ) );
                }
                if ( preg_match( '/property=["\']og:site_name["\'][^>]*content=["\']([^"\']*)/i', $html, $m ) ) {
                    return trim( html_entity_decode( $m[1] ) );
                }
                return '';
        }
        return '';
    }

    private function extract_body_text( $html ) {
        $text = preg_replace( '/<script[^>]*>.*?<\/script>/is', '', $html );
        $text = preg_replace( '/<style[^>]*>.*?<\/style>/is', '', $text );
        $text = wp_strip_all_tags( $text );
        $text = preg_replace( '/\s+/', ' ', $text );
        return mb_substr( trim( $text ), 0, 2000 );
    }
}
