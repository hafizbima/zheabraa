import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
