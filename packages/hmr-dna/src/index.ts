import {
    type ComponentConstructor,
    type ComponentInstance,
    getProperties,
    isComponentConstructor,
} from '@chialab/dna';
import { createProxy } from './CustomElementProxy';
import { getConnected } from './connectedRegistry';
import { defineOnce } from './defineOnce';
import { cloneProperties, overridePrototype } from './utils';

// Override browser custom elements define method
// in order to prevent a `NotSupportedError` when re-defining a component on HMR
customElements.define = defineOnce;

/**
 * Store the DNA customElements.define method.
 */
const define = customElements.define.bind(customElements) as (
    name: string,
    ctr: CustomElementConstructor,
    options?: ElementDefinitionOptions
) => void;

/**
 * Define a DNA component with HMR support.
 * @param name The custom element name.
 * @param ctr The custom element constructor.
 * @param options Definition options.
 */
customElements.define = function hmrDefine<T extends ComponentInstance>(
    name: string,
    ctr: ComponentConstructor<T> | CustomElementConstructor,
    options?: ElementDefinitionOptions
) {
    if (!isComponentConstructor(ctr)) {
        return define(name, ctr, options);
    }

    const actual = customElements.get(name);
    const connected = getConnected<T>(name);

    const connectedProperties = new Map<
        T,
        {
            [K in keyof T]: T[K];
        }
    >();
    connected.forEach((node) => {
        connectedProperties.set(node, cloneProperties(node));
    });

    const proxyClass = createProxy(name, ctr as ComponentConstructor<T>);
    overridePrototype(proxyClass, ctr);
    define(name, proxyClass, options);

    if (!actual) {
        return;
    }

    connected.forEach((node) => {
        const computedProperties = getProperties(node);
        const actualProperties =
            connectedProperties.get(node) ||
            ({} as {
                [K in keyof T]: T[K];
            });
        let initializedProperties: T;
        for (const propertyKey in computedProperties) {
            const value = actualProperties[propertyKey];
            if (value !== undefined) {
                node.setInnerPropertyValue(propertyKey, value);
            } else {
                const property = computedProperties[propertyKey];
                if (property) {
                    if (typeof property.initializer === 'function') {
                        node[propertyKey] = property.initializer.call(node);
                    } else if (typeof property.defaultValue !== 'undefined') {
                        node[propertyKey] = property.defaultValue;
                    } else if (!property.static) {
                        initializedProperties ??= new proxyClass();
                        node.setInnerPropertyValue(
                            propertyKey,
                            initializedProperties[propertyKey]
                        );
                    }
                }
            }
        }
        connectedProperties.delete(node);
        node.requestUpdate();
    });
};
