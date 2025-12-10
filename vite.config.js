import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 8888,
    strictPort: true,
    host: '0.0.0.0',
    hmr: {
      host: '10.26.30.67',
      port: 8888
    }
  }
});