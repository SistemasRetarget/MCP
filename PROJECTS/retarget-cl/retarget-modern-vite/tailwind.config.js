/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.php',
    './template-parts/**/*.php',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a365d',
          50: '#f0f5ff',
          100: '#e6f0ff',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1a365d',
          950: '#0f172a'
        },
        accent: {
          DEFAULT: '#e53e3e',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a'
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      fontSize: {
        '2xs': '0.625rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem'
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'marquee': 'marquee 25s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms'
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(26, 54, 93, 0.15)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      }
    }
  },
  plugins: [
    // Plugin para form elements
    require('@tailwindcss/forms')({
      strategy: 'class'
    }),
    // Plugin para typography
    require('@tailwindcss/typography'),
    // Plugin para aspect ratio
    require('@tailwindcss/aspect-ratio'),
    // Plugin para line-clamp
    require('@tailwindcss/line-clamp'),
    
    // Plugin custom para componentes de noticias
    function({ addComponents, theme }) {
      addComponents({
        '.news-card': {
          '@apply bg-white rounded-xl overflow-hidden shadow-card transition-all duration-300': {},
          '&:hover': {
            '@apply shadow-card-hover -translate-y-1': {}
          }
        },
        '.news-featured': {
          '@apply grid md:grid-cols-2 gap-0': {}
        },
        '.section-title': {
          '@apply text-2xl font-bold text-primary-900 flex items-center gap-3': {},
          '&::before': {
            content: '""',
            '@apply w-1 h-8 bg-accent-500 rounded-full': {}
          }
        },
        '.breaking-badge': {
          '@apply inline-flex items-center px-3 py-1 bg-accent-500 text-white text-xs font-bold uppercase tracking-wider rounded-full animate-pulse': {}
        },
        '.category-pill': {
          '@apply inline-block px-4 py-1.5 bg-primary-100 text-primary-800 text-sm font-medium rounded-full hover:bg-primary-200 transition-colors': {}
        }
      });
    }
  ],
  // Configuración para producción
  purge: {
    enabled: true,
    content: [
      './*.php',
      './template-parts/**/*.php',
      './src/**/*.{js,jsx}'
    ]
  }
};
