import type { Plugin } from '@custom-elements-manifest/analyzer';
import type { CustomElementExport } from 'custom-elements-manifest';
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

            const [argument, options] = getDecoratorArguments(ts, customElementDecorator);
            if (!ts.isStringLiteral(argument)) {
                return;
            }

            let extend = undefined;
            if (options && ts.isObjectLiteralExpression(options)) {
                const properties = options.properties;
                if (properties) {
                    for (let i = 0; i < properties.length; i++) {
                        const property = properties[i];
                        if (!ts.isPropertyAssignment(property)) {
                            continue;
                        }
                        if (property.name.getText() !== 'extends') {
                            continue;
                        }
                        if (!ts.isStringLiteral(property.initializer)) {
                            break;
                        }
                        extend = property.initializer.text;
                        break;
                    }
                }
            }

            moduleDoc.exports = [
                ...(moduleDoc.exports || []),
                {
                    kind: 'custom-element-definition',
                    name: argument.text,
                    extend,
                    declaration: {
                        name: node.name.getText(),
                        ...resolveModuleOrPackageSpecifier(moduleDoc, context, node.getText()),
                    },
                } as unknown as CustomElementExport,
            ];
        },
    };
}
