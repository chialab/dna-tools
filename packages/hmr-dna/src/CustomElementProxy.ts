import {
    type ComponentConstructor,
    type ComponentInstance,
    isComponentConstructor,
} from '@chialab/dna';
import { connect, disconnect } from './connectedRegistry';

/**
 * A map of registered custom element proxies.
 */
const proxies = new Map<string, ComponentConstructor>();

/**
 * Create a proxy class for the custom element.
 * @param name The custom element name.
 * @param ctr The custom element constructor.
 */
export function createProxy<T extends ComponentInstance>(
    name: string,
    ctr: ComponentConstructor<T>
) {
    if (proxies.get(name)) {
        return proxies.get(name) as ComponentConstructor<T>;
    }

    if (isComponentConstructor(ctr)) {
        const ProxyClass = class extends (ctr as ComponentConstructor) {
            // we need to override the constructor in order to proxy it in the future.
            constructor(...args: unknown[]) {
                super(...args);
                if (new.target === ProxyClass) {
                    this.initialize();
                }
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

        proxies.set(name, ProxyClass);

        return ProxyClass;
    }

    return ctr;
}
