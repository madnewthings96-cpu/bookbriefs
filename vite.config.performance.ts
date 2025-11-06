import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Performance-optimized Vite configuration
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Firebase split into separate chunk (498KB!)
          'firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/analytics'
          ],
          
          // PDF library is huge (385KB!) - separate chunk
          'pdf': ['pdf-lib'],
          
          // HTML canvas library (199KB) - separate chunk
          'canvas': ['html2canvas'],
          
          // UI library components
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],
          
          // Markdown and rich text
          'markdown': ['react-markdown', 'remark-gfm', 'dompurify'],
          
          // Charts and data visualization
          'charts': ['recharts'],
        },
        
        // Use content-based hashing for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Increase chunk size warning limit (we're splitting intentionally)
    chunkSizeWarningLimit: 600,
    
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        passes: 2
      }
    },
    
    // Source maps for debugging (disable in production for smaller builds)
    sourcemap: false,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ],
    exclude: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'pdf-lib',
      'html2canvas'
    ]
  }
});
