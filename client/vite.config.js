import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// During development, API calls to /api are forwarded to the Express server.
const apiTarget = process.env.VITE_API_PROXY || 'http://localhost:5000';
const proxy = { '/api': { target: apiTarget, changeOrigin: true } };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
  build: { outDir: 'dist', chunkSizeWarningLimit: 700 },
});
