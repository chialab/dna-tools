import type { Context } from '@custom-elements-manifest/analyzer';
import type {
    Decorator,
    GetAccessorDeclaration,
    Modifier,
    Node,
    ObjectLiteralExpression,
    PropertyDeclaration,
    SyntaxKind,
} from '@custom-elements-manifest/analyzer/node_modules/typescript';
import type typescript from '@custom-elements-manifest/analyzer/node_modules/typescript';
import type { Attribute, ClassField, CustomElement, JavaScriptModule } from 'custom-elements-manifest/schema';

type TypeScriptModule = typeof typescript &
    Partial<{
        canHaveModifiers(node: Node): boolean;
        getModifiers(node: Node): readonly Modifier[] | undefined;
        canHaveDecorators(node: Node): boolean;
        getDecorators(node: Node): readonly Decorator[] | undefined;
    }>;

/**
 * Check if node has a specific keyword.
 * @param ts Typescript module instance.
 * @param node The AST node.
 * @param keyword The keyword code to check for.
 * @returns True if the node has the keyword.
 */
export function hasKeyword(ts: TypeScriptModule, node: Node, keyword: SyntaxKind) {
    if (typeof ts.getModifiers !== 'function' || typeof ts.canHaveModifiers !== 'function') {
        return node.modifiers?.some((mod) => mod.kind === keyword) ?? false;
    }
    if (!ts.canHaveModifiers(node)) {
        return false;
    }
    return ts.getModifiers(node)?.some((mod) => mod.kind === keyword) ?? false;
}

/**
 * Get the proper decorator expression.
 * @param decorator The decorator AST node.
 * @returns The decorator expression.
 */
export function getDecoratorExpression(decorator: Decorator) {
    return decorator.expression;
}

/**
 * Get decorator call expression arguments.
 * @param ts Typescript module instance.
 * @param decorator The decorator AST node.
 * @returns The decorator call expression arguments.
 */
export function getDecoratorArguments(ts: TypeScriptModule, decorator: Decorator) {
    const expression = decorator.expression;
    if (!ts.isCallExpression(expression)) {
        return [];
    }

    return [...(expression?.arguments ?? [])];
}

/**
 * Get class/method/property decorator by name.
 * @param ts Typescript module instance.
 * @param node The AST node.
 * @param name The decorator name.
 * @returns The decorator AST node.
 */
export function getDecorator(ts: TypeScriptModule, node: Node, name: string): Decorator | null {
    const decorators =
        typeof ts.getDecorators === 'function' && typeof ts.canHaveDecorators === 'function'
            ? ts.canHaveDecorators(node) && ts.getDecorators(node)
            : node.decorators;

    if (!decorators) {
        return null;
    }

    return (
        decorators.find((decorator) => {
            if (!decorator) {
                return;
            }
            if (ts.isCallExpression(decorator.expression)) {
                return decorator.expression.expression.getText() === name;
            }
            return decorator.expression?.getText() === name;
        }) ?? null
    );
}

/**
 * Check if property has an attribute.
 * @param ts Typescript module instance.
 * @param node The property descriptor object AST node.
 * @returns True if the property has an attribute field.
 */
export function hasAttribute(ts: TypeScriptModule, node: ObjectLiteralExpression) {
    const properties = node.properties;
    if (!properties) {
        return false;
    }

    for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        if (!ts.isPropertyAssignment(property)) {
            continue;
        }

        if (property.name.getText() === 'attribute') {
            if (property.initializer.kind === ts.SyntaxKind.StringLiteral) {
                return true;
            } else if (property.initializer.kind === ts.SyntaxKind.TrueKeyword) {
                return true;
            }

            return false;
        }
    }
    return false;
}

/**
 * Check if property is a state property.
 * @param ts Typescript module instance.
 * @param node The property descriptor object AST node.
 * @returns True if the property is a state property field.
 */
export function isState(ts: TypeScriptModule, node: ObjectLiteralExpression) {
    const properties = node.properties;
    if (!properties) {
        return false;
    }

    for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        if (!ts.isPropertyAssignment(property)) {
            continue;
        }

        if (property.name.getText() === 'state') {
            if (property.initializer.kind === ts.SyntaxKind.TrueKeyword) {
                return true;
            }

            return false;
        }
    }
    return false;
}

/**
 * Get attribute name from property decorator options.
 * @param ts Typescript module instance.
 * @param node The property descriptor object AST node.
 * @returns The attribute name.
 */
export function getAttributeName(ts: TypeScriptModule, node: ObjectLiteralExpression): string | null {
    const properties = node.properties;
    if (!properties) {
        return null;
    }

    for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        if (!ts.isPropertyAssignment(property)) {
            continue;
        }
        if (property.name.getText() === 'attribute') {
            if (ts.isStringLiteral(property.initializer)) {
                return property.initializer.text;
            }

            return null;
        }
    }
    return null;
}

/**
 * Get property declarations from static properties getter.
 * @param ts Typescript module instance.
 * @param node The property getter AST node.
 * @returns The property descriptor object AST node.
 */
export function getPropertiesObject(
    ts: TypeScriptModule,
    node: GetAccessorDeclaration | PropertyDeclaration
): ObjectLiteralExpression | null {
    const exp = ts.isGetAccessor(node)
        ? node.body?.statements?.find(ts.isReturnStatement)?.expression
        : node.initializer;

    if (exp && ts.isObjectLiteralExpression(exp)) {
        return exp;
    }

    return null;
}

/**
 * Convert field to attribute.
 * @param field The field name.
 * @param attrName The attribute name.
 * @returns The manifest attribute.
 */
export function createAttributeFromField(field: ClassField, attrName: string): Attribute {
    return {
        name: attrName,
        fieldName: field.name,
        summary: field.summary,
        description: field.description,
        type: field.type,
        default: field.default,
    };
}

/**
 * Get module by name.
 * @param moduleDoc The module documentation.
 * @param context The analyzer context.
 * @param name The module name.
 * @returns Module info.
 */
export function resolveModuleOrPackageSpecifier(moduleDoc: Partial<JavaScriptModule>, context: Context, name: string) {
    const imports = (context?.imports ?? []) as {
        name: string;
        isBareModuleSpecifier: boolean;
        importPath: string;
    }[];
    const foundImport = imports.find((_import) => _import.name === name);
    if (foundImport) {
        if (foundImport.isBareModuleSpecifier) {
            return { package: foundImport.importPath };
        }
        return { module: new URL(foundImport.importPath, `file:///${moduleDoc.path}`).pathname };
    }
    return { module: moduleDoc.path };
}

/**
 * Get class declaration by name.
 * @param moduleDoc The module documentation.
 * @param className The class name.
 * @returns The custom element definition.
 */
export function getClassDeclaration(moduleDoc: Partial<JavaScriptModule>, className: string): CustomElement | null {
    if (!moduleDoc.declarations) {
        return null;
    }
    return (moduleDoc.declarations.find((declaration) => declaration.name === className) as CustomElement) ?? null;
}
