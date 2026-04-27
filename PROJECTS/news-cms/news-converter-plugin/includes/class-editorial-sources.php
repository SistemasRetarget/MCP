<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * HITO 2: Página Fuentes - Solo UI (Sin lógica real)
 * Mockup funcional para presentación
 */
class NC_Editorial_Sources {

    public static function init() {
        add_action( 'admin_menu', array( __CLASS__, 'add_menu' ) );
        add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
    }

    public static function add_menu() {
        add_submenu_page(
            'news-converter',
            'Fuentes Editorial',
            '📡 Fuentes',
            'manage_options',
            'nc-editorial-sources',
            array( __CLASS__, 'render_page' )
        );
    }

    public static function enqueue_assets( $hook ) {
        if ( $hook !== 'news-converter_page_nc-editorial-sources' ) {
            return;
        }
        
        // Estilos inline para el mockup
        wp_add_inline_style( 'wp-admin', self::get_styles() );
        wp_add_inline_script( 'jquery', self::get_scripts() );
    }

    public static function render_page() {
        // Datos MOCK (falsos) para la presentación
        $mock_sources = array(
            array(
                'id' => 1,
                'name' => 'El Mercurio - RSS',
                'type' => 'rss',
                'type_icon' => '📰',
                'url' => 'https://mercurio.cl/rss/politica',
                'section' => 'Política',
                'frequency' => '5 minutos',
                'status' => 'active',
                'last_run' => 'Hace 2 min',
                'items_today' => 12,
            ),
            array(
                'id' => 2,
                'name' => 'Twitter - Cuentas Políticas',
                'type' => 'twitter',
                'type_icon' => '🐦',
                'url' => 'List: @politica_cl',
                'section' => 'Política',
                'frequency' => '2 minutos',
                'status' => 'active',
                'last_run' => 'Hace 30 seg',
                'items_today' => 45,
            ),
            array(
                'id' => 3,
                'name' => 'Instagram - Políticos',
                'type' => 'instagram',
                'type_icon' => '📸',
                'url' => 'Posts seleccionados',
                'section' => 'Política',
                'frequency' => 'Manual',
                'status' => 'manual',
                'last_run' => 'Hace 1 hora',
                'items_today' => 3,
            ),
            array(
                'id' => 4,
                'name' => 'Banco Central - RSS',
                'type' => 'rss',
                'type_icon' => '📰',
                'url' => 'https://bcch.cl/feed',
                'section' => 'Economía',
                'frequency' => '15 minutos',
                'status' => 'active',
                'last_run' => 'Hace 10 min',
                'items_today' => 2,
            ),
            array(
                'id' => 5,
                'name' => 'La Tercera - RSS',
                'type' => 'rss',
                'type_icon' => '📰',
                'url' => 'https://latercera.com/rss',
                'section' => 'Nacional',
                'frequency' => '5 minutos',
                'status' => 'error',
                'last_run' => 'Hace 2 horas',
                'items_today' => 0,
            ),
        );

        $total_active = 3;
        $total_error = 1;
        $total_manual = 1;
        ?>+
        <div class="wrap nc-sources-wrap">
            <div class="nc-header">
                <h1>📡 Fuentes de Datos</h1>
                <p>Configura las fuentes que alimentan el portal</p>
            </div>
            
            <!-- INSTRUCCIONES -->
            <div class="nc-help-box" style="background: #e6f3ff; border-left: 4px solid #3182ce; padding: 15px 20px; margin-bottom: 20px; border-radius: 4px;">
                <strong>📖 ¿Qué hace esta página?</strong>
                <p style="margin: 8px 0 0 0; color: #4a5568;">
                    Aquí configuras <strong>de dónde vienen las noticias</strong>. Puedes agregar:
                    <span style="display: inline-block; margin: 5px 10px;">📰 RSS de medios (El Mercurio, La Tercera, etc.)</span>
                    <span style="display: inline-block; margin: 5px 10px;">🐦 Cuentas de Twitter/X</span>
                    <span style="display: inline-block; margin: 5px 10px;">📸 Posts de Instagram</span>
                    <br><em>El sistema revisará estas fuentes automáticamente cada 5 minutos.</em>
                </p>
            </div>

            <!-- Stats Bar -->
            <div class="nc-stats-bar">
                <div class="nc-stat-card">
                    <div class="nc-stat-value"><?php echo count( $mock_sources ); ?></div>
                    <div class="nc-stat-label">Fuentes Configuradas</div>
                </div>
                <div class="nc-stat-card success">
                    <div class="nc-stat-value"><?php echo $total_active; ?></div>
                    <div class="nc-stat-label">Activas</div>
                </div>
                <div class="nc-stat-card warning">
                    <div class="nc-stat-value"><?php echo $total_manual; ?></div>
                    <div class="nc-stat-label">Manuales</div>
                </div>
                <div class="nc-stat-card danger">
                    <div class="nc-stat-value"><?php echo $total_error; ?></div>
                    <div class="nc-stat-label">Con Error</div>
                </div>
            </div>

            <!-- Action Bar -->
            <div class="nc-action-bar">
                <button class="button button-primary" onclick="ncOpenModal('add-source')">
                    <span class="dashicons dashicons-plus-alt"></span>
                    Agregar Nueva Fuente
                </button>
                <button class="button" onclick="ncRefreshAll()">
                    <span class="dashicons dashicons-update"></span>
                    Refrescar Todas
                </button>
            </div>

            <!-- Sources List -->
            <div class="nc-card">
                <table class="nc-table wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th class="column-primary">Fuente</th>
                            <th>Tipo</th>
                            <th>Sección</th>
                            <th>Frecuencia</th>
                            <th>Estado</th>
                            <th>Últ. Ejecución</th>
                            <th>Hoy</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ( $mock_sources as $source ) : ?>
                        <tr>
                            <td class="column-primary">
                                <strong><?php echo esc_html( $source['name'] ); ?></strong>
                                <div class="row-actions">
                                    <span class="source-url"><?php echo esc_html( $source['url'] ); ?></span>
                                </div>
                            </td>
                            <td>
                                <span class="nc-type-badge">
                                    <?php echo $source['type_icon']; ?> 
                                    <?php echo esc_html( strtoupper( $source['type'] ) ); ?>
                                </span>
                            </td>
                            <td><?php echo esc_html( $source['section'] ); ?></td>
                            <td><?php echo esc_html( $source['frequency'] ); ?></td>
                            <td>
                                <?php if ( $source['status'] === 'active' ) : ?>
                                    <span class="nc-status active">● Activo</span>
                                <?php elseif ( $source['status'] === 'manual' ) : ?>
                                    <span class="nc-status manual">● Manual</span>
                                <?php else : ?>
                                    <span class="nc-status error">● Error</span>
                                <?php endif; ?>
                            </td>
                            <td><?php echo esc_html( $source['last_run'] ); ?></td>
                            <td><?php echo intval( $source['items_today'] ); ?></td>
                            <td class="nc-actions">
                                <button class="button button-small" onclick="ncEditSource(<?php echo $source['id']; ?>)" title="Configurar">
                                    <span class="dashicons dashicons-admin-generic"></span>
                                </button>
                                <?php if ( $source['status'] === 'active' ) : ?>
                                    <button class="button button-small" onclick="ncPauseSource(<?php echo $source['id']; ?>)" title="Pausar">
                                        <span class="dashicons dashicons-controls-pause"></span>
                                    </button>
                                <?php else : ?>
                                    <button class="button button-small" onclick="ncResumeSource(<?php echo $source['id']; ?>)" title="Reactivar">
                                        <span class="dashicons dashicons-controls-play"></span>
                                    </button>
                                <?php endif; ?>
                                <button class="button button-small" onclick="ncRunNow(<?php echo $source['id']; ?>)" title="Ejecutar ahora">
                                    <span class="dashicons dashicons-arrow-right-alt"></span>
                                </button>
                                <button class="button button-small button-link-delete" onclick="ncDeleteSource(<?php echo $source['id']; ?>)" title="Eliminar">
                                    <span class="dashicons dashicons-trash"></span>
                                </button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal: Add Source -->
        <div id="nc-modal-add-source" class="nc-modal" style="display:none;">
            <div class="nc-modal-content">
                <div class="nc-modal-header">
                    <h2>➕ Agregar Nueva Fuente</h2>
                    <button class="nc-modal-close" onclick="ncCloseModal('add-source')">&times;</button>
                </div>
                <div class="nc-modal-body">
                    <!-- Source Type Selection -->
                    <div class="nc-source-types">
                        <label class="nc-source-type-card" data-type="rss">
                            <input type="radio" name="source_type" value="rss" checked>
                            <span class="nc-source-icon">📰</span>
                            <strong>RSS Feed</strong>
                            <small>XML/RSS tradicional</small>
                        </label>
                        <label class="nc-source-type-card" data-type="twitter">
                            <input type="radio" name="source_type" value="twitter">
                            <span class="nc-source-icon">🐦</span>
                            <strong>Twitter/X</strong>
                            <small>Cuentas o listas</small>
                        </label>
                        <label class="nc-source-type-card" data-type="instagram">
                            <input type="radio" name="source_type" value="instagram">
                            <span class="nc-source-icon">📸</span>
                            <strong>Instagram</strong>
                            <small>Posts específicos</small>
                        </label>
                        <label class="nc-source-type-card" data-type="scraping">
                            <input type="radio" name="source_type" value="scraping">
                            <span class="nc-source-icon">🌐</span>
                            <strong>Web Scraping</strong>
                            <small>Sitios sin RSS</small>
                        </label>
                    </div>

                    <!-- Form Fields -->
                    <div class="nc-form-section">
                        <div class="nc-form-row">
                            <div class="nc-form-group">
                                <label>Nombre de la Fuente *</label>
                                <input type="text" id="nc-source-name" name="name" class="nc-form-control" placeholder="Ej: El Mercurio - Política" required>
                            </div>
                            <div class="nc-form-group">
                                <label>Sección *</label>
                                <select id="nc-source-section" name="section" class="nc-form-control" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="politica">Política</option>
                                    <option value="economia">Economía</option>
                                    <option value="nacional">Nacional</option>
                                    <option value="internacional">Internacional</option>
                                    <option value="sociedad">Sociedad</option>
                                </select>
                            </div>
                        </div>

                        <div class="nc-form-group">
                            <label>URL del Feed / Endpoint *</label>
                            <input type="url" id="nc-source-url" name="url" class="nc-form-control" placeholder="https://ejemplo.com/rss" required>
                            <p class="nc-help-text">Para Instagram: pegar URL del post (ej: https://instagram.com/p/ABC123)</p>
                        </div>

                        <div class="nc-form-row">
                            <div class="nc-form-group">
                                <label>Frecuencia de Chequeo</label>
                                <select id="nc-source-frequency" name="frequency" class="nc-form-control">
                                    <option value="2">Cada 2 minutos</option>
                                    <option value="5" selected>Cada 5 minutos</option>
                                    <option value="15">Cada 15 minutos</option>
                                    <option value="60">Cada hora</option>
                                </select>
                            </div>
                            <div class="nc-form-group">
                                <label>Modo de Procesamiento</label>
                                <select id="nc-source-mode" name="mode" class="nc-form-control">
                                    <option value="auto" selected>Automático (va a cola)</option>
                                    <option value="manual">Manual (revisión previa)</option>
                                </select>
                            </div>
                        </div>

                        <div class="nc-form-group">
                            <label>Keywords para Filtrar</label>
                            <input type="text" id="nc-source-keywords" name="keywords" class="nc-form-control" placeholder="congreso, senado, reforma, ley... (coma separados)">
                            <p class="nc-help-text">Solo se procesarán items que contengan estas palabras. Dejar vacío para procesar todo.</p>
                        </div>

                        <div class="nc-form-group">
                            <label>Keywords para Excluir</label>
                            <input type="text" class="nc-form-control" placeholder="farándula, deportes, espectáculos...">
                            <p class="nc-help-text">Se descartarán items que contengan estas palabras.</p>
                        </div>
                    </div>
                </div>
                <div class="nc-modal-footer">
                    <button class="button" onclick="ncCloseModal('add-source')">Cancelar</button>
                    <button class="button button-primary" onclick="ncSaveSource()">💾 Guardar Fuente</button>
                </div>
            </div>
        </div>

        <!-- Modal: Test Result (Demo) -->
        <div id="nc-modal-test" class="nc-modal" style="display:none;">
            <div class="nc-modal-content" style="max-width:600px;">
                <div class="nc-modal-header">
                    <h2>🧪 Probar Conexión</h2>
                    <button class="nc-modal-close" onclick="ncCloseModal('test')">&times;</button>
                </div>
                <div class="nc-modal-body">
                    <div class="nc-test-result">
                        <div class="nc-test-step success">
                            <span class="dashicons dashicons-yes-alt"></span>
                            <span>Conexión establecida</span>
                        </div>
                        <div class="nc-test-step success">
                            <span class="dashicons dashicons-yes-alt"></span>
                            <span>Feed RSS válido detectado</span>
                        </div>
                        <div class="nc-test-step success">
                            <span class="dashicons dashicons-yes-alt"></span>
                            <span>3 items encontrados</span>
                        </div>
                        <div class="nc-test-preview">
                            <h4>Vista previa del primer item:</h4>
                            <div class="nc-preview-item">
                                <strong>BCCh mantiene tasa de interés en 6,5%</strong>
                                <p>El Consejo del Banco Central acordó mantener la tasa de política monetaria...</p>
                                <span class="nc-preview-date">Publicado: Hoy, 15:30</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nc-modal-footer">
                    <button class="button" onclick="ncCloseModal('test')">Cerrar</button>
                    <button class="button button-primary">✓ Confirmar y Guardar</button>
                </div>
            </div>
        </div>
        <?php
    }

    private static function get_styles() {
        return '
        .nc-sources-wrap { max-width: 1200px; }
        .nc-header { margin-bottom: 25px; }
        .nc-header h1 { color: #1a365d; font-size: 1.8em; }
        .nc-header p { color: #718096; margin-top: 5px; }
        
        .nc-stats-bar {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .nc-stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #1a365d;
        }
        
        .nc-stat-card.success { border-left-color: #38a169; }
        .nc-stat-card.warning { border-left-color: #d69e2e; }
        .nc-stat-card.danger { border-left-color: #e53e3e; }
        
        .nc-stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #1a365d;
        }
        
        .nc-stat-label {
            color: #718096;
            font-size: 0.9em;
        }
        
        .nc-action-bar {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
        }
        
        .nc-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .nc-table th {
            font-weight: 600;
            color: #1a365d;
        }
        
        .nc-type-badge {
            background: #edf2f7;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 0.85em;
        }
        
        .nc-status {
            font-weight: 500;
        }
        
        .nc-status.active { color: #38a169; }
        .nc-status.manual { color: #d69e2e; }
        .nc-status.error { color: #e53e3e; }
        
        .nc-actions {
            white-space: nowrap;
        }
        
        .nc-actions .button {
            padding: 0;
            width: 30px;
            height: 30px;
            line-height: 1;
        }
        
        .nc-actions .dashicons {
            line-height: 28px;
        }
        
        .source-url {
            color: #718096;
            font-size: 0.85em;
        }
        
        /* Modal Styles */
        .nc-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .nc-modal-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 700px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        }
        
        .nc-modal-header {
            padding: 20px 25px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .nc-modal-header h2 {
            margin: 0;
            font-size: 1.3em;
            color: #1a365d;
        }
        
        .nc-modal-close {
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
            color: #718096;
        }
        
        .nc-modal-body {
            padding: 25px;
        }
        
        .nc-modal-footer {
            padding: 20px 25px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        /* Source Type Cards */
        .nc-source-types {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .nc-source-type-card {
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            display: block;
        }
        
        .nc-source-type-card:hover {
            border-color: #1a365d;
        }
        
        .nc-source-type-card input[type="radio"] {
            display: none;
        }
        
        .nc-source-type-card input[type="radio"]:checked + span + strong + small,
        .nc-source-type-card:has(input:checked) {
            border-color: #1a365d;
            background: #ebf8ff;
        }
        
        .nc-source-icon {
            font-size: 2em;
            display: block;
            margin-bottom: 10px;
        }
        
        .nc-source-type-card strong {
            display: block;
            margin-bottom: 5px;
        }
        
        .nc-source-type-card small {
            color: #718096;
            font-size: 0.85em;
        }
        
        /* Form Styles */
        .nc-form-section {
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
        
        .nc-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .nc-form-group {
            margin-bottom: 20px;
        }
        
        .nc-form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #2d3748;
        }
        
        .nc-form-control {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .nc-form-control:focus {
            border-color: #1a365d;
            outline: none;
            box-shadow: 0 0 0 3px rgba(26,54,93,0.1);
        }
        
        .nc-help-text {
            color: #718096;
            font-size: 0.85em;
            margin-top: 5px;
        }
        
        /* Test Result */
        .nc-test-step {
            padding: 10px 15px;
            margin-bottom: 10px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .nc-test-step.success {
            background: #f0fff4;
            color: #22543d;
        }
        
        .nc-test-step.success .dashicons {
            color: #38a169;
        }
        
        .nc-test-preview {
            margin-top: 20px;
            padding: 15px;
            background: #f7fafc;
            border-radius: 8px;
        }
        
        .nc-test-preview h4 {
            margin: 0 0 10px 0;
            color: #1a365d;
        }
        
        .nc-preview-item {
            background: white;
            padding: 15px;
            border-radius: 4px;
            border-left: 3px solid #1a365d;
        }
        
        .nc-preview-item strong {
            display: block;
            margin-bottom: 5px;
            color: #1a365d;
        }
        
        .nc-preview-item p {
            margin: 0 0 5px 0;
            color: #4a5568;
            font-size: 0.9em;
        }
        
        .nc-preview-date {
            font-size: 0.85em;
            color: #718096;
        }
        
        @media screen and (max-width: 782px) {
            .nc-stats-bar { grid-template-columns: repeat(2, 1fr); }
            .nc-source-types { grid-template-columns: repeat(2, 1fr); }
            .nc-form-row { grid-template-columns: 1fr; }
        }
        ';
    }

    private static function get_scripts() {
        return '
        function ncOpenModal(modalId) {
            document.getElementById("nc-modal-" + modalId).style.display = "flex";
        }
        
        function ncCloseModal(modalId) {
            document.getElementById("nc-modal-" + modalId).style.display = "none";
        }
        
        
        function ncSaveSource() {
            var name = document.getElementById("nc-source-name").value;
            var url = document.getElementById("nc-source-url").value;
            var section = document.getElementById("nc-source-section").value;
            var keywords = document.getElementById("nc-source-keywords").value;
            
            if (!name || !url || !section) {
                alert("Por favor completa todos los campos requeridos.");
                return;
            }
            
            // Verificar si es Instagram
            if (url.indexOf("instagram.com") !== -1) {
                ncSaveInstagramSource(name, url, section, keywords);
                return;
            }
            
            // Demo mode por ahora
            alert("[DEMO] Guardando fuente:\\n" + name + "\\n" + url + "\\n\\nEn version real se guardaria en BD.");
            ncCloseModal("add-source");
        }
        
        function ncSaveInstagramSource(name, url, section, keywords) {
            alert("[DEMO] Agregando Instagram:\\n" + url + "\\n\\nSe agregaria a la cola editorial.");
            ncCloseModal("add-source");
            window.location.href = "?page=nc-editorial-queue";
        }
        
        function ncEditSource(id) {
            alert("[DEMO] Configurar fuente #" + id);
        }
        
        function ncPauseSource(id) {
            alert("[DEMO] Fuente #" + id + " pausada.");
        }
        
        function ncResumeSource(id) {
            alert("[DEMO] Fuente #" + id + " reactivada.");
        }
        
        function ncRunNow(id) {
            alert("[DEMO] Ejecutando fuente #" + id);
            ncOpenModal("test");
        }
        
        function ncDeleteSource(id) {
            if (confirm("Eliminar fuente #" + id + "?")) {
                alert("[DEMO] Fuente #" + id + " eliminada.");
            }
        }
        
        function ncRefreshAll() {
            alert("[DEMO] Refrescando todas las fuentes...");
        }
        
        // Cerrar modal al hacer click fuera
        document.addEventListener("click", function(e) {
            if (e.target.classList.contains("nc-modal")) {
                e.target.style.display = "none";
            }
        });
        
        // Source type selection
        document.addEventListener("DOMContentLoaded", function() {
            var cards = document.querySelectorAll(".nc-source-type-card");
            cards.forEach(function(card) {
                card.addEventListener("click", function() {
                    cards.forEach(function(c) { c.style.background = ""; c.style.borderColor = "#e2e8f0"; });
                    this.style.background = "#ebf8ff";
                    this.style.borderColor = "#1a365d";
                    this.querySelector("input").checked = true;
                });
            });
        });
        ';
    }
}

NC_Editorial_Sources::init();
