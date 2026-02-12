import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // base path for GitHub Pages — matches the repo name
  base: '/digital-bouquet/',
  plugins: [
    react(),
    tailwindcss(),
  ],
});
