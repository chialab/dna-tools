import type { Plugin } from '@custom-elements-manifest/analyzer';
import { getDecorator, getDecoratorArguments, resolveModuleOrPackageSpecifier } from './utils';

/**
 * A plugin that detects `customElement` decorator usage.
 * @returns An analyzer plugin.
 */
export function customElementDecorator(): Plugin {
    return {
        name: 'DNA-CUSTOM-ELEMENT-DECORATOR',
        analyzePhase({ ts, node, moduleDoc, context }) {
            if (!ts.isClassDeclaration(node)) {
                return;
            }
            if (!node.name) {
                return;
            }

            const customElementDecorator = getDecorator(ts, node, 'customElement');
            if (!customElementDecorator) {
                return;
            }

            const argument = getDecoratorArguments(ts, customElementDecorator)[0];
            if (!ts.isStringLiteral(argument)) {
                return;
            }

            moduleDoc.exports = [
                ...(moduleDoc.exports || []),
                {
                    kind: 'custom-element-definition',
                    name: argument.text,
                    declaration: {
                        name: node.name.getText(),
                        ...resolveModuleOrPackageSpecifier(moduleDoc, context, node.getText()),
                    },
                },
            ];
        },
    };
}
