import type { Plugin } from '@web/dev-server-core';
import { hmrPlugin as createBaseHmrPlugin } from '@web/dev-server-hmr';
import MagicString from 'magic-string';

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

/**
 * Create a server plugin that injects @chialab/hmr-dna module.
 * @returns A web dev server plugin.
 */
export function hmrPlugin(): Plugin {
    const baseHmrPlugin = createBaseHmrPlugin();

    return {
        name: 'hmr-dna',

        async serverStart(args) {
            if (
                !args.config.plugins ||
                args.config.plugins.find((pl) => pl.name === 'hmr')
            ) {
                throw new Error(
                    '[@chialab/wds-plugin-hmr-dna] Cannot include both @web/dev-server-hmr and @chialab/wds-plugin-hmr-dna plugins.'
                );
            }

            return baseHmrPlugin.serverStart?.(args);
        },

        async serverStop() {
            return baseHmrPlugin.serverStop?.();
        },

        resolveImport(args) {
            return baseHmrPlugin.resolveImport?.(args);
        },

        serve(context) {
            return baseHmrPlugin.serve?.(context);
        },

        async transform(context) {
            const body = context.body as string;
            if (context.response.is('js') && containsComponent(body)) {
                const output = new MagicString(body);
                output.prepend("import '@chialab/hmr-dna';");
                output.append(
                    'if (import.meta.hot) { import.meta.hot.accept(); }'
                );

                context.body = `${output.toString()}\n//# sourceMappingURL=${output.generateMap().toUrl()}`;
            }

            return baseHmrPlugin.transform?.(context);
        },

        transformCacheKey(context) {
            return baseHmrPlugin.transformCacheKey?.(context);
        },

        transformImport(args) {
            return baseHmrPlugin.transformImport?.(args);
        },
    };
}
