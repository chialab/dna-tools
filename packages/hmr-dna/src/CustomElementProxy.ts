import { isComponentConstructor, type ComponentConstructor, type ComponentInstance } from '@chialab/dna';
import { connect, disconnect } from './connectedRegistry';

/**
 * A map of registered custom element proxies.
 */
const proxies = new Map<string, ComponentConstructor>();

/**
 * Create a proxy class for the custom element.
 * @param name The custom element name.
 * @param constructor The custom element constructor.
 */
export function createProxy<T extends ComponentInstance>(name: string, constructor: ComponentConstructor<T>) {
    if (proxies.get(name)) {
        return proxies.get(name) as ComponentConstructor<T>;
    }

    if (isComponentConstructor(constructor)) {
        const proxyClass = class extends (constructor as ComponentConstructor) {
            // we need to override the constructor in order to proxy it in the future.
            // eslint-disable-next-line no-useless-constructor
            constructor(...args: any[]) {
                super(...args);
            }

            connectedCallback() {
                connect(this);
                super.connectedCallback();
            }

            disconnectedCallback() {
                disconnect(this);
                super.disconnectedCallback();
            }
        } as unknown as ComponentConstructor<T>;

        proxies.set(name, proxyClass);

        return proxyClass;
    }

    return constructor;
}
