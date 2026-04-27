<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * DASHBOARD PRINCIPAL - Portal Editorial
 * Explica el flujo completo para la periodista (Cota)
 */
class NC_Editorial_Dashboard {

    public static function init() {
        add_action( 'admin_menu', array( __CLASS__, 'add_menu' ) );
    }

    public static function add_menu() {
        // El menú principal y dashboard se crean en news-converter.php
        // Este método queda vacío para evitar duplicados
    }

    public static function render_dashboard() {
        // Contar items reales si existen, sino mostrar mock
        $pending_count = 3; // Mock para presentación
        $today_count = 12;
        $sources_count = 5;
        ?>
        <div class="wrap nc-dashboard-wrap">
            
            <!-- Header -->
            <div class="nc-dashboard-header">
                <h1>📰 Portal Editorial - News Converter</h1>
                <p class="nc-subtitle">Sistema automatizado de detección y curación de noticias</p>
            </div>

            <!-- Bienvenida / Instrucciones -->
            <div class="nc-welcome-box">
                <h2>👋 ¡Bienvenida, Cota!</h2>
                <p>Este sistema te ayuda a <strong>descubrir, filtrar y publicar noticias</strong> de múltiples fuentes automáticamente.</p>
                <p><strong>Flujo de trabajo:</strong> El sistema detecta noticias → Las pone en cola → Tú las revisas y apruebas → Se publican en el portal</p>
            </div>

            <!-- Stats Cards -->
            <div class="nc-stats-grid">
                <div class="nc-stat-card pending" onclick="ncGoTo('queue')">
                    <div class="nc-stat-icon">📥</div>
                    <div class="nc-stat-number"><?php echo $pending_count; ?></div>
                    <div class="nc-stat-label">Pendientes de Revisión</div>
                    <div class="nc-stat-action">Revisar ahora →</div>
                </div>
                
                <div class="nc-stat-card success">
                    <div class="nc-stat-icon">📰</div>
                    <div class="nc-stat-number"><?php echo $today_count; ?></div>
                    <div class="nc-stat-label">Publicadas Hoy</div>
                    <div class="nc-stat-date"><?php echo date('d/m/Y'); ?></div>
                </div>
                
                <div class="nc-stat-card" onclick="ncGoTo('sources')">
                    <div class="nc-stat-icon">📡</div>
                    <div class="nc-stat-number"><?php echo $sources_count; ?></div>
                    <div class="nc-stat-label">Fuentes Activas</div>
                    <div class="nc-stat-action">Configurar →</div>
                </div>
                
                <div class="nc-stat-card warning" onclick="ncGoTo('instagram')">
                    <div class="nc-stat-icon">📸</div>
                    <div class="nc-stat-number">+</div>
                    <div class="nc-stat-label">Agregar Instagram</div>
                    <div class="nc-stat-action">Nuevo post →</div>
                </div>
            </div>

            <!-- FLUJO DEL SISTEMA -->
            <div class="nc-flow-section">
                <h2>🔄 ¿Cómo funciona el sistema?</h2>
                
                <div class="nc-flow-steps">
                    <div class="nc-flow-step">
                        <div class="nc-step-number">1</div>
                        <div class="nc-step-icon">📡</div>
                        <h3>Configura Fuentes</h3>
                        <p>Agrega RSS de medios, cuentas de Twitter o posts de Instagram que quieres monitorear.</p>
                        <a href="?page=nc-editorial-sources" class="nc-step-link">Ir a Fuentes →</a>
                    </div>
                    
                    <div class="nc-flow-arrow">→</div>
                    
                    <div class="nc-flow-step">
                        <div class="nc-step-number">2</div>
                        <div class="nc-step-icon">🤖</div>
                        <h3>Detección Automática</h3>
                        <p>El sistema revisa cada 5 minutos y detecta nuevas noticias según tus keywords.</p>
                    </div>
                    
                    <div class="nc-flow-arrow">→</div>
                    
                    <div class="nc-flow-step active">
                        <div class="nc-step-number">3</div>
                        <div class="nc-step-icon">📥</div>
                        <h3>Revisión Editorial</h3>
                        <p><strong>Tu trabajo:</strong> Revisa la cola, edita si es necesario, aprueba o rechaza.</p>
                        <a href="?page=nc-editorial-queue" class="nc-step-link">Ir a Cola →</a>
                    </div>
                    
                    <div class="nc-flow-arrow">→</div>
                    
                    <div class="nc-flow-step">
                        <div class="nc-step-number">4</div>
                        <div class="nc-step-icon">📰</div>
                        <h3>Publicación</h3>
                        <p>Las noticias aprobadas se publican automáticamente en el portal con la fecha correcta.</p>
                    </div>
                </div>
            </div>

            <!-- ACCIONES RÁPIDAS -->
            <div class="nc-quick-actions">
                <h2>⚡ Acciones Rápidas</h2>
                <div class="nc-actions-grid">
                    <a href="?page=nc-editorial-queue" class="nc-action-card urgent">
                        <span class="nc-action-icon">📥</span>
                        <span class="nc-action-title">Revisar Cola</span>
                        <span class="nc-action-desc"><?php echo $pending_count; ?> noticias pendientes</span>
                    </a>
                    
                    <a href="?page=nc-editorial-sources" class="nc-action-card">
                        <span class="nc-action-icon">➕</span>
                        <span class="nc-action-title">Agregar Fuente</span>
                        <span class="nc-action-desc">RSS, Twitter o Instagram</span>
                    </a>
                    
                    <a href="?page=nc-instagram-comments" class="nc-action-card">
                        <span class="nc-action-icon">📸</span>
                        <span class="nc-action-title">Post de Instagram</span>
                        <span class="nc-action-desc">Extraer comentarios</span>
                    </a>
                    
                    <a href="?page=nc-metrics" class="nc-action-card">
                        <span class="nc-action-icon">📈</span>
                        <span class="nc-action-title">Ver Métricas</span>
                        <span class="nc-action-desc">Rendimiento del sistema</span>
                    </a>
                </div>
            </div>

            <!-- EJEMPLO VISUAL -->
            <div class="nc-example-section">
                <h2>📝 Ejemplo: ¿Cómo se ve una noticia en el sistema?</h2>
                
                <div class="nc-example-item">
                    <div class="nc-example-header">
                        <span class="nc-example-source">📸 Instagram - Paz Charpentier</span>
                        <span class="nc-example-time">Detectado: Hace 30 min</span>
                    </div>
                    <h4>Paz Charpentier - Unboxing invitaciones cambio de mando</h4>
                    <p>Diputada electa muestra invitaciones para juramento del miércoles 11. Comentarios destacan controversia sobre financiamiento...</p>
                    <div class="nc-example-keywords">
                        <span>Keywords detectados:</span>
                        <span class="nc-keyword-tag">política</span>
                        <span class="nc-keyword-tag">congreso</span>
                        <span class="nc-keyword-tag">cambio de mando</span>
                    </div>
                    <div class="nc-example-actions">
                        <button class="button button-primary">✓ Aprobar y Publicar</button>
                        <button class="button">✏️ Editar</button>
                        <button class="button button-link-delete">✕ Rechazar</button>
                    </div>
                </div>
            </div>

            <!-- MENÚ DEL SISTEMA -->
            <div class="nc-menu-help">
                <h2>📍 Guía del Menú</h2>
                <div class="nc-menu-grid">
                    <div class="nc-menu-item">
                        <strong>📊 Dashboard</strong>
                        <p>Esta página - Resumen y acceso rápido</p>
                    </div>
                    <div class="nc-menu-item">
                        <strong>📡 Fuentes</strong>
                        <p>Configurar RSS, Twitter, Instagram</p>
                    </div>
                    <div class="nc-menu-item">
                        <strong>📥 Cola Editorial</strong>
                        <p>Revisar, editar, aprobar noticias</p>
                    </div>
                    <div class="nc-menu-item">
                        <strong>📸 Instagram</strong>
                        <p>Extraer comentarios de posts específicos</p>
                    </div>
                    <div class="nc-menu-item">
                        <strong>⚙️ Configuración</strong>
                        <p>API keys y ajustes del sistema</p>
                    </div>
                </div>
            </div>

        </div>

        <style>
        .nc-dashboard-wrap {
            max-width: 1200px;
            padding: 20px;
        }
        
        .nc-dashboard-header {
            margin-bottom: 30px;
        }
        
        .nc-dashboard-header h1 {
            color: #1a365d;
            font-size: 1.8em;
            margin-bottom: 5px;
        }
        
        .nc-subtitle {
            color: #718096;
            font-size: 1.1em;
        }
        
        /* Welcome Box */
        .nc-welcome-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 30px;
            border-radius: 12px;
            margin-bottom: 30px;
        }
        
        .nc-welcome-box h2 {
            margin: 0 0 10px 0;
            font-size: 1.3em;
        }
        
        .nc-welcome-box p {
            margin: 5px 0;
            opacity: 0.95;
        }
        
        /* Stats Grid */
        .nc-stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .nc-stat-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            cursor: pointer;
            transition: all 0.2s;
            border-top: 4px solid #cbd5e0;
        }
        
        .nc-stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .nc-stat-card.pending { border-top-color: #d69e2e; }
        .nc-stat-card.success { border-top-color: #38a169; }
        .nc-stat-card.warning { border-top-color: #ed8936; }
        
        .nc-stat-icon {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .nc-stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #1a365d;
        }
        
        .nc-stat-label {
            color: #718096;
            margin: 5px 0;
        }
        
        .nc-stat-action {
            color: #667eea;
            font-weight: 500;
            margin-top: 10px;
        }
        
        .nc-stat-date {
            color: #a0aec0;
            font-size: 0.9em;
        }
        
        /* Flow Section */
        .nc-flow-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .nc-flow-section h2 {
            color: #1a365d;
            margin-bottom: 25px;
        }
        
        .nc-flow-steps {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        }
        
        .nc-flow-step {
            flex: 1;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            background: #f7fafc;
            position: relative;
        }
        
        .nc-flow-step.active {
            background: #ebf8ff;
            border: 2px solid #3182ce;
        }
        
        .nc-step-number {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: #1a365d;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .nc-step-icon {
            font-size: 2em;
            margin: 10px 0;
        }
        
        .nc-flow-step h3 {
            margin: 10px 0;
            font-size: 1em;
            color: #2d3748;
        }
        
        .nc-flow-step p {
            font-size: 0.9em;
            color: #718096;
            margin: 0 0 10px 0;
        }
        
        .nc-step-link {
            color: #3182ce;
            font-weight: 500;
            text-decoration: none;
        }
        
        .nc-flow-arrow {
            font-size: 1.5em;
            color: #cbd5e0;
        }
        
        /* Quick Actions */
        .nc-quick-actions {
            margin-bottom: 30px;
        }
        
        .nc-quick-actions h2 {
            color: #1a365d;
            margin-bottom: 20px;
        }
        
        .nc-actions-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }
        
        .nc-action-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            text-decoration: none;
            color: inherit;
            box-shadow: 0 2px 4px rgba(0,0,0,0.08);
            transition: all 0.2s;
            border-left: 4px solid #cbd5e0;
        }
        
        .nc-action-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.12);
        }
        
        .nc-action-card.urgent {
            border-left-color: #e53e3e;
            background: #fff5f5;
        }
        
        .nc-action-icon {
            font-size: 2em;
            display: block;
            margin-bottom: 10px;
        }
        
        .nc-action-title {
            display: block;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 5px;
        }
        
        .nc-action-desc {
            display: block;
            font-size: 0.85em;
            color: #718096;
        }
        
        /* Example Section */
        .nc-example-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .nc-example-section h2 {
            color: #1a365d;
            margin-bottom: 20px;
        }
        
        .nc-example-item {
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            background: #f7fafc;
        }
        
        .nc-example-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 0.9em;
            color: #718096;
        }
        
        .nc-example-item h4 {
            margin: 0 0 10px 0;
            color: #1a365d;
            font-size: 1.1em;
        }
        
        .nc-example-item p {
            color: #4a5568;
            margin: 0 0 15px 0;
            line-height: 1.5;
        }
        
        .nc-example-keywords {
            margin-bottom: 15px;
        }
        
        .nc-example-keywords span:first-child {
            color: #718096;
            font-size: 0.9em;
        }
        
        .nc-keyword-tag {
            background: #d1fae5;
            color: #065f46;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 0.8em;
            margin: 0 3px;
        }
        
        .nc-example-actions {
            display: flex;
            gap: 10px;
        }
        
        /* Menu Help */
        .nc-menu-help {
            background: #f7fafc;
            border-radius: 12px;
            padding: 30px;
        }
        
        .nc-menu-help h2 {
            color: #1a365d;
            margin-bottom: 20px;
        }
        
        .nc-menu-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        
        .nc-menu-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid #cbd5e0;
        }
        
        .nc-menu-item strong {
            display: block;
            color: #2d3748;
            margin-bottom: 5px;
        }
        
        .nc-menu-item p {
            margin: 0;
            font-size: 0.9em;
            color: #718096;
        }
        
        @media screen and (max-width: 782px) {
            .nc-stats-grid { grid-template-columns: repeat(2, 1fr); }
            .nc-actions-grid { grid-template-columns: repeat(2, 1fr); }
            .nc-flow-steps { flex-direction: column; }
            .nc-flow-arrow { transform: rotate(90deg); }
            .nc-menu-grid { grid-template-columns: 1fr; }
        }
        </style>

        <script>
        function ncGoTo(page) {
            var urls = {
                'queue': '?page=nc-editorial-queue',
                'sources': '?page=nc-editorial-sources',
                'instagram': '?page=nc-instagram-comments'
            };
            if (urls[page]) {
                window.location.href = urls[page];
            }
        }
        </script>
        <?php
    }
}

NC_Editorial_Dashboard::init();
