import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point imports from the library to the source for HMR
      'fc-react-rich-editor': path.resolve(__dirname, '../src/index.ts'),
    },
  },
});
