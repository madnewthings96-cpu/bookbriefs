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
        chunkSizeWarningLimit: 2500,
        rollupOptions: {
          output: {
            manualChunks: {
              firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
              vendor: ['react', 'react-dom', 'react-router-dom'],
              ui: ['framer-motion', 'lucide-react'],
              'pdf-lib': ['jspdf']
            }
          }
        },
        // Enable minification for better performance
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Remove console logs in production
            drop_debugger: true
          }
        }
      },
      // Optimize dependencies
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore']
      }
    };
});
