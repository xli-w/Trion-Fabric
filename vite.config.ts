import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const resolvePath = (...segments: string[]) => path.resolve(repoRoot, ...segments);

export default defineConfig({
  root: resolvePath('apps', 'web'),
  plugins: [react()],
  resolve: {
    alias: {
      '@app': resolvePath('apps', 'web', 'src'),
      '@config': resolvePath('packages', 'config', 'src'),
      '@domain': resolvePath('packages', 'domain', 'src'),
      '@ui': resolvePath('packages', 'ui', 'src'),
      '@validation': resolvePath('packages', 'validation', 'src'),
    },
  },
  build: {
    outDir: resolvePath('dist', 'web'),
    emptyOutDir: true,
  },
  server: {
    port: 4173,
  },
});