import { dnaPlugins } from '@chialab/manifest-analyzer-dna-plugin';
import { create } from '@custom-elements-manifest/analyzer';
import type { CustomElementDeclaration, Declaration } from 'custom-elements-manifest';
import type { ClassDeclaration, TransformationContext, SourceFile, Statement } from 'typescript';

const isClassDeclaration = (decl: Statement): decl is ClassDeclaration => decl.kind === /* SyntaxKind.ClassDeclaration */ 260;

export default function dnaPlugin(ctx: TransformationContext) {
    const isCustomElementDeclaration = (decl: Declaration): decl is CustomElementDeclaration =>
        decl.kind === 'class' && (decl as CustomElementDeclaration).customElement;

    return (sourceFile: SourceFile) => {
        const originalSourceFile = 'original' in sourceFile ? (sourceFile.original as SourceFile) : sourceFile;
        const manifest = create({
            modules: [originalSourceFile],
            plugins: [...dnaPlugins()],
        });

        if (!manifest) {
            return sourceFile;
        }

        const modules = manifest.modules;
        if (!modules.length) {
            return sourceFile;
        }

        const customElements = modules.reduce(
            (acc, mod) => [...acc, ...(mod.declarations ?? []).filter(isCustomElementDeclaration)],
            [] as (CustomElementDeclaration & { builtin?: string })[]
        );

        // Add __properties__ and __extends__ declarations.
        const statements = sourceFile.statements.map((statement) => {
            if (!isClassDeclaration(statement)) {
                return statement;
            }

            const customElement = customElements.find((customElement) => customElement.name === statement.name?.getText());
            if (!customElement) {
                return statement;
            }

            const members = [
                ...statement.members,
            ];
            if (customElement.tagName) {
                members.push(
                    ctx.factory.createPropertyDeclaration(
                        undefined,
                        '__is__',
                        undefined,
                        ctx.factory.createLiteralTypeNode(
                            ctx.factory.createStringLiteral(customElement.tagName)
                        ),
                        undefined,
                    ),
                );
            }
            if (customElement.builtin) {
                members.push(
                    ctx.factory.createPropertyDeclaration(
                        undefined,
                        '__extends__',
                        undefined,
                        ctx.factory.createLiteralTypeNode(
                            ctx.factory.createStringLiteral(customElement.builtin)
                        ),
                        undefined,
                    ),
                );
            }
            if (customElement.members) {
                members.push(
                    ctx.factory.createPropertyDeclaration(
                        undefined,
                        '__properties__',
                        undefined,
                        ctx.factory.createTypeLiteralNode(
                            customElement.members.map((member) => {
                                const type = ('type' in member && member.type) ? ctx.factory.createTypeReferenceNode(member.type.text) : undefined;

                                return ctx.factory.createPropertySignature(
                                    undefined,
                                    ctx.factory.createStringLiteral(member.name),
                                    undefined,
                                    type,
                                );
                            })
                        ),
                        undefined,
                    ),
                );
            }

            return ctx.factory.updateClassDeclaration(
                statement,
                statement.modifiers,
                statement.name,
                statement.typeParameters,
                statement.heritageClauses,
                members,
            );
        });

        // Register IntrinsicElements
        const moduleDeclaration = ctx.factory.createModuleDeclaration(
            [ctx.factory.createModifier(/* SyntaxKind.DeclareKeyword */ 136)],
            ctx.factory.createStringLiteral('@chialab/dna'),
            ctx.factory.createModuleBlock([
                ctx.factory.createModuleDeclaration(
                    [],
                    ctx.factory.createIdentifier('JSX'),
                    ctx.factory.createModuleBlock([
                        ctx.factory.createInterfaceDeclaration(
                            [],
                            ctx.factory.createIdentifier('CustomElements'),
                            undefined,
                            undefined,
                            customElements.map((customElement) =>
                                ctx.factory.createPropertySignature(
                                    [],
                                    ctx.factory.createStringLiteral(customElement.tagName as string),
                                    undefined,
                                    ctx.factory.createTypeReferenceNode(
                                        ctx.factory.createIdentifier(customElement.name)
                                    )
                                )
                            )
                        ),
                    ]),
                    /* NodeFlags.Namespace */ 16
                ),
            ])
        );

        return ctx.factory.updateSourceFile(sourceFile, [
            ...statements,
            moduleDeclaration,
        ], true);
    };
}
