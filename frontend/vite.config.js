// Nota: vite.config.js fica na raiz do pacote frontend/ (não em src/),
// pois o Vite busca a config no diretório de onde é executado.
import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // HTML de entrada em public/, JS/CSS em src/
  root: '.',
  publicDir: 'public/assets',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Assets com hash no nome para cache busting imutável
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
      },
    },
    // Sourcemaps desabilitados em produção (não expor código-fonte)
    sourcemap: false,
    minify: 'esbuild',
  },

  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
      '/l': 'http://localhost:3000',
    },
  },

  preview: {
    port: 4173,
  },
});
