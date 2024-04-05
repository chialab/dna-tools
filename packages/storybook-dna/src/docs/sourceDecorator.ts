import type { Template, VObject } from '@chialab/dna';
import { STORY_PREPARED } from '@storybook/core-events';
import { SNIPPET_RENDERED } from '@storybook/docs-tools';
import { addons, useEffect } from '@storybook/preview-api';
import type { PartialStoryFn, StoryContext } from '@storybook/types';
import type { DnaRenderer } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isObject(value: any): value is object {
    if (value === null) {
        return false;
    }
    if (typeof value === 'object') {
        return true;
    }
    if (typeof value !== 'string') {
        return false;
    }
    value = value.trim();
    if (value[0] !== '{' && value[0] !== '[') {
        return false;
    }
    try {
        return typeof JSON.parse(value) === 'object';
    } catch {
        return false;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isArray(value: any): value is any[] {
    if (Array.isArray(value)) {
        return true;
    }
    if (typeof value !== 'string') {
        return false;
    }
    value = value.trim();
    if (value[0] !== '[') {
        return false;
    }
    try {
        return Array.isArray(JSON.parse(value));
    } catch {
        return false;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFunction(value: any): value is Function {
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

    if (typeof hyperObject.type === 'symbol') {
        return children.map(vnodeToString).join('\n');
    }

    const tag =
        (typeof hyperObject.type === 'string' && hyperObject.type) ||
        (hyperObject.type instanceof Element && hyperObject.type.tagName) ||
        '#unknown';

    const properties = { ...hyperObject.properties };
    const attrs = Object.keys(properties)
        .map((prop) => {
            if (prop === 'ref' || prop === 'children') {
                return false;
            }

            let value = properties[prop as keyof typeof properties];
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
                value = value.name || 'function() { ... }';
            }
            if (value === true) {
                return prop;
            }
            return `${prop}="${escapeHtml(`${value}`)}"`;
        })
        .filter(Boolean)
        .join(' ');

    if (typeof hyperObject.type === 'function') {
        return `<${hyperObject.type.name}${attrs ? ` ${attrs}` : ''} />`;
    }

    const tagBlock = inlineElements.includes(tag) ? '' : '\n';
    const childrenBlock = [...inlineElements, ...simpleBlockElements].includes(tag) ? '' : '\n';
    if (voidElements.includes(tag)) {
        return `${tagBlock}<${tag}${attrs ? ` ${attrs}` : ''} />${tagBlock}`;
    }
    if (!children.length) {
        return `${tagBlock}<${tag}${attrs ? ` ${attrs}` : ''}></${tag}>${tagBlock}`;
    }

    const prefix = ''.padStart(4, ' ');
    const childContents = children
        .reduce((acc: (Template | string)[], child) => {
            if (typeof child !== 'object') {
                child = vnodeToString(child);
            } else if (child instanceof Node) {
                child = vnodeToString(child);
            }

            if (typeof child === 'string' && typeof acc[acc.length - 1] === 'string') {
                acc[acc.length - 1] += child;
            } else {
                acc.push(child);
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
        } catch {
            return '';
        }
    })();

    useEffect(() => {
        channel.emit(SNIPPET_RENDERED, context.id, source);
    });

    const storySource = (context.parameters.storySource = context.parameters.storySource || {});
    const currentSource = storySource.source;
    storySource.source = source;

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
