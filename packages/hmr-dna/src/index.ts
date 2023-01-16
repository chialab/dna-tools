import { window, customElements, type ComponentInstance, getProperties } from '@chialab/dna';
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
const define = customElements.define as (name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) => void;

/**
 * Define a DNA component with HMR support.
 * @param name The custom element name.
 * @param constructor The custom element constructor.
 * @param options Definition options.
 */
customElements.define = function<T extends CustomElementConstructor>(name: string, constructor: T, options?: ElementDefinitionOptions) {
    const actual = customElements.get(name);
    const connected = getConnected(name);

    const connectedProperties = new Map<ComponentInstance, Record<string, unknown>>();
    connected.forEach((node) => {
        connectedProperties.set(node, cloneProperties(node));
    });

    const proxyClass = createProxy(name, constructor);
    overridePrototype(proxyClass, constructor);

    delete customElements.registry[name];
    define(name, proxyClass, options);

    if (!actual) {
        return;
    }

    connected.forEach((node: any) => {
        const computedProperties = getProperties(node);
        const actualProperties = connectedProperties.get(node) || {};
        let initializedProperties: InstanceType<T> | undefined;
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
                        initializedProperties = initializedProperties || (new proxyClass() as InstanceType<T>);
                        node.setInnerPropertyValue(propertyKey, initializedProperties[propertyKey as keyof InstanceType<T>]);
                    }
                    node.watchedProperties.push(propertyKey);
                }
            }
        }
        connectedProperties.delete(node);
        node.forceUpdate();
    });
};
