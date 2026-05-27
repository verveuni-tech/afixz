import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Target modern browsers for smaller output
    target: 'es2020',

    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into own chunk — loaded async, not in initial bundle
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },

    // esbuild minification (built-in, fast)
    minify: 'esbuild',
  },

  // Strip console.log/warn in production (keep console.error for debugging)
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    pure: process.env.NODE_ENV === 'production' ? ['console.log', 'console.warn'] : [],
  },
})
