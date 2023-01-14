import type { StorybookConfig } from '@storybook/builder-vite';
import { dnaPlugins } from '@chialab/dna-manifest-analyzer-plugin';
import { mergeConfig } from 'vite';
import customElementsManifestPlugin from './plugins/CustomElementsManifest';

export const core: StorybookConfig['core'] = {
    builder: '@storybook/builder-vite',
    renderer: '@chialab/dna-storybook-renderer',
};

export const viteFinal: StorybookConfig['viteFinal'] = async (config) => (
    mergeConfig(config, {
        optimizeDeps: {
            exclude: ['@chialab/dna-storybook-renderer'],
            include: [
                '@storybook/docs-tools',
                '@storybook/preview-api',
                'ts-dedent',
            ],
        },
        plugins: [
            customElementsManifestPlugin({
                renderer: '@chialab/dna-storybook-renderer',
                plugins: [
                    ...dnaPlugins(),
                ],
            }),
        ],
    })
);
