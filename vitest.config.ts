import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        exclude: ['**/node_modules/**', '**/dist/**'],
        testTimeout: 20000,
        cache: false,
    },
    esbuild: {
        target: 'node16',
        format: 'esm',
    },
});
