import type { ComponentInstance } from '@chialab/dna';

/**
 * Collect connected nodes.
 */
const connectedNodes = new Map<string, ComponentInstance[]>();

/**
 * Add a node to the connected list.
 * @param node The node to register.
 */
export function connect(node: ComponentInstance) {
    const list = getConnected(node.is);
    list.push(node);
}

/**
 * Remove a node from the connected list.
 * @param node The node to unregister.
 */
export function disconnect(node: ComponentInstance) {
    const list = getConnected(node.is);
    if (list.includes(node)) {
        list.splice(list.indexOf(node), 1);
    }
}

/**
 * Get connected nodes for a given name.
 * @returns A live array of connected nodes.
 */
export function getConnected<T extends ComponentInstance>(name: string): T[] {
    const list = (connectedNodes.get(name) || []) as T[];
    connectedNodes.set(name, list);

    return list;
}
