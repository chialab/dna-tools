import { isComponentConstructor } from '@chialab/dna';

/**
 * Store the browser customElements.define method.
 */
const customElementsDefine = customElements.define.bind(customElements);

/**
 * Use browser APIs to define a custom element only once.
 * @param name The custom element name.
 * @param constructor The custom element constructor.
 * @param options Definition options.
 */
export function defineOnce(name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) {
    if (!customElements.get(name) || !isComponentConstructor(constructor)) {
        customElementsDefine(name, constructor, options);
    }
}
