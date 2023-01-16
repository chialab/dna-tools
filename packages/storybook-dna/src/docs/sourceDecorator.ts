import { type Template, type ComponentInstance, type VObject, window, customElements } from '@chialab/dna';
import { SNIPPET_RENDERED } from '@storybook/docs-tools';
import { addons, useEffect } from '@storybook/preview-api';
import { STORY_PREPARED } from '@storybook/core-events';
import { type PartialStoryFn, type StoryContext } from '@storybook/types';
import { type DnaRenderer } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isObject(value: any): value is object {
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

function escapeHtml(input: string) {
    return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function vnodeToString(vnode: Template): string {
    if (typeof vnode !== 'object') {
        return vnode ? (vnode as string).toString() : '';
    }
    if (Array.isArray(vnode)) {
        return vnode.map(vnodeToString).join('\n');
    }
    if (vnode instanceof window.Element) {
        return vnode.outerHTML;
    }
    if (vnode instanceof window.Node) {
        return vnode.textContent || '';
    }

    const hyperObject = vnode as VObject;

    const is = (typeof hyperObject.type === 'function' && hyperObject.type.prototype.is) ||
        (hyperObject.type instanceof window.Node && (hyperObject.type as ComponentInstance).is) ||
        undefined;

    const tag = (typeof hyperObject.type === 'string' && hyperObject.type) ||
        (is && customElements.tagNames[is]) ||
        (hyperObject.type instanceof window.Node && hyperObject.type.tagName) ||
        undefined;

    const properties = { is, ...hyperObject.properties };
    if (!is || !tag || is.toLowerCase() === tag.toLowerCase()) {
        delete properties.is;
    }

    const attrs = Object.keys(properties).map((prop) => {
        if (prop === 'is' && is) {
            return `is="${is}"`;
        }
        if (prop === 'ref') {
            return false;
        }

        let value = properties[prop as keyof typeof properties];
        if (isObject(value)) {
            value = '{...}';
        }
        if (isArray(value)) {
            value = '[...]';
        }
        if (typeof value === 'function') {
            value = value.name || 'function() { ... }';
        }
        if (value == null || value === false) {
            return false;
        }
        if (value === true) {
            return prop;
        }

        return `${prop}="${escapeHtml(`${value}`)}"`;
    }).filter(Boolean).join(' ');

    if (typeof hyperObject.type === 'function' && !is) {
        return `<${hyperObject.type.name}${attrs ? ` ${attrs}` : ''} />`;
    }

    if (voidElements.indexOf(tag) !== -1) {
        return `<${tag}${attrs ? ` ${attrs}` : ''} />`;
    }

    if (!hyperObject.children || !hyperObject.children.length) {
        return `<${tag}${attrs ? ` ${attrs}` : ''}></${tag}>`;
    }

    let hasNodes = false;
    const prefix = ''.padStart(4, ' ');
    const childContents = (hyperObject.children || [])
        .reduce((acc: (Template|string)[], child) => {
            if (typeof child !== 'object') {
                child = vnodeToString(child);
            } else if (child instanceof window.Node) {
                hasNodes = true;
                child = vnodeToString(child);
            } else {
                hasNodes = true;
            }

            if (typeof child === 'string' &&
                typeof acc[acc.length - 1] === 'string') {
                acc[acc.length - 1] += child;
            } else {
                acc.push(child);
            }

            return acc;
        }, [])
        .map((child) =>
            vnodeToString(child).replace(/\n/g, `\n${prefix}`)
        );

    let childContentsHtml = '';
    if (childContents.length === 1 && !hasNodes) {
        childContentsHtml = childContents[0];
    } else if (childContents.length) {
        childContentsHtml = `\n${prefix}${childContents.join(`\n${prefix}`)}\n`;
    }

    return `<${tag}${attrs ? ` ${attrs}` : ''}>${childContentsHtml}</${tag}>`;
}

export function sourceDecorator(storyFn: PartialStoryFn<DnaRenderer>, context: StoryContext) {
    const channel = addons.getChannel();
    const story = storyFn();
    const source = (() => {
        try {
            return vnodeToString(story);
        } catch {
            return '';
        }
    })();

    useEffect(() => {
        channel.emit(SNIPPET_RENDERED, context.id, source);
    });

    const storySource = context.parameters.storySource = context.parameters.storySource || {};
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