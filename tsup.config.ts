import { defineConfig } from 'tsup';

export default defineConfig([
  // Node.js builds: stdio + HTTP transports
  {
    entry: {
      index: 'src/index.ts',
      http: 'src/http.ts',
    },
    format: ['esm'],
    target: 'node22',
    outDir: 'dist',
    clean: true,
    dts: true,
    sourcemap: true,
    banner: { js: '#!/usr/bin/env node' },
    external: ['@wyre-technology/node-rootly'],
  },
  // Cloudflare Worker build — bundle all deps, esnext target, browser runtime
  {
    entry: { worker: 'src/worker.ts' },
    format: ['esm'],
    target: 'esnext',
    platform: 'browser',
    outDir: 'dist',
    clean: false, // append to existing dist
    noExternal: [/.*/], // bundle everything — Workers can't use node_modules
    sourcemap: true,
    dts: false,
  },
]);
