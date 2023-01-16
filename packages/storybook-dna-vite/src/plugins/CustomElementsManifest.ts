import type { Plugin } from 'vite';
import type { Plugin as AnalyzerPlugin } from '@custom-elements-manifest/analyzer';
import type { Package, CustomElementDeclaration } from 'custom-elements-manifest/schema';
import type * as tsModule from '@custom-elements-manifest/analyzer/node_modules/typescript';
import { createFilter } from '@rollup/pluginutils';
import { ts, create } from '@custom-elements-manifest/analyzer/index.js';
import MagicString from 'magic-string';

declare module '@custom-elements-manifest/analyzer/index.js' {
    export const ts: typeof tsModule;
    export const create: (data: { modules: tsModule.SourceFile[]; plugins?: Plugin[] }) => Package;
}

export interface CustomElementsManifestOptions {
    include?: string | RegExp | string[] | RegExp[];
    exclude?: string | RegExp | string[] | RegExp[];
    renderer: string;
    plugins?: AnalyzerPlugin[];
}

export default function customElementsManifestPlugin(options: CustomElementsManifestOptions): Plugin {
    const filter = createFilter(
        options.include || /\.(m?ts|[jt]sx)$/,
        options.exclude
    );

    return {
        name: 'vite:storybook-cem',

        enforce: 'pre',

        transform(code: string, id: string) {
            if (!filter(id)) {
                return;
            }

            const modules = [
                ts.createSourceFile(id, code, ts.ScriptTarget.ESNext, true),
            ];

            const customElementsManifest = create({
                modules,
                plugins: options.plugins,
            });

            if (!customElementsManifest.modules) {
                return;
            }

            const declarations = customElementsManifest.modules
                .map((mod) => mod.declarations ?? [])
                .flat();

            if (declarations.length === 0) {
                return;
            }

            (declarations
                .filter((decl) =>
                    (decl as CustomElementDeclaration).customElement &&
                    (decl as CustomElementDeclaration).attributes &&
                    (decl as CustomElementDeclaration).members
                ) as CustomElementDeclaration[])
                .forEach((decl) => {
                    decl.attributes?.forEach(
                        (attr) => {
                            const member = decl.members?.find(
                                /** @param {*} m */
                                (m) => m.name === attr.fieldName
                            );
                            if (!member) {
                                return member;
                            }

                            attr.name += ' ';
                            attr.description = `🔗 **${member.name}**`;
                            attr.type = undefined;
                            attr.default = undefined;
                        }
                    );
                });

            const output = new MagicString(code);
            output.prepend(`import * as __STORYBOOK_WEB_COMPONENTS__ from '${options.renderer}';\n`);
            output.append(`\n;(function() {
    const { getCustomElementsManifest, setCustomElementsManifest, mergeCustomElementsManifests } = __STORYBOOK_WEB_COMPONENTS__;
    if (!setCustomElementsManifest) {
        console.debug('Custom Element Manifest is not supported by this version of Storybook.');
        return;
    }

    const customElementManifest = ${JSON.stringify(customElementsManifest)};
    const globalCustomElementsManifest = getCustomElementsManifest() || {};
    setCustomElementsManifest(mergeCustomElementsManifests(globalCustomElementsManifest, customElementManifest));
}());`);

            return {
                code: output.toString(),
                map: output.generateMap(),
            };
        },
    };
}
