import {
    Fragment,
    type Template,
    type VObject,
    getProperties,
    isComponentConstructor,
} from '@chialab/dna';
import { logger } from '@storybook/client-logger';
import { STORY_PREPARED } from '@storybook/core-events';
import { SNIPPET_RENDERED } from '@storybook/docs-tools';
import { addons, useEffect } from '@storybook/preview-api';
import type { PartialStoryFn, StoryContext } from '@storybook/types';
import type { DnaRenderer } from '../types';

function isObject(value: unknown): value is object {
    if (value === null) {
        return false;
    }
    if (typeof value === 'object') {
        return true;
    }
    if (typeof value !== 'string') {
        return false;
    }
    const trimmedValue = value.trim();
    if (trimmedValue[0] !== '{' && trimmedValue[0] !== '[') {
        return false;
    }
    try {
        return typeof JSON.parse(trimmedValue) === 'object';
    } catch {
        return false;
    }
}

function isArray(value: unknown): value is unknown[] {
    if (Array.isArray(value)) {
        return true;
    }
    if (typeof value !== 'string') {
        return false;
    }
    const trimmedValue = value.trim();
    if (trimmedValue[0] !== '[') {
        return false;
    }
    try {
        return Array.isArray(JSON.parse(trimmedValue));
    } catch {
        return false;
    }
}

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === 'function';
}

const voidElements = [
    'area',
    'base',
    'basefont',
    'bgsound',
    'br',
    'col',
    'command',
    'embed',
    'frame',
    'hr',
    'image',
    'img',
    'input',
    'isindex',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'nextid',
    'param',
    'source',
    'track',
    'wbr',
];

const inlineElements = [
    'a',
    'abbr',
    'acronym',
    'b',
    'bdi',
    'bdo',
    'big',
    'br',
    'data',
    'del',
    'dfn',
    'em',
    'i',
    'ins',
    'kbd',
    'mark',
    'q',
    'ruby',
    's',
    'samp',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'time',
    'u',
    'tt',
    'var',
    'wbr',
];

const simpleBlockElements = ['button', 'h1', 'h2', 'h3', 'h4', 'h5'];

function escapeHtml(input: string) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function vnodeToString(vnode: Template): string {
    if (vnode == null) {
        return '';
    }
    if (typeof vnode !== 'object') {
        return vnode ? (vnode as string).toString() : '';
    }
    if (Array.isArray(vnode)) {
        return vnode.map(vnodeToString).join('\n');
    }
    if (vnode instanceof Element) {
        return vnode.outerHTML;
    }
    if (vnode instanceof Node) {
        return vnode.textContent || '';
    }

    const hyperObject = vnode as VObject;
    const children = hyperObject.children
        ? Array.isArray(hyperObject.children)
            ? hyperObject.children
            : [hyperObject.children]
        : [];

    if (hyperObject.type === Fragment) {
        return children.map(vnodeToString).join('\n');
    }

    const tag =
        (typeof hyperObject.type === 'string' && hyperObject.type) ||
        (hyperObject.type instanceof Element && hyperObject.type.tagName) ||
        '#unknown';

    const properties = { ...hyperObject.properties };
    const ctr = customElements.get(properties.is || tag);
    const definedProperties =
        ctr && isComponentConstructor(ctr)
            ? getProperties(ctr.prototype)
            : null;

    const attrs = Object.keys(properties)
        .map((prop) => {
            if (
                prop === 'ref' ||
                prop === 'children' ||
                prop === 'class' ||
                prop === 'style'
            ) {
                return false;
            }

            if (prop === 'is') {
                return `is="${properties[prop as keyof typeof properties]}"`;
            }

            let value = properties[prop as keyof typeof properties];
            if (value == null) {
                return false;
            }

            const definedProperty =
                definedProperties?.[prop as keyof typeof definedProperties];
            if (definedProperty?.defaultValue === value) {
                return false;
            }

            value =
                (
                    definedProperty?.toAttribute as (
                        value: unknown
                    ) => string | null
                )?.call((ctr as CustomElementConstructor).prototype, value) ??
                value;
            const normalizedProp = definedProperty?.attribute ?? prop;

            if (value == null || value === false) {
                return false;
            }
            if (isArray(value)) {
                value = '[...]';
            }
            if (value instanceof Date) {
                value = value.toISOString();
            }
            if (isObject(value)) {
                value = '{...}';
            }
            if (isFunction(value)) {
                return `${normalizedProp}="..."`;
            }
            if (value === true || value === '') {
                return normalizedProp;
            }
            return `${normalizedProp}="${escapeHtml(`${value}`)}"`;
        })
        .filter(Boolean)
        .join(' ');

    if (typeof hyperObject.type === 'function') {
        return `<${hyperObject.type.name}${attrs ? ` ${attrs}` : ''} />`;
    }

    const tagBlock = inlineElements.includes(tag) ? '' : '\n';
    const childrenBlock = [...inlineElements, ...simpleBlockElements].includes(
        tag
    )
        ? ''
        : '\n';
    if (voidElements.includes(tag)) {
        return `${tagBlock}<${tag}${attrs ? ` ${attrs}` : ''} />${tagBlock}`;
    }
    if (!children.length) {
        return `${tagBlock}<${tag}${attrs ? ` ${attrs}` : ''}></${tag}>${tagBlock}`;
    }

    const prefix = ''.padStart(4, ' ');
    const childContents = children
        .reduce((acc: (Template | string)[], child) => {
            let convertedChild = child;
            if (typeof child !== 'object') {
                convertedChild = vnodeToString(child);
            } else if (child instanceof Node) {
                convertedChild = vnodeToString(child);
            }

            if (
                typeof convertedChild === 'string' &&
                typeof acc[acc.length - 1] === 'string'
            ) {
                acc[acc.length - 1] += convertedChild;
            } else {
                acc.push(convertedChild);
            }

            return acc;
        }, [])
        .map((child) => vnodeToString(child).replace(/\n/g, `\n${prefix}`));

    return `${tagBlock}<${tag}${attrs ? ` ${attrs}` : ''}>${
        childrenBlock ? `${childrenBlock}${prefix}` : ''
    }${childContents.join('')}${childrenBlock}</${tag}>${tagBlock}`;
}

export function sourceDecorator(
    storyFn: PartialStoryFn<DnaRenderer>,
    context: StoryContext<DnaRenderer>
): DnaRenderer['storyResult'] {
    const channel = addons.getChannel();
    const story = storyFn();
    const source = (() => {
        try {
            return vnodeToString(story).replace(/\n\s*\n+/g, '\n');
        } catch (err) {
            logger.error(err);
            return '';
        }
    })();

    useEffect(() => {
        channel.emit(SNIPPET_RENDERED, context.id, source);
    });

    context.parameters.storySource = context.parameters.storySource || {};
    const currentSource = context.parameters.storySource.source;
    context.parameters.storySource.source = source;

    if (currentSource !== source) {
        channel.emit(STORY_PREPARED, {
            id: context.id,
            argTypes: context.argTypes,
            args: context.args,
            initialArgs: context.initialArgs,
            parameters: context.parameters,
        });
    }

    return story;
}
