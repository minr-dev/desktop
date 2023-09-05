import { resolve } from 'path';
import dotenv from 'dotenv';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

const envPath = '.env';
dotenv.config({ path: envPath, debug: true });

const DEFAULT_MINR_SERVER_URL = process.env.DEFAULT_MINR_SERVER_URL || 'http://127.0.0.1:5000';
console.log(`DEFAULT_MINR_SERVER_URL: ${DEFAULT_MINR_SERVER_URL}`);

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@shared': resolve('src/shared'),
      },
    },
    define: {
      DEFAULT_MINR_SERVER_URL: JSON.stringify(DEFAULT_MINR_SERVER_URL),
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared'),
      },
    },
    plugins: [react()],
  },
});
