import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const backendProxyTarget = process.env.BACKEND_PROXY_TARGET ?? 'http://localhost:3333';

export default defineConfig({
  root: 'frontend',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/v1': backendProxyTarget,
      '/health': backendProxyTarget
    }
  },
  build: {
    outDir: '../dist/frontend',
    emptyOutDir: true
  }
});
