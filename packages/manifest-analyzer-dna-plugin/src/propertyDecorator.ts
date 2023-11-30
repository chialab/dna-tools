import type { Plugin } from '@custom-elements-manifest/analyzer';
import type { ClassDeclaration } from '@custom-elements-manifest/analyzer/node_modules/typescript';
import {
    createAttributeFromField,
    getAttributeName,
    getClassDeclaration,
    getDecorator,
    getDecoratorArguments,
    hasAttribute,
    hasKeyword,
} from './utils';

/**
 * A plugin that that detects `property` decorator usage.
 * @returns An analyzer plugin.
 */
export function propertyDecorator(): Plugin {
    return {
        name: 'DNA-PROPERTY-DECORATOR',
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
                    hasKeyword(ts, member, ts.SyntaxKind.StaticKeyword) ||
                    (!ts.isPropertyDeclaration(member) && !ts.isGetAccessor(member))
                ) {
                    return;
                }

                const parent = member.parent as ClassDeclaration;
                const memberName = member.name.getText();
                const accessorMembers = parent.members?.filter((m) => m.name && m.name.getText() === memberName) ?? [];
                const propDecorator = accessorMembers.map((m) => getDecorator(ts, m, 'property')).filter(Boolean)[0];
                const stateDecorator = accessorMembers.map((m) => getDecorator(ts, m, 'state')).filter(Boolean)[0];
                const actualDecorator = propDecorator || stateDecorator;
                const field = currClass.members?.find((classMember) => classMember.name === memberName);
                if (!field) {
                    return;
                }

                if (!actualDecorator) {
                    if (currClass.members) {
                        const index = currClass.members.indexOf(field);
                        if (index !== -1) {
                            currClass.members.splice(index, 1);
                        }
                    }
                    return;
                }

                if (stateDecorator) {
                    field.privacy = 'protected';
                }

                const actualDecoratorArguments = getDecoratorArguments(ts, actualDecorator);
                const propertyOptions = actualDecoratorArguments.find((arg) => ts.isObjectLiteralExpression(arg));
                if (
                    !propertyOptions ||
                    !ts.isObjectLiteralExpression(propertyOptions) ||
                    !hasAttribute(ts, propertyOptions)
                ) {
                    return;
                }

                if (field.kind !== 'field') {
                    return;
                }

                const attribute = createAttributeFromField(field, getAttributeName(ts, propertyOptions) || memberName);
                const existingAttribute = currClass.attributes?.find((attr) => attr.name === attribute.name);
                if (!existingAttribute) {
                    currClass.attributes = [...(currClass.attributes || []), attribute];
                } else {
                    currClass.attributes = currClass.attributes?.map((attr) =>
                        attr.name === attribute.name ? { ...attr, ...attribute } : attr
                    );
                }
            });
        },
    };
}
