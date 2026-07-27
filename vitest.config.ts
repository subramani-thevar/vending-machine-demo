import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,pbt}.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/server/**/*.ts'],
    },
    reporters: ['verbose'],
    seed: process.env.VITEST_SEED ? Number(process.env.VITEST_SEED) : undefined,
  },
});
