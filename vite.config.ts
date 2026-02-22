
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'esnext'
  }
});
