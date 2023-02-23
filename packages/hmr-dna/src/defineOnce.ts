import { isComponentConstructor, window } from '@chialab/dna';

/**
 * Store the browser customElements.define method.
 */
const customElementsDefine = window.customElements.define.bind(window.customElements);

/**
 * Use browser APIs to define a custom element only once.
 * @param name The custom element name.
 * @param constructor The custom element constructor.
 * @param options Definition options.
 */
export function defineOnce(name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) {
    if (!window.customElements.get(name) || !isComponentConstructor(constructor)) {
        customElementsDefine(name, constructor, options);
    }
}
