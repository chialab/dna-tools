import { type Package } from 'custom-elements-manifest';

declare global {
    interface Window {
        STORYBOOK_ENV: 'dna';
        __STORYBOOK_CUSTOM_ELEMENTS_MANIFEST__: Package | undefined;
    }
}
