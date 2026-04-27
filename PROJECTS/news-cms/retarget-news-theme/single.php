<?php
/**
 * Template para post individual
 */

get_header();

// Obtener datos del post
$is_demo = retarget_is_demo_mode();
if (!$is_demo) {
    while (have_posts()) : the_post();
        $title = get_the_title();
        $content = get_the_content();
        $excerpt = get_the_excerpt();
        $author = get_the_author();
        $date = get_the_date();
        $modified = get_the_modified_date();
        $categories = get_the_category();
        $tags = get_the_tags();
        $featured_image = get_the_post_thumbnail_url(get_the_ID(), 'large');
    endwhile;
    wp_reset_postdata();
} else {
    // Demo data
    $demo = retarget_get_demo_posts(1)[0];
    $title = $demo['title'];
    $content = '<p>' . $demo['excerpt'] . '</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>';
    $excerpt = $demo['excerpt'];
    $author = 'Cota Editorial';
    $date = '16 de abril, 2025';
    $modified = $date;
    $categories = array((object)array('name' => $demo['category'], 'link' => '#'));
    $tags = array((object)array('name' => 'Destacado'), (object)array('name' => 'Política'));
    $featured_image = $demo['image'];
}
?>

<div class="content-area" style="grid-column: span 2;">
    
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" style="margin-bottom: 20px; font-size: 0.9em; color: var(--text-light);">
        <a href="<?php echo home_url(); ?>">Inicio</a>
        <span style="margin: 0 10px;">/</span>
        <?php if (!empty($categories)) : ?>
        <a href="#"><?php echo is_array($categories) ? $categories[0]->name : $categories[0]->name; ?></a>
        <span style="margin: 0 10px;">/</span>
        <?php endif; ?>
        <span><?php echo esc_html(wp_trim_words($title, 5)); ?>...</span>
    </nav>
    
    <!-- Header del artículo -->
    <article class="single-article" style="background: var(--white); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow);">
        
        <?php if ($featured_image) : ?>
        <div class="single-featured-image" style="position: relative; height: 500px;">
            <img src="<?php echo esc_url($featured_image); ?>" alt="<?php echo esc_attr($title); ?>" style="width: 100%; height: 100%; object-fit: cover;">
            <?php if (!empty($categories)) : ?>
            <span class="single-category" style="position: absolute; top: 30px; left: 30px; background: var(--accent); color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.8em; font-weight: 600; text-transform: uppercase;">
                <?php echo is_array($categories) ? $categories[0]->name : $categories[0]->name; ?>
            </span>
            <?php endif; ?>
        </div>
        <?php endif; ?>
        
        <div class="single-content" style="padding: 40px;">
            
            <h1 class="single-title" style="font-size: 2.5em; font-weight: 800; line-height: 1.2; color: var(--primary); margin-bottom: 20px;">
                <?php echo esc_html($title); ?>
            </h1>
            
            <!-- Meta -->
            <div class="single-meta" style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--border); color: var(--text-light); font-size: 0.9em;">
                <div class="author" style="display: flex; align-items: center; gap: 10px;">
                    <div class="author-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                        <?php echo substr($author, 0, 1); ?>
                    </div>
                    <span><strong><?php echo esc_html($author); ?></strong></span>
                </div>
                <span>|</span>
                <span><?php echo esc_html($date); ?></span>
                <?php if ($date !== $modified) : ?>
                <span>|</span>
                <span>Actualizado: <?php echo esc_html($modified); ?></span>
                <?php endif; ?>
                <span>|</span>
                <span>5 min de lectura</span>
            </div>
            
            <!-- Contenido -->
            <div class="article-body" style="font-size: 1.1em; line-height: 1.8; color: var(--text);">
                <?php 
                if ($is_demo) {
                    echo wp_kses_post($content);
                } else {
                    the_content();
                }
                ?>
            </div>
            
            <!-- Tags -->
            <?php if (!empty($tags)) : ?>
            <div class="article-tags" style="margin-top: 40px; padding-top: 30px; border-top: 1px solid var(--border);">
                <h4 style="font-size: 0.9em; color: var(--text-light); margin-bottom: 15px;">🏷️ Etiquetas:</h4>
                <div class="tag-cloud">
                    <?php foreach ($tags as $tag) : 
                        $tag_name = is_object($tag) ? $tag->name : $tag['name'];
                        $tag_link = is_object($tag) ? get_tag_link($tag->term_id) : '#';
                    ?>
                    <a href="<?php echo esc_url($tag_link); ?>"><?php echo esc_html($tag_name); ?></a>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
            
            <!-- Compartir -->
            <div class="article-share" style="margin-top: 30px; padding: 20px; background: var(--background); border-radius: var(--radius);">
                <h4 style="font-size: 0.9em; color: var(--text-light); margin-bottom: 15px;">📤 Compartir:</h4>
                <div class="social-widget" style="justify-content: flex-start;">
                    <a href="#" class="facebook" style="width: 40px; height: 40px;">f</a>
                    <a href="#" class="twitter" style="width: 40px; height: 40px;">t</a>
                    <a href="#" class="linkedin" style="background: #0077b5; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">in</a>
                    <a href="#" class="whatsapp" style="background: #25d366; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">w</a>
                </div>
            </div>
            
        </div>
    </article>
    
    <!-- Artículos relacionados -->
    <section class="related-posts" style="margin-top: 40px;">
        <div class="news-section">
            <div class="section-header">
                <h2 class="section-title">📰 Artículos Relacionados</h2>
            </div>
            <div class="news-grid news-grid-3">
                <?php
                $related = retarget_is_demo_mode() 
                    ? array_slice(retarget_get_demo_posts(6), 0, 3)
                    : retarget_get_recent_posts(3);
                
                foreach ($related as $post) :
                    $is_demo = retarget_is_demo_mode();
                    $rel_title = $is_demo ? $post['title'] : get_the_title($post);
                    $rel_category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
                    $rel_image = $is_demo ? $post['image'] : (get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'card') ?: 'https://via.placeholder.com/400x300');
                    $rel_date = $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID));
                    $rel_url = $is_demo ? '#' : get_permalink($post);
                ?>
                <article class="news-card">
                    <div class="news-card-image">
                        <img src="<?php echo esc_url($rel_image); ?>" alt="<?php echo esc_attr($rel_title); ?>">
                        <span class="news-card-category"><?php echo esc_html($rel_category); ?></span>
                    </div>
                    <div class="news-card-content">
                        <h3 class="news-card-title">
                            <a href="<?php echo esc_url($rel_url); ?>"><?php echo esc_html($rel_title); ?></a>
                        </h3>
                        <div class="news-card-meta">
                            <span class="news-card-date"><?php echo esc_html($rel_date); ?></span>
                        </div>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    
</div>

<?php get_footer(); ?>
