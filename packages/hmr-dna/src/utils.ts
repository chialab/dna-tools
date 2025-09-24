import { type ComponentInstance, getProperties } from '@chialab/dna';

/**
 * Clone element property values.
 * @param node The node.
 * @returns A record of properties.
 */
export function cloneProperties<T extends ComponentInstance>(node: T) {
    const computedProperties = getProperties(node);
    const actualProperties = {} as {
        [K in keyof T]: T[K];
    };
    for (const propertyKey in computedProperties) {
        actualProperties[propertyKey] = node.getInnerPropertyValue(propertyKey);
    }

    return actualProperties;
}

/**
 * Override class prototype.
 * @param targetClass Target class.
 * @param sourceClass Soure class.
 */
export function overridePrototype(
    targetClass: CustomElementConstructor,
    sourceClass: CustomElementConstructor
) {
    const prototype = sourceClass.prototype;
    const superConstructor = Object.getPrototypeOf(sourceClass);
    const Ctr = class extends superConstructor {
        constructor(...args: unknown[]) {
            if (new.target === sourceClass) {
                // biome-ignore lint/correctness/noConstructorReturn: We need to return a new target constructor instance instead of the source constructor instance.
                return new targetClass(...args);
            }
            // biome-ignore lint/correctness/noUnreachableSuper: We need to override the source constructor with the target constructor.
            super(...args);
        }
    };
    // Move Symbol.metadata to the new constructor.
    if (
        Symbol.metadata &&
        Object.prototype.hasOwnProperty.call(sourceClass, Symbol.metadata)
    ) {
        Object.defineProperty(Ctr, Symbol.metadata, {
            writable: false,
            configurable: true,
            value: sourceClass[Symbol.metadata],
        });
        sourceClass[Symbol.metadata] = null;
    }
    Object.setPrototypeOf(sourceClass, Ctr);
    Object.setPrototypeOf(sourceClass.prototype, Ctr.prototype);
    Object.setPrototypeOf(targetClass, sourceClass);
    Object.setPrototypeOf(targetClass.prototype, prototype);
}
