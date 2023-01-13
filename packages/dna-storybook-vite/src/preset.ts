import type { StorybookConfig } from '@storybook/builder-vite';
import dnaPlugin from '@chialab/dna-manifest-analyzer-plugin';
import customElementsManifestPlugin from './plugins/CustomElementsManifest';

export const core: StorybookConfig['core'] = {
    builder: '@storybook/builder-vite',
    renderer: '@chialab/dna-storybook-renderer',
};


export const viteFinal: StorybookConfig['viteFinal'] = async (config) => {
    const { plugins = [] } = config;

    // Add custom elements manifest plugin
    plugins.push(customElementsManifestPlugin({
        renderer: '@chialab/dna-storybook-renderer',
        plugins: [
            dnaPlugin(),
        ],
    }));

    return config;
};
