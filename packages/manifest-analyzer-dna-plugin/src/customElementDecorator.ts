import type { Plugin } from '@custom-elements-manifest/analyzer';
import { getDecorator, resolveModuleOrPackageSpecifier, getDecoratorArguments } from './utils';

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

            const className = node.name.getText();
            let builtinTagName: string | undefined = undefined;

            const customElementDecorator = getDecorator(ts, node, 'customElement');
            if (!customElementDecorator) {
                return;
            }

            const [nameArgument, optionsArgument] = getDecoratorArguments(ts, customElementDecorator);
            if (!ts.isStringLiteral(nameArgument)) {
                return;
            }

            if (optionsArgument && ts.isObjectLiteralExpression(optionsArgument)) {
                const extendsProp = optionsArgument.properties.find(
                    (property) => ts.isPropertyAssignment(property) && property.name.getText() === 'extends'
                );
                if (extendsProp && ts.isPropertyAssignment(extendsProp)) {
                    const initializer = extendsProp.initializer;
                    builtinTagName = initializer.getText().replace(/['"]/g, '');
                }
            }

            if (builtinTagName) {
                moduleDoc.declarations = (moduleDoc.declarations || []).map((decl) => {
                    if (decl.kind !== 'class') {
                        return decl;
                    }

                    if (decl.name !== className) {
                        return decl;
                    }

                    return {
                        ...decl,
                        builtin: builtinTagName,
                    };
                });
            }

            moduleDoc.exports = [
                ...(moduleDoc.exports || []),
                {
                    kind: 'custom-element-definition',
                    name: nameArgument.text,
                    declaration: {
                        name: className,
                        ...resolveModuleOrPackageSpecifier(moduleDoc, context, node.getText()),
                    },
                },
            ];
        },
    };
}
