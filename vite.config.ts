import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Concept demo: static SPA, no backend, no secrets, relative base for static hosting.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', sourcemap: true },
});
