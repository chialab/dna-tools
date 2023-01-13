import { global } from '@storybook/global';
import { logger } from '@storybook/client-logger';
import { dedent } from 'ts-dedent';
import { type Package, type CustomElement, type PropertyLike } from 'custom-elements-manifest';

const { window: globalWindow } = global;

export function getCustomElements() {
    return globalWindow.__STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__;
}

export function setCustomElementsManifest(customElements: Package) {
    globalWindow.__STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__ = customElements;
}

export function isValidComponent(tagName: string) {
    if (!tagName) {
        return false;
    }
    if (typeof tagName === 'string') {
        return true;
    }
    throw new Error('Provided component needs to be a string. e.g. component: "my-element"');
}

export function isValidMetaData(customElements: Package) {
    if (!customElements) {
        return false;
    }

    if (customElements.modules && Array.isArray(customElements.modules)) {
        return true;
    }
    throw new Error(dedent`
        You need to setup valid meta data in your config.js via setCustomElements().
        See the readme of addon-docs for web components for more details.
    `);
}

export const getMetaData = (tagName: string, customElements: Package): (CustomElement & { properties?: PropertyLike[] }) | null => {
    if (!isValidComponent(tagName) || !isValidMetaData(customElements)) {
        return null;
    }

    if (!customElements || !customElements.modules) {
        return null;
    }

    let metadata: CustomElement | null = null;
    customElements.modules.forEach((_module) => {
        if (!_module || !_module.declarations) {
            return;
        }
        _module.declarations.forEach((declaration) => {
            if ((declaration as CustomElement).tagName === tagName) {
                metadata = declaration as CustomElement;
            }
        });
    });

    if (!metadata) {
        logger.warn(`Component not found in custom-elements.json: ${tagName}`);
    }

    return metadata;
};
