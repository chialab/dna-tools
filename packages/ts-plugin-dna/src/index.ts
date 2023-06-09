import { dnaPlugins } from '@chialab/manifest-analyzer-dna-plugin';
import { create } from '@custom-elements-manifest/analyzer';
import type { CustomElementDeclaration, Declaration } from 'custom-elements-manifest';
import type { TransformationContext, SourceFile } from 'typescript';

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
                                    customElement.builtin
                                        ? ctx.factory.createIntersectionTypeNode([
                                              ctx.factory.createTypeReferenceNode(
                                                  ctx.factory.createIdentifier(customElement.name)
                                              ),
                                              ctx.factory.createTypeLiteralNode([
                                                  ctx.factory.createPropertySignature(
                                                      [],
                                                      ctx.factory.createIdentifier('extends'),
                                                      undefined,
                                                      ctx.factory.createLiteralTypeNode(
                                                          ctx.factory.createStringLiteral(customElement.builtin)
                                                      )
                                                  ),
                                              ]),
                                          ])
                                        : ctx.factory.createTypeReferenceNode(
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

        return ctx.factory.updateSourceFile(sourceFile, [...sourceFile.statements, moduleDeclaration], true);
    };
}
