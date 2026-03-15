import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

const versionData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'public/version.json'), 'utf-8'),
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/gridrival-showcase/',
  define: {
    __APP_VERSION__: JSON.stringify(versionData.version),
    __BUILD_TIME__: JSON.stringify(versionData.buildTime),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
});
