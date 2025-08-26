/// <reference types="vite/client" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    // Prevent Vite from watching generated output folders which can trigger
    // unnecessary HMR/full page reloads when e.g. a build or script writes files there.
    watch: {
      ignored: ['**/dist/**', '**/build/**', '**/.cache/**', '**/.git/**'],
    },
  },
  define: {
    // Add environment variable definitions if needed
  },
})
