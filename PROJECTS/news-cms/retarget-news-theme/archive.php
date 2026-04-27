<?php
/**
 * Template para archivo (categoría, tag, autor)
 */

get_header();

$is_demo = retarget_is_demo_mode();

// Obtener título del archivo
if (is_category()) {
    $archive_title = single_cat_title('', false);
    $archive_description = category_description();
} elseif (is_tag()) {
    $archive_title = single_tag_title('', false);
    $archive_description = tag_description();
} elseif (is_author()) {
    $archive_title = get_the_author();
    $archive_description = '';
} elseif (is_date()) {
    $archive_title = get_the_date('F Y');
    $archive_description = '';
} else {
    $archive_title = 'Archivo';
    $archive_description = '';
}

// Obtener posts
if ($is_demo) {
    $posts = retarget_get_demo_posts(9);
    $total_posts = 24;
} else {
    global $wp_query;
    $posts = $wp_query->posts;
    $total_posts = $wp_query->found_posts;
}
?>

<div class="content-area" style="grid-column: span 2;">
    
    <!-- Header del archivo -->
    <div class="archive-header" style="background: var(--white); border-radius: var(--radius-lg); padding: 40px; margin-bottom: 30px; box-shadow: var(--shadow); text-align: center;">
        <h1 class="archive-title" style="font-size: 2em; color: var(--primary); margin-bottom: 15px;">
            📂 <?php echo esc_html($archive_title); ?>
        </h1>
        
        <?php if ($archive_description) : ?>
        <p class="archive-description" style="color: var(--text-light); max-width: 600px; margin: 0 auto;">
            <?php echo wp_kses_post($archive_description); ?>
        </p>
        <?php endif; ?>
        
        <div class="archive-stats" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
            <span class="badge badge-primary"><?php echo $total_posts; ?> artículos</span>
        </div>
    </div>
    
    <!-- Grid de posts -->
    <div class="news-grid news-grid-3">
        <?php foreach ($posts as $post) : 
            $post_title = $is_demo ? $post['title'] : get_the_title($post);
            $post_excerpt = $is_demo ? $post['excerpt'] : retarget_get_excerpt($is_demo ? 0 : $post->ID, 20);
            $post_category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
            $post_image = $is_demo ? $post['image'] : (get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'card') ?: 'https://via.placeholder.com/400x300');
            $post_date = $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID));
            $post_url = $is_demo ? '#' : get_permalink($post);
            $post_author = $is_demo ? 'Cota Editorial' : get_the_author_meta('display_name', $post->post_author);
        ?>
        <article class="news-card" style="display: flex; flex-direction: column;">
            <div class="news-card-image">
                <img src="<?php echo esc_url($post_image); ?>" alt="<?php echo esc_attr($post_title); ?>">
                <span class="news-card-category"><?php echo esc_html($post_category); ?></span>
            </div>
            <div class="news-card-content" style="flex: 1; display: flex; flex-direction: column;">
                <h3 class="news-card-title">
                    <a href="<?php echo esc_url($post_url); ?>"><?php echo esc_html($post_title); ?></a>
                </h3>
                <p class="news-card-excerpt"><?php echo esc_html($post_excerpt); ?></p>
                <div class="news-card-meta" style="margin-top: auto;">
                    <span><?php echo esc_html($post_date); ?></span>
                    <span>•</span>
                    <span><?php echo esc_html($post_author); ?></span>
                </div>
            </div>
        </article>
        <?php endforeach; ?>
    </div>
    
    <!-- Paginación -->
    <?php if ($total_posts > 9) : ?>
    <div class="pagination" style="margin-top: 40px; text-align: center;">
        <nav style="display: inline-flex; gap: 10px; background: var(--white); padding: 10px; border-radius: var(--radius); box-shadow: var(--shadow);">
            <a href="#" class="pagination-link" style="padding: 10px 15px; background: var(--background); border-radius: var(--radius); color: var(--text);">‹ Anterior</a>
            <a href="#" class="pagination-link" style="padding: 10px 15px; background: var(--primary); color: white; border-radius: var(--radius);">1</a>
            <a href="#" class="pagination-link" style="padding: 10px 15px; background: var(--background); border-radius: var(--radius); color: var(--text);">2</a>
            <a href="#" class="pagination-link" style="padding: 10px 15px; background: var(--background); border-radius: var(--radius); color: var(--text);">3</a>
            <span style="padding: 10px;">...</span>
            <a href="#" class="pagination-link" style="padding: 10px 15px; background: var(--background); border-radius: var(--radius); color: var(--text);">Siguiente ›</a>
        </nav>
    </div>
    <?php endif; ?>
    
</div>

<?php get_footer(); ?>
