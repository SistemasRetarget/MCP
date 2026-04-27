<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * HITO 3: Cola Editorial - Solo UI (Mockup)
 * Interfaz para revisar, aprobar, rechazar items
 */
class NC_Editorial_Queue {

    public static function init() {
        add_action( 'admin_menu', array( __CLASS__, 'add_menu' ) );
    }

    public static function add_menu() {
        add_submenu_page(
            'news-converter',
            'Cola Editorial',
            '📥 Cola Editorial',
            'edit_posts',
            'nc-editorial-queue',
            array( __CLASS__, 'render_page' )
        );
    }

    public static function render_page() {
        // Datos MOCK para presentación
        $mock_items = array(
            array(
                'id' => 1,
                'title' => 'Paz Charpentier - Unboxing invitaciones cambio de mando',
                'source_type' => 'instagram',
                'source_icon' => '📸',
                'source_name' => 'Instagram',
                'section' => 'Política',
                'excerpt' => 'Diputada electa muestra invitaciones para juramento del miércoles 11. Comentarios destacan controversia sobre financiamiento de estudios...',
                'date_detected' => 'Hace 30 min',
                'status' => 'pending',
                'keywords' => array('política', 'congreso', 'paz charpentier'),
                'meta' => '16 comentarios extraídos',
            ),
            array(
                'id' => 2,
                'title' => 'BCCh mantiene tasa de interés en 6,5% por séptimo mes consecutivo',
                'source_type' => 'rss',
                'source_icon' => '📰',
                'source_name' => 'Banco Central',
                'section' => 'Economía',
                'excerpt' => 'El Consejo del Banco Central de Chile acordó mantener la tasa de interés de referencia en 6,5%, en línea con las expectativas del mercado...',
                'date_detected' => 'Hace 45 min',
                'status' => 'pending',
                'keywords' => array('banco central', 'tasa de interés', 'inflación'),
                'meta' => 'RSS Feed',
            ),
            array(
                'id' => 3,
                'title' => 'Thread: Análisis del nuevo gabinete ministerial y sus implicancias',
                'source_type' => 'twitter',
                'source_icon' => '🐦',
                'source_name' => '@politologo_cl',
                'section' => 'Análisis',
                'excerpt' => 'Hilo con análisis detallado de los cambios en el gabinete y sus implicancias para la agenda legislativa del segundo semestre...',
                'date_detected' => 'Hace 1 hora',
                'status' => 'pending',
                'keywords' => array('gabinete', 'ministros', 'análisis'),
                'meta' => 'Thread completo',
            ),
            array(
                'id' => 4,
                'title' => 'Gobierno anuncia nueva reforma tributaria para 2026',
                'source_type' => 'rss',
                'source_icon' => '📰',
                'source_name' => 'El Mercurio',
                'section' => 'Economía',
                'excerpt' => 'El ministro de Hacienda confirmó que el proyecto será enviado al Congreso en marzo del próximo año...',
                'date_detected' => 'Hace 2 horas',
                'status' => 'approved',
                'keywords' => array('reforma tributaria', 'impuestos', 'hacienda'),
                'meta' => 'Editado por Cota',
            ),
            array(
                'id' => 5,
                'title' => 'Presidente Boric se reúne con empresarios en CEP',
                'source_type' => 'twitter',
                'source_icon' => '🐦',
                'source_name' => '@Presidencia_cl',
                'section' => 'Política',
                'excerpt' => 'El Presidente Gabriel Boric participó en el encuentro anual del Consejo Empresarial para el Desarrollo...',
                'date_detected' => 'Hace 3 horas',
                'status' => 'published',
                'keywords' => array('boric', 'empresarios', 'cep'),
                'meta' => 'Publicado hace 2 horas',
            ),
        );

        $counts = array(
            'pending' => 3,
            'approved' => 1,
            'published' => 1,
            'rejected' => 0,
        );

        $active_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'pending';
        ?>
        <div class="wrap nc-queue-wrap">
            <div class="nc-header">
                <h1>📥 Cola Editorial</h1>
                <p>Revisa, edita y aprueba contenido antes de publicar</p>
            </div>

            <!-- INSTRUCCIONES -->
            <div class="nc-help-box" style="background: #fffaf0; border-left: 4px solid #d69e2e; padding: 15px 20px; margin-bottom: 20px; border-radius: 4px;">
                <strong>📖 ¿Qué hace esta página?</strong>
                <p style="margin: 8px 0 0 0; color: #4a5568;">
                    Esta es tu <strong>bandeja de entrada de noticias</strong>. El sistema detecta noticias automáticamente y tú decides:
                    <span style="display: inline-block; margin: 5px 10px;">✓ <strong>Aprobar</strong> → Se publica en el portal</span>
                    <span style="display: inline-block; margin: 5px 10px;">✏️ <strong>Editar</strong> → Modificar antes de publicar</span>
                    <span style="display: inline-block; margin: 5px 10px;">✕ <strong>Rechazar</strong> → No se publica</span>
                    <br><em>Las noticias se ordenan por fecha de detección (las más nuevas primero).</em>
                </p>
            </div>

            <!-- Tabs -->
            <div class="nc-tabs">
                <a href="?page=nc-editorial-queue&tab=pending" class="nc-tab <?php echo $active_tab === 'pending' ? 'active' : ''; ?>">
                    ⏳ Pendientes
                    <span class="nc-tab-count"><?php echo $counts['pending']; ?></span>
                </a>
                <a href="?page=nc-editorial-queue&tab=approved" class="nc-tab <?php echo $active_tab === 'approved' ? 'active' : ''; ?>">
                    ✓ Aprobados
                    <span class="nc-tab-count"><?php echo $counts['approved']; ?></span>
                </a>
                <a href="?page=nc-editorial-queue&tab=published" class="nc-tab <?php echo $active_tab === 'published' ? 'active' : ''; ?>">
                    📰 Publicados Hoy
                    <span class="nc-tab-count"><?php echo $counts['published']; ?></span>
                </a>
                <a href="?page=nc-editorial-queue&tab=rejected" class="nc-tab <?php echo $active_tab === 'rejected' ? 'active' : ''; ?>">
                    ✕ Rechazados
                    <span class="nc-tab-count"><?php echo $counts['rejected']; ?></span>
                </a>
            </div>

            <!-- Queue List -->
            <div class="nc-card">
                <?php foreach ( $mock_items as $item ) : ?>
                    <?php if ( $item['status'] === $active_tab ) : ?>
                    <div class="nc-queue-item">
                        <div class="nc-item-main">
                            <div class="nc-item-icon"><?php echo $item['source_icon']; ?></div>
                            <div class="nc-item-content">
                                <h3><?php echo esc_html( $item['title'] ); ?></h3>
                                <div class="nc-item-meta">
                                    <span><?php echo $item['source_icon']; ?> <?php echo esc_html( $item['source_name'] ); ?></span>
                                    <span>🏷️ <?php echo esc_html( $item['section'] ); ?></span>
                                    <span>🕐 <?php echo esc_html( $item['date_detected'] ); ?></span>
                                    <span class="nc-meta-badge"><?php echo esc_html( $item['meta'] ); ?></span>
                                </div>
                                <p class="nc-item-excerpt"><?php echo esc_html( $item['excerpt'] ); ?></p>
                                <div class="nc-item-keywords">
                                    <?php foreach ( $item['keywords'] as $kw ) : ?>
                                        <span class="nc-keyword include"><?php echo esc_html( $kw ); ?></span>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                        <div class="nc-item-actions">
                            <?php if ( $item['status'] === 'pending' ) : ?>
                                <button class="button button-primary" onclick="ncApproveItem(<?php echo $item['id']; ?>)">
                                    <span class="dashicons dashicons-yes"></span> Aprobar
                                </button>
                                <button class="button" onclick="ncEditItem(<?php echo $item['id']; ?>)">
                                    <span class="dashicons dashicons-edit"></span> Editar
                                </button>
                                <button class="button button-link-delete" onclick="ncRejectItem(<?php echo $item['id']; ?>)">
                                    <span class="dashicons dashicons-no"></span> Rechazar
                                </button>
                            <?php elseif ( $item['status'] === 'approved' ) : ?>
                                <span class="nc-status-badge approved">✓ Aprobado</span>
                                <button class="button" onclick="ncViewPost(<?php echo $item['id']; ?>)">
                                    <span class="dashicons dashicons-visibility"></span> Ver
                                </button>
                            <?php elseif ( $item['status'] === 'published' ) : ?>
                                <span class="nc-status-badge published">📰 Publicado</span>
                                <button class="button" onclick="ncViewPost(<?php echo $item['id']; ?>)">
                                    <span class="dashicons dashicons-external"></span> Ver en vivo
                                </button>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endif; ?>
                <?php endforeach; ?>
                
                <?php 
                // Mensaje si no hay items
                $has_items = false;
                foreach ( $mock_items as $item ) {
                    if ( $item['status'] === $active_tab ) {
                        $has_items = true;
                        break;
                    }
                }
                if ( ! $has_items ) : 
                ?>
                    <div class="nc-empty-state">
                        <span class="dashicons dashicons-archive"></span>
                        <p>No hay items <?php echo esc_html( $active_tab ); ?> en este momento.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Modal: Edit Item -->
        <div id="nc-modal-edit" class="nc-modal" style="display:none;">
            <div class="nc-modal-content nc-modal-lg">
                <div class="nc-modal-header">
                    <h2>✏️ Editar Noticia</h2>
                    <button class="nc-modal-close" onclick="ncCloseModal('edit')">&times;</button>
                </div>
                <div class="nc-modal-body">
                    <div class="nc-edit-preview">
                        <div class="nc-preview-source">
                            <strong>Fuente original:</strong> 📸 Instagram - Paz Charpentier
                        </div>
                    </div>
                    
                    <div class="nc-form-group">
                        <label>Título *</label>
                        <input type="text" class="nc-form-control nc-title-input" 
                               value="Paz Charpentier - Unboxing invitaciones cambio de mando">
                    </div>
                    
                    <div class="nc-form-group">
                        <label>Contenido / Resumen</label>
                        <textarea class="nc-form-control" rows="4">Diputada electa muestra invitaciones para juramento del miércoles 11. Comentarios destacan controversia sobre financiamiento de estudios...</textarea>
                    </div>
                    
                    <div class="nc-form-row">
                        <div class="nc-form-group">
                            <label>Sección</label>
                            <select class="nc-form-control">
                                <option selected>Política</option>
                                <option>Economía</option>
                                <option>Nacional</option>
                            </select>
                        </div>
                        <div class="nc-form-group">
                            <label>Autor</label>
                            <input type="text" class="nc-form-control" value="Redacción NC">
                        </div>
                    </div>
                    
                    <div class="nc-form-group">
                        <label>Tags / Keywords</label>
                        <div class="nc-tag-editor">
                            <span class="nc-tag">política <span onclick="this.parentElement.remove()">×</span></span>
                            <span class="nc-tag">congreso <span onclick="this.parentElement.remove()">×</span></span>
                            <span class="nc-tag">paz charpentier <span onclick="this.parentElement.remove()">×</span></span>
                            <input type="text" placeholder="+ Agregar tag" style="width:100px;border:none;" onkeydown="if(event.key==='Enter'){event.preventDefault();alert('[DEMO] Tag agregado');}">
                        </div>
                    </div>
                    
                    <div class="nc-ai-suggestions">
                        <h4>🤖 Sugerencias de IA</h4>
                        <div class="nc-suggestion">
                            <span class="nc-suggest-label">Título alternativo:</span>
                            <span class="nc-suggest-text">"Diputada Charpentier muestra invitaciones al cambio de mando con polémica incluida"</span>
                            <button class="button button-small">Usar</button>
                        </div>
                        <div class="nc-suggestion">
                            <span class="nc-suggest-label">Categoría sugerida:</span>
                            <span class="nc-suggest-text">Política > Congreso</span>
                            <button class="button button-small">Aplicar</button>
                        </div>
                    </div>
                </div>
                <div class="nc-modal-footer">
                    <button class="button" onclick="ncCloseModal('edit')">Cancelar</button>
                    <button class="button" onclick="ncSaveDraft()">💾 Guardar Borrador</button>
                    <button class="button button-primary" onclick="ncSaveAndApprove()">✓ Guardar y Aprobar</button>
                </div>
            </div>
        </div>

        <!-- Modal: Reject Item -->
        <div id="nc-modal-reject" class="nc-modal" style="display:none;">
            <div class="nc-modal-content" style="max-width:500px;">
                <div class="nc-modal-header">
                    <h2>✕ Rechazar Noticia</h2>
                    <button class="nc-modal-close" onclick="ncCloseModal('reject')">&times;</button>
                </div>
                <div class="nc-modal-body">
                    <p>Estás rechazando: <strong id="nc-reject-title">Paz Charpentier - Unboxing...</strong></p>
                    
                    <div class="nc-form-group">
                        <label>Motivo del Rechazo *</label>
                        <select class="nc-form-control" id="nc-reject-reason">
                            <option value="">Selecciona un motivo...</option>
                            <option value="offtopic">Fuera de temática editorial</option>
                            <option value="opinion">Contenido de opinión sin respaldo factual</option>
                            <option value="duplicate">Noticia ya cubierta</option>
                            <option value="unreliable">Fuente no confiable</option>
                            <option value="incomplete">Información incompleta</option>
                            <option value="sensitive">Contenido sensible/inapropiado</option>
                            <option value="other">Otros (especificar)</option>
                        </select>
                    </div>
                    
                    <div class="nc-form-group">
                        <label>Comentario adicional</label>
                        <textarea class="nc-form-control" rows="3" placeholder="Explica el motivo del rechazo..."></textarea>
                    </div>
                    
                    <div class="nc-reject-warning">
                        <strong>⚠️ Atención:</strong>
                        <p>Esta acción registrará el rechazo en el historial y entrenará al sistema para futuras detecciones similares.</p>
                    </div>
                </div>
                <div class="nc-modal-footer">
                    <button class="button" onclick="ncCloseModal('reject')">Cancelar</button>
                    <button class="button button-danger" onclick="ncConfirmReject()">✕ Confirmar Rechazo</button>
                </div>
            </div>
        </div>

        <style>
        .nc-queue-wrap { max-width: 1200px; }
        .nc-header { margin-bottom: 25px; }
        .nc-header h1 { color: #1a365d; font-size: 1.8em; }
        .nc-header p { color: #718096; margin-top: 5px; }
        
        .nc-tabs {
            display: flex;
            gap: 5px;
            margin-bottom: 25px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
        }
        
        .nc-tab {
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            color: #4a5568;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .nc-tab:hover {
            background: #f7fafc;
            color: #1a365d;
        }
        
        .nc-tab.active {
            background: #1a365d;
            color: white;
        }
        
        .nc-tab-count {
            background: rgba(255,255,255,0.2);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.85em;
        }
        
        .nc-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .nc-queue-item {
            padding: 25px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            gap: 25px;
            transition: background 0.2s;
        }
        
        .nc-queue-item:hover {
            background: #f7fafc;
        }
        
        .nc-queue-item:last-child {
            border-bottom: none;
        }
        
        .nc-item-main {
            display: flex;
            gap: 20px;
            flex: 1;
        }
        
        .nc-item-icon {
            width: 50px;
            height: 50px;
            background: #f7fafc;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5em;
            flex-shrink: 0;
        }
        
        .nc-item-content {
            flex: 1;
        }
        
        .nc-item-content h3 {
            margin: 0 0 10px 0;
            color: #1a365d;
            font-size: 1.1em;
            line-height: 1.4;
        }
        
        .nc-item-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 10px;
            font-size: 0.85em;
            color: #718096;
        }
        
        .nc-meta-badge {
            background: #edf2f7;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.9em;
        }
        
        .nc-item-excerpt {
            color: #4a5568;
            line-height: 1.6;
            margin: 0 0 10px 0;
        }
        
        .nc-item-keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        
        .nc-keyword {
            background: #d1fae5;
            color: #065f46;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 0.8em;
        }
        
        .nc-item-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 140px;
        }
        
        .nc-item-actions .button {
            justify-content: center;
        }
        
        .nc-status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 500;
            text-align: center;
        }
        
        .nc-status-badge.approved {
            background: #d1fae5;
            color: #065f46;
        }
        
        .nc-status-badge.published {
            background: #bee3f8;
            color: #2c5282;
        }
        
        .nc-empty-state {
            padding: 60px 20px;
            text-align: center;
            color: #718096;
        }
        
        .nc-empty-state .dashicons {
            font-size: 3em;
            margin-bottom: 15px;
            color: #cbd5e0;
        }
        
        /* Modal */
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
        }
        
        .nc-modal-lg {
            max-width: 800px;
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
        
        /* Form */
        .nc-form-group {
            margin-bottom: 20px;
        }
        
        .nc-form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        .nc-form-control {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }
        
        .nc-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .nc-title-input {
            font-size: 1.1em;
            font-weight: 500;
        }
        
        .nc-edit-preview {
            background: #f7fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        /* Tags */
        .nc-tag-editor {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 8px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }
        
        .nc-tag {
            background: #edf2f7;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 0.85em;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .nc-tag span {
            cursor: pointer;
            opacity: 0.5;
        }
        
        .nc-tag span:hover {
            opacity: 1;
        }
        
        /* AI Suggestions */
        .nc-ai-suggestions {
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 20px;
        }
        
        .nc-ai-suggestions h4 {
            margin: 0 0 15px 0;
            color: #1a365d;
        }
        
        .nc-suggestion {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 10px 0;
            border-bottom: 1px solid #edf2f7;
        }
        
        .nc-suggest-label {
            font-weight: 500;
            color: #4a5568;
            min-width: 140px;
        }
        
        .nc-suggest-text {
            flex: 1;
            color: #2d3748;
        }
        
        /* Reject Modal */
        .nc-reject-warning {
            background: #fff5f5;
            border: 1px solid #fc8181;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .nc-reject-warning strong {
            color: #c53030;
        }
        
        .nc-reject-warning p {
            margin: 5px 0 0 0;
            font-size: 0.9em;
            color: #742a2a;
        }
        
        .button-danger {
            background: #e53e3e !important;
            border-color: #e53e3e !important;
            color: white !important;
        }
        
        @media screen and (max-width: 782px) {
            .nc-form-row { grid-template-columns: 1fr; }
            .nc-item-main { flex-direction: column; }
            .nc-item-actions { flex-direction: row; flex-wrap: wrap; }
        }
        </style>

        <script>
        function ncCloseModal(modalId) {
            document.getElementById('nc-modal-' + modalId).style.display = 'none';
        }
        
        function ncEditItem(id) {
            document.getElementById('nc-modal-edit').style.display = 'flex';
        }
        
        function ncRejectItem(id) {
            document.getElementById('nc-modal-reject').style.display = 'flex';
        }
        
        function ncApproveItem(id) {
            if (confirm('¿Aprobar esta noticia para publicación?')) {
                alert('[DEMO] Item ' + id + ' aprobado.\\nEn la versión real, se crearía el post en WordPress.');
                location.reload();
            }
        }
        
        function ncSaveDraft() {
            alert('[DEMO] Borrador guardado.\\nEn la versión real, se guardarían los cambios sin aprobar.');
            ncCloseModal('edit');
        }
        
        function ncSaveAndApprove() {
            alert('[DEMO] Guardado y aprobado.\\nEn la versión real, se guardarían los cambios y se crearía el post.');
            ncCloseModal('edit');
            location.reload();
        }
        
        function ncConfirmReject() {
            var reason = document.getElementById('nc-reject-reason').value;
            if (!reason) {
                alert('Por favor selecciona un motivo de rechazo.');
                return;
            }
            alert('[DEMO] Item rechazado.\\nMotivo: ' + reason + '\\n\\nEn la versión real, se registraría en el historial.');
            ncCloseModal('reject');
            location.reload();
        }
        
        function ncViewPost(id) {
            alert('[DEMO] Abriendo post ' + id + '...\\nEn la versión real, se abriría el editor de WordPress o el post publicado.');
        }
        
        // Cerrar modal al hacer click fuera
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('nc-modal')) {
                e.target.style.display = 'none';
            }
        });
        </script>
        <?php
    }
}

NC_Editorial_Queue::init();
