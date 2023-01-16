import { type ComponentInstance, getProperties } from '@chialab/dna';

/**
 * Clone element property values.
 * @param node The node.
 * @returns A record of properties.
 */
export function cloneProperties(node: ComponentInstance) {
    const computedProperties = getProperties(node);
    const actualProperties: Record<string, unknown> = {};
    for (const propertyKey in computedProperties) {
        actualProperties[propertyKey] = node.getInnerPropertyValue(propertyKey as keyof typeof computedProperties);
    }

    return actualProperties;
}

/**
 * Override class prototype.
 * @param targetClass Target class.
 * @param sourceClass Soure class.
 */
export function overridePrototype(targetClass: CustomElementConstructor, sourceClass: CustomElementConstructor) {
    const prototype = sourceClass.prototype;
    const superConstructor = Object.getPrototypeOf(sourceClass);
    const constructor = class extends superConstructor {
        constructor(...args: any[]) {
            if (new.target === sourceClass) {
                return new targetClass(...args);
            }
            super(...args);
        }
    };
    Object.setPrototypeOf(sourceClass, constructor);
    Object.setPrototypeOf(sourceClass.prototype, constructor.prototype);
    Object.setPrototypeOf(targetClass, sourceClass);
    Object.setPrototypeOf(targetClass.prototype, prototype);
}
