<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class NC_OpenAI {

    private $api_key;
    private $model;

    public function __construct( $api_key, $model = 'gpt-4o-mini' ) {
        $this->api_key = $api_key;
        $this->model   = $model;
    }

    public function analyze( $extracted_content ) {
        $title_lessons = NC_Feedback::format_lessons_for_prompt( 'title', 5 );
        $excerpt_lessons = NC_Feedback::format_lessons_for_prompt( 'excerpt', 3 );

        $system_prompt = 'Eres un editor periodístico chileno experto en cuñas para columnas de opinión.

Tu trabajo es generar el campo "title" como una CUÑA PERIODÍSTICA.

REGLAS ESTRICTAS PARA EL TITLE:
1. PROHIBIDO usar nombres de personas en el título. Nunca. Jamás.
2. PROHIBIDO parafrasear (ej: "Fulano critica X", "Experto advierte Y", "Fulano califica Z").
3. PROHIBIDO usar verbos como "critica", "advierte", "señala", "califica", "destaca".
4. PROHIBIDO incluir porcentajes o cifras numéricas en el título. Nada de "8,3%", "un 20%", etc.
5. El título es SOLO la afirmación central, como si fuera una cita textual sin comillas.
6. Máximo 80 caracteres. Corto. Directo. Potente.
7. Debe ser DIFERENTE al título original de la fuente.

EJEMPLOS CORRECTOS:
- "El desempleo es un problema estructural"
- "El mercado laboral no se va a recuperar solo"
- "Esta reforma no resuelve nada"
- "Chile necesita empleos reales, no estadísticas maquilladas"

EJEMPLOS INCORRECTOS (NUNCA hagas esto):
- "David Bravo critica las reformas laborales del gobierno"
- "Economista advierte sobre el alto desempleo"
- "El 8,3% de desempleo revela un problema profundo"
- "Experto señala problemas en el mercado laboral"' . $title_lessons . $excerpt_lessons . '

Devuelve SOLO JSON válido, sin texto adicional.';

        $user_prompt = sprintf(
            'Convierte este contenido en un post de opinión.

TÍTULO ORIGINAL (no lo repitas): %s
Descripción: %s
Autor: %s
Texto: %s

JSON requerido:
{
  "title": "CUÑA directa sin nombres (máx 80 chars)",
  "excerpt": "Contexto breve, máx 160 chars, complementa el título",
  "author": "Nombre del autor o fuente",
  "content": "Post en HTML con <p>, <strong>, <em> (máx 500 palabras)",
  "category": "Opiniones",
  "tags": ["tag1", "tag2", "tag3"],
  "image_url": "%s",
  "confidence": 0.95
}',
            $extracted_content['title'] ?? '',
            $extracted_content['description'] ?? '',
            $extracted_content['author'] ?? '',
            $extracted_content['text'] ?? '',
            $extracted_content['image'] ?? ''
        );

        $response = wp_remote_post( 'https://api.openai.com/v1/chat/completions', array(
            'timeout' => 30,
            'headers' => array(
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            ),
            'body'    => wp_json_encode( array(
                'model'      => $this->model,
                'max_tokens' => 1500,
                'messages'   => array(
                    array(
                        'role'    => 'system',
                        'content' => $system_prompt,
                    ),
                    array(
                        'role'    => 'user',
                        'content' => $user_prompt,
                    ),
                ),
            ) ),
        ) );

        if ( is_wp_error( $response ) ) {
            return new WP_Error( 'openai_error', 'Error conectando con OpenAI: ' . $response->get_error_message() );
        }

        $code = wp_remote_retrieve_response_code( $response );
        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( $code !== 200 ) {
            $error_msg = $data['error']['message'] ?? 'Error desconocido de OpenAI (código ' . $code . ')';
            return new WP_Error( 'openai_api_error', $error_msg );
        }

        $content = $data['choices'][0]['message']['content'] ?? '';

        if ( preg_match( '/\{[\s\S]*\}/', $content, $matches ) ) {
            $parsed = json_decode( $matches[0], true );
            if ( json_last_error() === JSON_ERROR_NONE ) {
                return $parsed;
            }
        }

        return new WP_Error( 'parse_error', 'No se pudo interpretar la respuesta de OpenAI' );
    }
}
