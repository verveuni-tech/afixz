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

    // Skip modulepreload for heavy firebase chunks — let browser fetch on-demand,
    // not block initial paint. Saves ~480KB on landing.
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter(
          (dep) =>
            !dep.includes('firebase-firestore') &&
            !dep.includes('firebase-auth')
        ),
    },

    rollupOptions: {
      output: {
        manualChunks: {
          // Split firebase by surface — auth small, firestore huge.
          'firebase-core': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-firestore': ['firebase/firestore'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },

    minify: 'esbuild',
  },

  // Strip console.log/warn in production (keep console.error for debugging)
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    pure: process.env.NODE_ENV === 'production' ? ['console.log', 'console.warn'] : [],
  },
})
