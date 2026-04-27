<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class NC_Taxonomies {

    public static function register() {
        add_action( 'init', array( __CLASS__, 'register_section_taxonomy' ) );
        add_action( 'init', array( __CLASS__, 'register_source_post_type' ) );
        add_action( 'init', array( __CLASS__, 'register_queue_post_type' ) );
    }

    public static function register_section_taxonomy() {
        $labels = array(
            'name'                       => _x( 'Secciones', 'taxonomy general name', 'news-converter' ),
            'singular_name'              => _x( 'Sección', 'taxonomy singular name', 'news-converter' ),
            'search_items'               => __( 'Buscar Secciones', 'news-converter' ),
            'all_items'                  => __( 'Todas las Secciones', 'news-converter' ),
            'parent_item'                => __( 'Sección Padre', 'news-converter' ),
            'parent_item_colon'          => __( 'Sección Padre:', 'news-converter' ),
            'edit_item'                  => __( 'Editar Sección', 'news-converter' ),
            'update_item'                => __( 'Actualizar Sección', 'news-converter' ),
            'add_new_item'               => __( 'Agregar Nueva Sección', 'news-converter' ),
            'new_item_name'              => __( 'Nueva Sección', 'news-converter' ),
            'menu_name'                  => __( 'Secciones', 'news-converter' ),
        );

        $args = array(
            'labels'            => $labels,
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_admin_column' => true,
            'show_in_nav_menus' => true,
            'rewrite'           => array( 'slug' => 'seccion' ),
            'show_in_rest'      => true,
        );

        register_taxonomy( 'nc_section', array( 'post' ), $args );
        self::maybe_create_default_sections();
    }

    private static function maybe_create_default_sections() {
        $sections = array(
            'Política'      => array( 'slug' => 'politica', 'description' => 'Noticias políticas nacionales e internacionales' ),
            'Economía'      => array( 'slug' => 'economia', 'description' => 'Economía, mercados, finanzas y negocios' ),
            'Deportes'      => array( 'slug' => 'deportes', 'description' => 'Actualidad deportiva nacional e internacional' ),
            'Tecnología'    => array( 'slug' => 'tecnologia', 'description' => 'Innovación, tecnología y ciencia' ),
            'Cultura'       => array( 'slug' => 'cultura', 'description' => 'Arte, música, literatura y entretenimiento' ),
            'Opiniones'     => array( 'slug' => 'opiniones', 'description' => 'Columnas de opinión y análisis' ),
        );

        foreach ( $sections as $name => $data ) {
            if ( ! term_exists( $name, 'nc_section' ) ) {
                wp_insert_term( $name, 'nc_section', $data );
            }
        }
    }

    public static function register_source_post_type() {
        $labels = array(
            'name'                  => _x( 'Fuentes', 'Post type general name', 'news-converter' ),
            'singular_name'         => _x( 'Fuente', 'Post type singular name', 'news-converter' ),
            'menu_name'             => _x( 'Fuentes', 'Admin Menu text', 'news-converter' ),
            'name_admin_bar'        => _x( 'Fuente', 'Add New on Toolbar', 'news-converter' ),
            'add_new'               => __( 'Agregar Nueva', 'news-converter' ),
            'add_new_item'          => __( 'Agregar Nueva Fuente', 'news-converter' ),
            'new_item'              => __( 'Nueva Fuente', 'news-converter' ),
            'edit_item'             => __( 'Editar Fuente', 'news-converter' ),
            'view_item'             => __( 'Ver Fuente', 'news-converter' ),
            'all_items'             => __( 'Todas las Fuentes', 'news-converter' ),
            'search_items'          => __( 'Buscar Fuentes', 'news-converter' ),
            'parent_item_colon'     => __( 'Fuente Padre:', 'news-converter' ),
            'not_found'             => __( 'No se encontraron fuentes', 'news-converter' ),
            'not_found_in_trash'    => __( 'No hay fuentes en la papelera', 'news-converter' ),
            'featured_image'        => __( 'Imagen de la Fuente', 'news-converter' ),
            'set_featured_image'    => __( 'Establecer imagen', 'news-converter' ),
            'remove_featured_image' => __( 'Quitar imagen', 'news-converter' ),
            'use_featured_image'    => __( 'Usar como imagen', 'news-converter' ),
            'archives'              => __( 'Archivo de Fuentes', 'news-converter' ),
            'insert_into_item'      => __( 'Insertar en la fuente', 'news-converter' ),
            'uploaded_to_this_item' => __( 'Subido a esta fuente', 'news-converter' ),
            'filter_items_list'     => __( 'Filtrar lista de fuentes', 'news-converter' ),
            'items_list_navigation' => __( 'Navegación de fuentes', 'news-converter' ),
            'items_list'            => __( 'Lista de fuentes', 'news-converter' ),
        );

        $args = array(
            'labels'             => $labels,
            'public'             => false,
            'publicly_queryable' => false,
            'show_ui'            => false, // Ocultar - usamos pagina personalizada
            'show_in_menu'       => false,
            'query_var'          => true,
            'rewrite'            => false,
            'capability_type'    => 'post',
            'has_archive'        => false,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array( 'title' ),
            'show_in_rest'       => true,
        );

        register_post_type( 'nc_source', $args );
    }

    public static function register_queue_post_type() {
        $labels = array(
            'name'                  => _x( 'Cola Editorial', 'Post type general name', 'news-converter' ),
            'singular_name'         => _x( 'Item en Cola', 'Post type singular name', 'news-converter' ),
            'menu_name'             => _x( 'Cola Editorial', 'Admin Menu text', 'news-converter' ),
            'name_admin_bar'        => _x( 'Item en Cola', 'Add New on Toolbar', 'news-converter' ),
            'add_new'               => __( 'Agregar Manualmente', 'news-converter' ),
            'add_new_item'          => __( 'Agregar a Cola', 'news-converter' ),
            'new_item'              => __( 'Nuevo Item', 'news-converter' ),
            'edit_item'             => __( 'Revisar Item', 'news-converter' ),
            'view_item'             => __( 'Ver Item', 'news-converter' ),
            'all_items'             => __( 'Todos los Items', 'news-converter' ),
            'search_items'          => __( 'Buscar en Cola', 'news-converter' ),
            'not_found'             => __( 'La cola está vacía', 'news-converter' ),
            'not_found_in_trash'    => __( 'No hay items en papelera', 'news-converter' ),
        );

        $args = array(
            'labels'             => $labels,
            'public'             => false,
            'publicly_queryable' => false,
            'show_ui'            => false, // Ocultar - usamos pagina personalizada
            'show_in_menu'       => false,
            'query_var'          => true,
            'rewrite'            => false,
            'capability_type'    => 'post',
            'has_archive'        => false,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array( 'title', 'editor', 'thumbnail' ),
            'show_in_rest'       => true,
        );

        register_post_type( 'nc_queue', $args );
    }

    public static function get_sections() {
        return get_terms( array(
            'taxonomy'   => 'nc_section',
            'hide_empty' => false,
        ) );
    }

    public static function get_section_by_slug( $slug ) {
        return get_term_by( 'slug', $slug, 'nc_section' );
    }
}
