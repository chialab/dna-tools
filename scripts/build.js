import esbuild from 'esbuild';

// hmr-dna

esbuild.build({
    entryPoints: ['./packages/hmr-dna/src/index.ts'],
    target: 'chrome100',
    sourcemap: true,
    bundle: true,
    platform: 'browser',
    format: 'cjs',
    outdir: './packages/hmr-dna/dist',
    packages: 'external',
});

esbuild.build({
    entryPoints: ['./packages/hmr-dna/src/index.ts'],
    outExtension: {
        '.js': '.mjs',
    },
    target: 'chrome100',
    sourcemap: true,
    bundle: true,
    splitting: true,
    platform: 'browser',
    format: 'esm',
    outdir: './packages/hmr-dna/dist',
    packages: 'external',
});

// manifest-analyzer-dna-plugin

esbuild.build({
    entryPoints: ['./packages/manifest-analyzer-dna-plugin/src/index.ts'],
    target: 'node16',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outdir: './packages/manifest-analyzer-dna-plugin/dist',
    packages: 'external',
});

esbuild.build({
    entryPoints: ['./packages/manifest-analyzer-dna-plugin/src/index.ts'],
    outExtension: {
        '.js': '.mjs',
    },
    target: 'node16',
    bundle: true,
    splitting: true,
    platform: 'node',
    format: 'esm',
    outdir: './packages/manifest-analyzer-dna-plugin/dist',
    packages: 'external',
});

// storybook-dna

esbuild.build({
    entryPoints: ['./packages/storybook-dna/src/index.ts', './packages/storybook-dna/src/config.ts'],
    target: 'chrome100',
    bundle: true,
    platform: 'browser',
    format: 'cjs',
    outdir: './packages/storybook-dna/dist',
    packages: 'external',
});

esbuild.build({
    entryPoints: ['./packages/storybook-dna/src/index.ts', './packages/storybook-dna/src/config.ts'],
    outExtension: {
        '.js': '.mjs',
    },
    target: 'chrome100',
    bundle: true,
    splitting: true,
    platform: 'browser',
    format: 'esm',
    outdir: './packages/storybook-dna/dist',
    packages: 'external',
});

// storybook-dna-vite

esbuild.build({
    entryPoints: ['./packages/storybook-dna-vite/src/index.ts', './packages/storybook-dna-vite/src/preset.ts'],
    target: 'node16',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outdir: './packages/storybook-dna-vite/dist',
    packages: 'external',
});

esbuild.build({
    entryPoints: ['./packages/storybook-dna-vite/src/index.ts', './packages/storybook-dna-vite/src/preset.ts'],
    outExtension: {
        '.js': '.mjs',
    },
    target: 'node16',
    bundle: true,
    splitting: true,
    platform: 'node',
    format: 'esm',
    outdir: './packages/storybook-dna-vite/dist',
    packages: 'external',
});

// vite-plugin-hmr-dna

esbuild.build({
    entryPoints: ['./packages/vite-plugin-hmr-dna/src/index.ts'],
    target: 'node16',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outdir: './packages/vite-plugin-hmr-dna/dist',
    packages: 'external',
});

esbuild.build({
    entryPoints: ['./packages/vite-plugin-hmr-dna/src/index.ts'],
    outExtension: {
        '.js': '.mjs',
    },
    target: 'node16',
    bundle: true,
    splitting: true,
    platform: 'node',
    format: 'esm',
    outdir: './packages/vite-plugin-hmr-dna/dist',
    packages: 'external',
});

// wds-plugin-hmr-dna

esbuild.build({
    entryPoints: ['./packages/wds-plugin-hmr-dna/src/index.ts'],
    target: 'node16',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outdir: './packages/wds-plugin-hmr-dna/dist',
    packages: 'external',
});

esbuild.build({
    entryPoints: ['./packages/wds-plugin-hmr-dna/src/index.ts'],
    outExtension: {
        '.js': '.mjs',
    },
    target: 'node16',
    bundle: true,
    splitting: true,
    platform: 'node',
    format: 'esm',
    outdir: './packages/wds-plugin-hmr-dna/dist',
    packages: 'external',
});
