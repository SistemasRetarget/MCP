<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class NC_Admin {

    public static function render_converter_page() {
        $categories = get_categories( array( 'hide_empty' => false ) );
        ?>
        <div class="wrap nc-wrap">
            <div class="nc-header">
                <h1><span class="dashicons dashicons-rss"></span> News Converter</h1>
                <p>Convierte links de redes sociales en posts de WordPress</p>
            </div>

            <div class="nc-grid">
                <div class="nc-card nc-input-section">
                    <h2>Ingresa un Link</h2>
                    <div class="nc-message nc-error" id="ncError"></div>
                    <div class="nc-message nc-success" id="ncSuccess"></div>

                    <div class="nc-field">
                        <label for="ncUrl">URL del Artículo o Tweet</label>
                        <input type="url" id="ncUrl" placeholder="https://x.com/... o cualquier URL" class="regular-text nc-input-full">
                    </div>

                    <button class="button button-primary button-hero nc-btn-full" id="ncConvertBtn">
                        <span class="dashicons dashicons-update"></span> Convertir a Noticia
                    </button>

                    <div class="nc-loading" id="ncLoading">
                        <span class="spinner is-active"></span>
                        Analizando contenido con IA...
                    </div>
                </div>

                <div class="nc-card nc-preview-section" id="ncPreview">
                    <h2>Vista Previa y Edición</h2>

                    <div class="nc-field">
                        <img id="ncPreviewImage" class="nc-preview-image" src="" alt="">
                        <label>URL de Imagen</label>
                        <div class="nc-field-row">
                            <input type="url" id="ncImageUrl" class="regular-text nc-input-grow" placeholder="URL de la imagen">
                            <button type="button" class="button nc-regen-btn" data-field="image" title="Mejorar imagen">🔄 Mejorar</button>
                        </div>
                        <div class="nc-image-edit-section" id="ncImageEditSection">
                            <label>Filtros</label>
                            <div class="nc-filter-buttons">
                                <button type="button" class="button nc-filter-btn" data-filter="grayscale">B/N</button>
                                <button type="button" class="button nc-filter-btn" data-filter="sepia">Sepia</button>
                                <button type="button" class="button nc-filter-btn" data-filter="contrast">Contraste</button>
                                <button type="button" class="button nc-filter-btn" data-filter="brightness">Brillo</button>
                                <button type="button" class="button nc-filter-btn" data-filter="darken">Oscurecer</button>
                                <button type="button" class="button nc-filter-btn" data-filter="blur">Difuminar</button>
                                <button type="button" class="button nc-filter-btn" data-filter="sharpen">Enfocar</button>
                            </div>
                            <label>Texto sobre la imagen</label>
                            <div class="nc-field-row">
                                <input type="text" id="ncOverlayText" class="regular-text nc-input-grow" placeholder="Texto que aparecerá sobre la foto">
                                <button type="button" class="button nc-regen-btn nc-btn-edit-image" id="ncAddTextBtn" title="Agregar texto">🎨 Agregar</button>
                            </div>
                            <button type="button" class="button nc-restore-btn" id="ncRestoreImageBtn">↩ Restaurar original</button>
                            <div class="nc-image-loading" id="ncImageLoading">
                                <span class="spinner is-active"></span> Procesando imagen...
                            </div>
                        </div>
                    </div>

                    <div class="nc-field">
                        <label for="ncTitle">Título (Cuña)</label>
                        <div class="nc-field-row">
                            <input type="text" id="ncTitle" class="regular-text nc-input-grow" placeholder="Título de la noticia">
                            <button type="button" class="button nc-regen-btn" data-field="title" title="Generar otra cuña">🔄 Otra cuña</button>
                        </div>
                    </div>

                    <div class="nc-field">
                        <label for="ncExcerpt">Extracto / Cuña</label>
                        <div class="nc-field-row">
                            <textarea id="ncExcerpt" class="nc-textarea nc-input-grow" rows="3" placeholder="Resumen corto"></textarea>
                            <button type="button" class="button nc-regen-btn" data-field="excerpt" title="Mejorar extracto">🔄 Mejorar</button>
                        </div>
                    </div>

                    <div class="nc-field">
                        <label for="ncAuthor">Autor / Fuente</label>
                        <div class="nc-field-row">
                            <input type="text" id="ncAuthor" class="regular-text nc-input-grow" placeholder="Nombre del autor">
                            <button type="button" class="button nc-regen-btn" data-field="author" title="Mejorar autor">🔄 Mejorar</button>
                        </div>
                    </div>

                    <div class="nc-field">
                        <label for="ncCategory">Categoría</label>
                        <select id="ncCategory" class="nc-input-full">
                            <?php foreach ( $categories as $cat ) : ?>
                                <option value="<?php echo esc_attr( $cat->name ); ?>" <?php selected( $cat->name, 'Opiniones' ); ?>>
                                    <?php echo esc_html( $cat->name ); ?>
                                </option>
                            <?php endforeach; ?>
                            <option value="__new__">+ Nueva categoría...</option>
                        </select>
                        <input type="text" id="ncNewCategory" class="regular-text nc-input-full nc-hidden" placeholder="Nombre de la nueva categoría">
                    </div>

                    <div class="nc-field">
                        <label>Etiquetas</label>
                        <div class="nc-tags-container" id="ncTagsContainer"></div>
                        <input type="text" id="ncTagInput" class="regular-text nc-input-full" placeholder="Escribe y presiona Enter">
                    </div>

                    <div class="nc-field">
                        <label for="ncContent">Contenido</label>
                        <div class="nc-field-row nc-field-row-top">
                            <textarea id="ncContent" class="nc-textarea nc-textarea-large nc-input-grow" rows="10" placeholder="Contenido del post"></textarea>
                            <button type="button" class="button nc-regen-btn" data-field="content" title="Mejorar contenido">🔄 Mejorar</button>
                        </div>
                    </div>

                    <div class="nc-field">
                        <span class="nc-confidence" id="ncConfidence"></span>
                    </div>

                    <div class="nc-actions">
                        <button class="button button-secondary" id="ncResetBtn">Limpiar</button>
                        <button class="button button-primary" id="ncDraftBtn">
                            <span class="dashicons dashicons-edit"></span> Guardar como Borrador
                        </button>
                        <button class="button nc-btn-publish" id="ncPublishBtn">
                            <span class="dashicons dashicons-yes-alt"></span> Publicar Ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    public static function render_settings_page() {
        ?>
        <div class="wrap">
            <h1><span class="dashicons dashicons-admin-settings"></span> News Converter - Configuración</h1>

            <form method="post" action="options.php">
                <?php settings_fields( 'nc_settings_group' ); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="nc_openai_api_key">API Key de OpenAI</label></th>
                        <td>
                            <input type="password" id="nc_openai_api_key" name="nc_openai_api_key"
                                value="<?php echo esc_attr( get_option( 'nc_openai_api_key', '' ) ); ?>"
                                class="regular-text" placeholder="sk-...">
                            <p class="description">Obtén tu clave en <a href="https://platform.openai.com/account/api-keys" target="_blank">platform.openai.com</a></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="nc_openai_model">Modelo de OpenAI</label></th>
                        <td>
                            <select id="nc_openai_model" name="nc_openai_model">
                                <?php $current = get_option( 'nc_openai_model', 'gpt-4o-mini' ); ?>
                                <option value="gpt-4o-mini" <?php selected( $current, 'gpt-4o-mini' ); ?>>GPT-4o Mini (económico)</option>
                                <option value="gpt-4o" <?php selected( $current, 'gpt-4o' ); ?>>GPT-4o (mejor calidad)</option>
                                <option value="gpt-4-turbo" <?php selected( $current, 'gpt-4-turbo' ); ?>>GPT-4 Turbo</option>
                            </select>
                            <p class="description">Modelo a usar para el análisis de contenido</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="nc_default_category">Categoría por defecto</label></th>
                        <td>
                            <input type="text" id="nc_default_category" name="nc_default_category"
                                value="<?php echo esc_attr( get_option( 'nc_default_category', 'Opiniones' ) ); ?>"
                                class="regular-text">
                        </td>
                    </tr>
                </table>

                <?php submit_button( 'Guardar Configuración' ); ?>
            </form>
        </div>
        <?php
    }
}
