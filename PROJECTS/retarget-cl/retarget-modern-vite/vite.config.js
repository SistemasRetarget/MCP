import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  // WordPress espera archivos en dist/
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/js/main.js'),
        editor: resolve(__dirname, 'src/css/editor.css')
      },
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.css$/i.test(assetInfo.name)) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: true
  },
  
  // Server para desarrollo
  server: {
    port: 3000,
    strictPort: true,
    https: false,
    cors: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws'
    },
    // Proxy para WordPress local
    proxy: {
      '^/(?!src|node_modules|dist)': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true
    })
  ],
  
  // Optimizaciones
  optimizeDeps: {
    include: ['alpinejs', 'gsap', 'swiper']
  },
  
  css: {
    devSourcemap: true,
    postcss: './postcss.config.js'
  }
});
