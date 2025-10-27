import MagicString from 'magic-string';
import { type Plugin, mergeConfig } from 'vite';

/**
 * Check if module body contains DNA component definitions.
 * @param body The file contents.
 */
function containsComponent(body: string) {
    if (body.includes('customElement(')) {
        return true;
    }

    if (body.includes('customElements.define(')) {
        return true;
    }

    return false;
}

export function hmrPlugin(): Plugin {
    return {
        name: 'hmr-dna',

        config(config) {
            return mergeConfig(config, {
                optimizeDeps: {
                    include: ['@chialab/hmr-dna'],
                },
            });
        },

        transform(body, id) {
            if (!containsComponent(body) || id.includes('/node_modules/')) {
                return;
            }

            const output = new MagicString(body);
            output.prepend("import '@chialab/hmr-dna';");
            output.append('if (import.meta.hot) { import.meta.hot.accept(); }');

            return {
                code: output.toString(),
                map: output.generateMap(),
            };
        },
    };
}
