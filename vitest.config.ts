import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const resolvePath = (...segments: string[]) => path.resolve(repoRoot, ...segments);

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@app': resolvePath('apps', 'web', 'src'),
      '@config': resolvePath('packages', 'config', 'src'),
      '@domain': resolvePath('packages', 'domain', 'src'),
      '@ui': resolvePath('packages', 'ui', 'src'),
      '@validation': resolvePath('packages', 'validation', 'src'),
    },
  },
});