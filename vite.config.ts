import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Expose env variables to the client
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate React and React DOM into their own chunk
            'react-vendor': ['react', 'react-dom'],
            // Separate markdown libraries into their own chunk
            'markdown-vendor': ['react-markdown', 'remark-gfm'],
            // Separate UI libraries
            'ui-vendor': ['lucide-react', '@radix-ui/react-label', '@radix-ui/react-slot'],
            // Separate form libraries
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            // Separate Auth0
            'auth-vendor': ['@auth0/auth0-react'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Use default minification (esbuild)
      minify: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@tailwindcss/typography'], // Exclude unused typography plugin
    },
  }
})
