<?php
/**
 * Instagram Playwright Scraper Wrapper
 * Ejecuta el scraper de Node.js desde PHP
 */

class Instagram_Playwright_Scraper {

    private $nodeScriptPath;
    private $outputDir;
    private $errors = array();
    private $lastResult = null;

    public function __construct() {
        $this->nodeScriptPath = __DIR__ . '/../scripts/instagram-playwright/scraper.js';
        $this->outputDir = __DIR__ . '/../output';

        // Crear directorio de salida si no existe
        if ( ! is_dir( $this->outputDir ) ) {
            wp_mkdir_p( $this->outputDir );
        }
    }

    /**
     * Verifica que Playwright esté instalado
     */
    public function is_installed() {
        // Verificar Node.js
        exec( 'which node 2>&1', $output, $returnCode );
        if ( $returnCode !== 0 ) {
            $this->add_error( 'Node.js no está instalado' );
            return false;
        }

        // Verificar que el script exista
        if ( ! file_exists( $this->nodeScriptPath ) ) {
            $this->add_error( 'Script de Playwright no encontrado: ' . $this->nodeScriptPath );
            return false;
        }

        return true;
    }

    /**
     * Instala las dependencias de Node.js
     */
    public function install() {
        $scriptDir = dirname( $this->nodeScriptPath );

        echo "Instalando dependencias en {$scriptDir}...\n";

        // Instalar npm packages
        $cmd = "cd {$scriptDir} && npm install 2>&1";
        exec( $cmd, $output, $returnCode );

        if ( $returnCode !== 0 ) {
            $this->add_error( 'Error instalando npm packages: ' . implode( "\n", $output ) );
            return false;
        }

        // Instalar Playwright browsers
        echo "Descargando browsers de Playwright (puede tardar varios minutos)...\n";
        $cmd = "cd {$scriptDir} && npx playwright install chromium 2>&1";
        exec( $cmd, $output, $returnCode );

        if ( $returnCode !== 0 ) {
            $this->add_error( 'Error instalando browsers: ' . implode( "\n", $output ) );
            return false;
        }

        return true;
    }

    /**
     * Extrae comentarios de un post
     */
    public function scrape_post( $url, $options = array() ) {
        $this->errors = array();
        $this->lastResult = null;

        if ( ! $this->is_installed() ) {
            return false;
        }

        // Validar URL
        if ( ! preg_match( '/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/', $url, $matches ) ) {
            $this->add_error( 'URL de Instagram no válida' );
            return false;
        }

        $shortcode = $matches[2];

        // Construir comando
        $cmd = sprintf(
            'node %s --url=%s --max-comments=%d --output=%s --timeout=%d %s 2>&1',
            escapeshellarg( $this->nodeScriptPath ),
            escapeshellarg( $url ),
            intval( $options['max_comments'] ?? 50 ),
            escapeshellarg( $this->outputDir ),
            intval( $options['timeout'] ?? 60 ),
            ( $options['debug'] ?? false ) ? '--debug' : ''
        );

        // Si hay login automático configurado
        if ( ! empty( $options['username'] ) && ! empty( $options['password'] ) ) {
            $cmd .= sprintf(
                ' --username=%s --password=%s',
                escapeshellarg( $options['username'] ),
                escapeshellarg( $options['password'] )
            );
        }

        // Si se requiere login manual
        if ( $options['login'] ?? false ) {
            $cmd .= ' --login --headed';
        }

        // Ejecutar
        echo "Ejecutando: {$cmd}\n";
        exec( $cmd, $output, $returnCode );

        $outputStr = implode( "\n", $output );

        if ( $returnCode !== 0 ) {
            $this->add_error( 'Error ejecutando scraper: ' . $outputStr );
            return false;
        }

        // Buscar archivos generados
        $this->lastResult = $this->find_output_files( $shortcode );

        return $this->lastResult;
    }

    /**
     * Busca archivos de salida generados
     */
    private function find_output_files( $shortcode ) {
        $files = array();
        $pattern = $this->outputDir . '/comments_' . $shortcode . '_*';

        $matches = glob( $pattern );

        foreach ( $matches as $file ) {
            $ext = pathinfo( $file, PATHINFO_EXTENSION );
            if ( $ext === 'json' || $ext === 'csv' ) {
                $files[$ext] = array(
                    'path' => $file,
                    'url' => str_replace( ABSPATH, site_url( '/' ), $file ),
                    'size' => filesize( $file ),
                    'modified' => filemtime( $file )
                );

                // Si es JSON, extraer stats
                if ( $ext === 'json' ) {
                    $content = file_get_contents( $file );
                    $data = json_decode( $content, true );
                    if ( $data && isset( $data['stats'] ) ) {
                        $files[$ext]['stats'] = $data['stats'];
                        $files[$ext]['post'] = $data['post'] ?? null;
                    }
                }
            }
        }

        return $files;
    }

    /**
     * Obtiene el último resultado
     */
    public function get_last_result() {
        return $this->lastResult;
    }

    /**
     * Verifica si hay errores
     */
    public function has_errors() {
        return ! empty( $this->errors );
    }

    /**
     * Obtiene errores
     */
    public function get_errors() {
        return $this->errors;
    }

    /**
     * Agrega un error
     */
    private function add_error( $message ) {
        $this->errors[] = array(
            'time' => date( 'Y-m-d H:i:s' ),
            'message' => $message
        );
    }
}
