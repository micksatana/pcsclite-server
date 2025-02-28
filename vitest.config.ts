import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'esnext',
  },
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts', 'src/dev.ts', 'src/entities/**/*.ts'],
      reporter: ['lcov', 'json', 'json-summary'],
    },
  },
  resolve: {
    conditions: ['development', 'module'],
  },
});
