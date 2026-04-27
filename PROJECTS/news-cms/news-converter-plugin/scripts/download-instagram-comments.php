<?php
/**
 * Script standalone para descargar comentarios de Instagram
 * Uso: php download-instagram-comments.php [opciones]
 *
 * Ejemplo:
 * php download-instagram-comments.php --token=YOUR_TOKEN --account_id=YOUR_ACCOUNT_ID --limit=50
 */

require_once __DIR__ . '/../includes/class-instagram-comments.php';

// Parsear argumentos de línea de comandos
$options = getopt( '', array(
    'token:',
    'account_id:',
    'page_id:',
    'limit::',
    'since::',
    'until::',
    'output::',
    'format::',
    'include_replies::',
    'help'
) );

// Mostrar ayuda
if ( isset( $options['help'] ) || ( ! isset( $options['token'] ) ) ) {
    echo <<<HELP
Instagram Comments Downloader
=============================

Uso:
  php download-instagram-comments.php --token=ACCESS_TOKEN [opciones]

Opciones requeridas:
  --token         Access Token de Facebook/Instagram Graph API

Opcional (una de estas):
  --account_id    ID de la cuenta de Instagram Business
  --page_id       ID de la página de Facebook conectada a Instagram

Opciones adicionales:
  --limit         Número máximo de posts a procesar (default: 25)
  --since         Fecha desde (YYYY-MM-DD)
  --until         Fecha hasta (YYYY-MM-DD)
  --output        Directorio de salida (default: ./output)
  --format        Formato de exportación: json, csv, both (default: both)
  --include_replies   Incluir respuestas a comentarios: yes/no (default: yes)
  --help          Mostrar esta ayuda

Ejemplos:
  # Usar con account_id directo:
  php download-instagram-comments.php --token=EAAxxx --account_id=178414xxx --limit=50

  # Usar con page_id (obtiene account_id automáticamente):
  php download-instagram-comments.php --token=EAAxxx --page_id=123456789 --limit=50

  # Exportar solo CSV, últimos 7 días:
  php download-instagram-comments.php --token=EAAxxx --account_id=178414xxx --since="2026-04-08" --format=csv

HELP;
    exit(0);
}

// Validar token
$access_token = $options['token'] ?? null;
if ( ! $access_token ) {
    die( "Error: Se requiere --token\n" );
}

// Parámetros
$instagram_account_id = $options['account_id'] ?? null;
$page_id = $options['page_id'] ?? null;
$limit = intval( $options['limit'] ?? 25 );
$since = $options['since'] ?? null;
$until = $options['until'] ?? null;
$output_dir = $options['output'] ?? './output';
$format = $options['format'] ?? 'both';
$include_replies = ( $options['include_replies'] ?? 'yes' ) === 'yes';

// Crear directorio de salida
if ( ! is_dir( $output_dir ) ) {
    mkdir( $output_dir, 0755, true );
}

// Inicializar downloader
$downloader = new Instagram_Comments_Downloader( $access_token, $instagram_account_id );

// Si no tenemos account_id pero sí page_id, obtenerlo
if ( ! $instagram_account_id && $page_id ) {
    echo "Obteniendo Instagram Account ID desde Page ID...\n";
    $instagram_account_id = $downloader->get_instagram_account_id( $page_id );

    if ( ! $instagram_account_id ) {
        die( "Error: No se pudo obtener el Instagram Account ID. Verifica que la página tenga una cuenta de Instagram Business conectada.\n" );
    }

    echo "Instagram Account ID: {$instagram_account_id}\n";
}

if ( ! $instagram_account_id ) {
    die( "Error: Debes proporcionar --account_id o --page_id\n" );
}

echo "========================================\n";
echo "Instagram Comments Downloader\n";
echo "========================================\n";
echo "Cuenta: {$instagram_account_id}\n";
echo "Límite de posts: {$limit}\n";
if ( $since ) echo "Desde: {$since}\n";
if ( $until ) echo "Hasta: {$until}\n";
echo "Incluir replies: " . ( $include_replies ? 'Sí' : 'No' ) . "\n";
echo "----------------------------------------\n";

// Obtener posts
echo "Obteniendo posts...\n";
$posts = $downloader->get_posts( $limit, $since, $until );

if ( ! $posts ) {
    die( "Error: No se pudieron obtener posts. " . implode( '; ', array_column( $downloader->get_errors(), 'message' ) ) . "\n" );
}

echo "Posts encontrados: " . count( $posts ) . "\n";

// Descargar comentarios
echo "Descargando comentarios...\n";
$comments = $downloader->download_comments_from_posts( $posts, $include_replies );

$stats = $downloader->get_stats();
echo "\n========================================\n";
echo "ESTADÍSTICAS\n";
echo "========================================\n";
echo "Total comentarios: {$stats['total_comments']}\n";
echo "Respuestas: {$stats['total_replies']}\n";
echo "Usuarios únicos: {$stats['unique_users']}\n";

if ( $downloader->has_errors() ) {
    echo "\nErrores encontrados:\n";
    foreach ( $downloader->get_errors() as $error ) {
        echo "  [{$error['time']}] {$error['message']}\n";
    }
}

// Exportar
echo "\nExportando resultados...\n";
$exports = array();

if ( in_array( $format, array( 'json', 'both' ) ) ) {
    $json_file = $output_dir . '/instagram_comments_' . date( 'Y-m-d_H-i-s' ) . '.json';
    $result = $downloader->export_to_json( $json_file );
    $exports[] = "JSON: {$result['path']} ({$result['count']} registros)";
}

if ( in_array( $format, array( 'csv', 'both' ) ) ) {
    $csv_file = $output_dir . '/instagram_comments_' . date( 'Y-m-d_H-i-s' ) . '.csv';
    $result = $downloader->export_to_csv( $csv_file );
    $exports[] = "CSV: {$result['path']} ({$result['count']} registros)";
}

echo "\nArchivos exportados:\n";
foreach ( $exports as $export ) {
    echo "  ✓ {$export}\n";
}

echo "\n✅ Completado\n";
