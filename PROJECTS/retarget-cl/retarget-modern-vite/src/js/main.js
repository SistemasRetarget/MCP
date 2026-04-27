/**
 * Retarget Modern Theme - Main JavaScript
 * Vite + Alpine.js + GSAP + Swiper
 */

// Importar Alpine.js
import Alpine from 'alpinejs';

// Importar GSAP para animaciones avanzadas
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Importar Swiper para carruseles táctiles
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade, A11y } from 'swiper/modules';

// Importar estilos de Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Importar CSS principal
import '../css/main.css';

// Registrar plugins GSAP
gsap.registerPlugin(ScrollTrigger);

// Inicializar Alpine
document.addEventListener('alpine:init', () => {
    console.log('Alpine.js initialized');
});

// ============================================
// APP STATE CON ALPINE.JS
// ============================================
window.newsApp = () => ({
    // Estado del menú móvil
    mobileMenuOpen: false,
    
    // Estado de búsqueda
    searchOpen: false,
    searchQuery: '',
    searchResults: [],
    
    // Modo oscuro
    darkMode: localStorage.getItem('darkMode') === 'true',
    
    // Scroll progress
    scrollProgress: 0,
    
    // Notificaciones
    notifications: [],
    
    // Toggle menú móvil
    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        document.body.classList.toggle('overflow-hidden', this.mobileMenuOpen);
    },
    
    // Toggle búsqueda
    toggleSearch() {
        this.searchOpen = !this.searchOpen;
        if (this.searchOpen) {
            this.$nextTick(() => this.$refs.searchInput.focus());
        }
    },
    
    // Toggle dark mode
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode);
        document.documentElement.classList.toggle('dark', this.darkMode);
    },
    
    // Buscar noticias
    async searchNews() {
        if (this.searchQuery.length < 3) return;
        
        // En producción, esto llamaría a la REST API de WordPress
        const response = await fetch(
            `${window.retargetData.restUrl}wp/v2/posts?search=${encodeURIComponent(this.searchQuery)}&per_page=5`
        );
        this.searchResults = await response.json();
    },
    
    // Cerrar búsqueda al presionar Escape
    init() {
        this.$watch('darkMode', value => {
            document.documentElement.classList.toggle('dark', value);
        });
        
        // Inicializar dark mode según preferencia del sistema
        if (!localStorage.getItem('darkMode')) {
            this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        // Track scroll para progress bar
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            this.scrollProgress = (winScroll / height) * 100;
        });
    }
});

// ============================================
// INICIALIZACIÓN DEL TEMA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Inicializar Alpine
    Alpine.start();
    
    // Inicializar carruseles Swiper
    initCarousels();
    
    // Inicializar animaciones GSAP
    initAnimations();
    
    // Inicializar lazy loading
    initLazyLoad();
    
    // Inicializar efectos de scroll
    initScrollEffects();
    
    // Inicializar breaking news ticker
    initBreakingNews();
});

// ============================================
// CARRUSELES CON SWIPER
// ============================================
function initCarousels() {
    // Hero Carousel principal
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        new Swiper(heroCarousel, {
            modules: [Navigation, Pagination, Autoplay, EffectFade, A11y],
            slidesPerView: 1,
            spaceBetween: 0,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            loop: true,
            speed: 800,
            a11y: {
                prevSlideMessage: 'Noticia anterior',
                nextSlideMessage: 'Noticia siguiente',
            },
            on: {
                slideChange: function() {
                    // Animar contenido al cambiar slide
                    const activeSlide = this.slides[this.activeIndex];
                    const content = activeSlide.querySelector('.carousel-content');
                    if (content) {
                        gsap.fromTo(content, 
                            { opacity: 0, y: 30 },
                            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
                        );
                    }
                }
            }
        });
    }
    
    // Carrusel de noticias relacionadas
    const relatedCarousel = document.querySelector('.related-carousel');
    if (relatedCarousel) {
        new Swiper(relatedCarousel, {
            modules: [Navigation, Pagination, A11y],
            slidesPerView: 1,
            spaceBetween: 20,
            breakpoints: {
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            loop: true,
        });
    }
}

// ============================================
// ANIMACIONES GSAP
// ============================================
function initAnimations() {
    // Animar elementos al entrar en viewport
    const revealElements = document.querySelectorAll('.reveal-up, .news-card, .widget');
    
    revealElements.forEach((el, i) => {
        gsap.fromTo(el,
            {
                opacity: 0,
                y: 30,
                scale: 0.95
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                delay: i * 0.05 // Stagger effect
            }
        );
    });
    
    // Animar secciones
    const sections = document.querySelectorAll('.news-section');
    sections.forEach(section => {
        const title = section.querySelector('.section-title');
        const grid = section.querySelector('.news-grid');
        
        if (title) {
            gsap.fromTo(title,
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%'
                    }
                }
            );
        }
    });
    
    // Parallax en imágenes hero
    const heroImages = document.querySelectorAll('.carousel-image');
    heroImages.forEach(img => {
        gsap.to(img, {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('.hero-carousel'),
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    });
}

// ============================================
// LAZY LOADING CON INTERSECTION OBSERVER
// ============================================
function initLazyLoad() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                    
                    // Fade in la imagen
                    gsap.fromTo(img, 
                        { opacity: 0 },
                        { opacity: 1, duration: 0.5 }
                    );
                }
                
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// EFECTOS DE SCROLL
// ============================================
function initScrollEffects() {
    // Header sticky con efecto
    const header = document.querySelector('.site-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Añadir clase cuando hay scroll
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Ocultar/mostrar header al hacer scroll (smart header)
        if (currentScroll > lastScroll && currentScroll > 100) {
            gsap.to(header, { y: -100, duration: 0.3, ease: 'power2.out' });
        } else {
            gsap.to(header, { y: 0, duration: 0.3, ease: 'power2.out' });
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
    
    // Smooth scroll para anclas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: target, offsetY: 80 },
                    ease: 'power2.inOut'
                });
            }
        });
    });
}

// ============================================
// BREAKING NEWS TICKER
// ============================================
function initBreakingNews() {
    const ticker = document.querySelector('.breaking-ticker');
    if (!ticker) return;
    
    // Animación infinita del ticker
    const tickerContent = ticker.querySelector('.ticker-content');
    if (tickerContent) {
        gsap.to(tickerContent, {
            xPercent: -50,
            duration: 20,
            ease: 'none',
            repeat: -1
        });
    }
}

// ============================================
// UTILIDADES GLOBALES
// ============================================

// Debounce para eventos frecuentes
window.debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle para scroll/resize
window.throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Formatear tiempo relativo
window.timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
        año: 31536000,
        mes: 2592000,
        semana: 604800,
        día: 86400,
        hora: 3600,
        minuto: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `Hace ${interval} ${unit}${interval > 1 ? 's' : ''}`;
        }
    }
    
    return 'Justo ahora';
};

// Infinite scroll para noticias
window.initInfiniteScroll = (container, loadMoreUrl) => {
    let page = 1;
    let loading = false;
    
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !loading) {
            loading = true;
            page++;
            
            fetch(`${loadMoreUrl}&page=${page}`)
                .then(res => res.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const newPosts = doc.querySelectorAll('.news-card');
                    
                    newPosts.forEach((post, i) => {
                        container.appendChild(post);
                        gsap.fromTo(post,
                            { opacity: 0, y: 30 },
                            { opacity: 1, y: 0, duration: 0.4, delay: i * 0.1 }
                        );
                    });
                    
                    loading = false;
                });
        }
    });
    
    // Observar el sentinel
    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    container.after(sentinel);
    observer.observe(sentinel);
};

// Exportar para uso global
window.gsap = gsap;
window.Swiper = Swiper;
