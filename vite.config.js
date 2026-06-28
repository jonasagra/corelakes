import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    // dev: encaminha /api para o `vercel dev` (porta 3001). Não afeta build/prod.
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: false },
    },
  }
})
