import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['axion/scripts/**/*.ts'],
      exclude: ['**/node_modules/**', '**/*.test.ts']
    },
    reporters: ['verbose'],
    isolate: false,
    fileParallelism: false
  },
  resolve: {
    alias: {
      '@axion': path.resolve(__dirname, './axion'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});
