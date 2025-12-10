import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: {
      host: '10.26.30.67',
      port: 3000
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
