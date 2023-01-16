import type { StorybookConfig } from '@storybook/builder-vite';
import { dnaPlugins } from '@chialab/manifest-analyzer-dna-plugin';
import { mergeConfig } from 'vite';
import customElementsManifestPlugin from './plugins/CustomElementsManifest';

export const core: StorybookConfig['core'] = {
    builder: '@storybook/builder-vite',
    renderer: '@chialab/storybook-dna',
};

export const viteFinal: StorybookConfig['viteFinal'] = async (config) => (
    mergeConfig(config, {
        optimizeDeps: {
            exclude: ['@chialab/storybook-dna'],
            include: [
                '@storybook/docs-tools',
                '@storybook/preview-api',
                'ts-dedent',
            ],
        },
        plugins: [
            customElementsManifestPlugin({
                renderer: '@chialab/storybook-dna',
                plugins: [
                    ...dnaPlugins(),
                ],
            }),
        ],
    })
);