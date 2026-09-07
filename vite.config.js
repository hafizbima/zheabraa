import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon-192.png', 'pwa-icon-512.png'],
      manifest: {
        name: 'Zheabraa Pocket Budgeting',
        short_name: 'Zheabraa',
        description: 'Sistem pocket budgeting untuk keuangan pribadimu',
        lang: 'id',
        theme_color: '#0f1b3d',
        background_color: '#dceeff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}', 'pwa-icon-*.png'],
        globIgnores: ['**/logo.png'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // data Supabase: network-first, fallback cache — app tetap terbaca offline
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-data',
              expiration: { maxEntries: 64, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/node_modules[\\/](react|react-dom)[\\/]/.test(id)) return 'vendor-react'
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('recharts')) return 'vendor-charts'
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
