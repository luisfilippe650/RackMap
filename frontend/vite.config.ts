import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/v1': 'http://localhost:3333',
      '/health': 'http://localhost:3333'
    }
  },
  build: {
    outDir: '../dist/frontend',
    emptyOutDir: true
  }
});
