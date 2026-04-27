<?php
/**
 * Homepage - Template principal
 */

get_header();
?>

<!-- Content Area -->
<main class="lg:col-span-8 space-y-8">
    
    <?php if (get_theme_mod('retarget_carousel_enabled', true)) : ?>
    <!-- Hero Carousel con Swiper -->
    <section class="reveal-up">
        <div class="hero-carousel swiper">
            <div class="swiper-wrapper">
                <?php
                $posts = retarget_is_demo() 
                    ? retarget_demo_posts(5) 
                    : retarget_get_carousel_posts(get_theme_mod('retarget_carousel_count', 5));
                
                foreach ($posts as $post) :
                    $is_demo = retarget_is_demo();
                    $title = $is_demo ? $post['title'] : get_the_title($post);
                    $excerpt = $is_demo ? $post['excerpt'] : retarget_excerpt($is_demo ? 0 : $post->ID);
                    $category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
                    $image = $is_demo ? $post['image'] : get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'hero');
                    $url = $is_demo ? '#' : get_permalink($post);
                ?>
                <div class="swiper-slide relative">
                    <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>" class="carousel-image">
                    <div class="carousel-overlay"></div>
                    <div class="carousel-content">
                        <span class="inline-block px-3 py-1 bg-accent-500 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                            <?php echo esc_html($category); ?>
                        </span>
                        <h2 class="carousel-title">
                            <a href="<?php echo esc_url($url); ?>" class="hover:underline">
                                <?php echo esc_html($title); ?>
                            </a>
                        </h2>
                        <p class="hidden md:block text-white/80 text-lg max-w-2xl mb-4">
                            <?php echo esc_html(wp_trim_words($excerpt, 20)); ?>
                        </p>
                        <div class="carousel-meta">
                            <span><?php echo $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID)); ?></span>
                            <span>•</span>
                            <span>5 min lectura</span>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            
            <!-- Navigation -->
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-pagination"></div>
        </div>
    </section>
    <?php endif; ?>
    
    <!-- Sección: Política -->
    <section class="news-section reveal-up">
        <div class="section-header">
            <h2 class="section-title">Política</h2>
            <a href="#" class="section-link">Ver todas →</a>
        </div>
        
        <div class="news-grid news-grid-cols-3">
            <?php
            $posts = retarget_is_demo() 
                ? array_slice(retarget_demo_posts(6), 0, 3)
                : retarget_get_recent(3);
            
            foreach ($posts as $index => $post) :
                $is_demo = retarget_is_demo();
                $is_featured = $index === 0;
                $title = $is_demo ? $post['title'] : get_the_title($post);
                $excerpt = $is_demo ? $post['excerpt'] : retarget_excerpt($is_demo ? 0 : $post->ID, 15);
                $category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
                $image = $is_demo ? $post['image'] : (get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'card') ?: 'https://via.placeholder.com/800x600');
                $url = $is_demo ? '#' : get_permalink($post);
            ?>
            <article class="news-card <?php echo $is_featured ? 'md:col-span-2 news-featured' : ''; ?>">
                <div class="news-card-image">
                    <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>" loading="lazy">
                    <span class="news-card-category"><?php echo esc_html($category); ?></span>
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">
                        <a href="<?php echo esc_url($url); ?>"><?php echo esc_html($title); ?></a>
                    </h3>
                    <?php if ($is_featured) : ?>
                    <p class="news-card-excerpt"><?php echo esc_html($excerpt); ?></p>
                    <?php endif; ?>
                    <div class="news-card-meta">
                        <span><?php echo $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID)); ?></span>
                        <?php if ($is_featured) : ?>
                        <span class="badge badge-accent">Destacado</span>
                        <?php endif; ?>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>
    
    <!-- Sección: Economía -->
    <section class="news-section reveal-up">
        <div class="section-header">
            <h2 class="section-title">Economía</h2>
            <a href="#" class="section-link">Ver todas →</a>
        </div>
        
        <div class="news-grid news-grid-cols-2">
            <?php
            $posts = retarget_is_demo() 
                ? array_slice(retarget_demo_posts(6), 1, 2)
                : retarget_get_recent(2);
            
            foreach ($posts as $post) :
                $is_demo = retarget_is_demo();
                $title = $is_demo ? $post['title'] : get_the_title($post);
                $excerpt = $is_demo ? $post['excerpt'] : retarget_excerpt($is_demo ? 0 : $post->ID, 20);
                $category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
                $image = $is_demo ? $post['image'] : (get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'card') ?: 'https://via.placeholder.com/800x600');
                $url = $is_demo ? '#' : get_permalink($post);
            ?>
            <article class="news-card">
                <div class="news-card-image">
                    <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>" loading="lazy">
                    <span class="news-card-category"><?php echo esc_html($category); ?></span>
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">
                        <a href="<?php echo esc_url($url); ?>"><?php echo esc_html($title); ?></a>
                    </h3>
                    <p class="news-card-excerpt"><?php echo esc_html($excerpt); ?></p>
                    <div class="news-card-meta">
                        <span><?php echo $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID)); ?></span>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>
    
    <!-- Sección: Más Noticias (4 columnas) -->
    <section class="news-section reveal-up">
        <div class="section-header">
            <h2 class="section-title">Más Noticias</h2>
            <a href="#" class="section-link">Ver archivo →</a>
        </div>
        
        <div class="news-grid news-grid-cols-4">
            <?php
            $posts = retarget_is_demo() 
                ? retarget_demo_posts(4)
                : retarget_get_recent(4);
            
            foreach ($posts as $post) :
                $is_demo = retarget_is_demo();
                $title = $is_demo ? $post['title'] : get_the_title($post);
                $category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
                $image = $is_demo ? $post['image'] : (get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'card') ?: 'https://via.placeholder.com/400x300');
                $url = $is_demo ? '#' : get_permalink($post);
            ?>
            <article class="news-card">
                <div class="news-card-image">
                    <img src="<?php echo esc_url($image); ?>" alt="<?php echo esc_attr($title); ?>" loading="lazy">
                    <span class="news-card-category"><?php echo esc_html($category); ?></span>
                </div>
                <div class="news-card-content">
                    <h3 class="news-card-title">
                        <a href="<?php echo esc_url($url); ?>"><?php echo esc_html(wp_trim_words($title, 8)); ?></a>
                    </h3>
                    <div class="news-card-meta">
                        <span><?php echo $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID)); ?></span>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>
    
</main>

<!-- Sidebar -->
<aside class="lg:col-span-4 space-y-6">
    
    <!-- Widget: Últimas Noticias -->
    <div class="widget reveal-up">
        <h3 class="widget-title">🔥 Últimas Noticias</h3>
        <div class="news-list">
            <?php
            $posts = retarget_is_demo() 
                ? array_slice(retarget_demo_posts(6), 0, 5)
                : retarget_get_recent(5);
            
            foreach ($posts as $post) :
                $is_demo = retarget_is_demo();
                $title = $is_demo ? $post['title'] : get_the_title($post);
                $category = $is_demo ? $post['category'] : (get_the_category($is_demo ? 0 : $post->ID)[0]->name ?? 'General');
                $image = $is_demo ? $post['image'] : (get_the_post_thumbnail_url($is_demo ? 0 : $post->ID, 'sidebar') ?: 'https://via.placeholder.com/200x150');
                $url = $is_demo ? '#' : get_permalink($post);
            ?>
            <div class="news-list-item">
                <div class="news-list-thumb">
                    <img src="<?php echo esc_url($image); ?>" alt="" loading="lazy">
                </div>
                <div class="news-list-content">
                    <span class="news-list-category"><?php echo esc_html($category); ?></span>
                    <h4 class="news-list-title">
                        <a href="<?php echo esc_url($url); ?>"><?php echo esc_html(wp_trim_words($title, 10)); ?></a>
                    </h4>
                    <div class="news-list-date"><?php echo $is_demo ? $post['date'] : retarget_time_ago(get_the_date('', $is_demo ? 0 : $post->ID)); ?></div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    
    <!-- Widget: Banner -->
    <div class="widget widget-banner reveal-up">
        <img src="https://via.placeholder.com/300x250/1a365d/ffffff?text=TU+PUBLICIDAD+AQUI" alt="Publicidad" loading="lazy">
    </div>
    
    <!-- Widget: Categorías -->
    <div class="widget reveal-up">
        <h3 class="widget-title">📂 Categorías</h3>
        <div class="category-list">
            <?php
            $categories = get_categories(['number' => 6]);
            if (empty($categories) || retarget_is_demo()) {
                $demo_cats = ['Política' => 12, 'Economía' => 8, 'Deportes' => 15, 'Tecnología' => 6, 'Cultura' => 10, 'Nacional' => 9];
                foreach ($demo_cats as $name => $count) {
                    echo '<a href="#" class="category-pill">' . $name . ' <span class="ml-1 text-xs text-neutral-500">(' . $count . ')</span></a>';
                }
            } else {
                foreach ($categories as $cat) {
                    echo '<a href="' . get_category_link($cat->term_id) . '" class="category-pill">';
                    echo esc_html($cat->name);
                    echo ' <span class="ml-1 text-xs text-neutral-500">(' . $cat->count . ')</span>';
                    echo '</a>';
                }
            }
            ?>
        </div>
    </div>
    
    <!-- Widget: Tags -->
    <div class="widget reveal-up">
        <h3 class="widget-title">🏷️ Tags Populares</h3>
        <div class="tag-cloud">
            <?php
            $tags = ['Congreso', 'Presupuesto', 'Chile', 'Mundo', 'Innovación', 'Futuro', 'Cambio', 'Democracia'];
            foreach ($tags as $tag) {
                echo '<a href="#" class="tag-item">' . esc_html($tag) . '</a>';
            }
            ?>
        </div>
    </div>
    
    <!-- Widget: Newsletter -->
    <div class="widget bg-primary-900 text-white reveal-up">
        <h3 class="widget-title text-white border-white/20">📧 Newsletter</h3>
        <p class="text-white/80 text-sm mb-4">Recibe las noticias más importantes cada mañana en tu correo.</p>
        <form class="space-y-3">
            <input type="email" placeholder="tu@email.com" class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white">
            <button type="submit" class="w-full btn-accent">Suscribirme</button>
        </form>
    </div>
    
</aside>

<?php get_footer(); ?>
