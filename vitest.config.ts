import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    alias: {
      // The published @wyre-technology/node-rootly package has no dist/ files.
      // Use our fetch-based stub that works with MSW for tests.
      '@wyre-technology/node-rootly': resolve(__dirname, 'src/client.worker-stub.ts'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/http.ts', 'src/worker.ts'],
    },
  },
});
