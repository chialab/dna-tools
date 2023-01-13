import type { Plugin } from 'vite';
import type { Plugin as AnalyzerPlugin } from '@custom-elements-manifest/analyzer';
import { createFilter } from '@rollup/pluginutils';
import ts from '@custom-elements-manifest/analyzer/node_modules/typescript';
import { create } from '@custom-elements-manifest/analyzer/src/create';
import MagicString from 'magic-string';

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

        transform(code: string, id: string) {
            if (!filter(id)) {
                return;
            }

            const modules = [
                ts.createSourceFile(id, code, ts.ScriptTarget.ESNext, true),
            ];

            const customElementsManifest = create({
                ...options,
                modules,
            });
            if (!customElementsManifest.modules) {
                return;
            }

            const declarations = customElementsManifest.modules
                .filter((mod) => mod.declarations)
                .reduce((acc, mod) => {
                    acc.push(...mod.declarations);
                    return acc;
                }, []);

            if (declarations.length === 0) {
                return;
            }

            declarations
                .filter((decl) => decl.customElement && decl.attributes && decl.members)
                .forEach((decl) => {
                    decl.attributes.forEach(
                        (attr) => {
                            const member = decl.members.find(
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
            output.prepend(`import * as __STORYBOOK_WEB_COMPONENTS__ from '${options.renderer}');\n`);
            output.append(`\n;(function() {
    const { getCustomElements, setCustomElementsManifest } = __STORYBOOK_WEB_COMPONENTS__;
    if (!setCustomElementsManifest) {
        console.debug('Custom Element Manifest is not supported by this version of Storybook.');
        return;
    }

    const CUSTOM_ELEMENT_JSON = ${JSON.stringify(customElementsManifest)};
    const CUSTOM_ELEMENTS_JSON = getCustomElements() || {};
    setCustomElementsManifest({
        ...CUSTOM_ELEMENTS_JSON,
        ...CUSTOM_ELEMENT_JSON,
        modules: [
            ...(CUSTOM_ELEMENTS_JSON.modules || []),
            ...(CUSTOM_ELEMENT_JSON.modules || []),
        ],
    });
}());`);

            return {
                code: output.toString(),
                map: output.generateMap(),
            };
        },
    };
}
