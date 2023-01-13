import esbuild from 'esbuild';

// dna-storybook-renderer

esbuild.build({
    entryPoints: [
        './packages/dna-storybook-renderer/src/index.ts',
        './packages/dna-storybook-renderer/src/config.ts',
    ],
    target: 'node16',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outdir: './packages/dna-storybook-renderer/dist',
    packages: 'external',
});

esbuild.build({
    entryPoints: [
        './packages/dna-storybook-renderer/src/index.ts',
        './packages/dna-storybook-renderer/src/config.ts',
    ],
    outExtension: {
        '.js': '.mjs',
    },
    target: 'chrome100',
    bundle: true,
    splitting: true,
    platform: 'browser',
    format: 'esm',
    outdir: './packages/dna-storybook-renderer/dist',
    packages: 'external',
});

// dna-storybook-vite

esbuild.build({
    entryPoints: [
        './packages/dna-storybook-vite/src/index.ts',
        './packages/dna-storybook-vite/src/preset.ts',
    ],
    target: 'node16',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outdir: './packages/dna-storybook-vite/dist',
    packages: 'external',
});

esbuild.build({
    entryPoints: [
        './packages/dna-storybook-vite/src/index.ts',
        './packages/dna-storybook-vite/src/preset.ts',
    ],
    outExtension: {
        '.js': '.mjs',
    },
    target: 'node16',
    bundle: true,
    platform: 'node',
    format: 'esm',
    outdir: './packages/dna-storybook-vite/dist',
    packages: 'external',
});
