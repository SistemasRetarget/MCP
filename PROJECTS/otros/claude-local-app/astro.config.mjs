import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
  vite: {
    css: {
      postcss: true,
    },
    build: {
      cssCodeSplit: true,
      assetsInlineLimit: 0,
    },
  },
});
