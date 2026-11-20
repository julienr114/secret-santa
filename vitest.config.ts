import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Unit tests sit next to the code they cover (server/utils/draw.test.js).
// Route tests live in tests/api.
export default defineConfig({
  // Same aliases as Nuxt, so tests import the way the app does.
  resolve: {
    alias: {
      '#server': root('./server'),
      '#shared': root('./shared'),
      '~~': root('.'),
      '~': root('./app'),
    },
  },
  test: {
    environment: 'node',
    include: [
      'app/**/*.test.ts',
      'server/**/*.test.ts',
      'shared/**/*.test.ts',
      'tests/**/*.test.ts',
      'scripts/**/*.test.ts',
    ],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['server/utils/**/*.ts', 'shared/**/*.ts'],
      exclude: ['**/*.test.ts'],
      reporter: ['text', 'html'],
    },
  },
});
