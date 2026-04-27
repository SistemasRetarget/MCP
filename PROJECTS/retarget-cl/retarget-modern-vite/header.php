<?php
/**
 * Header del tema Retarget Modern
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?> x-data="newsApp()" x-init="init()" :class="{ 'dark': darkMode }">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#1a365d">
    <?php wp_head(); ?>
</head>
<body <?php body_class('bg-neutral-50 text-neutral-800 antialiased'); ?>>
<?php wp_body_open(); ?>

<!-- Progress Bar de Lectura -->
<div class="reading-progress" :style="`width: ${scrollProgress}%`"></div>

<!-- Overlay de Búsqueda -->
<div class="search-overlay" :class="{ 'active': searchOpen }" @click="searchOpen = false">
    <div class="search-modal" @click.stop>
        <form class="relative" @submit.prevent="searchNews()">
            <input 
                type="search" 
                x-ref="searchInput"
                x-model="searchQuery"
                placeholder="Buscar noticias..." 
                class="w-full px-6 py-4 text-xl bg-white rounded-2xl shadow-2xl border-0 focus:ring-2 focus:ring-primary-500"
            >
            <button type="submit" class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-primary-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </button>
        </form>
        
        <!-- Resultados de búsqueda -->
        <div x-show="searchResults.length > 0" class="mt-4 bg-white rounded-xl shadow-xl overflow-hidden">
            <template x-for="result in searchResults" :key="result.id">
                <a :href="result.link" class="block px-6 py-4 hover:bg-primary-50 transition-colors border-b border-neutral-100 last:border-0">
                    <h4 class="font-semibold text-neutral-800" x-text="result.title.rendered"></h4>
                </a>
            </template>
        </div>
    </div>
</div>

<header class="site-header">
    
    <?php if (get_theme_mod('retarget_breaking', true)) : ?>
    <!-- Breaking News Bar -->
    <div class="breaking-bar">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <span class="breaking-label">Última hora</span>
            <div class="overflow-hidden flex-1 ml-4">
                <div class="whitespace-nowrap animate-marquee">
                    <?php
                    $breaking = ['Congreso aprueba reforma tributaria', 'Bolsas europeas cierran al alza', 'Selección chilena anuncia convocados'];
                    foreach ($breaking as $item) {
                        echo '<span class="inline-block mx-8">' . esc_html($item) . '</span>';
                    }
                    ?>
                </div>
            </div>
        </div>
    </div>
    <?php endif; ?>
    
    <!-- Main Header -->
    <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                
                <!-- Logo -->
                <div class="flex-shrink-0 flex items-center gap-4">
                    <?php if (has_custom_logo()) : ?>
                        <?php the_custom_logo(); ?>
                    <?php else : ?>
                        <a href="<?php echo home_url(); ?>" class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                R
                            </div>
                            <div>
                                <span class="text-2xl font-bold text-primary-900 tracking-tight">Retarget</span>
                                <span class="hidden sm:block text-xs text-neutral-500">Noticias que importan</span>
                            </div>
                        </a>
                    <?php endif; ?>
                </div>
                
                <!-- Desktop Navigation -->
                <nav class="hidden lg:flex items-center gap-8">
                    <?php
                    wp_nav_menu([
                        'theme_location' => 'primary',
                        'container' => false,
                        'menu_class' => 'flex items-center gap-6',
                        'walker' => new Retarget_Walker(),
                        'fallback_cb' => function() {
                            echo '<a href="#" class="nav-link">Política</a>';
                            echo '<a href="#" class="nav-link">Economía</a>';
                            echo '<a href="#" class="nav-link">Deportes</a>';
                            echo '<a href="#" class="nav-link">Tecnología</a>';
                            echo '<a href="#" class="nav-link">Cultura</a>';
                        }
                    ]);
                    ?>
                </nav>
                
                <!-- Actions -->
                <div class="flex items-center gap-3">
                    
                    <!-- Search Toggle -->
                    <button @click="toggleSearch()" class="p-2 text-neutral-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-neutral-100">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </button>
                    
                    <!-- Dark Mode Toggle -->
                    <button @click="toggleDarkMode()" class="p-2 text-neutral-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-neutral-100">
                        <svg x-show="!darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                        <svg x-show="darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </button>
                    
                    <!-- Mobile Menu Toggle -->
                    <button @click="toggleMobileMenu()" class="lg:hidden p-2 text-neutral-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-neutral-100">
                        <svg x-show="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                        <svg x-show="mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Mobile Menu -->
    <div x-show="mobileMenuOpen" 
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0 -translate-y-4"
         x-transition:enter-end="opacity-100 translate-y-0"
         x-transition:leave="transition ease-in duration-150"
         x-transition:leave-start="opacity-100 translate-y-0"
         x-transition:leave-end="opacity-0 -translate-y-4"
         class="lg:hidden bg-white border-t border-neutral-200 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-4">
            <?php
            wp_nav_menu([
                'theme_location' => 'mobile',
                'container' => false,
                'menu_class' => 'flex flex-col gap-2',
                'fallback_cb' => function() {
                    $items = ['Política', 'Economía', 'Deportes', 'Tecnología', 'Cultura'];
                    foreach ($items as $item) {
                        echo '<a href="#" class="px-4 py-3 rounded-lg hover:bg-primary-50 text-neutral-800 font-medium">' . $item . '</a>';
                    }
                }
            ]);
            ?>
        </div>
    </div>
    
</header>

<!-- Spacer para header fijo -->
<div class="h-20"></div>

<!-- Main Content Wrapper -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid lg:grid-cols-12 gap-8">
