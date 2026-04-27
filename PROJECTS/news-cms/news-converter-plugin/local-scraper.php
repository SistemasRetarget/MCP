<?php
/**
 * Interfaz Local para Instagram Scraper
 * Ejecuta el scraper de Playwright desde una interfaz web simple
 */

// Configuración
$scriptPath = __DIR__ . '/scripts/instagram-playwright/scraper.js';
$outputDir = __DIR__ . '/scripts/instagram-playwright/output';
$result = null;
$error = null;

// Procesar formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['url'])) {
    $url = escapeshellarg($_POST['url']);
    $maxComments = intval($_POST['max_comments'] ?? 50);
    $timeout = intval($_POST['timeout'] ?? 60);
    
    // Construir comando
    $cmd = sprintf(
        'cd %s && node scraper.js --url=%s --max-comments=%d --timeout=%d 2>&1',
        escapeshellarg(dirname($scriptPath)),
        $url,
        $maxComments,
        $timeout
    );
    
    // Ejecutar
    $output = [];
    $returnCode = 0;
    exec($cmd, $output, $returnCode);
    
    $outputStr = implode("\n", $output);
    
    if ($returnCode !== 0) {
        $error = $outputStr;
    } else {
        // Buscar archivos generados
        $shortcode = '';
        if (preg_match('/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/', $_POST['url'], $matches)) {
            $shortcode = $matches[2];
        }
        
        if ($shortcode) {
            $pattern = $outputDir . '/comments_' . $shortcode . '_*';
            $files = glob($pattern);
            
            if (!empty($files)) {
                // Ordenar por fecha (más reciente primero)
                usort($files, function($a, $b) {
                    return filemtime($b) - filemtime($a);
                });
                
                $latestFiles = [];
                foreach (array_slice($files, 0, 2) as $file) {
                    $ext = pathinfo($file, PATHINFO_EXTENSION);
                    $latestFiles[$ext] = [
                        'path' => $file,
                        'name' => basename($file),
                        'size' => filesize($file),
                        'modified' => date('Y-m-d H:i:s', filemtime($file))
                    ];
                    
                    // Si es JSON, extraer stats
                    if ($ext === 'json') {
                        $content = file_get_contents($file);
                        $data = json_decode($content, true);
                        if ($data) {
                            $latestFiles[$ext]['stats'] = $data['stats'] ?? null;
                            $latestFiles[$ext]['comments'] = $data['comments'] ?? [];
                        }
                    }
                }
                
                $result = [
                    'output' => $outputStr,
                    'files' => $latestFiles,
                    'shortcode' => $shortcode
                ];
            } else {
                $result = ['output' => $outputStr, 'files' => [], 'shortcode' => $shortcode];
            }
        } else {
            $result = ['output' => $outputStr, 'files' => []];
        }
    }
}

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Scraper - Interfaz Local</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #333;
        }
        
        input[type="text"],
        input[type="number"],
        select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        input[type="text"]:focus,
        input[type="number"]:focus,
        select:focus {
            outline: none;
            border-color: #007cba;
        }
        
        .row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
        }
        
        button {
            background: #007cba;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            transition: background 0.3s;
        }
        
        button:hover {
            background: #005a87;
        }
        
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .spinner {
            display: none;
            text-align: center;
            margin: 20px 0;
        }
        
        .spinner.active {
            display: block;
        }
        
        .spinner::after {
            content: '';
            display: inline-block;
            width: 30px;
            height: 30px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007cba;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .result {
            margin-top: 30px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 4px;
            border-left: 4px solid #007cba;
        }
        
        .result.error {
            border-left-color: #dc3232;
            background: #fef7f7;
        }
        
        .result.success {
            border-left-color: #46b450;
            background: #f7fcf7;
        }
        
        .result h3 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-box {
            background: white;
            padding: 15px;
            border-radius: 4px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #007cba;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        .files {
            margin-top: 20px;
        }
        
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: white;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .file-info {
            flex: 1;
        }
        
        .file-name {
            font-weight: 600;
            color: #333;
        }
        
        .file-meta {
            font-size: 12px;
            color: #666;
            margin-top: 3px;
        }
        
        .download-btn {
            background: #46b450;
            color: white;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .download-btn:hover {
            background: #389e42;
        }
        
        .comments-preview {
            margin-top: 20px;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .comment-item {
            background: white;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .comment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .comment-user {
            font-weight: 600;
            color: #007cba;
        }
        
        .comment-likes {
            color: #e91e63;
            font-size: 13px;
        }
        
        .comment-text {
            color: #333;
            font-size: 14px;
        }
        
        pre {
            background: #f4f4f4;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 12px;
            margin-top: 10px;
        }
        
        .help-text {
            font-size: 13px;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📸 Instagram Comments Scraper</h1>
        <p class="subtitle">Extrae comentarios de posts de Instagram usando Playwright</p>
        
        <form method="POST" id="scraperForm">
            <div class="form-group">
                <label for="url">URL del post de Instagram</label>
                <input type="text" id="url" name="url" 
                       placeholder="https://www.instagram.com/p/DVq0LtYEdme/" 
                       value="<?php echo isset($_POST['url']) ? htmlspecialchars($_POST['url']) : ''; ?>"
                       required>
                <p class="help-text">Soporta: /p/SHORTCODE, /reel/SHORTCODE, /tv/SHORTCODE</p>
            </div>
            
            <div class="row">
                <div class="form-group">
                    <label for="max_comments">Max Comentarios</label>
                    <input type="number" id="max_comments" name="max_comments" 
                           value="<?php echo isset($_POST['max_comments']) ? intval($_POST['max_comments']) : 50; ?>" 
                           min="1" max="100">
                </div>
                
                <div class="form-group">
                    <label for="timeout">Timeout (seg)</label>
                    <input type="number" id="timeout" name="timeout" 
                           value="<?php echo isset($_POST['timeout']) ? intval($_POST['timeout']) : 60; ?>" 
                           min="30" max="300">
                </div>
                
                <div class="form-group">
                    <label>&nbsp;</label>
                    <button type="submit" id="submitBtn">
                        🔍 Scrapear Comentarios
                    </button>
                </div>
            </div>
        </form>
        
        <div class="spinner" id="spinner">
            <p>Scrapeando comentarios... Esto puede tomar 30-60 segundos</p>
        </div>
        
        <?php if ($error): ?>
        <div class="result error">
            <h3>❌ Error</h3>
            <pre><?php echo htmlspecialchars($error); ?></pre>
        </div>
        <?php endif; ?>
        
        <?php if ($result): ?>
        <div class="result success">
            <h3>✅ Scrapeo Completado</h3>
            
            <?php if (isset($result['files']['json']['stats'])): ?>
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-value"><?php echo $result['files']['json']['stats']['total_comments'] ?? 0; ?></div>
                    <div class="stat-label">Comentarios</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value"><?php echo $result['files']['json']['stats']['replies'] ?? 0; ?></div>
                    <div class="stat-label">Respuestas</div>
                </div>
            </div>
            <?php endif; ?>
            
            <div class="files">
                <h4>📁 Archivos Generados</h4>
                <?php foreach ($result['files'] as $ext => $file): ?>
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-name"><?php echo htmlspecialchars($file['name']); ?></div>
                        <div class="file-meta">
                            Tamaño: <?php echo number_format($file['size'] / 1024, 1); ?> KB | 
                            Fecha: <?php echo $file['modified']; ?>
                        </div>
                    </div>
                    <a href="scripts/instagram-playwright/output/<?php echo urlencode($file['name']); ?>" 
                       class="download-btn" download>
                        ⬇️ Descargar
                    </a>
                </div>
                <?php endforeach; ?>
            </div>
            
            <?php if (isset($result['files']['json']['comments']) && !empty($result['files']['json']['comments'])): ?>
            <div class="comments-preview">
                <h4>💬 Vista Previa (primeros 10 comentarios)</h4>
                <?php foreach (array_slice($result['files']['json']['comments'], 0, 10) as $comment): ?>
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-user">@<?php echo htmlspecialchars($comment['username']); ?></span>
                        <?php if ($comment['likes'] > 0): ?>
                        <span class="comment-likes">❤️ <?php echo $comment['likes']; ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="comment-text"><?php echo htmlspecialchars($comment['text']); ?></div>
                </div>
                <?php endforeach; ?>
                
                <?php if (count($result['files']['json']['comments']) > 10): ?>
                <p style="text-align: center; color: #666; margin-top: 15px;">
                    ... y <?php echo count($result['files']['json']['comments']) - 10; ?> comentarios más
                </p>
                <?php endif; ?>
            </div>
            <?php endif; ?>
            
            <details>
                <summary>Ver log completo</summary>
                <pre><?php echo htmlspecialchars($result['output']); ?></pre>
            </details>
        </div>
        <?php endif; ?>
    </div>
    
    <script>
        document.getElementById('scraperForm').addEventListener('submit', function() {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('spinner').classList.add('active');
        });
    </script>
</body>
</html>
