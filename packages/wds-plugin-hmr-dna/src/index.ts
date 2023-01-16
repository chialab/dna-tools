import { type Plugin } from '@web/dev-server-core';
import { hmrPlugin as createBaseHmrPlugin } from '@web/dev-server-hmr';
import MagicString from 'magic-string';

/**
 * Check if module body contains DNA component definitions.
 * @param body The file contents.
 */
function containsComponent(body: string) {
    const matches = body.match(/import\s*\{([^}]*)\}\s*from\s*['|"]@chialab\/dna['|"]/g);
    if (!matches) {
        return false;
    }

    const specs = matches
        .map((importMatch) => {
            const match = importMatch.match(/import\s*\{([^}]*)\}\s*from\s*['|"]@chialab\/dna['|"]/);
            if (match) {
                return match[1];
            }
            return [];
        })
        .flat()
        .map((match) => match.split(','))
        .flat()
        .map((match) => match.trim());

    if (specs.includes('customElement') && body.includes('customElement(')) {
        return true;
    }

    if (specs.includes('customElements') && body.includes('customElements.define(')) {
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
            if (!args.config.plugins || args.config.plugins.find(pl => pl.name === 'hmr')) {
                throw new Error(
                    '[@chialab/wds-plugin-hmr-dna] Cannot include both @web/dev-server-hmr and @chialab/wds-plugin-hmr-dna plugins.'
                );
            }

            return baseHmrPlugin.serverStart && baseHmrPlugin.serverStart(args);
        },

        async serverStop() {
            return baseHmrPlugin.serverStop && baseHmrPlugin.serverStop();
        },

        resolveImport(args) {
            return baseHmrPlugin.resolveImport && baseHmrPlugin.resolveImport(args);
        },

        serve(context) {
            return baseHmrPlugin.serve && baseHmrPlugin.serve(context);
        },

        async transform(context) {
            const body = context.body as string;
            if (context.response.is('js') && containsComponent(body)) {
                const output = new MagicString(body);
                output.prepend('import \'@chialab/hmr-dna\';');
                output.append('if (import.meta.hot) { import.meta.hot.accept(); }');

                context.body = `${output.toString()}\n//# sourceMappingURL=${output.generateMap().toUrl()}`;
            }

            return baseHmrPlugin.transform && baseHmrPlugin.transform(context);
        },

        transformCacheKey(context) {
            return baseHmrPlugin.transformCacheKey && baseHmrPlugin.transformCacheKey(context);
        },

        transformImport(args) {
            return baseHmrPlugin.transformImport && baseHmrPlugin.transformImport(args);
        },
    };
}
