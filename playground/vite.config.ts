import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // GitHub project pages are served below /react-rich-text/.
  // Keep local development and preview available at the site root.
  base: process.env.GITHUB_PAGES === 'true' ? '/react-rich-text/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      // Point imports from the library to the source for HMR
      'fc-react-rich-editor': path.resolve(__dirname, '../src/index.ts'),
    },
  },
});
