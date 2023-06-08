import { window } from '@chialab/dna';
import { logger } from '@storybook/client-logger';
import { type Package, type CustomElement, type PropertyLike } from 'custom-elements-manifest';
import { dedent } from 'ts-dedent';

export function getCustomElementsManifest() {
    return window.__STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__;
}

export function setCustomElementsManifest(manifest: Package) {
    window.__STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__ = manifest;
}

function isValidTagName(tagName: string) {
    if (!tagName) {
        return false;
    }
    if (typeof tagName === 'string') {
        return true;
    }
    throw new Error('Provided component needs to be a string. e.g. component: "my-element"');
}

function isValidManifest(manifest: Package) {
    if (!manifest) {
        return false;
    }

    if (manifest.modules && Array.isArray(manifest.modules)) {
        return true;
    }
    throw new Error(dedent`
        You need to setup valid meta data in your config.js via setCustomElements().
        See the readme of addon-docs for web components for more details.
    `);
}

export const getCustomElementDeclaration = (
    tagName: string,
    manifest: Package
): (CustomElement & { properties?: PropertyLike[] }) | null => {
    if (!isValidTagName(tagName) || !isValidManifest(manifest)) {
        return null;
    }

    if (!manifest || !manifest.modules) {
        return null;
    }

    let metadata: CustomElement | null = null;
    manifest.modules.forEach((_module) => {
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

export function mergeCustomElementsManifests(manifest1: Package, manifest2: Package) {
    return {
        ...manifest1,
        ...manifest2,
        modules: [...(manifest1.modules || []), ...(manifest2.modules || [])],
    };
}
