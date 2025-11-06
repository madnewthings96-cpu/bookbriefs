import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Increase chunk size limit for Firebase and large dependencies
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            manualChunks: {
              // Split React vendor code (largest initial bundle)
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              
              // Firebase is 498KB - must be separate and lazy loaded
              'firebase': [
                'firebase/app',
                'firebase/auth',
                'firebase/firestore',
                'firebase/analytics'
              ],
              
              // PDF library - lazy load only when needed (dynamic import in SummaryDetailPage)
              'pdf-generator': ['jspdf'],
              
              // UI components library
              'ui-components': [
                'framer-motion',
                'lucide-react'
              ]
            },
            
            // Content-based hashing for better caching
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        },
        // Enable aggressive minification
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Remove console logs in production
            drop_debugger: true,
            passes: 2, // Multiple passes for better compression
            pure_funcs: ['console.log', 'console.info', 'console.debug'] // Remove specific console methods
          },
          mangle: {
            safari10: true // Fix Safari 10 bugs
          }
        },
        // Disable source maps in production for smaller bundle
        sourcemap: false
      },
      // Optimize dependencies - exclude heavy ones from pre-bundling
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
        exclude: [
          'firebase/app',
          'firebase/auth', 
          'firebase/firestore',
          'firebase/analytics',
          'jspdf'
        ]
      }
    };
});
