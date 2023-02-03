import type { PresetProperty } from '@storybook/types';
import type { StorybookConfig } from './types';
import { dnaPlugins } from '@chialab/manifest-analyzer-dna-plugin';
import { mergeConfig } from 'vite';
import remarkGfm from 'remark-gfm';
import customElementsManifestPlugin from './plugins/CustomElementsManifest';

export const core: PresetProperty<'core', StorybookConfig> = {
    builder: '@storybook/builder-vite',
    renderer: '@chialab/storybook-dna',
};

export const mdxLoaderOptions = {
    mdxCompileOptions: {
        remarkPlugins: [('default' in remarkGfm) ? remarkGfm.default : remarkGfm],
    },
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
