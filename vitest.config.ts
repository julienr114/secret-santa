import { defineConfig } from 'vitest/config';

// Unit tests sit next to the code they cover (server/utils/draw.test.js).
// Route tests live in tests/api.
export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'server/**/*.test.js',
      'shared/**/*.test.js',
      'tests/**/*.test.js',
    ],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['server/utils/**/*.ts', 'shared/**/*.ts'],
      exclude: ['**/*.test.ts'],
      reporter: ['text', 'html'],
    },
  },
});
