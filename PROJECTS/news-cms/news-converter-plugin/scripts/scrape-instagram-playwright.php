#!/usr/bin/env php
<?php
/**
 * Instagram Playwright Scraper CLI
 * Wrapper PHP que ejecuta el scraper de Node.js
 * 
 * Uso: php scrape-instagram-playwright.php --url=POST_URL [opciones]
 */

require_once __DIR__ . '/../includes/class-instagram-playwright.php';

// Parsear argumentos
$options = getopt( '', array(
    'url:',
    'max-comments::',
    'output::',
    'login',
    'username::',
    'password::',
    'headed',
    'install',
    'debug',
    'help'
) );

// Ayuda
if ( isset( $options['help'] ) || ( ! isset( $options['url'] ) && ! isset( $options['install'] ) ) ) {
    echo <<<HELP
Instagram Comments Scraper - Playwright CLI
===========================================

USO:
  php scrape-instagram-playwright.php --url=POST_URL [opciones]
  php scrape-instagram-playwright.php --install

REQUERIDO:
  --url            URL del post de Instagram
                   Ej: https://www.instagram.com/p/DVq0LtYEdme/

OPCIONES:
  --max-comments   Max comentarios a extraer (default: 50)
  --output         Directorio de salida (default: ../output)
  --login          Requiere login manual
  --username       Username para login automático
  --password       Password para login automático
  --headed         Mostrar ventana del browser
  --install        Instalar dependencias de Playwright
  --debug          Modo debug
  --help           Mostrar esta ayuda

EJEMPLOS:
  # Instalar Playwright (primera vez):
  php scrape-instagram-playwright.php --install

  # Post público:
  php scrape-instagram-playwright.php --url=https://instagram.com/p/DVq0LtYEdme/

  # Con login manual (se abre browser):
  php scrape-instagram-playwright.php --url=... --login --headed

  # Con login automático:
  php scrape-instagram-playwright.php --url=... --username=tuuser --password=tupass

NOTAS:
  - Requiere Node.js instalado
  - Primera ejecución descarga ~100MB de browsers
  - Las cookies se guardan para futuras ejecuciones

HELP;
    exit( 0 );
}

$scraper = new Instagram_Playwright_Scraper();

// Instalar
if ( isset( $options['install'] ) ) {
    echo "Instalando Playwright Scraper...\n";
    
    if ( ! $scraper->is_installed() ) {
        echo "Node.js no encontrado. Por favor instala Node.js primero:\n";
        echo "  - macOS: brew install node\n";
        echo "  - Ubuntu: sudo apt install nodejs npm\n";
        echo "  - Windows: Descarga de https://nodejs.org/\n";
        exit( 1 );
    }
    
    if ( $scraper->install() ) {
        echo "✓ Instalación completada\n";
        exit( 0 );
    } else {
        echo "✗ Error en instalación:\n";
        print_r( $scraper->get_errors() );
        exit( 1 );
    }
}

// Scrapear
$url = $options['url'];
$scrapeOptions = array(
    'max_comments' => intval( $options['max-comments'] ?? 50 ),
    'output' => $options['output'] ?? __DIR__ . '/../output',
    'login' => isset( $options['login'] ),
    'username' => $options['username'] ?? null,
    'password' => $options['password'] ?? null,
    'debug' => isset( $options['debug'] )
);

echo "========================================\n";
echo "Instagram Playwright Scraper\n";
echo "========================================\n";
echo "URL: {$url}\n";
echo "Max comentarios: {$scrapeOptions['max_comments']}\n";
echo "========================================\n\n";

$result = $scraper->scrape_post( $url, $scrapeOptions );

if ( $result === false ) {
    echo "\n❌ ERROR\n";
    if ( $scraper->has_errors() ) {
        echo "\nErrores:\n";
        foreach ( $scraper->get_errors() as $error ) {
            echo "  [{$error['time']}] {$error['message']}\n";
        }
    }
    exit( 1 );
}

echo "\n✅ COMPLETADO\n\n";

// Mostrar resultados
if ( isset( $result['json'] ) ) {
    $json = $result['json'];
    echo "Archivos generados:\n";
    echo "  JSON: {$json['path']}\n";
    
    if ( isset( $json['stats'] ) ) {
        echo "\nEstadísticas:\n";
        echo "  Comentarios: {$json['stats']['total_comments']}\n";
        echo "  Respuestas: {$json['stats']['replies']}\n";
    }
}

if ( isset( $result['csv'] ) ) {
    echo "  CSV: {$result['csv']['path']}\n";
}

echo "\n========================================\n";
exit( 0 );
