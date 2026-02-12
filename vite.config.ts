import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // base path for GitHub Pages — matches the repo name
  base: '/digital-bouquet/',
  server: {
    // Allow ngrok tunnel hostname during development
    allowedHosts: ['.ngrok-free.dev'],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      include: [
        'src/utils/**',
        'src/features/share/**',
        'src/features/builder/PlacementEngine.ts',
        'src/data/flowers.ts',
      ],
    },
  },
});
