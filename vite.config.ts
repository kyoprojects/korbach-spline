import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Custom plugin to handle MIME types
const fixMimeTypes = () => {
  return {
    name: 'fix-mime-types',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.endsWith('.tsx')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), fixMimeTypes()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
});
