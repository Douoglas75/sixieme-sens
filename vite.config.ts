import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// SÉCURITÉ : aucune clé API n'est injectée dans le bundle client.
// GEMINI_API_KEY reste côté serveur (server.ts / api/index.ts).
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  build: { chunkSizeWarningLimit: 2000 },
  server: { hmr: process.env.DISABLE_HMR !== 'true' },
});
