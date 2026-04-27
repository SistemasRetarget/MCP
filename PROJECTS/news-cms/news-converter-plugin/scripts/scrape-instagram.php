<?php
/**
 * Script standalone para scrapear comentarios de Instagram público
 * Uso: php scrape-instagram.php --url=URL [opciones]
 *
 * Soporta:
 * - URLs de perfil: https://instagram.com/username
 * - URLs de post: https://instagram.com/p/SHORTCODE/
 * - URLs de reel: https://instagram.com/reel/SHORTCODE/
 *
 * Ejemplos:
 * php scrape-instagram.php --url=https://instagram.com/bbcnews --posts=5 --comments=20
 * php scrape-instagram.php --url=@cnn --posts=10
 * php scrape-instagram.php --url=https://www.instagram.com/p/DVq0LtYEdme/ --comments=50
 */

require_once __DIR__ . '/../includes/class-instagram-scraper.php';

$options = getopt( '', array(
    'url:',
    'posts::',
    'comments::',
    'output::',
    'format::',
    'delay::',
    'help'
) );

// Ayuda
if ( isset( $options['help'] ) || ! isset( $options['url'] ) ) {
    echo <<<HELP
Instagram Public Scraper - Extrae comentarios de Instagram público
==================================================================

SOPORTA:
  - Perfiles: https://instagram.com/username
  - Posts individuales: https://instagram.com/p/SHORTCODE/
  - Reels: https://instagram.com/reel/SHORTCODE/

USO:
  php scrape-instagram.php --url=URL [opciones]

OPCIONES REQUERIDAS:
  --url            URL del perfil, post, username, o @username
                   Ej: https://instagram.com/bbcnews
                   Ej: https://instagram.com/p/ABC123/
                   Ej: @bbcnews

OPCIONES:
  --posts          Número de posts recientes a analizar (default: 5)
                   (Ignorado si --url es un post individual)
  --comments       Máximo comentarios por post (default: 20)
  --output         Directorio de salida (default: ./output)
  --format         Formato: json, csv, both (default: both)
  --delay          Segundos entre requests (default: 3)
  --help           Mostrar esta ayuda

EJEMPLOS - PERFIL COMPLETO:
  # Básico - últimos 5 posts:
  php scrape-instagram.php --url=https://www.instagram.com/elpais/

  # 10 posts, 50 comentarios cada uno, solo CSV:
  php scrape-instagram.php --url=@cnn --posts=10 --comments=50 --format=csv

  # Con delay largo para evitar bloqueos:
  php scrape-instagram.php --url=bbcnews --posts=3 --delay=5

EJEMPLOS - POST INDIVIDUAL:
  # Un solo post específico:
  php scrape-instagram.php --url=https://www.instagram.com/p/DVq0LtYEdme/

  # Post con más comentarios:
  php scrape-instagram.php --url=https://instagram.com/p/ABC123/ --comments=50

ADVERTENCIAS:
  - Solo funciona con contenido PÚBLICO
  - Instagram puede bloquear la IP si se hacen muchas peticiones
  - Use delay de 3+ segundos entre requests
  - Este método puede dejar de funcionar si Instagram cambia su HTML

HELP;
    exit(0);
}

// Parámetros
$url = $options['url'];
$posts = intval( $options['posts'] ?? 5 );
$comments = intval( $options['comments'] ?? 20 );
$output_dir = $options['output'] ?? './output';
$format = $options['format'] ?? 'both';
$delay = intval( $options['delay'] ?? 3 );

// Crear directorio de salida
if ( ! is_dir( $output_dir ) ) {
    mkdir( $output_dir, 0755, true );
}

echo "========================================\n";
echo "Instagram Public Scraper\n";
echo "========================================\n\n";

// Inicializar scraper
$scraper = new Instagram_Public_Scraper();
$scraper->set_delay( $delay );

// Extraer username para mostrar
$username = $scraper->extract_username( $url );

// Detectar si es post individual
$is_single_post = ( strpos( $username, 'post:' ) === 0 );

if ( $is_single_post ) {
    $shortcode = substr( $username, 5 );
    echo "Post individual: {$shortcode}\n";
    echo "Comentarios a extraer: {$comments}\n";
} elseif ( $username ) {
    echo "Perfil objetivo: @{$username}\n";
    echo "Posts a procesar: {$posts}\n";
    echo "Comentarios por post: {$comments}\n";
}

echo "Delay entre requests: {$delay}s\n";
echo "----------------------------------------\n\n";

// Ejecutar scraping
$data = $scraper->scrape_comments_from_profile( $url, $posts, $comments );

if ( $data === false ) {
    echo "\n❌ ERROR: No se pudieron obtener datos\n";

    if ( $scraper->has_errors() ) {
        echo "\nErrores:\n";
        foreach ( $scraper->get_errors() as $error ) {
            echo "  [{$error['time']}] {$error['message']}\n";
        }
    }

    exit(1);
}

// Mostrar estadísticas
$stats = $scraper->get_stats();

echo "\n========================================\n";
echo "RESULTADOS\n";
echo "========================================\n";
echo "Total comentarios: {$stats['total_comments']}\n";
echo "Respuestas: {$stats['total_replies']}\n";
echo "Usuarios únicos: {$stats['unique_users']}\n";

if ( $scraper->has_errors() ) {
    echo "\nAdvertencias ({$scraper->count_errors()}):\n";
    foreach ( array_slice( $scraper->get_errors(), 0, 5 ) as $error ) {
        echo "  ⚠ {$error['message']}\n";
    }
}

// Preparar nombre de archivo seguro
$file_basename = $is_single_post ? 'post_' . substr( $username, 5 ) : $username;
$file_basename = preg_replace( '/[^a-zA-Z0-9_-]/', '_', $file_basename );

// Exportar
echo "\nExportando...\n";
$timestamp = date( 'Y-m-d_H-i-s' );
$exported = array();

if ( in_array( $format, array( 'json', 'both' ) ) ) {
    $json_file = "{$output_dir}/instagram_{$file_basename}_{$timestamp}.json";
    $result = $scraper->export_to_json( $json_file );
    $exported[] = "JSON: {$result['path']} ({$result['count']} registros)";
}

if ( in_array( $format, array( 'csv', 'both' ) ) ) {
    $csv_file = "{$output_dir}/instagram_{$file_basename}_{$timestamp}.csv";
    $result = $scraper->export_to_csv( $csv_file );
    $exported[] = "CSV: {$result['path']} ({$result['count']} registros)";
}

echo "\n✅ Archivos exportados:\n";
foreach ( $exported as $file ) {
    echo "   {$file}\n";
}

echo "\n========================================\n";
echo "Scraping completado\n";
echo "========================================\n";
