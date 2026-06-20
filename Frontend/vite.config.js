import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/calendar': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/clients': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
