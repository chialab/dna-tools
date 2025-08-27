import type { Plugin } from '@custom-elements-manifest/analyzer';
import type { ClassDeclaration, ClassElement, JSDoc } from 'typescript';
import {
    getClassDeclaration,
    getDecorator,
    getDecoratorArguments,
    hasKeyword,
} from './utils';

/**
 * A plugin that that detects `fires` decorator usage.
 * @returns An analyzer plugin.
 */
export function firesDecorator(): Plugin {
    return {
        name: 'DNA-FIRES-DECORATOR',
        analyzePhase({ ts, node, moduleDoc }) {
            if (!ts.isClassDeclaration(node)) {
                return;
            }

            if (!node.members || !node.name) {
                return;
            }

            const hasDefaultModifier = hasKeyword(
                ts,
                node,
                ts.SyntaxKind.DefaultKeyword
            );
            const className = hasDefaultModifier
                ? 'default'
                : node.name.getText();
            const currClass = getClassDeclaration(moduleDoc, className);
            if (!currClass) {
                return;
            }

            node.members.forEach((member) => {
                if (
                    !member.name ||
                    hasKeyword(ts, member, ts.SyntaxKind.StaticKeyword) ||
                    (!ts.isPropertyDeclaration(member) &&
                        !ts.isGetAccessor(member))
                ) {
                    return;
                }

                const parent = member.parent as ClassDeclaration;
                const memberName = member.name.getText();
                const accessorMembers =
                    parent.members?.filter(
                        (m) => m.name && m.name.getText() === memberName
                    ) ?? [];
                const firesDecorator = accessorMembers
                    .map((m) => getDecorator(ts, m, 'fires'))
                    .filter(Boolean)[0];
                if (!firesDecorator) {
                    return;
                }

                const decoratorArguments = getDecoratorArguments(
                    ts,
                    firesDecorator
                );

                const eventName =
                    decoratorArguments.length &&
                    ts.isStringLiteral(decoratorArguments[0])
                        ? decoratorArguments[0].text
                        : ts.isIdentifier(member.name) ||
                            ts.isStringLiteral(member.name)
                          ? member.name.text.replace(/^on/, '')
                          : null;
                if (!eventName) {
                    return;
                }

                currClass.events = currClass.events || [];

                let type = 'Event';
                if (
                    member.type &&
                    ts.isTypeReferenceNode(member.type) &&
                    ts.isIdentifier(member.type.typeName) &&
                    member.type.typeName.text === 'EventHandler' &&
                    member.type.typeArguments?.length
                ) {
                    type = member.type.typeArguments[0].getText();
                }

                const comment =
                    (member as ClassElement & { jsDoc?: JSDoc[] }).jsDoc?.[0]
                        ?.comment ?? '';
                const description =
                    typeof comment === 'string' ? comment : comment.join(' ');

                currClass.events.push({
                    name: eventName,
                    type: {
                        text: type,
                    },
                    description: [description, `\`${type}\``]
                        .filter(Boolean)
                        .join('\n\n'),
                });
            });
        },
    };
}
