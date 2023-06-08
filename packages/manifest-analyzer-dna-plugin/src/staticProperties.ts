import type { Plugin } from '@custom-elements-manifest/analyzer';
import type { ClassField } from 'custom-elements-manifest/schema';
import {
    hasAttribute,
    getClassDeclaration,
    getAttributeName,
    getPropertiesObject,
    createAttributeFromField,
    hasKeyword,
    isState,
} from './utils';

/**
 * A plugin that collects static properties.
 * An analyzer plugin.
 */
export function staticProperties(): Plugin {
    return {
        name: 'DNA-STATIC-PROPERTIES',
        analyzePhase({ ts, node, moduleDoc }) {
            if (!ts.isClassDeclaration(node)) {
                return;
            }

            if (!node.members || !node.name) {
                return;
            }

            const hasDefaultModifier = hasKeyword(ts, node, ts.SyntaxKind.DefaultKeyword);
            const className = hasDefaultModifier ? 'default' : node.name.getText();
            const currClass = getClassDeclaration(moduleDoc, className);
            if (!currClass) {
                return;
            }

            node.members.forEach((member) => {
                if (
                    !member.name ||
                    !hasKeyword(ts, member, ts.SyntaxKind.StaticKeyword) ||
                    (!ts.isPropertyDeclaration(member) && !ts.isGetAccessor(member)) ||
                    member.name.getText() !== 'properties'
                ) {
                    return;
                }

                const properties = getPropertiesObject(ts, member)?.properties;
                if (!properties) {
                    return;
                }

                properties.forEach((property) => {
                    if (!ts.isPropertyAssignment(property) || !property.name) {
                        return;
                    }

                    const initializer = property.initializer;
                    if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
                        return;
                    }

                    const classMember: ClassField = {
                        kind: 'field',
                        name: property.name.getText(),
                        privacy: 'public',
                    };

                    if (hasAttribute(ts, initializer)) {
                        const attribute = createAttributeFromField(
                            classMember,
                            getAttributeName(ts, initializer) || property.name.getText()
                        );
                        currClass.attributes = [...(currClass.attributes || []), attribute];
                    }

                    if (isState(ts, initializer)) {
                        (classMember as ClassField & { state?: boolean }).state = true;
                    }

                    const existingField = currClass.members?.find((field) => field.name === classMember.name);
                    if (!existingField) {
                        currClass.members = [...(currClass.members || []), classMember];
                    } else {
                        currClass.members =
                            currClass.members?.map((field) =>
                                field.name === classMember.name ? { ...field, ...classMember } : field
                            ) ?? [];
                    }
                });
            });
        },
    };
}
