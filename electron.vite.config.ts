import { resolve } from 'path';
import dotenv from 'dotenv';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

const envPath = '.env';
dotenv.config({ path: envPath, debug: true });

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://127.0.0.1/callback';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
console.log(`GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}`);
console.log(`GOOGLE_REDIRECT_URI: ${GOOGLE_REDIRECT_URI}`);
console.log(`GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}`);

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@shared': resolve('src/shared'),
      },
    },
    define: {
      GOOGLE_CLIENT_ID: JSON.stringify(GOOGLE_CLIENT_ID),
      GOOGLE_REDIRECT_URI: JSON.stringify(GOOGLE_REDIRECT_URI),
      GITHUB_CLIENT_ID: JSON.stringify(GITHUB_CLIENT_ID),
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
