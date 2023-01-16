import { isComponentConstructor } from '@chialab/dna';
import { connect, disconnect } from './connectedRegistry';

/**
 * A map of registered custom element proxies.
 */
const proxies = new Map<string, CustomElementConstructor>();

/**
 * Create a proxy class for the custom element.
 * @param name The custom element name.
 * @param constructor The custom element constructor.
 */
export function createProxy<T extends CustomElementConstructor>(name: string, constructor: T) {
    if (proxies.get(name)) {
        return proxies.get(name) as T;
    }

    if (isComponentConstructor(constructor)) {
        const proxyClass = class extends constructor {
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
        };

        proxies.set(name, proxyClass);

        return proxyClass as T;
    }

    return constructor;
}
