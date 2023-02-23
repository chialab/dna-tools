import { window, customElements, type ComponentConstructor, type ComponentInstance, getProperties, isComponentConstructor } from '@chialab/dna';
import { getConnected } from './connectedRegistry';
import { createProxy } from './CustomElementProxy';
import { defineOnce } from './defineOnce';
import { cloneProperties, overridePrototype } from './utils';

// Override browser custom elements define method
// in order to prevent a `NotSupportedError` when re-defining a component on HMR
window.customElements.define = defineOnce;

/**
 * Store the DNA customElements.define method.
 */
const define = customElements.define.bind(customElements) as (name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) => void;

/**
 * Define a DNA component with HMR support.
 * @param name The custom element name.
 * @param constructor The custom element constructor.
 * @param options Definition options.
 */
customElements.define = function <T extends ComponentInstance>(name: string, constructor: ComponentConstructor<T> | CustomElementConstructor, options?: ElementDefinitionOptions) {
    if (!isComponentConstructor(constructor)) {
        return define(name, constructor, options);
    }

    const actual = customElements.get(name);
    const connected = getConnected<T>(name);

    const connectedProperties = new Map();
    connected.forEach((node) => {
        connectedProperties.set(node, cloneProperties(node));
    });

    const proxyClass = createProxy(name, constructor) as ComponentConstructor<T>;
    overridePrototype(proxyClass, constructor);

    delete customElements.registry[name];
    define(name, proxyClass, options);

    if (!actual) {
        return;
    }

    connected.forEach((node) => {
        const computedProperties = getProperties(node);
        const actualProperties = connectedProperties.get(node) || {};
        let initializedProperties: T | undefined;
        for (const propertyKey in computedProperties) {
            if (propertyKey in actualProperties) {
                node.setInnerPropertyValue(propertyKey, actualProperties[propertyKey]);
            } else {
                const property = computedProperties[propertyKey];
                if (property) {
                    if (typeof property.initializer === 'function') {
                        node[propertyKey] = property.initializer.call(node);
                    } else if (typeof property.defaultValue !== 'undefined') {
                        node[propertyKey] = property.defaultValue;
                    } else if (!property.static) {
                        initializedProperties = initializedProperties || new proxyClass();
                        node.setInnerPropertyValue(propertyKey, initializedProperties[propertyKey]);
                    }
                    node.watchedProperties.push(propertyKey);
                }
            }
        }
        connectedProperties.delete(node);
        node.forceUpdate();
    });
};
