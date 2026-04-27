<?php
/**
 * Template principal - Homepage
 * Carrusel, grillas de noticias y sidebar
 */

get_header();
?>

<!-- CONTENT AREA -->
<div class="content-area">
    
    <?php if (get_theme_mod('retarget_carousel_enabled', true)) : ?>
    <!-- CARRUSEL PRINCIPAL -->
    <section class="hero-carousel">
        <div class="carousel-container">
            <?php
            $posts = retarget_is_demo_mode() 
                ? retarget_get_demo_posts(5) 
                : retarget_get_carousel_posts(get_theme_mod('retarget_carousel_count', 5));
            
            foreach ($posts as $index => $post) :
                $is_demo = retarget_is_demo_mode();
                $title = $is_demo ? $post['title'] : get_the_title($post);
                $excerpt = $is_demo ? $post['excerpt'] : retarget_get_excerpt($is_demo ? 0 : $post->ID);
                $category = $is_demo ? $post['category'] : get_the_category()[0]->name ?? 'General';
                $image = $is_demo ? $post['image'] : get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'carousel');
                $date = $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID));
                $url = $is_demo ? '#' : get_permalink($post);
            ?>
            <div class="carousel-slide <?php echo $index === 0 ? 'active' : ''; ?>" data-slide="<?php echo $index; ?>">
                <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>">
                <div class="carousel-content">
                    <span class="carousel-category"><?php echo esc_html($category); ?></span>
                    <h2 class="carousel-title">
                        <a href="<?php echo esc_url($url); ?>"><?php echo esc_html($title); ?></a>
                    </h2>
                    <p class="carousel-excerpt"><?php echo esc_html($excerpt); ?></p>
                    <div class="carousel-meta">
                        <span><?php echo esc_html($date); ?></span>
                        <span>•</span>
                        <span>5 min lectura</span>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
            
            <!-- Navegación -->
            <button class="carousel-nav carousel-prev" aria-label="Anterior">‹</button>
            <button class="carousel-nav carousel-next" aria-label="Siguiente">›</button>
            
            <!-- Dots -->
            <div class="carousel-dots">
                <?php foreach ($posts as $index => $post) : ?>
                <button class="carousel-dot <?php echo $index === 0 ? 'active' : ''; ?>" data-slide="<?php echo $index; ?>" aria-label="Slide <?php echo $index + 1; ?>"></button>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>
    
    <!-- SECCIÓN: POLÍTICA -->
    <section class="news-section">
        <div class="section-header">
            <h2 class="section-title">Política</h2>
            <a href="#" class="section-link">Ver todas →</a>
        </div>
        <div class="news-grid news-grid-3">
            <?php
            $politica_posts = retarget_is_demo_mode() 
                ? array_slice(retarget_get_demo_posts(6), 0, 3)
                : retarget_get_recent_posts(3);
            
            foreach ($politica_posts as $index => $post) :
                $is_demo = retarget_is_demo_mode();
                $featured = $index === 0;
                $title = $is_demo ? $post['title'] : get_the_title($post);
                $excerpt = $is_demo ? $post['excerpt'] : retarget_get_excerpt($is_demo ? 0 : $post->ID, 15);
                $category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
                $image = $is_demo ? $post['image'] : (get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'card') ?: 'https://via.placeholder.com/400x300');
                $date = $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID));
                $url = $is_demo ? '#' : get_permalink($post);
            ?>
            <article class="news-card <?php echo $featured ? 'featured' : ''; ?>">
                <div class="news-card-image">
                    <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>">
                    <span class="news-card-category"><?php echo esc_html($category); ?></span>
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">
                        <a href="<?php echo esc_url($url); ?>"><?php echo esc_html($title); ?></a>
                    </h3>
                    <p class="news-card-excerpt"><?php echo esc_html($excerpt); ?></p>
                    <div class="news-card-meta">
                        <span class="news-card-date"><?php echo esc_html($date); ?></span>
                        <span class="badge badge-accent">Destacado</span>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>
    
    <!-- SECCIÓN: ECONOMÍA -->
    <section class="news-section">
        <div class="section-header">
            <h2 class="section-title">Economía</h2>
            <a href="#" class="section-link">Ver todas →</a>
        </div>
        <div class="news-grid news-grid-2">
            <?php
            $economia_posts = retarget_is_demo_mode() 
                ? array_slice(retarget_get_demo_posts(6), 1, 2)
                : retarget_get_recent_posts(2);
            
            foreach ($economia_posts as $post) :
                $is_demo = retarget_is_demo_mode();
                $title = $is_demo ? $post['title'] : get_the_title($post);
                $excerpt = $is_demo ? $post['excerpt'] : retarget_get_excerpt($is_demo ? 0 : $post->ID, 20);
                $category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
                $image = $is_demo ? $post['image'] : (get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'card') ?: 'https://via.placeholder.com/400x300');
                $date = $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID));
                $url = $is_demo ? '#' : get_permalink($post);
            ?>
            <article class="news-card">
                <div class="news-card-image">
                    <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>">
                    <span class="news-card-category"><?php echo esc_html($category); ?></span>
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">
                        <a href="<?php echo esc_url($url); ?>"><?php echo esc_html($title); ?></a>
                    </h3>
                    <p class="news-card-excerpt"><?php echo esc_html($excerpt); ?></p>
                    <div class="news-card-meta">
                        <span class="news-card-date"><?php echo esc_html($date); ?></span>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>
    
    <!-- SECCIÓN: MÁS NOTICIAS (Grilla 4 columnas) -->
    <section class="news-section">
        <div class="section-header">
            <h2 class="section-title">Más Noticias</h2>
            <a href="#" class="section-link">Ver todo el archivo →</a>
        </div>
        <div class="news-grid news-grid-4">
            <?php
            $more_posts = retarget_is_demo_mode() 
                ? retarget_get_demo_posts(4)
                : retarget_get_recent_posts(4);
            
            foreach ($more_posts as $post) :
                $is_demo = retarget_is_demo_mode();
                $title = $is_demo ? $post['title'] : get_the_title($post);
                $category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
                $image = $is_demo ? $post['image'] : (get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'card') ?: 'https://via.placeholder.com/400x300');
                $date = $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID));
                $url = $is_demo ? '#' : get_permalink($post);
            ?>
            <article class="news-card">
                <div class="news-card-image">
                    <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>">
                    <span class="news-card-category"><?php echo esc_html($category); ?></span>
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">
                        <a href="<?php echo esc_url($url); ?>"><?php echo esc_html(wp_trim_words($title, 8)); ?></a>
                    </h3>
                    <div class="news-card-meta">
                        <span class="news-card-date"><?php echo esc_html($date); ?></span>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>
    
</div>

<!-- SIDEBAR -->
<aside class="widget-area">
    
    <!-- Widget: Últimas Noticias -->
    <div class="widget">
        <h3 class="widget-title">🔥 Últimas Noticias</h3>
        <div class="news-list">
            <?php
            $latest = retarget_is_demo_mode() 
                ? retarget_get_demo_posts(5)
                : retarget_get_recent_posts(5);
            
            foreach ($latest as $post) :
                $is_demo = retarget_is_demo_mode();
                $title = $is_demo ? $post['title'] : get_the_title($post);
                $category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
                $image = $is_demo ? $post['image'] : (get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'sidebar') ?: 'https://via.placeholder.com/100x80');
                $date = $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID));
                $url = $is_demo ? '#' : get_permalink($post);
            ?>
            <div class="news-list-item">
                <div class="news-list-image">
                    <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>">
                </div>
                <div class="news-list-content">
                    <span class="news-list-category"><?php echo esc_html($category); ?></span>
                    <h4 class="news-list-title">
                        <a href="<?php echo esc_url($url); ?>"><?php echo esc_html(wp_trim_words($title, 10)); ?></a>
                    </h4>
                    <div class="news-list-meta"><?php echo esc_html($date); ?></div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    
    <!-- Widget: Banner Publicitario -->
    <div class="widget widget-banner">
        <img src="https://via.placeholder.com/300x250/1a365d/ffffff?text=TU+PUBLICIDAD+AQUI" alt="Publicidad">
    </div>
    
    <!-- Widget: Categorías -->
    <div class="widget">
        <h3 class="widget-title">📂 Categorías</h3>
        <ul class="category-list">
            <?php
            $categories = retarget_get_popular_categories(6);
            foreach ($categories as $cat) :
            ?>
            <li>
                <a href="<?php echo esc_url(get_category_link($cat->term_id)); ?>">
                    <?php echo esc_html($cat->name); ?>
                    <span class="category-count"><?php echo $cat->count; ?></span>
                </a>
            </li>
            <?php endforeach; ?>
            
            <?php if (empty($categories)) : ?>
            <li><a href="#">Política <span class="category-count">12</span></a></li>
            <li><a href="#">Economía <span class="category-count">8</span></a></li>
            <li><a href="#">Deportes <span class="category-count">15</span></a></li>
            <li><a href="#">Tecnología <span class="category-count">6</span></a></li>
            <li><a href="#">Cultura <span class="category-count">10</span></a></li>
            <?php endif; ?>
        </ul>
    </div>
    
    <!-- Widget: Tags -->
    <div class="widget">
        <h3 class="widget-title">🏷️ Tags Populares</h3>
        <div class="tag-cloud">
            <?php
            $tags = array('Congreso', 'Presupuesto', 'Chile', 'Mundo', 'Innovación', 'Futuro', 'Cambio', 'Democracia');
            foreach ($tags as $tag) :
            ?>
            <a href="#"><?php echo esc_html($tag); ?></a>
            <?php endforeach; ?>
        </div>
    </div>
    
    <!-- Widget: Redes Sociales -->
    <div class="widget">
        <h3 class="widget-title">📱 Síguenos</h3>
        <div class="social-widget">
            <a href="#" class="facebook">f</a>
            <a href="#" class="twitter">t</a>
            <a href="#" class="instagram">i</a>
            <a href="#" class="youtube">y</a>
        </div>
    </div>
    
</aside>

<?php get_footer(); ?>
